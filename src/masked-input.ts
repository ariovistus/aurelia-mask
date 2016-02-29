/// <reference path="../typings/tsd.d.ts" />

import {customElement, bindable, bindingMode, inject} from 'aurelia-framework';
import {getMasker, Masker} from "./masker";

/**
 * Test cases for this horrid thing:
 * 1:
 * format (999) 999-9999, current value: 3334445555, caret at end: (333) 444-5555|
 * <backspace> should make it do this: (333) 444-555|_
 * 2: 
 * format (999) 999-9999, current value: 3334445, caret at end: (333) 444-5|___
 * <backspace> should make it do this: (333) 444|-____
 * 3: 
 * format (999) 999-9999, current value: 3, caret at end: (3|__) ___-____
 * <backspace> should make it do this: (|___) ___-____
 * 4: 
 * format (999) 999-9999, current value: "", caret at end: (|___) ___-____
 * <backspace> should make it do this: (|___) ___-____
 * 5: 
 * format (999) 999-9999, current value: 3334445555, caret at end: (333) 444-5555|
 * click for caret like this: (333) 444-|5555
 * should immediately move caret like this: (333) 444|-5555
 * 6: 
 * format (999) 999-9999, current value: 3334445555, caret at end: (333) 444-5555|
 * <delete> should do this: (333) 444-5555|
 * 7: 
 * format (999) 999-9999, current value: 3334445555, caret at beginning: (|333) 444-5555
 * <delete> should do this: (|334) 445-555_
 * 8:
 * format (999) 999-9999, current value: 334445555, caret at beginning: (|334) 445-555_
 * type '6' should do this: (|633) 444-5555
 * 9: 
 * format (999) 999-9999, current value: 3334445555, caret at end: (333) 444-5555|
 * type '6' should do this: (333) 444-5555|
 */
@customElement('masked-input')
@inject(Element)
export class MaskedInput {
    element: Element;
    inputElement: HTMLInputElement;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value: string;
    @bindable mask: string;
    @bindable inputId: string;
    @bindable inputClass: string;
    @bindable disabled: boolean;
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: false}) bindMasking: boolean
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: null}) placeholder: string;

    masker: Masker;
    preventBackspace: boolean;
    oldValue: string;
    oldValueUnmasked: string;
    oldCaretPosition: number;
    oldSelectionLength: number;

    caretPos: number;
    keyDownListener: any;
    eventListener: any;


    constructor(element: Element) {
        this.element = element;
        this.preventBackspace = false;
        this.keyDownListener = e => this.onKeyDown(e);
        this.eventListener = e => this.onEvent(e);
    }

    bind() {
        this.masker = getMasker(this.mask, this.bindMasking, this.placeholder);
        this.oldValue = this.masker.maskValue(this.value);
    }

    attached() {
        this.inputElement = (<any>this.element).children[0];
        this.inputElement.addEventListener("keydown", this.keyDownListener);
        this.inputElement.addEventListener('keyup', this.eventListener);
        this.inputElement.addEventListener('input', this.eventListener);
        this.inputElement.addEventListener('click', this.eventListener);
        this.inputElement.addEventListener('focus', this.eventListener);
        this.caretPos = this.getCaretPosition();
    }

    detached() {
        this.inputElement.removeEventListener("keydown", this.keyDownListener);
        this.inputElement.removeEventListener('keyup', this.eventListener);
        this.inputElement.removeEventListener('input', this.eventListener);
        this.inputElement.removeEventListener('click', this.eventListener);
        this.inputElement.removeEventListener('focus', this.eventListener);
    }

    onEvent(e: any) {
            /*jshint validthis: true */
            e = e || {};
            // Allows more efficient minification
            var eventWhich = e.which,
                eventType = e.type;

            // Prevent shift and ctrl from mucking with old values
            if (eventWhich === 16 || eventWhich === 91) {
                return;
            }

            let val = this.inputElement.value;
            let valOld = this.oldValue;
            let valAltered = false;
            let valUnmasked = this.value || '';
            let valUnmaskedOld = this.oldValueUnmasked;
            let caretPos = this.getCaretPosition() || 0;
            let caretPosOld = this.oldCaretPosition || 0;
            let caretPosDelta = caretPos - caretPosOld;
            let caretPosMin = this.masker.minCaretPos();
            let caretPosMax = this.masker.maxCaretPos(valUnmasked);
            let selectionLenOld = this.oldSelectionLength || 0;
            let isSelected = this.getSelectionLength() > 0;
            let wasSelected = selectionLenOld > 0;
                // Case: Typing a character to overwrite a selection
            let isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld);
                // Case: Delete and backspace behave identically on a selection
            let isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld);
            let isSelection = (eventWhich >= 37 && eventWhich <= 40) && e.shiftKey; // Arrow key codes

            let isKeyLeftArrow = eventWhich === 37;
                // Necessary due to "input" event not providing a key code
            let isKeyBackspace = eventWhich === 8 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === -1));
            let isKeyDelete = eventWhich === 46 || (eventType !== 'keyup' && isDeletion && (caretPosDelta === 0) && !wasSelected);
                // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
                // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
                // non-mask character. Also applied to click since users are (arguably) more likely to backspace
                // a character when clicking within a filled input.
            let caretBumpBack = (isKeyLeftArrow || isKeyBackspace || eventType === 'click') && caretPos > caretPosMin;

            this.oldSelectionLength = this.getSelectionLength();

            // These events don't require any action
            if (isSelection || (isSelected && (eventType === 'click' || eventType === 'keyup'))) {
                return;
            }

            if (isKeyBackspace && this.preventBackspace) {
                this.inputElement.value = this.oldValue;
                this.setCaretPosition(caretPosOld);
                return;
            }

            // Value Handling
            // ==============

            // User attempted to delete but raw value was unaffected--correct this grievous offense
            if ((eventType === 'input') && isDeletion && !wasSelected && valUnmasked === valUnmaskedOld) {
                while (isKeyBackspace && caretPos > caretPosMin && !this.isValidCaretPosition(caretPos)) {
                    caretPos--;
                }
                while (isKeyDelete && caretPos < caretPosMax && this.masker.maskCaretMap.indexOf(caretPos) === -1) {
                    caretPos++;
                }
                var charIndex = this.masker.maskCaretMap.indexOf(caretPos);
                // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
                valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                valAltered = true;
            }

            // Update values
            let valMasked = this.masker.maskValue(valUnmasked);

            this.oldValue = valMasked;
            this.oldValueUnmasked = valUnmasked;

            //additional check to fix the problem where the viewValue is out of sync with the value of the element.
            //better fix for commit 2a83b5fb8312e71d220a497545f999fc82503bd9 (I think)
            if (!valAltered && val.length > valMasked.length)
                valAltered = true;

            this.inputElement.value = valMasked;

            // Caret Repositioning
            // ===================

            // Ensure that typing always places caret ahead of typed character in cases where the first char of
            // the input is a mask char and the caret is placed at the 0 position.
            if (isAddition && (caretPos <= caretPosMin)) {
                caretPos = caretPosMin + 1;
            }

            if (caretBumpBack) {
                caretPos--;
            }

            // Make sure caret is within min and max position limits
            caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;

            // Scoot the caret back or forth until it's in a non-mask position and within min/max position limits
            while (!this.isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
                caretPos += caretBumpBack ? -1 : 1;
            }

            if ((caretBumpBack && caretPos < caretPosMax) || (isAddition && !this.isValidCaretPosition(caretPosOld))) {
                caretPos++;
            }
            this.oldCaretPosition = caretPos;
            this.caretPos = caretPos;
            this.setCaretPosition(this.caretPos);
    }

    getSelectionLength() {
        if (!this.inputElement)
            return 0;
        if (this.inputElement.selectionStart !== undefined) {
            return (this.inputElement.selectionEnd - this.inputElement.selectionStart);
        }
        if ((<any>document).selection) {
            return ((<any>document).selection.createRange().text.length);
        }
        return 0;
    }

    onKeyDown(e: KeyboardEvent) {
        var isKeyBackspace = e.which === 8;
        var oldCaretPos = this.getCaretPosition();
        var newCaretPosOnBksp = oldCaretPos - 1 || 0;

        if (isKeyBackspace) {
            while (newCaretPosOnBksp >= 0) {
                if (this.isValidCaretPosition(newCaretPosOnBksp)) {
                    //re-adjust the caret position.
                    //Increment to account for the initial decrement to simulate post change

                    this.caretPos = newCaretPosOnBksp;
                    break;
                }
                newCaretPosOnBksp--;
            }
            this.preventBackspace = newCaretPosOnBksp === -1;
        }
    }

    getCaretPosition() {
        if (!this.inputElement)
            return 0;
        if (this.inputElement.selectionStart !== undefined) {
            return this.inputElement.selectionStart;
        } else if ((<any>document).selection) {
            if (this.isFocused()) {
                // Curse you IE
                this.inputElement.focus();
                var selection = (<any>document).selection.createRange();
                selection.moveStart('character', this.inputElement.value ? -this.inputElement.value.length : 0);
                return selection.text.length;
            }
        }
        return 0;
    }

    isValidCaretPosition(pos): boolean {
        return this.masker.maskCaretMap.indexOf(pos) > -1;
    }

    setCaretPosition(pos) {
        if (!this.inputElement)
            return 0;
        if (this.inputElement.offsetWidth === 0 || this.inputElement.offsetHeight === 0) {
            return; // Input's hidden
        }
        if (this.inputElement.setSelectionRange) {
            if (this.isFocused()) {
                this.inputElement.focus();
                this.inputElement.setSelectionRange(pos, pos);
            }
        }
        else if (this.inputElement.createTextRange) {
            // Curse you IE
            var range = this.inputElement.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    isFocused(): boolean {
        return this.inputElement === document.activeElement && (!document.hasFocus || document.hasFocus()) &&
            !!(this.inputElement.type || (<any>this.inputElement).href || ~this.inputElement.tabIndex);
    }

    maskChanged() {
        this.masker = getMasker(this.mask, this.bindMasking);
    }
}

