public with sharing class UserInformation {
    
    @AuraEnabled
    public static User inscribeUser(){

        
        return [Select id, Name, Email from User where Id = :UserInfo.getUserId()];
    }
}