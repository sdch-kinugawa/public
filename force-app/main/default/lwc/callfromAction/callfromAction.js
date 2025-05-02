import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
// 請求のアクションからLWCタブを呼び出す処理
export default class CallfromAction extends NavigationMixin(LightningElement) {

    @api recordId;

    // 初期処理呼出
    @api invoke() {
        const baseUrl = window.location.origin;
        // CreateBillは作成したタブのAPI名を指定
        let pageUrl = `${baseUrl}/lightning/n/CreateBill?c__billRecordId=${this.recordId}`;
        console.log('pageUrl == ' + pageUrl);
        // CreateBillタブへ遷移
        window.open(pageUrl, '_self');
    }

}