import { getMasker } from "./masker";
export class MaskValueConverter {
    toView(value, format, maskBinding, placeholder) {
        var masker = getMasker(format, maskBinding, placeholder);
        var result = masker.maskValue(value);
        return result;
    }
    fromView(value, format, maskBinding, placeholder) {
        var masker = getMasker(format, maskBinding, placeholder);
        var result = masker.unmaskValue(value);
        return result;
    }
}
//# sourceMappingURL=mask.js.map