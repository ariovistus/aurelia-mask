/// <reference path="../typings/tsd.d.ts" />

import {getMasker} from "./masker";

export class MaskValueConverter {
    toView(value: string, format: string): string {
        var masker = getMasker(format);
        var result = masker.maskValue(value);
        return result;
    }
    fromView(value: string, format: string): string {
        var masker = getMasker(format);
        var result = masker.unmaskValue(value);
        return result;
    }
}


