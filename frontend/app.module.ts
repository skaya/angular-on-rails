import { BrowserModule }            from '@angular/platform-browser';
import { NgModule }                 from '@angular/core';
import { FormsModule }              from '@angular/forms';
import { HttpModule }               from '@angular/http';

import { Component1 }              from './components/comp1/comp1.component';
import { Component2 }              from './components/comp2/comp2.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [Component1, Component2],
  bootstrap: [Component1, Component2]
})

export class AppModule { }
