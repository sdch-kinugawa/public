public without sharing class CustomDispContactsController {
    /**
    * 取引先責任者情報を取得する
    * @param recordId 取引先ID
    * @return 取引先責任者リスト
    * wireサービスでApexメソッドを呼び出す場合は、「cacheable=true」が必要
    */
    @AuraEnabled(cacheable=true)
    public static List<Contact> getConList(String recordId){
        try {

            List<Contact> conList = [SELECT 
                                          Id
                                        , FirstName
                                        , LastName
                                        , Title
                                        , Email
                                        , Phone 
                                        , AccountId 
                                    FROM Contact 
                                    WHERE AccountId = :recordId];           

            return conList;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * 取引先責任者を保存する
     * @param conList 画面入力した値
     */
    @AuraEnabled
    public static String saveConList(List<Contact> conList) {

        System.debug('conList = ' + conList);
        String errMsg = '';

        try{

            // 更新
            update conList;

        } catch (Exception e) {
            errMsg += e.getMessage() + ' : ' + e.getStackTraceString();
        }

        // 返却
        return errMsg;
    }
}