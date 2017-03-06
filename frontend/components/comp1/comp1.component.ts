import { Component } from '@angular/core';

let template = require('./comp1.component.html');
let styles = require('./comp1.component.scss');

@Component({
  selector: 'comp1',
  template: template,
  styles: [ String(styles) ]
})


export class Component1 {
}
