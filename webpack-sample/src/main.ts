import {Aurelia} from 'aurelia-framework'
import { PLATFORM } from "aurelia-pal";
import environment from './environment';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .globalResources(PLATFORM.moduleName("aurelia-mask/masked-input"));

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
