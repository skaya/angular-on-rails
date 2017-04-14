import { Component } from '@angular/core';

require('./comp1.component.scss');
require('./comp1.component.grid.scss');

let styleUrl1 = './comp1.component.scss';
let styleUrl2 = './comp1.component.grid.scss';

let template = require('./comp1.component.html');

@Component({
  selector: 'comp1',
  template: template,
  styleUrls: [styleUrl1, styleUrl2]
})


export class Component1 {
}
