import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation'; // 別Windowからの遷移なので、直前の請求IDを取得する用
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// Apexコントロラー呼出
import getSelectOptions from '@salesforce/apex/CreateBillingController.getSelectOptions';
import saveBill from '@salesforce/apex/CreateBillingController.saveBill';
import getBillInfo from '@salesforce/apex/CreateBillingController.getBillInfo';
// カスタム表示ラベル
import label_ErrMsg_BillingDtRequired from "@salesforce/label/c.ErrMsg_BillingDtRequired";
import label_Msg_BillingCreationSuccessful from "@salesforce/label/c.Msg_BillingCreationSuccessful";
import label_ErrMsg_BillingCreationFailed from "@salesforce/label/c.ErrMsg_BillingCreationFailed";
// モーダル画面
import confirmationModal from 'c/confirmationModal';

export default class CreateBill extends LightningElement {

    // 請求API名
    BillApiName = 'Billing__c';

    @track isLoading = false; // ローディングフラグ
    @track statusOptions; // フェーズリスト
    deleteBillDtIds = []; // 削除された請求明細
    openBillDtId = '';

    // 請求情報
    @track billInfo = {
          Id: null
        , Name: null
        , Opportunity__c: null
        , BillingPartner__c: null
        , PaymentDueDate__c: null
        , IsAwaitingConfirmation__c: null
        , ApprovalDate__c: null
        , BillingDate__c: null
        , AmountBilled__c: null
        , Status__c: null
        , Remarks__c: null
        , BillingDetails: []
    };

    // 初期表示時
    connectedCallback() {
        // 進捗選択肢設定
        this.setSelectOptions(this.BillApiName, 'Status__c', 'statusOptions');
    }

    // 請求ID初期設定
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        // Loadingオン
        this.isLoading = true;

        if (currentPageReference && currentPageReference.state) {
            // URLから請求Id取得
            if (currentPageReference.state.c__billRecordId != null) {
                this.billInfo.Id = currentPageReference.state.c__billRecordId;
            }
            // 請求IDがあれば 
            if(this.billInfo.Id){

                // 請求および請求明細を取得し画面へ設定
                this.setBillInfo(this.billInfo.Id);
            
            } else {
            
                // 新規作成の場合
                // 請求明細1件のみ設定
                this.billInfo.BillingDetails.push(this.getNewItemRow());

                // 選択行初期化
                this.billInfo.BillingDetails[0].Selected = true;
            }

        }

        // Loadingオフ
        this.isLoading = false;
    }

    // 請求と請求明細情報取得
    setBillInfo = async (billId) => {

        // Loadingオフ
        this.isLoading = true;

        // 請求情報の取得
        getBillInfo({ id: billId })
            .then(res => {
                if (res) {
                    console.log('res =' + JSON.stringify(res));

                    // 請求情報設定
                    this.billInfo.Id = res.Id;
                    this.billInfo.Name = res.Name;
                    this.billInfo.Opportunity__c = res.Opportunity__c;
                    this.billInfo.ApprovalDate__c = res.ApprovalDate__c;
                    this.billInfo.IsAwaitingConfirmation__c = res.IsAwaitingConfirmation__c;
                    this.billInfo.PaymentDueDate__c = res.PaymentDueDate__c;
                    this.billInfo.BillingPartner__c = res.BillingPartner__c;
                    this.billInfo.BillingDate__c = res.BillingDate__c;
                    this.billInfo.AmountBilled__c = res.AmountBilled__c;
                    this.billInfo.Status__c = res.Status__c;
                    this.billInfo.Remarks__c = res.Remarks__c;
                    
                    // 請求明細有無判定
                    if(res.BillingDetails.length > 0){
                        // 請求明細設定
                        this.setBillDts(res.BillingDetails);
                    }
                }

                // 請求明細が0件の場合
                if(this.billInfo.BillingDetails.length == 0){
                    // 1件のみ設定
                    this.billInfo.BillingDetails.push(this.getNewItemRow());
                }

                // 選択行初期化
                this.billInfo.BillingDetails[0].Selected = true;

                // 明細の表示順設定
                this.reassignSortNo();
                
                // Loadingオフ
                this.isLoading = false;

            })
            .catch(error => {
                
                // エラー
                this.showToast('失敗', error, 'error');

                // Loadingオフ
                this.isLoading = false;
            });
    }

    // 請求明細設定
    setBillDts(items) {

        items.forEach((item) => {
            // 新規請求明細作成
            let row = this.getNewItemRow();
            // 既存請求明細設定
            row.Id = item.Id; // id
            row.Billing__c = item.Billing__c; // 請求Id
            row.Discount__c = !isNaN(item.Discount__c) ? item.Discount__c : 0; // 割引
            row.Quantity__c = item.Quantity__c; // 数量
            row.ProductId__c = item.ProductId__c; // 商品名
            row.Subtotal__c = item.Subtotal__c; // 小計
            row.UnitPrice__c = item.UnitPrice__c; // 単価
            row.AmountBilled__c = item.AmountBilled__c; // 合計金額
            row.Remarks__c = item.Remarks__c; // 備考
            this.billInfo.BillingDetails.push(row);
        });
    }

    // 新規請求明細レコード
    getNewItemRow() {
        return {
              SortNo__c: 1 // 表示順 
            , Id: null // Id
            , Selected: false // チェック
            , Discount__c	: 0 // 割引
            , Quantity__c: 0 // 数量
            , UnitPrice__c: 0  // 単価
            , ProductId__c: null // 商品名
            , Billing__c: null // 請求Id
            , Subtotal__c: 0 // 小計
            , AmountBilled__c: 0 // 請求額            
            , Remarks__c: null // 備考                      
        };
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

    // 入力値変更(請求)
    handleFieldChange(event) {

        // 値設定
        this.setBillField(event);
    }

    // 入力値変更と再計算（請求明細情報のみ呼出）
    handleFieldChangeWithCal(event) {

        // 値設定
        this.setBillDtField(event);

        // 全行計算処理
        this.billItemsCalc();
    }

    // 選択変更実施
    handleSeletedRow(event){
        // 選択された表示順を取得
        const sortNo = event.target.dataset.index;
        // 選択
        this.setSelectedRow(sortNo);
    }

    // コピー
    handleClickCopy(event) {

        // 選択された表示順を取得
        const copySortNo = event.target.dataset.index;
        
        // コピー対象のレコードをコピーして取得
        // 深いコピー実施。浅いコピーを実施すると、参照先をコピーしてしまいます。深いコピーは参照先の値をコピーします。 
        //let newCopyRow = this.billInfo.BillingDetails.find(row => row.SortNo__c == copySortNo); // 浅いコピー
        let newCopyRow = JSON.parse(JSON.stringify(this.billInfo.BillingDetails.find(row => row.SortNo__c == copySortNo))); // 深いコピー
        // 明細Id初期化
        newCopyRow.Id = '';
        
        // コピー対象レコードの下に追加
        this.billInfo.BillingDetails.splice(copySortNo, 0, newCopyRow);

        // 明細の表示順設定
        this.reassignSortNo();
        // 明細金額の再計算        
        this.billItemsCalc();

    }

    // 入力値変更と再計算（請求明細情報のみ呼出）
    handleSave() {
        // Loadingオン
        this.isLoading = true;

        // エラーチェック　lightning-input,lightning-record-picker
        const allValid = [
            ...this.template.querySelectorAll('lightning-input, lightning-record-picker'),
        ].reduce((validSoFar, inputCmp) => {
            inputCmp.reportValidity(); // バリデーションがNGのとき、エラー内容を表示する
            return validSoFar && inputCmp.checkValidity(); // バリデーションNGの入力項目があった場合、falseを返す
        }, true);

        if (!allValid) {
            // バリデーションNG処理
            this.showToast('失敗', label_ErrMsg_BillingCreationFailed, 'error');
            // Loadingオフ
            this.isLoading = false;
            return;
        }

        // 確認画面表示
        this.showConfirmationModal()
        .then(retVal => {
            if(retVal == 'okay'){
                // 保存処理呼出
                saveBill({
                    billInfo : this.billInfo,
                    deleteBillDtIds : this.deleteBillDtIds
                }).then(result => {
                    // エラーがなければ
                    if(!result.errMsg){
                        // 新規また更新の時には、Idを再設定する
                        this.billInfo.Id = result.billId;
                        
                        // 正常メッセージ表示
                        this.showToast('成功', label_Msg_BillingCreationSuccessful, 'success');

                        // 正常終了後、処理
                        this.afterCompletedProc();

                        // 再取得して再描画
                        this.setBillInfo(this.billInfo.Id);
                        
                    } else {
                        // 入力チェックエラー
                        this.showToast('失敗', result.errMsg, 'error');
                    }
        
                }).catch(error => {
                    let systemErrMsg = reduceErrors(error);
                    // エラー
                    this.showToast('失敗', systemErrMsg, 'error');
                });
            }
        });

        // Loadingオフ
        this.isLoading = false;
    }

    // 同期処理のモーダル呼出
    async showConfirmationModal() {
        const result = await confirmationModal.open({
            size: 'small',
            description: '最終確認を実施します。',
            targetRow: this.billInfo,
        });
        return result;
    }

    // 正常終了後、処理
    afterCompletedProc(){
        // 削除レコードクリア
        this.deleteBillDtIds = [];
        // 明細行削除
        this.billInfo.BillingDetails = [];
    }

    // 選択済設定
    setSelectedRow(sortNo){
        // 選択された行を選択済みにして、以外は未選択に更新
        this.billInfo.BillingDetails.forEach(row => {
            if(row.SortNo__c == sortNo){
                row.Selected = true;
            } else {
                row.Selected = false;
            }
        });
    }

    // 入力値変更(請求)
    setBillField(event) {

        let fieldName = event.target.name;
        let fieldValue = event.target.value;

        // 参照項目の場合、detail.recordIdから取得なければvalueから取得
        if (event.detail && event.detail.recordId) {
            fieldValue = event.detail.recordId;
        }
        console.log("fieldName = " + fieldName + " | fieldValue = " + fieldValue);

        // 値設定
        this.billInfo[fieldName] = fieldValue;
        console.log("this.billInfo = " + JSON.stringify(this.billInfo));
    }

    // 入力値変更(請求明細)
    setBillDtField(event) {

        let fieldName = event.target.name;
        let fieldValue = event.target.value;
        
        // 参照項目の場合、detail.recordIdから取得なければvalueから取得
        if (event.detail && event.detail.recordId) {
            fieldValue = event.detail.recordId;
        }
        console.log("fieldName = " + fieldName + " | fieldValue = " + fieldValue);

        // 値設定（深いコピー実施）
        let items = JSON.parse(JSON.stringify(this.billInfo.BillingDetails));

        // イベント発生した表示順に該当する行取得
        const sortNo = event.target.dataset.index;
        console.log("sortNo = " + sortNo);
        let updatedRow = items.find(row => row.SortNo__c == sortNo);
        if (updatedRow) {

            console.log("updatedRow = " + JSON.stringify(updatedRow));

            // 請求明細に画面の値を設定
            updatedRow[fieldName] = fieldValue;

            // ==========================
            // 明細行 小計・合計の再計算
            // ==========================
            updatedRow.Subtotal__c = 0;
            if (updatedRow.Quantity__c > 0 && updatedRow.UnitPrice__c > 0) {
                updatedRow.Subtotal__c = updatedRow.Quantity__c * updatedRow.UnitPrice__c; // 小計 = 数量 * 販売価格
            }
            updatedRow.AmountBilled__c = updatedRow.Subtotal__c;
            if (updatedRow.Discount__c > 0 && updatedRow.Subtotal__c > 0) {
                updatedRow.AmountBilled__c = updatedRow.Subtotal__c - updatedRow.Discount__c; // 合計 = 小計 - 割引
            }

            // 対象行上書き
            this.billInfo.BillingDetails[sortNo - 1] = updatedRow;
        }
        //console.log("this.billInfo.BillingDetails = " + JSON.stringify(this.billInfo.BillingDetails));
    }

    // 請求明細をすべて確認して合計金額を計算
    billItemsCalc() {
        // 請求金額
        let billAmount = 0;

        // 請求明細全行取得
        let items = JSON.parse(JSON.stringify(this.billInfo.BillingDetails));
        items.forEach((item) => {
            // 合計
            billAmount = billAmount + item.AmountBilled__c;
        });

        // 請求情報のAmountへ設定
        this.billInfo.AmountBilled__c = billAmount;
    }

    // 行の削除
    handleClickDelRow(event) {

        const delSortNo = event.target.dataset.index;

        console.log('delSortNo = ' + delSortNo);
        
        // 明細が1件の場合、請求明細は一件以上必要なため、エラーとし終了
        if (this.billInfo.BillingDetails.length == 1) {
            this.showToast('失敗', label_ErrMsg_BillingDtRequired, 'error');
            return;
        }

        // 削除行取得
        const targetRows = this.billInfo.BillingDetails.filter(row => row.SortNo__c == delSortNo);

        // 削除行があれば
        if(targetRows.length > 0) {

            const targetRow = targetRows[0];

            if(targetRow.Id != null && targetRow.Id != undefined){
                // 削除対象請求明細Idリストへ追加
                this.deleteBillDtIds.push(targetRow.Id);
            }

            // 削除行以外を取得して格納
            this.billInfo.BillingDetails = this.billInfo.BillingDetails.filter(row => row.SortNo__c != delSortNo);

            // 明細の表示順設定
            this.reassignSortNo();

            // 削除された行が選択済の場合、1行目に選択済を設定
            if(targetRow.Selected) this.setSelectedRow(1);

            // 明細金額の再計算        
            this.billItemsCalc();

        }
    }

    // 1行下追加
    handleClickAdd1RowAfter() {
        
        // 新規行作成
        let newRow = this.getNewItemRow();
        // 選択行のindex取得
        let selectedRowIdx = this.billInfo.BillingDetails.findIndex(row => row.Selected === true);
        // 行を追加
        this.billInfo.BillingDetails.splice(++selectedRowIdx, 0, newRow);

        // 明細の表示順設定
        this.reassignSortNo();

    }

    // ソート順再設定
    reassignSortNo() {

        this.billInfo.BillingDetails.forEach((item, index) => {
            item.SortNo__c = (index + 1);
        });
    }

    // ============================
    // 共通処理
    // ============================

    // 選択肢取得
    setSelectOptions(objName, fieldName, target) {
        //　Apexメソッド呼出
        getSelectOptions({
            objectApiName: objName,
            fieldApiName: fieldName
        })
        // 戻り値設定
        .then(result => {
            this[target] = result;
        })
        // エラーの場合
        .catch(error => {
            console.error('setSelectOptions Error:', error);
        });
    }

    // 文字連結処理
    setMsgFormat(msg, targetMsg) {
        if (targetMsg) {
            return targetMsg + '\n' + msg;
        } else {
            return msg;
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