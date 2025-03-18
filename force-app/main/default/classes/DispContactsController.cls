public without sharing class DispContactsController {

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
                                    FROM Contact 
                                    WHERE AccountId = :recordId];
            return conList;
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void saveConList(List<Contact> conList) {
        if (!conList.isEmpty()) {
            //①インライン編集をしたレコードを更新
            update conList;
        }
    }
}