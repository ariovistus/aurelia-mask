/// <reference path="../../jasmine/jasmine.d.ts" />

import {isNumeric} from "../../../dist/masker";

describe("isNumeric", () => {
    var testcases = [
        {
            input: 1,
            result: true,
        },
        {
            input: 0,
            result: true,
        },
        {
            input: NaN,
            result: false,
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

    testcases.forEach(testcase => {
        it("should test " + testcase.input + " for numericality", () => {
            expect(isNumeric(testcase.input)).toBe(testcase.result);
        });
    });
});

