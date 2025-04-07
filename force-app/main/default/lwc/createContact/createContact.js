import { LightningElement } from 'lwc';
import { createRecord } from 'lightning/uiRecordApi';
import CONTACT_OBJECT from "@salesforce/schema/Contact";
// 各種項目
import LASTNAME_FIELD from "@salesforce/schema/Contact.LastName";
import FIRSTNAME_FIELD from "@salesforce/schema/Contact.FirstName";
import EMAIL_FIELD from "@salesforce/schema/Contact.Email";
import ACCOUNTID_FIELD from "@salesforce/schema/Contact.AccountId";
// メッセージ表示用
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class CreateContact extends LightningElement {

    // 変数宣言
    LastName;
    FirstName;
    Email;
    AccountId;

    async handleCreate() {

        // 画面からの入力値を取得
        const fields = this.getFieldsVal();
    
        const recordInput = { apiName: CONTACT_OBJECT.objectApiName, fields };
        try {
          // createRecord実施
          const contact = await createRecord(recordInput)
          if(contact){
            // 正常終了
            this.showToast("成功", '作成完了しました。', 'success');
            // 画面入力値初期化
            this.initVal();
          }

        } catch (error) {
            // 電話番号に必須の入力規則を入れてエラーを確認してみましょう。
            this.showToast("失敗", error.body.output.errors[0].message, 'error');
        }
    }

    // 画面の入力値取得
    getFieldsVal(){

        const fields = {};
        // 画面からの入力値を取得する方法１
        fields[LASTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='LastName']",).value;
        fields[FIRSTNAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='FirstName']",).value;
        fields[EMAIL_FIELD.fieldApiName] = this.template.querySelector("[data-field='Email']",).value;
        fields[ACCOUNTID_FIELD.fieldApiName] = this.template.querySelector("[data-field='AccountId']",).value;
        
        // 画面からの入力値を取得する方法2
        // lightning-inputタグの値をfieldsに設定
        // [...this.template.querySelectorAll('lightning-input, lightning-record-picker')].forEach(element => {
        //     fields[element.name] = element.value;
        // });
        return fields;
    }

    // 画面入力値初期化
    initVal() {

        this.LastName= '';
        this.FirstName= '';
        this.Email = '';
        this.AccountId = '';

    }

    // ================================
    // 参照項目：取引先の検索条件設定
    // ================================
    filterAcc = {
        criteria: [
            {
                fieldPath: 'Website',
                operator: 'ne',
                value: null,
            },
            {
                fieldPath: 'Phone',
                operator: 'ne',
                value: null,
            },
            {
                fieldPath: 'Type',
                operator: 'ne',
                value: 'Partner',
            }
        ],
        filterLogic: '(1 OR 2) AND 3',
    };
    // ================================
    // 参照項目：表示する情報設定
    // ================================
    displayInfoAcc = {
        primaryField: 'Name',
        additionalFields: ['Phone'],
    };
    // ================================
    // 参照項目：検索対象の項目を設定
    // ================================
    matchingInfoAcc = {
        primaryField: { fieldPath: 'Name', mode: 'startsWith' },
        additionalFields: [{ fieldPath: 'Phone' }],
    };

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