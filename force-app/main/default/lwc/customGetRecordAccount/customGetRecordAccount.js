import { LightningElement, track, wire, api } from 'lwc';
// Apexコントロラー呼出
import getAccInfo from '@salesforce/apex/CustomGetRecordAccountControl.getAccInfo';
import saveAcc from '@salesforce/apex/CustomGetRecordAccountControl.saveAcc';
// メッセージ表示用
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CustomGetRecordAccount extends LightningElement {

    // 詳細のSFID
    @api recordId;

    // 取引先情報
    @track accInfo = {
          Id : null
        , Name: null
        , Phone: null
        , AnnualRevenue: null
    }

    // 取引先情報取得
    @wire(getAccInfo, { id: '$recordId'})
    getAccInfo({error, data}){
        // 正常
        if(data){
            // 画面へ設定
            this.accInfo.Id = data.Id;
            this.accInfo.Name = data.Name;
            this.accInfo.Phone = data.Phone;
            this.accInfo.AnnualRevenue = data.AnnualRevenue;
        }
        
        if(error) {
            this.showToast("失敗", error.body.message, 'error');
        }
    }

    // 更新
    handleUpdate(){
        // lightning-inputタグの入力規則実施
        const allValid = [...this.template.querySelectorAll("lightning-input")].reduce(
        (validSoFar, inputFields) => {
            inputFields.reportValidity();
            return validSoFar && inputFields.checkValidity();
        },true,);
    
        if (allValid) {
            // 画面の入力値を取引先項目へ設定
            this.accInfo.Name = this.template.querySelector("[data-field='Name']").value;
            this.accInfo.Phone = this.template.querySelector("[data-field='Phone']").value;
            this.accInfo.AnnualRevenue = this.template.querySelector("[data-field='AnnualRevenue']").value;
        
            // 更新処理呼出
            saveAcc({accInfo : this.accInfo})
            .then(result => {
                if(!result){
                    // 正常
                    this.showToast('成功', '取引先を更新しました。', 'success');
                } else {
                    // 入力チェックエラー
                    this.showToast('失敗', result, 'error');
                }
            }).catch(error => {
                // システムエラーの場合はこちら
                this.showToast("失敗", error.body.message, 'error');
            });
        } else {
            // 入力規則エラー
            this.showToast('失敗', '入力に誤りがあります。再度入力内容確認してください。', 'error');
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