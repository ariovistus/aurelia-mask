export function getMasker(format, bindMasking, _placeholder = null) {
    let maskers = _maskers;
    let bindPlaceholdersIx = bindMasking ? 1 : 0;
    let placeholder = _placeholder || "_";
    if (!maskers[bindPlaceholdersIx]) {
        maskers[bindPlaceholdersIx] = {};
    }
    maskers = maskers[bindPlaceholdersIx];
    if (!maskers[placeholder]) {
        maskers[placeholder] = {};
    }
    maskers = maskers[placeholder];
    if (!maskers[format]) {
        maskers[format] = new Masker(format, bindMasking, placeholder);
    }
    return maskers[format];
}
var _maskers = {};
var maskDefinitions = {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/
};
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
export class Masker {
    constructor(maskFormat, bindMasking, placeholder) {
        this.maskFormat = maskFormat;
        this.bindMasking = bindMasking;
        this.maskCaretMap = [];
        this.maskPatterns = [];
        this.maskPlaceholder = '';
        this.minRequiredLength = 0;
        this.maskComponents = null;
        this.maskProcessed = false;
        this.placeholder = placeholder;
        this.processRawMask();
    }
    unmaskValue(value) {
        if (this.bindMasking) {
            return this._maskValue(value, true);
        }
        return this._unmaskValue(value);
    }
    maskValue(unmaskedValue) {
        if (isNumeric(unmaskedValue)) {
            unmaskedValue = "" + unmaskedValue;
        }
        return this._maskValue(unmaskedValue, false);
    }
    maxCaretPos(value) {
        let valueLength = -1;
        if (isString(value)) {
            valueLength = value.length;
        }
        else if (isNumeric(value)) {
            valueLength = ("" + value).length;
        }
        if (this.bindMasking) {
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
            let caretPosMax = this.maskCaretMap[valueLength] || this.maskCaretMap.slice().shift();
            return caretPosMax;
        }
    }
    minCaretPos() {
        return this.maskCaretMap[0];
    }
    _unmaskValue(value) {
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
    }
    _maskValue(unmaskedValue, keepMasking) {
        let input = unmaskedValue || '';
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
    }
    processRawMask() {
        var characterCount = 0;
        if (isString(this.maskFormat)) {
            var isOptional = false, numberOfOptionalCharacters = 0, splitMask = this.maskFormat.split('');
            splitMask.forEach((chr, i) => {
                if (maskDefinitions[chr]) {
                    this.maskCaretMap.push(characterCount);
                    this.maskPlaceholder += this.getPlaceholderChar(i - numberOfOptionalCharacters);
                    this.maskPatterns.push(maskDefinitions[chr]);
                    characterCount++;
                    if (!isOptional) {
                        this.minRequiredLength++;
                    }
                    isOptional = false;
                }
                else if (chr === '?') {
                    isOptional = true;
                    numberOfOptionalCharacters++;
                }
                else {
                    this.maskPlaceholder += chr;
                    characterCount++;
                }
            });
        }
        this.maskCaretMap.push(this.maskCaretMap.slice().pop() + 1);
        this.getMaskComponents();
        this.maskProcessed = this.maskCaretMap.length > 1 ? true : false;
    }
    getMaskComponents() {
        var maskPlaceholderChars = this.maskPlaceholder.split(''), maskPlaceholderCopy;
        if (this.maskCaretMap && !isNaN(this.maskCaretMap[0])) {
            this.maskCaretMap.forEach((value) => {
                maskPlaceholderChars[value] = '_';
            });
        }
        maskPlaceholderCopy = maskPlaceholderChars.join('');
        this.maskComponents = maskPlaceholderCopy.replace(/[_]+/g, '_').split('_');
    }
    getPlaceholderChar(i) {
        var defaultPlaceholderChar = this.placeholder;
        return (defaultPlaceholderChar.toLowerCase() === 'space') ? ' ' : defaultPlaceholderChar[0];
    }
}
function isString(myVar) {
    return (typeof myVar === 'string' || myVar instanceof String);
}
//# sourceMappingURL=masker.js.map