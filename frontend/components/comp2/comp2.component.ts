import { Component } from '@angular/core';

let template = require('./comp2.component.html');
let styles = require('./comp2.component.scss');

@Component({
  selector: 'comp2',
  template: template,
  styles: [ String(styles) ]
})


export class Component2 {
}
