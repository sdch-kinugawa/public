import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class LwcButtonList extends NavigationMixin(LightningElement) {

    @api recordId; //商談Id

    connectedCallback() {
        console.log('this.recordId=='+this.recordId);
    }

    // handleOppCreateOnClick(){
    //     const baseUrl = window.location.origin;
    //     let pageUrl = `${baseUrl}/lightning/n/CreateOpp?c__oppRecordId=${this.recordId}`;
    //     console.log('pageUrl == ' + pageUrl);
    //     // 見積作成画面に遷移
    //     window.open(pageUrl, '_self');
    // }

    handleBillCreateOnClick(){
        const baseUrl = window.location.origin;
        // CreateBillは作成したタブのAPI名を指定
        let pageUrl = `${baseUrl}/lightning/n/CreateBill?c__billRecordId=${this.recordId}`;
        console.log('pageUrl == ' + pageUrl);
        // 請求作成画面に遷移
        window.open(pageUrl, '_self');
    }

}