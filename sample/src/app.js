export class App {
  mask = '(999) (999) **999';
  mask2 = '**/***/****';

  update(i) {
      this['value'+i] = "123456AB789";
  }
}
