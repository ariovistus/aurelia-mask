export class App {
  mask: string = '(999) (999) **999';
  mask2: string = '**/***/****'; 
  mask3: string = "(999) 999-9999";
  findSecondInput: any = _findSecondInput;
  value11_r: string;

  constructor() {
  }

  update(masker) {
        masker.setValue("123456AB789");
  }


  onChange11(newValue, oldValue) {
    this.value11_r = "nachos: " + newValue;
  }

}

function _findSecondInput(elt) {
    return elt.getElementsByTagName('input')[1];
}
