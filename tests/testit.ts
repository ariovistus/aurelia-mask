/// <reference path="./jasmine/jasmine.d.ts" />
describe("The Test", () => {
    it("should fail", () => {
        expect("success").to("fail");
    });
});
