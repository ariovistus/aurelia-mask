import {getMasker} from "./masker";

export class MaskValueConverter {
    toView(value: string, format: string, bindMasking: boolean, placeholder: string): string {
        var masker = getMasker({maskFormat: format, bindMasking: bindMasking, placeholder: placeholder, aspnetMasking: false});
        var result = masker.maskValue(value);
        return result;
    }
    fromView(value: string, format: string, bindMasking: boolean, placeholder: string): string {
        var masker = getMasker({maskFormat: format, bindMasking: bindMasking, placeholder: placeholder, aspnetMasking: false});
        var result = masker.unmaskValue(value);
        return result;
    }
}


