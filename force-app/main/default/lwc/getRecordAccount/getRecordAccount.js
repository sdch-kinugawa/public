import { LightningElement, api,wire } from 'lwc';
import { getRecord,getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_PHONE from '@salesforce/schema/Account.Phone';
// 項目定義　スキーマからインポートしたもの、直書きしたもの
const FIELDS = [ACCOUNT_NAME, ACCOUNT_PHONE,'Account.AnnualRevenue'];
export default class getRecordAccount extends LightningElement {
    // 詳細画面ID取得
    @api recordId;

    // 引数1:実行したいメソッド名
    // 引数2:{ recordId: 取得したいSFID, fields: 取得したい項目}　呼び出したいメソッドによって、引数の変数は異なります。
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS})
    acc; // wireで実行された戻り値を格納する変数

    // ==================================
    // Getメソッドで値を取得する方法
    // ==================================
    get name() {
        // getFieldValue関数を使用した取得方法
        return getFieldValue(this.acc.data, ACCOUNT_NAME);
    }

    get phone() {
        // getRecordの戻り値から直接取得する方法
        return this.acc.data.fields.Phone.value;
    }
}
