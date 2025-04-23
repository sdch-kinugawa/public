public without sharing class CustomGetRecordAccountControl {

    /**
     * 取引先情報を取得する
     * @param id 取引先ID
     * @return 取引先情報
     * wireサービスでApexメソッドを呼び出す場合は、「cacheable=true」が必要
     */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getAccInfo(String id){
        try {
            Account acc = [SELECT 
                               Id
                             , Name
                             , Phone 
                             , AnnualRevenue 
                             FROM Account 
                             WHERE Id = :id];

            Map<String, Object> retMap = new Map<String, Object>();
            retMap.put('Id', acc.Id);
            retMap.put('Name', acc.Name);
            retMap.put('Phone', acc.Phone);
            retMap.put('AnnualRevenue', acc.AnnualRevenue);
            return retMap;

        } catch (Exception e) {
            throw null;
        }
    }

    /**
     * 
     * @param accInfo 取引先情報
     * @return 取引先情報
     * 
     */
    @AuraEnabled
    public static String saveAcc(Map<String, Object> accInfo){

        System.debug('accInfo = ' + accInfo);
        String errMsg = '';

        try{
            // 画面からの取引先情報設定　画面の値は格納先のデータ型に変換して設定
            Account acc = new Account(
                  Id = CommonUtil.toStrValNull(accInfo.get('Id'))
                , Name = CommonUtil.toStrValNull(accInfo.get('Name'))
                , Phone = CommonUtil.toStrValNull(accInfo.get('Phone'))
                , AnnualRevenue = CommonUtil.toDecValNull(accInfo.get('AnnualRevenue'))
            );

            // 20億以上の年間売上の場合はエラー
            if(acc.AnnualRevenue > 2000000000){
                errMsg = '20億以上の売上会社は更新できません。再度確認してください。';
            }

            // 取引先情報更新
            if(errMsg == '') upsert acc;

        } catch (Exception e) {
            errMsg += e.getMessage() + ' : ' + e.getStackTraceString();
        }

        // 返却
        return errMsg;
    }
}