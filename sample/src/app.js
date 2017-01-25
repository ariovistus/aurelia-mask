import {inject} from "aurelia-framework";
import {BindingEngine} from "aurelia-binding";

@inject(BindingEngine)
export class App {
  mask = '(999) (999) **999';
  mask2 = '**/***/****'; 
  mask3 = "(999) 999-9999";
  findSecondInput = _findSecondInput;

  constructor(bindingEngine) {
    bindingEngine.propertyObserver(this, "value11").subscribe(() => {
        this.onChange11();
    });
  }

  update(i) {
      this['value'+i] = "123456AB789";
  }


  onChange11() {
    this.value11_r = "nachos: " + this.value11;
  }
  onChange11_1() {
    this.value11_1_r = "nachos: " + this.value11_1;
  }
}

function _findSecondInput(elt) {
    return elt.getElementsByTagName('input')[1];
}
