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
    var test_data = [
        {raw: "3334445555", masked: "(333) 444-5555", fmt: phonefmt},
        {raw: "333444", masked: "(333) 444-____", fmt: phonefmt},
        {raw: "3", masked: "(3__) ___-____", fmt: phonefmt},
        {raw: "", masked: "(___) ___-____", fmt: phonefmt},
        {raw: "a", masked: "(a__) ___-____", fmt: phonefmt},
        {raw: "3334445555666", masked: "(333) 444-5555", fmt: phonefmt},

        {raw: "", masked: "(_) _ _", fmt: "(A) * 9"},
        {raw: "a", masked: "(a) _ _", fmt: "(A) * 9"},
        {raw: "9", masked: "(9) _ _", fmt: "(A) * 9"},
        {raw: "aa", masked: "(a) a _", fmt: "(A) * 9"},
        {raw: "a1", masked: "(a) 1 _", fmt: "(A) * 9"},
        {raw: "a12", masked: "(a) 1 2", fmt: "(A) * 9"},
        {raw: "a1b", masked: "(a) 1 b", fmt: "(A) * 9"},
    ];

    var test_data2 = [
        {raw: "3334445555", masked: "(333) 444-5555", fmt: phonefmt},
        {raw: "333444", masked: "(333) 444-____", fmt: phonefmt},
        {raw: "3", masked: "(3__) ___-____", fmt: phonefmt},
        {raw: "", masked: "(___) ___-____", fmt: phonefmt},
        {raw: "", masked: "(a__) ___-____", fmt: phonefmt},
        {raw: "3334445555", masked: "(333) 444-5555766", fmt: phonefmt},

        {raw: "", masked: "(_) _ _", fmt: "(A) * 9"},
        {raw: "a", masked: "(a) _ _", fmt: "(A) * 9"},
        {raw: "", masked: "(9) _ _", fmt: "(A) * 9"},
        {raw: "aa", masked: "(a) a _", fmt: "(A) * 9"},
        {raw: "a1", masked: "(a) 1 _", fmt: "(A) * 9"},
        {raw: "a12", masked: "(a) 1 2", fmt: "(A) * 9"},
        {raw: "a1", masked: "(a) 1 b", fmt: "(A) * 9"},
    ];

    it("should mask values", () => {
        for(var tst of test_data) {
            var masker = getMasker(tst.fmt);
            expect(masker.maskValue(tst.raw)).toBe(tst.masked);
        }
    });

    it("should unmask values", () => {
        for(var tst of test_data2) {
            var masker = getMasker(tst.fmt);
            expect(masker.unmaskValue(tst.masked)).toBe(tst.raw);
        }
    });
});

