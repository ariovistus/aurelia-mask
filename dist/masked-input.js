System.register(['aurelia-framework', "./masker"], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var aurelia_framework_1, masker_1;
    var MaskedInput;
    return {
        setters:[
            function (aurelia_framework_1_1) {
                aurelia_framework_1 = aurelia_framework_1_1;
            },
            function (masker_1_1) {
                masker_1 = masker_1_1;
            }],
        execute: function() {
            MaskedInput = (function () {
                function MaskedInput(element) {
                    var _this = this;
                    this.isAttached = false;
                    this.element = element;
                    this.preventBackspace = false;
                    this.keyDownHandler = function (e) { return _this.onKeyDown(e); };
                    this.keyUpHandler = function (e) { return _this.onKeyUp(e); };
                    this.clickHandler = function (e) { return _this.onClick(e); };
                    this.inputHandler = function (e) { return _this.onInput(e); };
                    this.focusHandler = function (e) { return _this.onFocus(e); };
                }
                MaskedInput.prototype.bind = function () {
                    this.masker = masker_1.getMasker(this.mask, this.bindMasking, this.placeholder, this.aspnetMasking);
                    this.oldValue = this.masker.maskValue(this.value);
                    this.oldValueUnmasked = this.masker.unmaskValue(this.oldValue);
                };
                MaskedInput.prototype.attached = function () {
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
                };
                MaskedInput.prototype.detached = function () {
                    this.inputElement.removeEventListener("keydown", this.keyDownHandler);
                    this.inputElement.removeEventListener('keyup', this.keyUpHandler);
                    this.inputElement.removeEventListener('input', this.inputHandler);
                    this.inputElement.removeEventListener('click', this.clickHandler);
                    this.inputElement.removeEventListener('focus', this.focusHandler);
                };
                Object.defineProperty(MaskedInput.prototype, "maxCaretPos", {
                    get: function () {
                        if (this.masker == null) {
                            return 0;
                        }
                        var valUnmasked = this.unmaskedModelValue;
                        var caretPosMax = this.masker.maxCaretPos(valUnmasked);
                        return caretPosMax;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MaskedInput.prototype, "minCaretPos", {
                    get: function () {
                        if (this.masker == null) {
                            return 0;
                        }
                        return this.masker.minCaretPos();
                    },
                    enumerable: true,
                    configurable: true
                });
                MaskedInput.prototype.onClick = function (e) {
                    e = e || {};
                    var valUnmasked = this.unmaskedUIValue;
                    var caretPos = this.getCaretPosition() || 0;
                    var caretPosOld = this.oldCaretPosition || 0;
                    var caretPosDelta = caretPos - caretPosOld;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var isSelected = this.getSelectionLength() > 0;
                    var wasSelected = selectionLenOld > 0;
                    var isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
                    var isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
                    var caretBumpBack = caretPos > this.minCaretPos;
                    this.oldSelectionLength = this.getSelectionLength();
                    if (isSelected) {
                        return;
                    }
                    if (isKeyBackspace && this.preventBackspace) {
                        this.inputElement.value = this.oldValue;
                        this.setCaretPosition(caretPosOld);
                        return;
                    }
                    console.info("update ui from onClick");
                    this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
                };
                Object.defineProperty(MaskedInput.prototype, "unmaskedUIValue", {
                    get: function () {
                        if (this.isAttached) {
                            var val = this.inputElement.value;
                            var unmasked = this.masker.unmaskValue(val);
                            return unmasked;
                        }
                        else {
                            return this.value;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(MaskedInput.prototype, "unmaskedModelValue", {
                    get: function () {
                        var val = this.value;
                        var unmasked = this.masker.unmaskValue(val);
                        return unmasked;
                    },
                    enumerable: true,
                    configurable: true
                });
                MaskedInput.prototype.isAddition = function () {
                    var val = this.unmaskedUIValue;
                    var valOld = this.oldValueUnmasked;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var _isAddition = (val.length > valOld.length) || (selectionLenOld && val.length > valOld.length - selectionLenOld);
                    return _isAddition;
                };
                MaskedInput.prototype.isSingleAddition = function () {
                    var val = this.inputElement.value;
                    var valOld = this.oldValueUnmasked;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var _isAddition = (val.length == valOld.length + 1);
                    return _isAddition;
                };
                MaskedInput.prototype.isDeletion = function () {
                    var val = this.unmaskedUIValue;
                    if (this.aspnetMasking) {
                        val = this.inputElement.value;
                    }
                    var valOld = this.oldValueUnmasked;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var _isDeletion = (val.length < valOld.length) || (selectionLenOld && val.length === valOld.length - selectionLenOld);
                    return _isDeletion;
                };
                MaskedInput.prototype.onInput = function (e) {
                    e = e || {};
                    var valUnmasked = this.unmaskedUIValue;
                    var valUnmaskedOld = this.oldValueUnmasked;
                    var caretPos = this.getCaretPosition() || 0;
                    var caretPosOld = this.oldCaretPosition || 0;
                    var caretPosDelta = caretPos - caretPosOld;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var wasSelected = selectionLenOld > 0;
                    if (this.isSingleAddition() && this.editMode === "overtype") {
                        console.info("correcting single char overtype at caret pos ", caretPos);
                        valUnmasked = this.inputElement.value;
                        console.info(" was: ", valUnmasked);
                        valUnmasked = valUnmasked.substr(0, caretPos) + valUnmasked.substr(caretPos + 1);
                        valUnmasked = this.masker.unmaskValue(valUnmasked);
                        console.info(" is: ", valUnmasked);
                        var caretPosMin = this.minCaretPos;
                        var caretPosMax = this.masker.maxCaretPos(valUnmasked);
                        console.info(" caretmap: ", this.masker.maskCaretMap);
                        while (!this.isValidCaretPosition(caretPos) && caretPos > caretPosMin && caretPos < caretPosMax) {
                            caretPos += 1;
                        }
                        console.info("caret pos should be ", caretPos);
                    }
                    var isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
                    var isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
                    var isAddition = this.isAddition();
                    var caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;
                    this.oldSelectionLength = this.getSelectionLength();
                    if (isKeyBackspace && this.preventBackspace) {
                        this.inputElement.value = this.oldValue;
                        this.setCaretPosition(caretPosOld);
                        return;
                    }
                    console.info(" onInput caretPos: ", caretPos, " isKeyBackspace: ", isKeyBackspace, "isDeletion: ", this.isDeletion(), "caretPosDelta: ", caretPosDelta);
                    if (this.isDeletion() && !wasSelected && valUnmasked === valUnmaskedOld) {
                        while (isKeyBackspace && caretPos > this.minCaretPos && !this.isValidCaretPosition(caretPos)) {
                            caretPos--;
                        }
                        while (isKeyDelete && caretPos < this.maxCaretPos && this.masker.maskCaretMap.indexOf(caretPos) === -1) {
                            caretPos++;
                        }
                        var charIndex = this.masker.maskCaretMap.indexOf(caretPos);
                        if (charIndex != 0) {
                            valUnmasked = valUnmasked.substring(0, charIndex) + valUnmasked.substring(charIndex + 1);
                        }
                        console.info(" onInput did something to caretPos: ", caretPos);
                    }
                    console.info("update ui from onInput");
                    this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
                    this.value = valUnmasked;
                    console.info("resultant caret pos: ", this.getCaretPosition());
                };
                MaskedInput.prototype.onFocus = function (e) {
                    e = e || {};
                    var valUnmasked = this.unmaskedUIValue;
                    var caretPos = this.getCaretPosition() || 0;
                    var caretPosOld = this.oldCaretPosition || 0;
                    var caretPosDelta = caretPos - caretPosOld;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var wasSelected = selectionLenOld > 0;
                    var isKeyBackspace = (this.isDeletion() && (caretPosDelta === -1));
                    var isKeyDelete = (this.isDeletion() && (caretPosDelta === 0) && !wasSelected);
                    var caretBumpBack = (isKeyBackspace) && caretPos > this.minCaretPos;
                    this.oldSelectionLength = this.getSelectionLength();
                    if (isKeyBackspace && this.preventBackspace) {
                        this.inputElement.value = this.oldValue;
                        this.setCaretPosition(caretPosOld);
                        return;
                    }
                    console.info("update ui from onFocus");
                    this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
                };
                MaskedInput.prototype.onKeyUp = function (e) {
                    e = e || {};
                    var eventType = e.type;
                    if (e.which === 16 || e.which === 91) {
                        return;
                    }
                    var valUnmasked = this.unmaskedUIValue;
                    var caretPos = this.getCaretPosition() || 0;
                    console.info("onKeyUp caret pos: ", caretPos);
                    var caretPosOld = this.oldCaretPosition || 0;
                    var caretPosDelta = caretPos - caretPosOld;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var isSelected = this.getSelectionLength() > 0;
                    var isSelection = (e.which >= 37 && e.which <= 40) && e.shiftKey;
                    var isKeyLeftArrow = e.which === 37;
                    var isKeyBackspace = e.which === 8;
                    var isKeyDelete = e.which === 46;
                    var caretBumpBack = (isKeyLeftArrow || isKeyBackspace) && caretPos > this.minCaretPos;
                    this.oldSelectionLength = this.getSelectionLength();
                    if (isSelection || isSelected) {
                        return;
                    }
                    if (isKeyBackspace && this.preventBackspace) {
                        this.inputElement.value = this.oldValue;
                        this.setCaretPosition(caretPosOld);
                        return;
                    }
                    console.info("update ui from onKeyUp");
                    this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
                    this.value = valUnmasked;
                };
                MaskedInput.prototype.updateUIValue = function (valUnmasked, caretBumpBack, caretPos, caretPosOld) {
                    console.info("update ui value val: ", valUnmasked, "caretPos: ", caretPos, "caret bump back: ", caretBumpBack);
                    var isAddition = this.isAddition();
                    var valMasked = this.masker.maskValue(valUnmasked);
                    var caretPosMin = this.minCaretPos;
                    var caretPosMax = this.masker.maxCaretPos(valUnmasked);
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
                    console.info("out update ui");
                };
                MaskedInput.prototype.getSelectionLength = function () {
                    if (!this.inputElement)
                        return 0;
                    if (this.inputElement.selectionStart !== undefined) {
                        return (this.inputElement.selectionEnd - this.inputElement.selectionStart);
                    }
                    if (document.selection) {
                        return (document.selection.createRange().text.length);
                    }
                    return 0;
                };
                MaskedInput.prototype.onKeyDown = function (e) {
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
                };
                MaskedInput.prototype.getCaretPosition = function () {
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
                };
                MaskedInput.prototype.isValidCaretPosition = function (pos) {
                    return this.masker.maskCaretMap.indexOf(pos) > -1;
                };
                MaskedInput.prototype.setCaretPosition = function (pos) {
                    console.info("   set caret pos to ", pos);
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
                };
                MaskedInput.prototype.isFocused = function () {
                    return this.inputElement === document.activeElement && (!document.hasFocus || document.hasFocus()) &&
                        !!(this.inputElement.type || this.inputElement.href || ~this.inputElement.tabIndex);
                };
                MaskedInput.prototype.isHidden = function () {
                    return (this.inputElement.offsetWidth === 0 || this.inputElement.offsetHeight === 0);
                };
                MaskedInput.prototype.maskChanged = function () {
                    this.masker = masker_1.getMasker(this.mask, this.bindMasking);
                };
                MaskedInput.prototype.valueChanged = function (newv, oldv) {
                    var valUnmasked = this.unmaskedModelValue;
                    var caretPos = this.getCaretPosition() || 0;
                    var caretPosOld = this.oldCaretPosition || 0;
                    var caretPosDelta = caretPos - caretPosOld;
                    var selectionLenOld = this.oldSelectionLength || 0;
                    var isSelected = this.getSelectionLength() > 0;
                    var caretBumpBack = caretPos > this.minCaretPos;
                    this.oldSelectionLength = this.getSelectionLength();
                    console.info("update ui from valueChanged");
                    console.info(" value: ", newv, oldv);
                    console.info(" valueUnmasked: ", valUnmasked);
                    console.info(" oldValueUnmasked: ", this.oldValueUnmasked);
                    if (this.editMode === "overtype") {
                        if (this.masker.stripPlaceholders(newv).length < this.masker.stripPlaceholders(oldv).length) {
                            caretBumpBack = true;
                        }
                        else {
                            caretBumpBack = false;
                        }
                    }
                    this.updateUIValue(valUnmasked, caretBumpBack, caretPos, caretPosOld);
                    this.value = valUnmasked;
                };
                __decorate([
                    aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }), 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "value", void 0);
                __decorate([
                    aurelia_framework_1.bindable, 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "mask", void 0);
                __decorate([
                    aurelia_framework_1.bindable, 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "inputId", void 0);
                __decorate([
                    aurelia_framework_1.bindable, 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "inputClass", void 0);
                __decorate([
                    aurelia_framework_1.bindable, 
                    __metadata('design:type', Boolean)
                ], MaskedInput.prototype, "disabled", void 0);
                __decorate([
                    aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.oneTime, defaultValue: false }), 
                    __metadata('design:type', Boolean)
                ], MaskedInput.prototype, "bindMasking", void 0);
                __decorate([
                    aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.oneTime, defaultValue: false }), 
                    __metadata('design:type', Boolean)
                ], MaskedInput.prototype, "aspnetMasking", void 0);
                __decorate([
                    aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.oneTime, defaultValue: null }), 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "placeholder", void 0);
                __decorate([
                    aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.oneTime, defaultValue: "insert" }), 
                    __metadata('design:type', String)
                ], MaskedInput.prototype, "editMode", void 0);
                MaskedInput = __decorate([
                    aurelia_framework_1.customAttribute('masked'),
                    aurelia_framework_1.inject(Element), 
                    __metadata('design:paramtypes', [Element])
                ], MaskedInput);
                return MaskedInput;
            })();
            exports_1("MaskedInput", MaskedInput);
        }
    }
});
//# sourceMappingURL=masked-input.js.map