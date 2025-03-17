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
                  Id = CommonUtill.toStrValNull(accInfo.get('Id'))
                , Name = CommonUtill.toStrValNull(accInfo.get('Name'))
                , Phone = CommonUtill.toStrValNull(accInfo.get('Phone'))
                , AnnualRevenue = CommonUtill.toDecValNull(accInfo.get('AnnualRevenue'))
            );

            // 取引先情報更新
            upsert acc;

        } catch (Exception e) {
            errMsg += e.getMessage() + ' : ' + e.getStackTraceString();
        }

        // 返却
        return errMsg;
    }
}