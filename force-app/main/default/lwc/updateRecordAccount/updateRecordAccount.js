import { LightningElement, api , wire } from 'lwc';
import { getRecord, updateRecord, getFieldValue } from 'lightning/uiRecordApi';
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';
import ACCOUNT_PHONE from '@salesforce/schema/Account.Phone';
import ACCOUNT_ID from '@salesforce/schema/Account.Id';
// メッセージ表示用
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// 項目定義　スキーマからインポートしたもの、直書きしたもの
const FIELDS = [ACCOUNT_NAME, ACCOUNT_PHONE,'Account.AnnualRevenue'];
export default class updateRecordAccount extends LightningElement {
    // 詳細画面ID取得
    @api recordId;

    // 引数1:実行したいメソッド名
    // 引数2:{ recordId: 取得したいSFID, fields: 取得したい項目}
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

    handleUpdate(event){
        // lightning-inputタグの入力規則実施
        const allValid = [...this.template.querySelectorAll("lightning-input")].reduce(
        (validSoFar, inputFields) => {
            inputFields.reportValidity();
            return validSoFar && inputFields.checkValidity();
        },true,);
    
        if (allValid) {
            // 画面の入力値を取引先項目へ設定
            const fields = {};
            fields[ACCOUNT_ID.fieldApiName] = this.recordId;
            fields[ACCOUNT_NAME.fieldApiName] = this.template.querySelector("[data-field='Name']",).value;
            fields[ACCOUNT_PHONE.fieldApiName] = this.template.querySelector("[data-field='Phone']").value;
            fields['AnnualRevenue'] = this.template.querySelector("[data-field='AnnualRevenue']").value;
        
            const recordInput = { fields };
            // 更新処理呼出
            updateRecord(recordInput)
                .then(() => {
                    // 正常終了
                    this.showToast("成功", '更新完了しました。', 'success');
                    // 再取得して描画します。
                    return refreshApex(this.acc);
                })
                .catch((error) => {
                    // システムエラーの場合はこちら
                    this.showToast("失敗", error.body.message, 'error');
                });
        } else {
            // システムエラーの場合はこちら
            this.showToast("失敗", "入力値に誤りがあります。", 'error');
        }
    }
    // メッセージ生成
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

}
