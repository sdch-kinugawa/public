import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class LwcButtonList extends NavigationMixin(LightningElement) {

    @api recordId; // 請求Id

    connectedCallback() {
        console.log('this.recordId=='+this.recordId);
    }

    handleBillCreateOnClick(){
        const baseUrl = window.location.origin;
        // CreateBillは作成したタブのAPI名を指定
        let pageUrl = `${baseUrl}/lightning/n/CreateBill?c__billRecordId=${this.recordId}`;
        console.log('pageUrl == ' + pageUrl);
        // CreateBillタブへ遷移
        window.open(pageUrl, '_self');
    }

}