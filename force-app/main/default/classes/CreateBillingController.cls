public without sharing class CreateBillingController {

    private static Decimal amountLimit = 10000000;
    private static String amountLimitErrMag = '金額が上限をオーバーしています。再調整指定下さい。';

    /**
     * 指定項目リストを返す
     * 
     * @return 選択肢リスト
     */
    @AuraEnabled
    public static List<Map<String, String>> getSelectOptions(String objectApiName, String fieldApiName) {
        try {
            return CommonUtil.getPickList(objectApiName, fieldApiName);
        } catch (Exception ex) {
            System.debug('getPickListValues_error：' + ex.getMessage());
            return null;
        }
    }

    /**
     * 請求情報を取得する
     * @param id 請求ID
     * @return 請求情報
     */
    @AuraEnabled
    public static Map<String, Object> getBillInfo(String id){
        try {
            Billing__c bill = [SELECT 
                               Id
                             , Name
                             , ApprovalDate__c 
                             , IsAwaitingConfirmation__c 
                             , PaymentDueDate__c
                             , BillingPartner__c
                             , BillingDate__c
                             , AmountBilled__c
                             , Opportunity__c
                             , Status__c
                             , Remarks__c
                             , (SELECT 
                                  Id
                                , Name
                                , SortNo__c 
                                , Discount__c
                                , AmountBilled__c
                                , Quantity__c
                                , Subtotal__c
                                , UnitPrice__c
                                , ProductId__c
                                , Billing__c
                                , Remarks__c 
                                FROM BillingDetails__r
                                ORDER BY SortNo__c)
                             FROM Billing__c 
                             WHERE Id = :id];

            Map<String, Object> retMap = new Map<String, Object>();
            retMap.put('Id', bill.Id);
            retMap.put('Name', bill.Name);
            retMap.put('Opportunity__c', bill.Opportunity__c);
            retMap.put('ApprovalDate__c', bill.ApprovalDate__c);
            retMap.put('IsAwaitingConfirmation__c', bill.IsAwaitingConfirmation__c);
            retMap.put('PaymentDueDate__c', bill.PaymentDueDate__c);
            retMap.put('BillingPartner__c', bill.BillingPartner__c);
            retMap.put('BillingDate__c', bill.BillingDate__c);
            retMap.put('AmountBilled__c', bill.AmountBilled__c);
            retMap.put('Status__c', bill.Status__c);
            retMap.put('Remarks__c', bill.Remarks__c);
            retMap.put('BillingDetails', bill.BillingDetails__r);
            System.debug('getBillInfo_success: ' + retMap);
            for(String key : retMap.keySet()){
                System.debug('retMap.' + key + ' = ' + retMap.get(key));
            }
            return retMap;

        } catch (Exception e) {
            throw null;
        }
    }

    /**
     * 請求情報を保存する
     * @param billInfo 画面入力した値
     */
    @AuraEnabled
    public static Map<String, String> saveBill(Map<String, Object> billInfo, List<String> deleteBillDtIds) {

        System.debug('billInfo = ' + billInfo);
        System.debug('deleteBillDtIds = ' + deleteBillDtIds);

        Map<String, String> retMap = new Map<String, String>();
        String errMsg = '';

        try{
            // 画面からの請求情報設定
            Billing__c bill = setBillFromDispBillInfo(billInfo);

            // 画面からの請求明細設定
            List<BillingDetail__c> updBillingDtList = new List<BillingDetail__c>();
            List<Object> billingDetailList = (List<Object>) billInfo.get('BillingDetails'); 
            for (Object billDtMap : billingDetailList) {
                BillingDetail__c billDt = setBillDtFromDispMap((Map<Object, Object>)billDtMap);
                updBillingDtList.add(billDt);
            }

            // サーバ側入力チェック
            errMsg = checkbillDtInfo(updBillingDtList);

            // エラーなし
            if(errMsg == ''){

                // 請求新規更新
                upsert bill;

                // 請求明細に請求ID設定
                for(BillingDetail__c billDt : updBillingDtList){
                    // 紐づく請求がなかったら
                    if(billDt.Billing__c == null){
                        billDt.Billing__c = bill.Id;
                    }
                }
                // 請求明細新規更新
                upsert updBillingDtList;

                // 削除対象明細削除
                delBillDts(deleteBillDtIds);
            }

            // 操作したIdを返却マップに格納
            retMap.put('billId' , bill.Id);


        } catch (Exception e) {
            errMsg += e.getMessage() + ' : ' + e.getStackTraceString();
        }

        // 操作したIdを返却マップに格納
        retMap.put('errMsg' , errMsg);

        // 返却
        return retMap;
    }

    /**
     * 削除対象の請求明細を削除
     * @param deleteBillDtIds 削除対象の請求明細Idリスト
     */
    private static void delBillDts(List<String> deleteBillDtIds){

        // 重複IDあった場合の対応として、Setへ変換
        Set<String> delBillDtIds = new Set<String>(deleteBillDtIds);

        List<BillingDetail__c> delBillDtList = [SELECT Id
                                                 FROM BillingDetail__c
                                                 WHERE Id IN :delBillDtIds];

        // 請求明細削除
        delete delBillDtList;
    }


    /**
     * 入力チェック
     * @param updBillingDtList 請求明細
     */
    private static String checkbillDtInfo(List<BillingDetail__c> updBillingDtList){

        String errMsg = '';
        Decimal totalAmount = 0;
        // 明細の合計チェック
        for(BillingDetail__c billDt : updBillingDtList){
            totalAmount += billDt.AmountBilled__c;
        }

        // 金額上限エラー
        if(totalAmount >= amountLimit){
            errMsg = amountLimitErrMag;
        }

        return errMsg;
    }

    /**
     * 請求明細情報を保存する
     * @param billInfo 画面入力した値
     */
    private static BillingDetail__c setBillDtFromDispMap(Map<Object, Object> billDlMap) {
        for(Object obj : billDlMap.keySet()){
            System.debug((String)obj + ' = ' + billDlMap.get((String)obj));
        }
        BillingDetail__c billDt = new BillingDetail__c();
        billDt.Id = CommonUtil.toStrValNull(billDlMap.get('Id'));
        billDt.AmountBilled__c = CommonUtil.toDecValNull(billDlMap.get('AmountBilled__c'));
        billDt.ProductId__c = CommonUtil.toStrValNull(billDlMap.get('ProductId__c'));
        billDt.Billing__c = CommonUtil.toStrValNull(billDlMap.get('Billing__c'));
        billDt.SortNo__c = CommonUtil.toDecValNull(billDlMap.get('SortNo__c'));
        billDt.Subtotal__c = CommonUtil.toDecValNull(billDlMap.get('Subtotal__c'));
        billDt.UnitPrice__c = CommonUtil.toDecValNull(billDlMap.get('UnitPrice__c'));
        billDt.Quantity__c = CommonUtil.toDecValNull(billDlMap.get('Quantity__c'));
        billDt.Discount__c = CommonUtil.toDecValNull(billDlMap.get('Discount__c'));
        billDt.Remarks__c = CommonUtil.toStrValNull(billDlMap.get('Remarks__c'));
        return billDt;
    }

    /**
     * 請求情報を保存する
     * @param billInfo 画面入力した値
     */
    private static Billing__c setBillFromDispBillInfo(Map<String, Object> billInfo){
        Billing__c bill = new Billing__c();
        bill.Id = CommonUtil.toStrValNull(billInfo.get('Id'));
        bill.Opportunity__c = CommonUtil.toStrValNull(billInfo.get('Opportunity__c'));
        bill.BillingPartner__c = CommonUtil.toStrValNull(billInfo.get('BillingPartner__c'));
        bill.PaymentDueDate__c = CommonUtil.toDateValNull(billInfo.get('PaymentDueDate__c'));
        bill.BillingDate__c = CommonUtil.toDateValNull(billInfo.get('BillingDate__c'));
        bill.Status__c = CommonUtil.toStrValNull(billInfo.get('Status__c'));
        bill.Remarks__c = CommonUtil.toStrValNull(billInfo.get('Remarks__c'));
        return bill;
    }
}