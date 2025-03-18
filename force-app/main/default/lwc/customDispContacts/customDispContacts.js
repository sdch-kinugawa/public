import { LightningElement, wire, api, track } from 'lwc';
import getConList from '@salesforce/apex/CustomDispContactsController.getConList';
import saveConList from '@salesforce/apex/CustomDispContactsController.saveConList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomDispContacts extends LightningElement {
    // 詳細のSFID
    @api recordId;
    @track conList = [];

    // 取引先責任者情報取得
    @wire(getConList, { recordId: '$recordId'})
    getConList({error, data}){
        // 正常
        if(data){
            // 画面へ設定
            this.setConList(data);

            // ソート順再設定
            this.reassignSortNo()
        }
        
        if(error) {
            this.showToast("失敗", error.body.message, 'error');
        }
    }

    // 取引先責任者設定
    setConList(items) {
        items.forEach((item) => {
            // 新規請求明細作成
            let row = this.getNewItemRow();
            row.Id = item.Id;
            row.FirstName = item.FirstName;
            row.LastName = item.LastName;
            row.Email = item.Email;
            row.AccountId = item.AccountId;
            this.conList.push(row);
        });
    }

    // 新規取引先責任者レコード
    getNewItemRow() {
        return {
              SortNo__c: 1 // 表示順 
            , Id: null 
            , FirstName: null
            , LastName	: null
            , Title: null
            , Email: null  
            , Phone: null   
            , AccountId: null               
        };
    }

    // ソート順再設定
    reassignSortNo() {

        this.conList.forEach((item, index) => {
            item.SortNo__c = (index + 1);
        });
    }

    // 保存処理
    handleSave() {

        // エラーチェック　lightning-input,lightning-record-picker
        const allValid = [
            ...this.template.querySelectorAll('lightning-input, lightning-record-picker'),
        ].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity(); // バリデーションがNGのとき、エラー内容を表示する
            return validSoFar && inputCmp.checkValidity(); // バリデーションNGの入力項目があった場合、falseを返す
        }, true);

        if (!allValid) {
            // バリデーションNG処理
            this.showToast('失敗', '入力値に誤りがあります。', 'error');
            return;
        }

        // Apex保存処理呼出
        saveConList({
            conList : this.conList,
        }).then(result => {
            if(!result){
                // 正常
                this.showToast('成功', '更新完了しました。', 'success');
            } else {
                // 入力チェックエラー
                this.showToast('失敗', result, 'error');
            }
        }).catch(error => {
            // エラー
            this.showToast('失敗', error, 'error');
        });
    }

    // 入力値変更
    handleFieldChange(event) {

        // 値設定
        this.setConField(event);
    }

    // 入力値変更
    setConField(event) {

        let fieldName = event.target.name;
        let fieldValue = event.target.value;
        
        // 参照項目の場合、detail.recordIdから取得なければvalueから取得
        if (event.detail && event.detail.recordId) {
            fieldValue = event.detail.recordId;
        }
        console.log("fieldName = " + fieldName + " | fieldValue = " + fieldValue);

        // イベント発生した表示順に該当する行取得
        const sortNo = event.target.dataset.index;
        console.log("sortNo = " + sortNo);
        let updatedRow = this.conList.find(row => row.SortNo__c == sortNo);
        if (updatedRow) {

            console.log("updatedRow = " + JSON.stringify(updatedRow));

            // 取引先責任者の値を設定
            updatedRow[fieldName] = fieldValue;

            // 対象行上書き
            this.conList[sortNo - 1] = updatedRow;
        }
    }

    // ================================
    // ルックアップ条件設定
    // ================================
    matchingInfo = {
        primaryField: { fieldPath: "Name" },
        additionalFields: [{ fieldPath: "Name" }],
    };
    // 表示項目
    displayInfo = {
        additionalFields: ["Name"],
    };
    // 検索制御
    filter = {
        criteria: [
            {
                fieldPath: "Name",
                operator: "like",
                value: "%%",
            }
        ],
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