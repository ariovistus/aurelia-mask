describe("blah", () => {
    beforeEach( () => {
        browser.loadAndWaitForAureliaPage("http://localhost:8000");
    });

    it("should like do things", () => {
        console.info(element(by.css("#thing")))
    });
});
