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

    keyDownHandler: any;
    keyUpHandler: any;
    inputHandler: any;
    clickHandler: any;
    focusHandler: any;


    constructor(element: Element) {
        this.element = element;
        this.preventBackspace = false;
        this.keyDownHandler = e => this.onKeyDown(e);
        this.keyUpHandler = e => this.onKeyUp(e);
        this.clickHandler = e => this.onClick(e);
        this.inputHandler = e => this.onInput(e);
        this.focusHandler = e => this.onFocus(e);
    }

    bind() {
        this.masker = getMasker(this.mask, this.bindMasking, this.placeholder);
        this.oldValue = this.masker.maskValue(this.value);
    }

    attached() {
        this.inputElement = (<any>this.element).children[0];
        this.inputElement.addEventListener("keydown", this.keyDownHandler);
        this.inputElement.addEventListener('keyup', this.keyUpHandler);
        this.inputElement.addEventListener('input', this.inputHandler);
        this.inputElement.addEventListener('click', this.clickHandler);
        this.inputElement.addEventListener('focus', this.focusHandler);
        this.caretPos = this.getCaretPosition();
        this.inputElement.value = this.oldValue;
    }

    detached() {
        this.inputElement.removeEventListener("keydown", this.keyDownHandler);
        this.inputElement.removeEventListener('keyup', this.keyUpHandler);
        this.inputElement.removeEventListener('input', this.inputHandler);
        this.inputElement.removeEventListener('click', this.clickHandler);
        this.inputElement.removeEventListener('focus', this.focusHandler);
    }

    get maxCaretPos() {
        if(this.masker == null) {
            return 0;
        }
        let valUnmasked = this.unmaskedModelValue;
        let caretPosMax = this.masker.maxCaretPos(valUnmasked);
        return caretPosMax;
    }

    get minCaretPos() {
        if(this.masker == null) {
            return 0;
        }
        return this.masker.minCaretPos();
    }

    onClick(e: any) {
        /*jshint validthis: true */
        e = e || {};

        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let isSelected = this.getSelectionLength() > 0;
        let wasSelected = selectionLenOld > 0;

        // Necessary due to "input" event not providing a key code
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
        // a character when clicking within a filled input.
        let caretBumpBack = caretPos > this.minCaretPos;

        this.oldSelectionLength = this.getSelectionLength();

        // These events don't require any action
        if (isSelected) {
            return;
        }

        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
    }

    get unmaskedUIValue() {
        let val = this.inputElement.value;
        let unmasked = this.masker.unmaskValue(val);
        return unmasked;
    }

    get unmaskedModelValue() {
        let val = this.value;
        let unmasked = this.masker.unmaskValue(val);
        return unmasked;
    }

    isAddition() {
        // Case: Typing a character to overwrite a selection
        let val = this.unmaskedUIValue;
        let valOld = this.oldValue;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld);
        return _isAddition;
    }

    isDeletion() {
        // Case: Delete and backspace behave identically on a selection
        let val = this.unmaskedUIValue;
        let valOld = this.oldValue;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld);
        return _isDeletion;
    }

    onInput(e: any) {
        /*jshint validthis: true */
        e = e || {};
        // Allows more efficient minification

        let valUnmasked = this.unmaskedUIValue;
        let valUnmaskedOld = this.oldValueUnmasked;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let wasSelected = selectionLenOld > 0;

        // Necessary due to "input" event not providing a key code
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
        // a character when clicking within a filled input.
        let caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;

        this.oldSelectionLength = this.getSelectionLength();

        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Value Handling
        // ==============

        // User attempted to delete but raw value was unaffected--correct this grievous offense
        if (this.isDeletion() && !wasSelected && valUnmasked === valUnmaskedOld) {
            while (isKeyBackspace && caretPos > this.minCaretPos && !this.isValidCaretPosition(caretPos)) {
                caretPos--;
            }
            while (isKeyDelete && caretPos < this.maxCaretPos && this.masker.maskCaretMap.indexOf(caretPos) === -1) {
                caretPos++;
            }
            var charIndex = this.masker.maskCaretMap.indexOf(caretPos);
            // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
            valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }

    onFocus(e: any) {
        /*jshint validthis: true */
        e = e || {};

        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let wasSelected = selectionLenOld > 0;

        // Necessary due to "input" event not providing a key code
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
        // a character when clicking within a filled input.
        let caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;

        this.oldSelectionLength = this.getSelectionLength();

        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
    }

    onKeyUp(e: any) {
        /*jshint validthis: true */
        e = e || {};
        var eventType = e.type;

        // Prevent shift and ctrl from mucking with old values
        if (e.which === 16 || e.which === 91) {
            return;
        }

        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let isSelected = this.getSelectionLength() > 0;
        let isSelection = (e.which >= 37 && e.which <= 40) && e.shiftKey; // Arrow key codes

        let isKeyLeftArrow = e.which === 37;
        // Necessary due to "input" event not providing a key code
        let isKeyBackspace = e.which === 8;
        let isKeyDelete = e.which === 46;
        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
        // a character when clicking within a filled input.
        let caretBumpBack = (isKeyLeftArrow || isKeyBackspace) && caretPos > this.minCaretPos;

        this.oldSelectionLength = this.getSelectionLength();

        // These events don't require any action
        if (isSelection || isSelected) {
            return;
        }

        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }

    updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld) {
        // Update values
        let isAddition = this.isAddition();
        let valMasked = this.masker.maskValue(valUnmasked);
        let caretPosMin = this.minCaretPos;
        let caretPosMax = this.masker.maxCaretPos(valUnmasked);

        this.oldValue = valMasked;
        this.oldValueUnmasked = valUnmasked;

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

    valueChanged() {
        let valUnmasked = this.unmaskedModelValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let isSelected = this.getSelectionLength() > 0;

        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace
        // a character when clicking within a filled input.
        let caretBumpBack = caretPos > this.minCaretPos;

        this.oldSelectionLength = this.getSelectionLength();

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }
}

