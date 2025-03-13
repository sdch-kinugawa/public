import { LightningElement } from 'lwc';
export default class HelloLwcWorld extends LightningElement {
  greeting = 'World';
  changeHandler(event) {
    this.greeting = event.target.value;
  }
}