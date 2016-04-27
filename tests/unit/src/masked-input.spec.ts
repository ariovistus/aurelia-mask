/// <reference path="../../jasmine/jasmine.d.ts" />

import 'aurelia-polyfills';
import {initialize} from 'aurelia-pal-browser';
import {Masker, getMasker} from "src/masker";
import {MaskedInput} from "src/masked-input";
import {Container} from "aurelia-dependency-injection";
import {TemplatingEngine} from "aurelia-templating";

function makeInputEvent() {
    let e = document.createEvent("Event");
    e.initEvent("input", true, true, window);
    return e;
}

function makeFocusEvent() {
    let e = document.createEvent("Event");
    e.initEvent("focus", true, true, window);
    return e;
}

var LEFT = 37;

function makeKeyupEvent(key) {
    // from http://stackoverflow.com/a/12187302/23648

    let keyCode = key;
    if(typeof keyCode == 'string') {
        keyCode = keyCode.charCodeAt(0);
    }
    let e = document.createEvent("KeyboardEvent");
    e.initEvent(
        "keyup", // type
        true, //  bubbles
        true, // cancelable
        window, // view?
        false, // ctrl key
        false, // alt key
        false, // shift key
        false, // meta key
        keyCode, // key code
        0
    );
    return e;
}

function getCursor(inputElement) {
    return inputElement.selectionStart;
}
function setCursor(inputElement, index) {
    inputElement.setSelectionRange(index, index);
}

describe ("MaskedInput", () => {
    
    it("should do things on things", () => {
        initialize();
        // type '1', '2', 'left', 'left', 'v' should result in '12'
        let inputElement = document.createElement("input");
        let container = new Container();
        container.makeGlobal();
        container.registerInstance(Element, inputElement);
        let engine = container.get(TemplatingEngine)
        let mask = "(999) 999-9999";
        let maskedInput = engine.createViewModelForUnitTest(MaskedInput, {
            "mask": mask
        });
        maskedInput.isFocused = () => true;
        maskedInput.isHidden = () => false;
        maskedInput.value = "";
        expect(maskedInput.mask).toBe(mask);
        expect(maskedInput.value).toBe("");
        expect(inputElement.value).toBe("");
        expect(maskedInput.element).toBe(inputElement);
        expect(maskedInput.getCaretPosition()).toBe(0);

        maskedInput.attached();
        expect(maskedInput.inputElement).toBe(inputElement);
        expect(inputElement.value).toBe("(___) ___-____");
        expect(maskedInput.caretPos).toBe(1);
        expect(maskedInput.getCaretPosition()).toBe(1);
        let focusEvent = null;
        let inputEvent = null;
        let keyupEvent = null;

        focusEvent = makeFocusEvent();
        maskedInput.onFocus(focusEvent);
        expect(getCursor(inputElement)).toBe(1);

        inputElement.value = "(1___) ___-____";
        setCursor(inputElement, 2);
        inputEvent = makeInputEvent();
        maskedInput.onInput(inputEvent);
        keyupEvent = makeKeyupEvent("1");
        maskedInput.onKeyUp(keyupEvent);
        expect(inputElement.value).toBe("(1__) ___-____");
        expect(maskedInput.value).toBe("1");
        expect(maskedInput.oldValue).toBe("(1__) ___-____");
        expect(maskedInput.oldValueUnmasked).toBe("1");
        expect(getCursor(inputElement)).toBe(2);

        inputElement.value = "(12__) ___-____";
        inputEvent = makeInputEvent();
        maskedInput.onInput(inputEvent);
        keyupEvent = makeKeyupEvent("2");
        maskedInput.onKeyUp(keyupEvent);
        expect(inputElement.value).toBe("(12_) ___-____");
        expect(maskedInput.value).toBe("12");
        expect(maskedInput.oldValue).toBe("(12_) ___-____");
        expect(maskedInput.oldValueUnmasked).toBe("12");
        expect(getCursor(inputElement)).toBe(3);

        setCursor(inputElement, 2);
        expect(inputElement.value).toBe("(12_) ___-____");
        inputEvent = makeInputEvent();
        maskedInput.onInput(inputEvent);
        keyupEvent = makeKeyupEvent(LEFT);
        maskedInput.onKeyUp(keyupEvent);
        expect(inputElement.value).toBe("(12_) ___-____");
        expect(maskedInput.value).toBe("12");
        expect(maskedInput.oldValue).toBe("(12_) ___-____");
        expect(maskedInput.oldValueUnmasked).toBe("12");
        expect(getCursor(inputElement)).toBe(2);

        setCursor(inputElement, 1);
        expect(inputElement.value).toBe("(12_) ___-____");
        maskedInput.onInput(inputEvent);
        maskedInput.onKeyUp(keyupEvent);
        expect(inputElement.value).toBe("(12_) ___-____");
        expect(maskedInput.value).toBe("12");
        expect(maskedInput.oldValue).toBe("(12_) ___-____");
        expect(maskedInput.oldValueUnmasked).toBe("12");
        expect(maskedInput.caretPos).toBe(1);
        expect(getCursor(inputElement)).toBe(1);

        inputElement.value = "(v12__) ___-____";
        setCursor(inputElement, 2);
        inputEvent = makeInputEvent();
        maskedInput.onInput(inputEvent);
        keyupEvent = makeKeyupEvent('v');
        maskedInput.onKeyUp(keyupEvent);
        expect(inputElement.value).toBe("(12_) ___-____");
        expect(maskedInput.value).toBe("12");
        expect(getCursor(inputElement)).toBe(2);
    });
});
