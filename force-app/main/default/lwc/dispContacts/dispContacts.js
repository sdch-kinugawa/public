import { LightningElement, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getConList from '@salesforce/apex/DispContactsController.getConList';
import saveConList from '@salesforce/apex/DispContactsController.saveConList';
// メッセージ表示用
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// 項目定義
const columns = [
    { label: 'Last Name', fieldName: 'LastName', editable: true  },
    { label: 'First Name', fieldName: 'FirstName', editable: true  },
    { label: 'Title', fieldName: 'Title', editable: true  },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true  },
    { label: 'Email', fieldName: 'Email', type: 'email', editable: true  },
];

export default class DispContacts extends LightningElement {

    @api recordId;
    error;
    columns = columns;
    draftValues = [];

    @wire(getConList, {recordId : '$recordId'})
    contacts;

    handleSave(event) {
        console.log('handleSave()');
        // ①インライン編集で更新した値を取得
        this.draftValues = event.detail.draftValues;
        const editList = {conList : this.draftValues};
        // ②Apexの処理を呼びだし
        saveConList(editList)
        .then(() => {
            // 更新成功時
            // ③フッターを非表示
            this.draftValues = null;
            // ③関連リストのデータを再取得
            refreshApex(this.contacts);
            this.showToast('成功', 'レコードが更新されました。', 'success');
        })
        .catch((error) => {
            // 更新失敗時
            this.showToast('エラー', error.body.message, 'error', 'sticky');
        })
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