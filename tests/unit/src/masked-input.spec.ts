/// <reference path="../../jasmine/jasmine.d.ts" />

import 'aurelia-polyfills';
import {initialize} from 'aurelia-pal-browser';
import {Masker, getMasker} from "src/masker";
import {MaskedInput} from "src/masked-input";
import {Container} from "aurelia-dependency-injection";
import {TemplatingEngine} from "aurelia-templating";

describe ("MaskedInput", () => {
    it("should do things on things", () => {
        initialize();
        // type '1', '2', 'left', 'left', 'v' should result in '12'
        console.info(document.createElement);
        let container = new Container();
        container.makeGlobal();
        let engine = container.get(TemplatingEngine)
        let maskedInput = engine.createViewModelForUnitTest(MaskedInput);
        console.info(maskedInput);
    });
});
