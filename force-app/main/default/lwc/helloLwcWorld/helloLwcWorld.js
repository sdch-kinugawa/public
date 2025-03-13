import { LightningElement } from 'lwc';
export default class HelloLwcWorld extends LightningElement {
  // 初期化
  greeting = 'World';
  // 入力値変更時の処理
  changeHandler(event) {
    // 発火元のイベントの入力値を取得
    this.greeting = event.target.value;
  }
}