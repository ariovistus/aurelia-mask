export declare function getMasker(format: string, bindMasking: boolean, _placeholder?: string, aspnetMasking?: boolean): Masker;
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
    constructor(options: any);
    unmaskValue(value: any): string;
    maskValue(unmaskedValue: any): string;
    maxCaretPos(value: any): number;
    minCaretPos(): number;
    _unmaskValue(value: any): string;
    _maskValue(unmaskedValue: string, keepMasking: boolean): string;
    _maskValue2(unmaskedValue: string): string;
    stripPlaceholders(masked: any): string;
    processRawMask(): void;
    getMaskComponents(): void;
    getPlaceholderChar(i: any): string;
}
