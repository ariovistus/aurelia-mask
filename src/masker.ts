/// <reference path="../typings/tsd.d.ts" />

export function getMasker(format): Masker {
    if (!maskers[format]) {
        maskers[format] = new Masker(format);
    }
    return maskers[format];
}


var maskers = {};
var maskDefinitions = {
    '9': /\d/,
    'A': /[a-zA-Z]/,
    '*': /[a-zA-Z0-9]/
};

export class Masker {
    maskFormat: string;
    maskCaretMap: Array<number>;
    maskPatterns: Array<RegExp>;
    maskPlaceholder: string;
    minRequiredLength: number;
    maskComponents: any;
    maskProcessed: boolean;

    constructor(maskFormat: string) {
        this.maskFormat = maskFormat;
        this.maskCaretMap = [];
        this.maskPatterns = [];
        this.maskPlaceholder = '';
        this.minRequiredLength = 0;
        this.maskComponents = null;
        this.maskProcessed = false;
        this.processRawMask();
    }

    unmaskValue(value) {
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

    maskValue(unmaskedValue) {
        unmaskedValue = unmaskedValue || '';
        var valueMasked = '',
            maskCaretMapCopy = this.maskCaretMap.slice();

        this.maskPlaceholder.split('').forEach(function (chr, i) {
            if (unmaskedValue.length && i === maskCaretMapCopy[0]) {
                valueMasked += unmaskedValue.charAt(0) || '_';
                unmaskedValue = unmaskedValue.substr(1);
                maskCaretMapCopy.shift();
            }
            else {
                valueMasked += chr;
            }
        });
        return valueMasked;
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
        var defaultPlaceholderChar = '_';
        return (defaultPlaceholderChar.toLowerCase() === 'space') ? ' ' : defaultPlaceholderChar[0];
    }
}

// from http://stackoverflow.com/a/9436948
function isString(myVar: any) {
    return (typeof myVar === 'string' || myVar instanceof String);
}
