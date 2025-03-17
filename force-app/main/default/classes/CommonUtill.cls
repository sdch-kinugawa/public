/**
 * 共通処理
 */
public without sharing class CommonUtill {

    /**
     * 選択リスト値取得
     * @param objectApiName オブジェクトAPI名
     * @param fieldApiName 項目のAPI名
     * @return 選択リスト値リスト
     */
    public static List<Map<String, String>> getPickList(String objectApiName, String fieldApiName) {   

        // objectApiNameからSObjectType情報を取得
        List<Schema.PicklistEntry> pickList;
        Schema.SObjectType sObjType = (Schema.SObjectType)Schema.getGlobalDescribe().get(objectApiName);
        if (sObjType != null) {
            // オブジェクトのfieldマップを取得
            Map<String, Schema.SObjectField> fieldmap = sObjType.getDescribe().fields.getMap();
            Schema.SObjectField f = (Schema.SObjectField) fieldmap.get(fieldApiName);
            // フィールドの選択リスト値を取得
            if (f != null) {
                Schema.DescribeFieldResult r = f.getDescribe();
                pickList = r.getPicklistValues();
            }
        }
        // 取得した選択リストをMapに格納
        List<Map<String, String>> options = new List<Map<String, String>>();
        for (Schema.PicklistEntry entry : pickList) {
            Map<String, String> option = new Map<String, String>{
                'label' => entry.getLabel(),
                'value' => entry.getValue()
            };
            // 返却用リストへ格納
            options.add(option);
        }
        return options;
    }

    /**
     * String値変換
     * @param val 値
     * @return 値
     * パラメーターの値がnullの場合、nullを返却しnull以外はStringに変換して返却
     */
    public static String toStrValNull(Object val) { 
        return (val == null || val == '') ? null : (String)val;
    }

    /**
     * Decimal値変換
     * @param val 値
     * @return 値
     * パラメーターの値がnullの場合、nullを返却しnull以外はDecimalに変換して返却
     */
    public static Decimal toDecValNull(Object val) {
        Decimal retVal = 0;
        // 文字列であれば変換 ※画面から数値は文字列の時と数値の時があるので、こんなことしています。
        if(val != null && val instanceof String){
            retVal = Decimal.valueOf((String)val);
        } else {
            retVal = (Decimal)val;
        }
        return retVal;
    }

    /**
     * Date値変換
     * @param val 値
     * @return 値
     * パラメーターの値がnullの場合、nullを返却しnull以外はDateに変換して返却
     */
    public static Date toDateValNull(Object val) { 
        return val == null ? null : Date.valueOf((String)val);
    }

    /**
     * Boolean値変換
     * @param val 値
     * @return 値
     * パラメーターの値がnullの場合、nullを返却しnull以外はBooleanに変換して返却
     */
    public static Boolean toBoolValNull(Object val) { 
        return val == null ? null : (Boolean)val;
    }

    /**
     * メール送信
     */
    public static void sendSystemEmail(String subject, String body, List<String> sendToMailList, String orgEmailAddress){
        // 単一メールメッセージの送信用
        Messaging.SingleEmailMessage resultEmail = new Messaging.SingleEmailMessage();
        // 件名
        resultEmail.setSubject(subject);
        // メール本文
        resultEmail.setHtmlBody(body);
        // 送信先
        resultEmail.setToAddresses( sendToMailList );
        // 「組織のメールアドレス」に登録したメールアドレスを取得
        ID orgWideEmailAddressId = getOrgWideEmailAddress(orgEmailAddress).Id;
        // 送信元になるようセット
        resultEmail.setOrgWideEmailAddressId(orgWideEmailAddressId);
        // メール送信
        Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{ resultEmail });
    }

    /*
    * 組織メールアドレス情報取得
    */
    public static OrgWideEmailAddress getOrgWideEmailAddress(String displayName) {
        // 表示名(DiplayName)で検索
        String queryStr =
        ' SELECT' +
        '     Id,' +
        '     Address,' +
        '     DisplayName' +
        ' FROM' +
        '     OrgWideEmailAddress' +
        ' WHERE' +
        '     DisplayName = :displayName';
        return Database.query(queryStr);
    }

    // 配列に格納された文字を改行でつなげる
    public static String createStringFromMsgList(List<String> msgList){
        
        String msg = '';
        final String CRLF = '\r\n';
        for (String data :msgList) {
            msg += data + CRLF;
        }
        return msg;
    }

}