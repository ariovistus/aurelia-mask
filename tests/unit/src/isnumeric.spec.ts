/// <reference path="../../jasmine/jasmine.d.ts" />

import {isNumeric} from "../../../dist/masker";

describe("isNumeric", () => {
    var testcases = [
        {
            input: 1,
            result: true,
        },
        {
            input: NaN,
            result: true,
        },
        {
            input: null,
            result: false,
        },
        {
            input: [],
            result: false,
        },
        {
            input: {},
            result: false,
        },
        {
            input: "",
            result: false,
        },
        {
            input: "1",
            result: false,
        },
    ];

    for(var testcase of testcases) {
        it("should test " + testcase.input + " for numericality", () => {
            expect(isNumeric(testcase.input)).toBe(testcase.result);
        });
    }
});

