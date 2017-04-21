import {customAttribute, bindable, bindingMode, inject} from 'aurelia-framework';
import {getMasker, Masker, isNumeric, isString} from "./masker";

function findFirstInputElement(elt: Element) {
    var elts = elt.getElementsByTagName("input");
    if(elts.length == 0) {
        throw new Error("'masked' attribute is not on an input element");
    }
    return <HTMLInputElement>elts[0];
}

@customAttribute('masked')
@inject(Element)
export class MaskedInput {
    element: Element;
    inputElement: HTMLInputElement;
    @bindable({ defaultBindingMode: bindingMode.twoWay }) value: string|number;
    @bindable mask: string;
    @bindable inputId: string;
    @bindable inputClass: string;
    @bindable disabled: boolean;
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: false}) bindMasking: boolean
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: false}) aspnetMasking: boolean
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: null}) placeholder: string;
    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: "insert"}) editMode: string;

    @bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: null}) 
        findInput: (Element) => HTMLInputElement;
    @bindable() change: Function;

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
    selectHandler: any;

    isAttached: boolean;


    constructor(element: Element) {
        this.isAttached = false;
        this.element = element;
        this.preventBackspace = false;
        this.keyDownHandler = e => this.onKeyDown(e);
        this.keyUpHandler = e => this.onKeyUp(e);
        this.clickHandler = e => this.onClick(e);
        this.inputHandler = e => this.onInput(e);
        this.focusHandler = e => this.onFocus(e);
        this.selectHandler = e => this.onSelect(e);
    }

    bind() {
        this.maskChanged();
        this.oldValue = this.masker.maskValue(this.numberToString(this.value));
        this.oldValueUnmasked = this.masker.unmaskValue(this.oldValue);
    }

    attached() {
        this.isAttached = true;
        this.findInputElement();
        this.inputElement.addEventListener("keydown", this.keyDownHandler);
        this.inputElement.addEventListener('keyup', this.keyUpHandler);
        this.inputElement.addEventListener('input', this.inputHandler);
        this.inputElement.addEventListener('mouseup', this.clickHandler);
        this.inputElement.addEventListener('focus', this.focusHandler);
        this.inputElement.addEventListener('select', this.selectHandler);
        this.caretPos = this.getCaretPosition();
        this.inputElement.value = this.oldValue;
        this.updateUIValue(this.oldValue, false, this.minCaretPos, this.minCaretPos);
    }

    findInputElement() {
        if(this.element.tagName.toLowerCase() === "input") {
            this.inputElement = (<HTMLInputElement>this.element);
        }else if (this.findInput != null){
            this.inputElement = this.findInput(this.element);
        }else{
            this.inputElement = findFirstInputElement(this.element);
        }
    }

    detached() {
        this.inputElement.removeEventListener("keydown", this.keyDownHandler);
        this.inputElement.removeEventListener('keyup', this.keyUpHandler);
        this.inputElement.removeEventListener('input', this.inputHandler);
        this.inputElement.removeEventListener('mouseup', this.clickHandler);
        this.inputElement.removeEventListener('focus', this.focusHandler);
        this.inputElement.removeEventListener('select', this.selectHandler);
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

    onSelect(e: any) {
        this.oldSelectionLength = this.getSelectionLength();
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

        this.oldSelectionLength = 0;
        if (isSelected) {
            this.oldCaretPosition = -1;
            return;
        }
        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
    }

    get unmaskedUIValue(): string {
        if(this.isAttached) {
            let val = this.inputElement.value;
            let unmasked = this.masker.unmaskValue(val);
            return unmasked;
        }else{
            return this.numberToString(this.value);
        }
    }

    get unmaskedModelValue(): string {
        return this.getUnmaskedValue(this.value);
    }

    private getUnmaskedValue(_val): string {
        let val = this.numberToString(_val);
        let unmasked = this.masker.unmaskValue(val);
        return unmasked;
    }

    isAddition(doterriblethings: boolean = false) {
        // Case: Typing a character to overwrite a selection
        let val = this.unmaskedUIValue;
        let maskedVal = this.inputElement.value;
        if(doterriblethings && (this.bindMasking || this.aspnetMasking)) {
            val = this.inputElement.value;
        }
        let valOld = this.oldValueUnmasked;
        let oldMaskedVal = this.oldValue;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isAddition = (val.length > valOld.length) || (selectionLenOld && maskedVal.length > oldMaskedVal.length - selectionLenOld);
        return _isAddition;
    }

    isSingleAddition() {
        // Case: Typing a character to overwrite a selection
        let val = this.inputElement.value;
        let valOld = this.oldValueUnmasked;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isAddition = (val.length == valOld.length + 1);
        return _isAddition;
    }

    isDeletion() {
        // Case: Delete and backspace behave identically on a selection
        let val = this.inputElement.value;
        let valOld = this.oldValue;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld);
        return _isDeletion;
    }

    onInput(e: any) {
        e = e || {};

        let valUnmasked = this.unmaskedUIValue;
        let valUnmaskedOld = this.oldValueUnmasked;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        if(caretPosOld === -1) {
            // case when was selected, click to unselect isn't being (can't be?) handled elsewhere properly, grr
            caretPosOld = caretPos-1;
        }
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let wasSelected = selectionLenOld > 0;
        if(this.isSingleAddition() && this.editMode === "overtype") {
            // if user is holding a key down, we need to fix things up, because onKeyUp won't
            valUnmasked = this.inputElement.value;
            if(this.isValidCaretPosition(caretPosOld)) {
                let newChar = valUnmasked.charAt(caretPosOld);
                if(this.masker.isValidAt(newChar, caretPosOld)) {
                    valUnmasked = valUnmasked.substr(0, caretPos) + valUnmasked.substr(caretPos+1);
                    valUnmasked = this.masker.unmaskValue(valUnmasked);
                }else{
                    valUnmasked = valUnmasked.substr(0, caretPosOld) + valUnmasked.substr(caretPosOld+1);
                    valUnmasked = this.masker.unmaskValue(valUnmasked);
                }
                caretPos = this.masker.getNextCaretPos(caretPosOld);
            }else {
                let newChar = this.inputElement.value.charAt(caretPosOld) || "";
                if(!this.isValidCaretPosition(caretPos)) {
                    caretPos = this.masker.getNextCaretPos(caretPos);
                }
                valUnmasked = this.oldValue.substr(0, caretPos) + newChar + this.oldValue.substr(caretPos+1);
                valUnmasked = this.masker.unmaskValue(valUnmasked);
                caretPos = this.masker.getNextCaretPos(caretPos);
            }
        }

        // Necessary due to "input" event not providing a key code
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        // Handles cases where caret is moved and placed in front of invalid maskCaretMap position. Logic below
        // ensures that, on click or leftward caret placement, caret is moved leftward until directly right of
        // non-mask character. Also applied to click since users are (arguably) more likely to backspace 
        // a character when clicking within a filled input.
        let caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;

        if(wasSelected && this.isAddition(true)) {
            let startCaretPos = Math.min(caretPos, caretPosOld);
            if(caretPos < caretPosOld) {
                startCaretPos--; //??
            }

            if(selectionLenOld == this.oldValue.length && this.editMode === "insert") {
                // value in inputElement might not be masked properly yet
                let maskedValue = this.masker.maskValue(this.inputElement.value);
                let newDelta = maskedValue.length -  (this.oldValue.length - selectionLenOld);
                caretPos = startCaretPos + newDelta;
            }else{
                let oldSelectionStart = startCaretPos;
                let oldSuffix = this.oldValue.substr(oldSelectionStart+selectionLenOld);
                let oldPrefix = this.oldValue.substr(0, oldSelectionStart);
                let newPart = this.inputElement.value;
                if(newPart.startsWith(oldPrefix)) {
                    newPart = newPart.substr(oldPrefix.length);
                }
                if(newPart.endsWith(oldSuffix)) {
                    newPart = newPart.substr(0, newPart.length-oldSuffix.length);
                }
                if(!this.isValidCaretPosition(startCaretPos)) {
                    startCaretPos = this.masker.getNextCaretPos(startCaretPos);
                }
                if(this.inputElement.value.length === 1) {
                    caretPos = this.masker.getNextCaretPos(startCaretPos);
                }else{
                    // todo: this can still calculate caretPos wrong e.g. when user pastes into a partial selection
                    let newDelta = this.inputElement.value.length - (this.oldValue.length - selectionLenOld);
                    caretPos = startCaretPos + newDelta;
                }
                let allPlaceholder = this.masker.maskValue("");
                if(newPart.length < selectionLenOld) {
                    let caretDiff = startCaretPos - oldSelectionStart;
                    let fill = allPlaceholder.substr(startCaretPos+newPart.length, selectionLenOld-newPart.length - caretDiff);
                    let fillPrefix = allPlaceholder.substr(oldSelectionStart, caretDiff);
                    valUnmasked = oldPrefix + fillPrefix + newPart + fill + oldSuffix;
                    valUnmasked = this.masker.unmaskValue(valUnmasked);
                }
            }
        }

        this.oldSelectionLength = this.getSelectionLength();

        if (isKeyBackspace && this.preventBackspace && !wasSelected) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Value Handling
        // ==============

        if(this.isDeletion() && !wasSelected && !this.isValidCaretPosition(caretPos)) {
            // need to delete whatever was before the punctuation
            caretPos = this.masker.getPreviousCaretPos(caretPos);
            valUnmasked = this.masker.unmaskValue(this.oldValue.substring(0, caretPos) + this.oldValue.substring(caretPos+1));
        }
        // User attempted to delete but raw value was unaffected--correct this grievous offense
        else if (this.isDeletion() && !wasSelected && valUnmasked === valUnmaskedOld) {
            while (isKeyBackspace && caretPos > this.minCaretPos && !this.isValidCaretPosition(caretPos)) {
                caretPos--;
            }
            while (isKeyDelete && caretPos < this.maxCaretPos && this.masker.maskCaretMap.indexOf(caretPos) === -1) {
                caretPos++;
            }
            var charIndex = this.masker.maskCaretMap.indexOf(caretPos);
            // Strip out non-mask character that user would have deleted if mask hadn't been in the way.
            if(charIndex != 0) {
                if(!this.aspnetMasking) {
                    valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                }
            }
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this._setValue(valUnmasked);
    }

    _setValue(newValue: string|number) {
        if(isNumeric(newValue) && isString(this.value) && this.numberToString(newValue) === this.value)  {
            return;
        }
        
        if(isNumeric(this.value) && isString(newValue) && this.numberToString(this.value) === newValue)  {
            return;
        }

        if(!this.value && this.value !== 0 && !newValue && newValue !== 0) {
            return;
        }

        if (this.change != null && newValue !== this.value) {
            this.change({newValue: newValue, oldValue: this.value});
        }
        this.value = newValue;
    }



    // bad things happen if x != numberToString(stringToNumber(x))
    numberToString(val: number|string): string {
        // todo: allow user to customize 
        if(val == null) val = "";
        return ""+val;
    }

    // bad things happen if x != stringToNumber(numberToString(x))
    stringToNumber(val: number|string): number {
        // todo: allow user to customize 
        // todo: what to do when this fails
        if(isNumeric(val)) {
            return <number>val;
        }
        return parseFloat(<string>val);
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

        this.oldSelectionLength = 0;

        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }

        // Update values
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.inputElement.setSelectionRange(0, this.inputElement.value.length);
        this.oldSelectionLength = this.getSelectionLength();
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
        this._setValue(valUnmasked);
    }

    updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld) {
        // Update values
        let isAddition = this.isAddition();
        let valMasked = this.masker.maskValue(valUnmasked);
        let caretPosMin = this.minCaretPos;
        let caretPosMax = this.masker.maxCaretPos(valUnmasked);

        this.oldValue = valMasked;
        this.oldValueUnmasked = valUnmasked;

        if(this.isAttached) {
            this.inputElement.value = valMasked;
        }

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
        if (this.isHidden()) {
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

    isHidden(): boolean {
        return (this.inputElement.offsetWidth === 0 || this.inputElement.offsetHeight === 0);
    }

    maskChanged() {
        this.masker = getMasker({
            maskFormat: this.mask, 
            bindMasking: this.bindMasking, 
            placeholder: this.placeholder, 
            aspnetMasking: this.aspnetMasking
        });
    }

    valueChanged(newv, oldv) {
        // apparently, the assumption that newv === this.value doesn't hold
        let valUnmasked = this.getUnmaskedValue(newv);
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
        if(this.editMode === "overtype") {
            let strippedOld = this.masker.stripPlaceholders(oldv);
            let strippedNew = this.masker.stripPlaceholders(newv);
            caretBumpBack = caretBumpBack && strippedNew.length < strippedOld.length;
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this._setValue(valUnmasked);
    }
}
