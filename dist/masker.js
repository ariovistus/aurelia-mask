function getMasker(options) {
    var maskers = _maskers;
    var key = new MaskOptions();
    key.maskFormat = options.maskFormat;
    key.placeholder = options.placeholder || "_";
    key.bindMasking = !!options.bindMasking;
    key.aspnetMasking = !!options.aspnetMasking;
    var strkey = JSON.stringify(key);
    if (!maskers[strkey]) {
        maskers[strkey] = new Masker(key);
    }
    return maskers[strkey];
}
exports.getMasker = getMasker;
var MaskOptions = (function () {
    function MaskOptions() {
    }
    return MaskOptions;
})();
exports.MaskOptions = MaskOptions;
var _maskers = new Map();
var maskDefinitions = {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/
};
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function deleteChars(s, ch) {
    if (s == null) {
        s = "";
    }
    return s.split(ch).join("");
}
var Masker = (function () {
    function Masker(options) {
        this.maskFormat = options.maskFormat;
        this.bindMasking = options.bindMasking;
        this.aspnetMasking = options.aspnetMasking;
        this.maskCaretMap = [];
        this.maskPatterns = [];
        this.maskPlaceholder = '';
        this.minRequiredLength = 0;
        this.maskComponents = null;
        this.maskProcessed = false;
        this.placeholder = options.placeholder;
        this.processRawMask();
    }
    Masker.prototype.unmaskValue = function (value) {
        if (this.aspnetMasking) {
            var result = this._maskValue2(value);
            return result;
        }
        else if (this.bindMasking) {
            return this._maskValue(value, true);
        }
        return this._unmaskValue(value);
    };
    Masker.prototype.maskValue = function (unmaskedValue) {
        if (this.aspnetMasking) {
            var result = this._maskValue2(unmaskedValue);
            return result;
        }
        else if (isNumeric(unmaskedValue)) {
            unmaskedValue = "" + unmaskedValue;
        }
        return this._maskValue(unmaskedValue, false);
    };
    Masker.prototype.maxCaretPos = function (value) {
        var valueLength = -1;
        if (isString(value)) {
            valueLength = value.length;
        }
        else if (isNumeric(value)) {
            valueLength = ("" + value).length;
        }
        if (this.aspnetMasking) {
            var caretPosMax = this.maskCaretMap.slice().pop();
            return caretPosMax;
        }
        else if (this.bindMasking) {
            if (this.maskCaretMap.indexOf(valueLength) != -1 ||
                valueLength === this.maskFormat.length) {
                return valueLength;
            }
            else {
                for (var i = 0; i < this.maskCaretMap.length; i++) {
                    if (this.maskCaretMap[i] > valueLength) {
                        return this.maskCaretMap[i];
                    }
                }
                return this.maskCaretMap.slice().shift();
            }
        }
        else {
            var caretPosMax = this.maskCaretMap[valueLength] || this.maskCaretMap.slice().shift();
            return caretPosMax;
        }
    };
    Masker.prototype.minCaretPos = function () {
        return this.maskCaretMap[0];
    };
    Masker.prototype._unmaskValue = function (value) {
        var valueUnmasked = '', maskPatternsCopy = this.maskPatterns.slice();
        value = value.toString();
        this.maskComponents.forEach(function (component) {
            value = value.replace(component, '');
        });
        value.split('').forEach(function (chr) {
            if (maskPatternsCopy.length && maskPatternsCopy[0].test(chr)) {
                valueUnmasked += chr;
                maskPatternsCopy.shift();
            }
        });
        return valueUnmasked;
    };
    Masker.prototype._maskValue = function (unmaskedValue, keepMasking) {
        var input = unmaskedValue || '';
        var valueMasked = '', maskCaretMapCopy = this.maskCaretMap.slice(), maskPatternsCopy = this.maskPatterns.slice();
        if (keepMasking) {
            input = this._unmaskValue(input);
        }
        function putMaybe(chr) {
            if (!keepMasking || input.length > 0) {
                valueMasked += chr;
            }
        }
        function putNextInput() {
            valueMasked += input.charAt(0);
        }
        function nextCharMatches() {
            return maskPatternsCopy[0].test(input.charAt(0));
        }
        function advanceInput() {
            input = input.substr(1);
        }
        function advanceCaretMap() {
            maskCaretMapCopy.shift();
        }
        function advancePatterns() {
            maskPatternsCopy.shift();
        }
        this.maskPlaceholder.split('').forEach(function (chr, i) {
            if (input.length > 0 && i === maskCaretMapCopy[0]) {
                if (maskPatternsCopy.length) {
                    while (input.length > 0 && !nextCharMatches()) {
                        advanceInput();
                    }
                }
                if (maskPatternsCopy.length && nextCharMatches()) {
                    putNextInput();
                    advanceCaretMap();
                    advancePatterns();
                }
                else {
                    putMaybe(chr);
                    maskCaretMapCopy.shift();
                }
                advanceInput();
            }
            else {
                if (input.length > 0 && input.charAt(0) === chr) {
                    advanceInput();
                }
                putMaybe(chr);
            }
        });
        return valueMasked;
    };
    Masker.prototype._maskValue2 = function (unmaskedValue) {
        var input = unmaskedValue || '';
        var valueMasked = '', maskCaretMapCopy = this.maskCaretMap.slice(), maskPatternsCopy = this.maskPatterns.slice();
        maskCaretMapCopy.pop();
        var placeholder = this.placeholder;
        function putMaybe(chr) {
            valueMasked += chr;
        }
        function putNextInput() {
            valueMasked += input.charAt(0);
        }
        function nextCharMatches() {
            if (input.charAt(0) == placeholder)
                return true;
            return maskPatternsCopy[0].test(input.charAt(0));
        }
        function advanceInput() {
            input = input.substr(1);
        }
        function advanceCaretMap() {
            maskCaretMapCopy.shift();
        }
        function advancePatterns() {
            maskPatternsCopy.shift();
        }
        this.maskPlaceholder.split('').forEach(function (chr, i) {
            if (input.length > 0 && i === maskCaretMapCopy[0]) {
                if (maskPatternsCopy.length && nextCharMatches()) {
                    putNextInput();
                    advanceCaretMap();
                    advancePatterns();
                }
                else {
                    putMaybe(chr);
                    maskCaretMapCopy.shift();
                }
                advanceInput();
            }
            else {
                while (input.length > 0 && input.charAt(0) === placeholder) {
                    advanceInput();
                }
                if (input.length > 0 && input.charAt(0) === chr) {
                    advanceInput();
                }
                putMaybe(chr);
            }
        });
        return valueMasked;
    };
    Masker.prototype.stripPlaceholders = function (masked) {
        return deleteChars(masked, this.placeholder);
    };
    Masker.prototype.getNextCaretPos = function (caretPos) {
        if (this.maskCaretMap.length == 0) {
            return this.maskFormat.length;
        }
        var ix = 0;
        while (ix < this.maskCaretMap.length - 1 && this.maskCaretMap[ix] <= caretPos) {
            ix++;
        }
        return this.maskCaretMap[ix];
    };
    Masker.prototype.getPreviousCaretPos = function (caretPos) {
        if (this.maskCaretMap.length == 0) {
            return 0;
        }
        var ix = this.maskCaretMap.length - 1;
        while (ix > 0 && this.maskCaretMap[ix] >= caretPos) {
            ix--;
        }
        return this.maskCaretMap[ix];
    };
    Masker.prototype.processRawMask = function () {
        var _this = this;
        var characterCount = 0;
        if (isString(this.maskFormat)) {
            var isOptional = false, numberOfOptionalCharacters = 0, splitMask = this.maskFormat.split('');
            splitMask.forEach(function (chr, i) {
                if (maskDefinitions[chr]) {
                    _this.maskCaretMap.push(characterCount);
                    _this.maskPlaceholder += _this.getPlaceholderChar(i - numberOfOptionalCharacters);
                    _this.maskPatterns.push(maskDefinitions[chr]);
                    characterCount++;
                    if (!isOptional) {
                        _this.minRequiredLength++;
                    }
                    isOptional = false;
                }
                else if (chr === '?') {
                    isOptional = true;
                    numberOfOptionalCharacters++;
                }
                else {
                    _this.maskPlaceholder += chr;
                    characterCount++;
                }
            });
        }
        this.maskCaretMap.push(this.maskCaretMap.slice().pop() + 1);
        this.getMaskComponents();
        this.maskProcessed = this.maskCaretMap.length > 1 ? true : false;
    };
    Masker.prototype.getMaskComponents = function () {
        var maskPlaceholderChars = this.maskPlaceholder.split(''), maskPlaceholderCopy;
        if (this.maskCaretMap && !isNaN(this.maskCaretMap[0])) {
            this.maskCaretMap.forEach(function (value) {
                maskPlaceholderChars[value] = '_';
            });
        }
        maskPlaceholderCopy = maskPlaceholderChars.join('');
        this.maskComponents = maskPlaceholderCopy.replace(/[_]+/g, '_').split('_');
    };
    Masker.prototype.getPlaceholderChar = function (i) {
        var defaultPlaceholderChar = this.placeholder;
        return (defaultPlaceholderChar.toLowerCase() === 'space') ? ' ' : defaultPlaceholderChar[0];
    };
    Masker.prototype.isValidAt = function (chr, caretPos) {
        var ix = this.maskCaretMap.indexOf(caretPos);
        if (ix == -1 || ix >= this.maskPatterns.length)
            return false;
        var pattern = this.maskPatterns[ix];
        return pattern.test(chr);
    };
    return Masker;
})();
exports.Masker = Masker;
function isString(myVar) {
    return (typeof myVar === 'string' || myVar instanceof String);
}
//# sourceMappingURL=masker.js.map