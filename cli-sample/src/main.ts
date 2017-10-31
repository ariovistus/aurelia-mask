import {Aurelia} from 'aurelia-framework'
import { PLATFORM } from "aurelia-pal";
import environment from './environment';

export function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .globalResources(PLATFORM.moduleName("aurelia-mask/masked-input"))
    .feature('resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.start().then(() => aurelia.setRoot());
}
