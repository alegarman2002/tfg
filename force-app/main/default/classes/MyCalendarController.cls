public with sharing class MyCalendarController {

    @AuraEnabled
    public static List<string> getHolidayDays(){
        StaticResource srObject = [SELECT id,body FROM StaticResource WHERE Name = 'Festivos'];
        String contents = srObject.body.toString();
        List<string> dias = new List<string>();
        for(String line:contents.split('\n')) {
            System.debug(line);
            dias.add(line);
        }
        return dias;
    }



    @AuraEnabled
    public static List<Map<String, Object>> getEvents() {
        
        String query = 'SELECT Id, Name, StartDateTime__c, EndDateTime__c, Image__c FROM MyEvent__c';
        // system.debug(query);
        List<sObject> results = Database.query(query);
        List<Map<String, Object>> listToReturn = new List<Map<String, Object>>();
        for (integer i = 0; i < results.size(); i++) {
            sObject event = results[i];
            DateTime startDateTime = (DateTime) event.get('StartDateTime__c');
            DateTime endDateTime = (DateTime) event.get('EndDateTime__c');
            String title = (String) event.get('Name');
            String id = (String) event.get('Id');
            String url = (String) event.get('Image__c');

            Map<String,Object> eventData = new Map<String, Object> {
                'id' => id,
                'title' => title,
                'start' => startDateTime.format('yyyy-MM-dd HH:mm:ss'),
                'end' => endDateTime.format('yyyy-MM-dd HH:mm:ss'),
                'img' => url
            };
            // System.debug(url);
            listToReturn.add(eventData);
        }

        return listToReturn;
    }

    @AuraEnabled
    public static List<string> getUserLogInfo(){
        List<string> listToReturn = new List<string>();
        try {
            Id userId = UserInfo.getUserId();
            User currentUser = [SELECT Name, Email FROM User WHERE Id = :userId LIMIT 1];
            listToReturn.add(currentUser.Name);
            listToReturn.add(currentUser.Email);
            // System.debug(currentUser);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return listToReturn;
    }

    @AuraEnabled
    public static List<string> getEventInfo(String id){
        List<string> listToReturn = new List<String>();
        try {
            String query = 'SELECT OwnerId, Description__c, StartDateTime__c, EndDateTime__c, Email__c, Location__c, Name, Image__c FROM MyEvent__c WHERE id = \'' + id + '\'';
            // system.debug(query);  
            List<sObject> results = Database.query(query);
            sObject event = results[0];
            listToReturn.add(String.valueOf(event.get('OwnerId')));
            listToReturn.add(String.valueOf(event.get('Description__c')));
            listToReturn.add(String.valueOf(event.get('StartDateTime__c')));
            listToReturn.add(String.valueOf(event.get('EndDateTime__c')));
            listToReturn.add(String.valueOf(event.get('Email__c')));
            listToReturn.add(String.valueOf(event.get('Location__c')));
            listToReturn.add(String.valueOf(event.get('Name')));
            listToReturn.add(String.valueOf(event.get('Image__c')));
            for (integer i = 0; i < listToReturn.size(); i++) {
                // System.debug(listToReturn[i]);
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return listToReturn;
    }

    @AuraEnabled
    public static string getUserInformation(String eventId){
        String userInfo = null;
        // System.debug(eventId);
        try {
            User currentUser = [SELECT FirstName, LastName FROM User WHERE Id = :eventId LIMIT 1];
            userInfo = currentUser.FirstName + ' ' + currentUser.LastName;
            // System.debug(currentUser);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return userInfo;
    }

    @AuraEnabled
    public static integer setRelationship(String id, String email, String name){
        //hay que hacer validador de que la relacion no existe
        // System.debug('Empezamos el metodo');
        Id userId = UserInfo.getUserId();
        String query = 'SELECT Id__c, Email__c, Name__c FROM MyEventUserRelation__c WHERE Id__c = \'' + id + '\' AND Email__c = \'' + email + '\' AND Name__c = \'' + name + '\'';
        // System.debug(query);
        // System.debug(Database.query(query));
        if (Database.query(query).size() == 0) {
            // System.debug('Devuelve nulo');
            // System.debug('Antes de crear el objeto de relacion');
            MyEventUserRelation__c relation = new MyEventUserRelation__c(
                Id__c = id,
                IdUser__c = userId,
                Email__c = email,
                Name__C = name
            );
            // System.debug('Despues de crear el objeto');
            insert relation;
            return 1;
        } else {
            // System.debug('Query realizada');
            return 0;
        }

        // insert relation;
    }

    @AuraEnabled
    public static integer compareEventsId(String id){
        Id userId = UserInfo.getUserId();
        List<sObject> relaciones = [SELECT Id__c FROM MyEventUserRelation__c WHERE IdUser__c = :userId];
        System.debug(relaciones.size());
        for (integer i = 0; i < relaciones.size(); i++) {
            sObject event = relaciones[i];
            if (String.valueOf(event.get('Id__c')) == id) {
                return 1;
            }
        }
        
        return 0;
    }

    @AuraEnabled
    public static List<List<string>> getEventsOfTheUser(){
        DateTime today = DateTime.now();

        Id userId = UserInfo.getUserId();
        
        List<List<String>> listaConEventos = new List<List<String>>();
        List<sObject> relaciones = [SELECT Id__c FROM MyEventUserRelation__c WHERE IdUser__c = :userId];
        for (integer i = 0; i < relaciones.size(); i++) {
            Id idToCompare = Id.valueOf((string) relaciones[i].get('Id__c'));
            List<MyEvent__c> event = [SELECT StartDateTime__c, EndDateTime__c, Name FROM MyEvent__c WHERE Id = :idToCompare LIMIT 1];           
            List<string> evento = new List<string>();
            if (today < (DateTime) event[0].get('StartDateTime__c')) {
                evento.add(String.valueOf((DateTime) event[0].get('StartDateTime__c')));
                evento.add(String.valueOf((DateTime) event[0].get('EndDateTime__c')));
                evento.add(String.valueOf(event[0].get('Name')));
                listaConEventos.add(evento);
            }
        }       
        
        return listaConEventos;
    }
}  