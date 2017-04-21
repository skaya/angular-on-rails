export class dynamicDeclaration {
  bootstrapingComponent: any[] = [];

  constructor(components: any[]) {
    this.listComponents = components;
  }

  set listComponents(components: any[]) {
    let reflectOjb = window['Reflect'];
    for (let component of components) {
      // getting selector of a component
      let selector = reflectOjb.getMetadata('annotations', component)[0].selector;
      if (document.querySelector(selector)) {
        // the component goes to array for bootstraping
        // only if the selector is present on the page
        this.bootstrapingComponent.push(component);
      }
    }
  }

  get listComponents(): any[] {
    return this.bootstrapingComponent;
  }
}

