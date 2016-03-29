var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { customAttribute, bindable, bindingMode, inject } from 'aurelia-framework';
import { getMasker } from "./masker";
export let MaskedInput = class {
    constructor(element) {
        this.isAttached = false;
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
        this.oldValueUnmasked = this.masker.unmaskValue(this.oldValue);
    }
    attached() {
        this.isAttached = true;
        this.inputElement = this.element;
        this.inputElement.addEventListener("keydown", this.keyDownHandler);
        this.inputElement.addEventListener('keyup', this.keyUpHandler);
        this.inputElement.addEventListener('input', this.inputHandler);
        this.inputElement.addEventListener('click', this.clickHandler);
        this.inputElement.addEventListener('focus', this.focusHandler);
        this.caretPos = this.getCaretPosition();
        this.inputElement.value = this.oldValue;
        this.updateUIValue(this.oldValue, false, this.minCaretPos, this.minCaretPos);
    }
    detached() {
        this.inputElement.removeEventListener("keydown", this.keyDownHandler);
        this.inputElement.removeEventListener('keyup', this.keyUpHandler);
        this.inputElement.removeEventListener('input', this.inputHandler);
        this.inputElement.removeEventListener('click', this.clickHandler);
        this.inputElement.removeEventListener('focus', this.focusHandler);
    }
    get maxCaretPos() {
        if (this.masker == null) {
            return 0;
        }
        let valUnmasked = this.unmaskedModelValue;
        let caretPosMax = this.masker.maxCaretPos(valUnmasked);
        return caretPosMax;
    }
    get minCaretPos() {
        if (this.masker == null) {
            return 0;
        }
        return this.masker.minCaretPos();
    }
    onClick(e) {
        e = e || {};
        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let isSelected = this.getSelectionLength() > 0;
        let wasSelected = selectionLenOld > 0;
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        let caretBumpBack = caretPos > this.minCaretPos;
        this.oldSelectionLength = this.getSelectionLength();
        if (isSelected) {
            return;
        }
        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
    }
    get unmaskedUIValue() {
        if (this.isAttached) {
            let val = this.inputElement.value;
            let unmasked = this.masker.unmaskValue(val);
            return unmasked;
        }
        else {
            return this.value;
        }
    }
    get unmaskedModelValue() {
        let val = this.value;
        let unmasked = this.masker.unmaskValue(val);
        return unmasked;
    }
    isAddition() {
        let val = this.unmaskedUIValue;
        let valOld = this.oldValueUnmasked;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld);
        return _isAddition;
    }
    isDeletion() {
        let val = this.unmaskedUIValue;
        let valOld = this.oldValueUnmasked;
        let selectionLenOld = this.oldSelectionLength || 0;
        let _isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld);
        return _isDeletion;
    }
    onInput(e) {
        e = e || {};
        let valUnmasked = this.unmaskedUIValue;
        let valUnmaskedOld = this.oldValueUnmasked;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let wasSelected = selectionLenOld > 0;
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        let caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;
        this.oldSelectionLength = this.getSelectionLength();
        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }
        if (this.isDeletion() && !wasSelected && valUnmasked === valUnmaskedOld) {
            while (isKeyBackspace && caretPos > this.minCaretPos && !this.isValidCaretPosition(caretPos)) {
                caretPos--;
            }
            while (isKeyDelete && caretPos < this.maxCaretPos && this.masker.maskCaretMap.indexOf(caretPos) === -1) {
                caretPos++;
            }
            var charIndex = this.masker.maskCaretMap.indexOf(caretPos);
            valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }
    onFocus(e) {
        e = e || {};
        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let wasSelected = selectionLenOld > 0;
        let isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
        let isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
        let caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;
        this.oldSelectionLength = this.getSelectionLength();
        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
    }
    onKeyUp(e) {
        e = e || {};
        var eventType = e.type;
        if (e.which === 16 || e.which === 91) {
            return;
        }
        let valUnmasked = this.unmaskedUIValue;
        let caretPos = this.getCaretPosition() || 0;
        let caretPosOld = this.oldCaretPosition || 0;
        let caretPosDelta = caretPos - caretPosOld;
        let selectionLenOld = this.oldSelectionLength || 0;
        let isSelected = this.getSelectionLength() > 0;
        let isSelection = (e.which >= 37 && e.which <= 40) && e.shiftKey;
        let isKeyLeftArrow = e.which === 37;
        let isKeyBackspace = e.which === 8;
        let isKeyDelete = e.which === 46;
        let caretBumpBack = (isKeyLeftArrow || isKeyBackspace) && caretPos > this.minCaretPos;
        this.oldSelectionLength = this.getSelectionLength();
        if (isSelection || isSelected) {
            return;
        }
        if (isKeyBackspace && this.preventBackspace) {
            this.inputElement.value = this.oldValue;
            this.setCaretPosition(caretPosOld);
            return;
        }
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }
    updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld) {
        let isAddition = this.isAddition();
        let valMasked = this.masker.maskValue(valUnmasked);
        let caretPosMin = this.minCaretPos;
        let caretPosMax = this.masker.maxCaretPos(valUnmasked);
        this.oldValue = valMasked;
        this.oldValueUnmasked = valUnmasked;
        if (this.isAttached) {
            this.inputElement.value = valMasked;
        }
        if (isAddition && (caretPos <= caretPosMin)) {
            caretPos = caretPosMin + 1;
        }
        if (caretBumpBack) {
            caretPos--;
        }
        caretPos = caretPos > caretPosMax ? caretPosMax : caretPos < caretPosMin ? caretPosMin : caretPos;
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
        if (document.selection) {
            return (document.selection.createRange().text.length);
        }
        return 0;
    }
    onKeyDown(e) {
        var isKeyBackspace = e.which === 8;
        var oldCaretPos = this.getCaretPosition();
        var newCaretPosOnBksp = oldCaretPos - 1 || 0;
        if (isKeyBackspace) {
            while (newCaretPosOnBksp >= 0) {
                if (this.isValidCaretPosition(newCaretPosOnBksp)) {
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
        }
        else if (document.selection) {
            if (this.isFocused()) {
                this.inputElement.focus();
                var selection = document.selection.createRange();
                selection.moveStart('character', this.inputElement.value ? -this.inputElement.value.length : 0);
                return selection.text.length;
            }
        }
        return 0;
    }
    isValidCaretPosition(pos) {
        return this.masker.maskCaretMap.indexOf(pos) > -1;
    }
    setCaretPosition(pos) {
        if (!this.inputElement)
            return 0;
        if (this.isHidden()) {
            return;
        }
        if (this.inputElement.setSelectionRange) {
            if (this.isFocused()) {
                this.inputElement.focus();
                this.inputElement.setSelectionRange(pos, pos);
            }
        }
        else if (this.inputElement.createTextRange) {
            var range = this.inputElement.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
    isFocused() {
        return this.inputElement === document.activeElement && (!document.hasFocus || document.hasFocus()) &&
            !!(this.inputElement.type || this.inputElement.href || ~this.inputElement.tabIndex);
    }
    isHidden() {
        return (this.inputElement.offsetWidth === 0 || this.inputElement.offsetHeight === 0);
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
        let caretBumpBack = caretPos > this.minCaretPos;
        this.oldSelectionLength = this.getSelectionLength();
        this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
        this.value = valUnmasked;
    }
};
__decorate([
    bindable({ defaultBindingMode: bindingMode.twoWay }), 
    __metadata('design:type', String)
], MaskedInput.prototype, "value", void 0);
__decorate([
    bindable, 
    __metadata('design:type', String)
], MaskedInput.prototype, "mask", void 0);
__decorate([
    bindable, 
    __metadata('design:type', String)
], MaskedInput.prototype, "inputId", void 0);
__decorate([
    bindable, 
    __metadata('design:type', String)
], MaskedInput.prototype, "inputClass", void 0);
__decorate([
    bindable, 
    __metadata('design:type', Boolean)
], MaskedInput.prototype, "disabled", void 0);
__decorate([
    bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: false }), 
    __metadata('design:type', Boolean)
], MaskedInput.prototype, "bindMasking", void 0);
__decorate([
    bindable({ defaultBindingMode: bindingMode.oneTime, defaultValue: null }), 
    __metadata('design:type', String)
], MaskedInput.prototype, "placeholder", void 0);
MaskedInput = __decorate([
    customAttribute('masked'),
    inject(Element), 
    __metadata('design:paramtypes', [Element])
], MaskedInput);
//# sourceMappingURL=masked-input.js.map