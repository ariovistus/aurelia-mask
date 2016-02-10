/// <reference path="./jasmine/jasmine.d.ts" />

import {Masker, getMasker} from "src/masker";

describe("getMasker", () => {
    it("should cache masker objects", () => {
        var masker1 = getMasker("999");
        var masker2 = getMasker("999");

        expect(masker1).toBe(masker2);
    });
});

describe("Masker", () => {
    var phonefmt = "(999) 999-9999";
    var mask_data = [
        {input: "3334445555",   result: "(333) 444-5555", fmt: phonefmt},
        {input: "(333) 444-5555",result: "(333) 444-5555", fmt: phonefmt},
        {input: "((333) 444-5555",result: "(333) 444-5555", fmt: phonefmt},
        {input: "333444",       result: "(333) 444-____", fmt: phonefmt},
        {input: "3",            result: "(3__) ___-____", fmt: phonefmt},
        {input: "",             result: "(___) ___-____", fmt: phonefmt},
        {input: "a",            result: "(___) ___-____", fmt: phonefmt},
        {input: "3334445555666", result: "(333) 444-5555", fmt: phonefmt},

        {input: "",             result: "(_) _ _", fmt: "(A) * 9"},
        {input: "a",            result: "(a) _ _", fmt: "(A) * 9"},
        {input: "9",            result: "(_) _ _", fmt: "(A) * 9"},
        {input: "aa",           result: "(a) a _", fmt: "(A) * 9"},
        {input: "a1",           result: "(a) 1 _", fmt: "(A) * 9"},
        {input: "a12",          result: "(a) 1 2", fmt: "(A) * 9"},
        {input: "a1b",          result: "(a) 1 _", fmt: "(A) * 9"},
    ];

    var unmask_data = [
        {result: "3334445555",  input: "(333) 444-5555", fmt: phonefmt},
        {result: "333444",      input: "(333) 444-____", fmt: phonefmt},
        {result: "3",           input: "(3__) ___-____", fmt: phonefmt},
        {result: "",            input: "(___) ___-____", fmt: phonefmt},
        {result: "",            input: "(___) ___-____", fmt: phonefmt},
        {result: "3334445555",  input: "(333) 444-5555766", fmt: phonefmt},

        {result: "",            input: "(_) _ _", fmt: "(A) * 9"},
        {result: "a",           input: "(a) _ _", fmt: "(A) * 9"},
        {result: "",            input: "(_) _ _", fmt: "(A) * 9"},
        {result: "aa",          input: "(a) a _", fmt: "(A) * 9"},
        {result: "a1",          input: "(a) 1 _", fmt: "(A) * 9"},
        {result: "a12",         input: "(a) 1 2", fmt: "(A) * 9"},
        {result: "a1",          input: "(a) 1 L", fmt: "(A) * 9"},
    ];

    it("should mask values", () => {
        for(var tst of mask_data) {
            var masker = getMasker(tst.fmt, false);
            expect(masker.maskValue(tst.input)).toBe(tst.result);
        }
    });

    it("should unmask values", () => {
        for(var tst of unmask_data) {
            var masker = getMasker(tst.fmt, false);
            expect(masker.unmaskValue(tst.input)).toBe(tst.result);
        }
    });

    var unmask_sorta_data = [
        //{result: "(333) 444-5555",  input: "(333) 444-5555", fmt: phonefmt},
        //{result: "(333) 444-",      input: "(333) 444-____", fmt: phonefmt},
        //{result: "(3",           input: "(3__) ___-____", fmt: phonefmt},
        //{result: "",            input: "(___) ___-____", fmt: phonefmt},
        //{result: "(333) 444-5555",  input: "(333) 444-5555766", fmt: phonefmt},

        {result: "",            input: "(_) _ _", fmt: "(A) * 9"},
        //{result: "(a",           input: "(a) _ _", fmt: "(A) * 9"},
        //{result: "",            input: "(_) _ _", fmt: "(A) * 9"},
        //{result: "(a) a",          input: "(a) a _", fmt: "(A) * 9"},
        //{result: "(a) 1",          input: "(a) 1 _", fmt: "(A) * 9"},
        //{result: "(a) 1 2",         input: "(a) 1 2", fmt: "(A) * 9"},
        {result: "(a) 1",          input: "(a) 1 L", fmt: "(A) * 9"},
    ];

    it("should mask values with masking", () => {
        for(var tst of mask_data) {
            var masker = getMasker(tst.fmt, true);
            expect(masker.maskValue(tst.input)).toBe(tst.result);
        }
    });

    it("should unmask values with masking", () => {
        for(var tst of unmask_sorta_data) {
            var masker = getMasker(tst.fmt, true);
            expect(masker.unmaskValue(tst.input)).toBe(tst.result);
        }
    });
});

