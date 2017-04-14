import { BrowserModule }            from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { FormsModule }              from '@angular/forms';
import { HttpModule }               from '@angular/http';

import { dinamicDeclaration }       from './helper.dinamicDeclaration';

// at least one component should be in bootstraped.
// AppComponent can be it, no metter it does something or not.
import { AppComponent }             from './components/app/app.component';
import { Component1 }               from './components/comp1/comp1.component';
import { Component2 }               from './components/comp2/comp2.component';

// component that have to be declared
let declareComponents = new dinamicDeclaration([
    AppComponent,
    Component1,
    Component2
]).listComponents;

// nested components have to be listed here
let nestedComponents: any[] = [
];

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [...nestedComponents, ...declareComponents],
  bootstrap: declareComponents,
  providers: [] //list of services
})

export class AppModule { }
