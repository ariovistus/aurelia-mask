export declare function getMasker(format: string, bindMasking: boolean, _placeholder?: string): Masker;
export declare class Masker {
    maskFormat: string;
    maskCaretMap: Array<number>;
    maskPatterns: Array<RegExp>;
    maskPlaceholder: string;
    minRequiredLength: number;
    maskComponents: any;
    maskProcessed: boolean;
    bindMasking: boolean;
    placeholder: string;
    constructor(maskFormat: string, bindMasking: boolean, placeholder: string);
    unmaskValue(value: any): string;
    maskValue(unmaskedValue: any): string;
    maxCaretPos(value: any): number;
    minCaretPos(): number;
    _unmaskValue(value: any): string;
    _maskValue(unmaskedValue: string, keepMasking: boolean): string;
    processRawMask(): void;
    getMaskComponents(): void;
    getPlaceholderChar(i: any): string;
}
