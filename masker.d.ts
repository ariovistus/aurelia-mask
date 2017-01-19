export declare function getMasker(options: IMaskOptions): Masker;
export interface IMaskOptions {
    maskFormat: string;
    bindMasking: boolean;
    placeholder?: string;
    aspnetMasking?: boolean;
}
export declare class MaskOptions {
    maskFormat: string;
    bindMasking: boolean;
    placeholder: string;
    aspnetMasking: boolean;
}
export declare class Masker {
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
    constructor(options: MaskOptions);
    unmaskValue(value: string): string;
    maskValue(unmaskedValue: string): string;
    maxCaretPos(value: string): number;
    minCaretPos(): number;
    _unmaskValue(value: any): string;
    _maskValue(unmaskedValue: string, keepMasking: boolean): string;
    _maskValue2(unmaskedValue: string): string;
    stripPlaceholders(masked: any): string;
    getNextCaretPos(caretPos: number): number;
    getPreviousCaretPos(caretPos: number): number;
    processRawMask(): void;
    getMaskComponents(): void;
    getPlaceholderChar(i: any): string;
    isValidAt(chr: string, caretPos: number): boolean;
}
export declare function isString(myVar: any): boolean;
export declare function isNumeric(n: any): boolean;
