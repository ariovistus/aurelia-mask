export function getMasker(format: string, bindMasking: boolean, _placeholder: string = null, aspnetMasking: boolean = false): Masker {
    let maskers : Map<any, Masker> = _maskers;
    let placeholder = _placeholder || "_";
    bindMasking = !!bindMasking;
    aspnetMasking = !!aspnetMasking;

    let key = {
        maskFormat: format,
        bindMasking: bindMasking,
        placeholder: placeholder,
        aspnetMasking: aspnetMasking
    }
    let strkey = JSON.stringify(key);
    if (!maskers[strkey]) {
        maskers[strkey] = new Masker(key);
    }
    return maskers[strkey];
}


var _maskers = new Map<any, Masker>();
var maskDefinitions = {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/
};
// from http://stackoverflow.com/a/9716488/23648
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function deleteChars(s: string, ch: string): string {
    if(s == null) {
        s = "";
    }
    return s.split(ch).join("");
}

export class Masker {
    maskFormat: string;
    maskCaretMap: Array<number>;
    maskPatterns: Array<RegExp>;
    maskPlaceholder: string;
    minRequiredLength: number;
    maskComponents: any;
    maskProcessed: boolean;
    bindMasking: boolean;
    aspnetMasking: boolean;
    placeholder: string;

    constructor(options) {
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

    unmaskValue(value) {
        if(this.aspnetMasking) {
            let result = this._maskValue2(value);
            return result;
        }else if(this.bindMasking) {
            return this._maskValue(value, true);
        }
        return this._unmaskValue(value);
    }

    maskValue(unmaskedValue) {
        if(this.aspnetMasking) {
            let result = this._maskValue2(unmaskedValue);
            return result;
        }else if(isNumeric(unmaskedValue)) {
            unmaskedValue = ""+unmaskedValue;
        }
        return this._maskValue(unmaskedValue, false);
    }

    maxCaretPos(value: any): number {
        let valueLength = -1;
        if(isString(value)) {
            valueLength = value.length;
        }else if(isNumeric(value)) {
            valueLength = (""+value).length;
        }
        if(this.aspnetMasking) {
            let caretPosMax = this.maskCaretMap.slice().pop();
            return caretPosMax;
        }else if(this.bindMasking) {
            if(this.maskCaretMap.indexOf(valueLength) != -1 || 
                valueLength === this.maskFormat.length) {
                return valueLength;
            }else {
                for(var i = 0; i < this.maskCaretMap.length; i++) {
                    if(this.maskCaretMap[i] > valueLength) 
                    {
                        return this.maskCaretMap[i];
                    }
                }
                return this.maskCaretMap.slice().shift();

            }
        }else{
            let caretPosMax = this.maskCaretMap[valueLength] || this.maskCaretMap.slice().shift();
            return caretPosMax;
        }
    }

    minCaretPos(): number {
        return this.maskCaretMap[0];
    }

    _unmaskValue(value) {
        var valueUnmasked = '',
            maskPatternsCopy = this.maskPatterns.slice();
        // Preprocess by stripping mask components from value
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

    _maskValue(unmaskedValue: string, keepMasking: boolean) {
        let input = unmaskedValue || '';
        var valueMasked = '',
            maskCaretMapCopy = this.maskCaretMap.slice(),
            maskPatternsCopy = this.maskPatterns.slice();

        if (keepMasking) {
            input = this._unmaskValue(input);
        }

        function putMaybe(chr) {
            if(!keepMasking || input.length > 0) {
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
                if(maskPatternsCopy.length) {
                    while(input.length > 0 && !nextCharMatches()) {
                        advanceInput();
                    }
                }
                if(maskPatternsCopy.length && nextCharMatches()) {
                    putNextInput();
                    advanceCaretMap();
                    advancePatterns();
                }else{
                    putMaybe(chr);
                    maskCaretMapCopy.shift();
                }
                advanceInput();
            }else{
                if (input.length > 0 && input.charAt(0) === chr) {
                    advanceInput();
                }
                putMaybe(chr);
            }
        });
        return valueMasked;
    }

    _maskValue2(unmaskedValue: string) {
        let input = unmaskedValue || '';
        var valueMasked = '',
            maskCaretMapCopy = this.maskCaretMap.slice(),
            maskPatternsCopy = this.maskPatterns.slice();
        maskCaretMapCopy.pop(); //don't want that last position
        var placeholder = this.placeholder;

        function putMaybe(chr) {
            valueMasked += chr;
        }

        function putNextInput() {
            valueMasked += input.charAt(0);
        }

        function nextCharMatches() {
            if(input.charAt(0) == placeholder) return true;
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
                if(maskPatternsCopy.length && nextCharMatches()) {
                    putNextInput();
                    advanceCaretMap();
                    advancePatterns();
                }else{
                    putMaybe(chr);
                    maskCaretMapCopy.shift();
                }
                advanceInput();
            }else{
                while(input.length > 0 && input.charAt(0) === placeholder) {
                    advanceInput();
                }
                if (input.length > 0 && input.charAt(0) === chr) {
                    advanceInput();
                }
                putMaybe(chr);
            }
        });
        return valueMasked;
    }

    stripPlaceholders(masked) {
        return deleteChars(masked, this.placeholder);
    }

    getNextCaretPos(caretPos: number): number {
        if(this.maskCaretMap.length == 0) {
            return this.maskFormat.length;
        }
        let ix = 0;
        while(ix < this.maskCaretMap.length-1 && this.maskCaretMap[ix] <= caretPos) {
            ix++;
        }
        return this.maskCaretMap[ix];
    }

    getPreviousCaretPos(caretPos: number): number {
        if(this.maskCaretMap.length == 0) {
            return 0;
        }
        let ix = this.maskCaretMap.length-1;
        while(ix > 0 && this.maskCaretMap[ix] >= caretPos) {
            ix--;
        }
        return this.maskCaretMap[ix];
    }

    processRawMask() {
        var characterCount: number = 0;
        if (isString(this.maskFormat)) {

            var isOptional = false,
                numberOfOptionalCharacters = 0,
                splitMask = this.maskFormat.split('');

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
        // Caret position immediately following last position is valid.
        this.maskCaretMap.push(this.maskCaretMap.slice().pop() + 1);

        this.getMaskComponents();
        this.maskProcessed = this.maskCaretMap.length > 1 ? true : false;
    }


    getMaskComponents() {
        var maskPlaceholderChars = this.maskPlaceholder.split(''),
            maskPlaceholderCopy;

        //maskCaretMap can have bad values if the input has the ui-mask attribute implemented as an observable property, i.e.the demo page
        if (this.maskCaretMap && !isNaN(this.maskCaretMap[0])) {
            //Instead of trying to manipulate the RegEx based on the placeholder characters
            //we can simply replace the placeholder characters based on the already built
            //maskCaretMap to underscores and leave the original working RegEx to get the pr

            //mask components
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

// from http://stackoverflow.com/a/9436948
function isString(myVar: any) {
    return (typeof myVar === 'string' || myVar instanceof String);
}
