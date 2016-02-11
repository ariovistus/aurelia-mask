/// <reference path="../typings/tsd.d.ts" />

import {getMasker} from "./masker";

export class MaskValueConverter {
    toView(value: string, format: string, maskBinding: boolean): string {
        var masker = getMasker(format, maskBinding);
        var result = masker.maskValue(value);
        return result;
    }
    fromView(value: string, format: string, maskBinding: boolean): string {
        var masker = getMasker(format, maskBinding);
        var result = masker.unmaskValue(value);
        return result;
    }
}


