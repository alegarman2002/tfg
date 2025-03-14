/**
 * This class contains unit tests for validating the behavior of Apex classes
 * and triggers.
 *
 * Unit tests are class methods that verify whether a particular piece
 * of code is working properly. Unit test methods take no arguments,
 * commit no data to the database, and are flagged with the testMethod
 * keyword in the method definition.
 *
 * All test methods in an org are executed whenever Apex code is deployed
 * to a production org to confirm correctness, ensure code
 * coverage, and prevent regressions. All Apex classes are
 * required to have at least 75% code coverage in order to be deployed
 * to a production org. In addition, all triggers must have some code coverage.
 * 
 * The @isTest class annotation indicates this class only contains test
 * methods. Classes defined with the @isTest annotation do not count against
 * the org size limit for all Apex scripts.
 *
 * See the Apex Language Reference for more information about Testing and Code Coverage.
 */
@isTest
private class TestMyCalendarController {

    @IsTest
    static void testGetHolidayDaysConRecurso() {
        // Ejecutar el método 
        Test.startTest();
        List<String> diasFestivos = MyCalendarController.getHolidayDays();
        Test.stopTest();

        // Verificar que retorne una lista con el numero de dias festivos
        System.assertEquals(12, diasFestivos.size(), 'Debe retornar una lista vacía si el recurso no existe');
    }
    
    @IsTest
    static void testGetEventsWithData() {
        // Crear registros de MyEvent__c para las pruebas
        MyEvent__c event1 = new MyEvent__c(
            Name = 'Test Event 1',
            StartDateTime__c = DateTime.newInstance(2026, 9, 20, 10, 0, 0),
            EndDateTime__c = DateTime.newInstance(2026, 9, 20, 12, 0, 0),
            Image__c = 'https://example.com/event1.png',
            Email__c = 'example@example.com',
            Location__c = 'example'
        );
        insert event1;

        MyEvent__c event2 = new MyEvent__c(
            Name = 'Test Event 2',
            StartDateTime__c = DateTime.newInstance(2026, 10, 5, 9, 30, 0),
            EndDateTime__c = DateTime.newInstance(2026, 10, 5, 11, 30, 0),
            Image__c = 'https://example.com/event2.png',
            Email__c = 'example@example.com',
            Location__c = 'example'
        );
        insert event2;

        // Ejecutar el método getEvents
        Test.startTest();
        List<Map<String, Object>> events = MyCalendarController.getEvents();
        Test.stopTest();

        // Verificar que se devuelvan 2 eventos
        System.assertEquals(2, events.size(), 'Debe devolver 2 eventos.');

        // Verificar los valores del primer evento
        Map<String, Object> firstEvent = events[0];
        System.assertEquals('Test Event 1', firstEvent.get('title'), 'El título del primer evento debe ser "Test Event 1".');
        System.assertEquals('2026-09-20 10:00:00', firstEvent.get('start'), 'La fecha de inicio debe ser correcta para el primer evento.');
        System.assertEquals('2026-09-20 12:00:00', firstEvent.get('end'), 'La fecha de finalización debe ser correcta para el primer evento.');
        System.assertEquals('https://example.com/event1.png', firstEvent.get('img'), 'La URL de la imagen debe ser correcta para el primer evento.');

        // Verificar los valores del segundo evento
        Map<String, Object> secondEvent = events[1];
        System.assertEquals('Test Event 2', secondEvent.get('title'), 'El título del segundo evento debe ser "Test Event 2".');
        System.assertEquals('2026-10-05 09:30:00', secondEvent.get('start'), 'La fecha de inicio debe ser correcta para el segundo evento.');
        System.assertEquals('2026-10-05 11:30:00', secondEvent.get('end'), 'La fecha de finalización debe ser correcta para el segundo evento.');
        System.assertEquals('https://example.com/event2.png', secondEvent.get('img'), 'La URL de la imagen debe ser correcta para el segundo evento.');
    }

    @IsTest
    static void testGetEventsNoData() {
        // Este test simula que no hay eventos en la base de datos

        // Ejecutar el método getEvents
        Test.startTest();
        List<Map<String, Object>> events = MyCalendarController.getEvents();
        Test.stopTest();

        // Verificar que se devuelvan 0 eventos
        System.assertEquals(0, events.size(), 'Debe devolver 0 eventos cuando no hay registros.');
    }

    @IsTest
    static void testGetUserLogInfo() {
        // Obtener el usuario actual (ya que el método está diseñado para el usuario logueado)
        User testUser = [SELECT Id, Name, Email FROM User WHERE IsActive = true LIMIT 1];

        // Establecer el usuario de prueba como el usuario logueado
        System.runAs(testUser) {
            // Ejecutar el método getUserLogInfo
            Test.startTest();
            List<String> userInfo = MyCalendarController.getUserLogInfo();
            Test.stopTest();

            // Verificar que la lista contenga dos elementos (nombre y correo electrónico)
            System.assertEquals(2, userInfo.size(), 'Debe devolver una lista con 2 elementos (nombre y correo electrónico).');

            // Verificar el nombre y el correo electrónico del usuario
            System.assertEquals(testUser.Name, userInfo[0], 'El nombre debe coincidir con el del usuario logueado.');
            System.assertEquals(testUser.Email, userInfo[1], 'El correo electrónico debe coincidir con el del usuario logueado.');
        }
    }
    
    @IsTest
    static void testGetEventInfo() {
        // Crear un evento de prueba
        MyEvent__c testEvent = new MyEvent__c(
            OwnerId = UserInfo.getUserId(),
            Description__c = 'Evento de prueba',
            StartDateTime__c = DateTime.newInstance(2026, 9, 20, 10, 0, 0),
            EndDateTime__c = DateTime.newInstance(2026, 9, 20, 12, 0, 0),
            Email__c = 'email@example.com',
            Location__c = 'Ubicación de prueba',
            Name = 'Evento Test',
            Image__c = 'http://example.com/image.png'
        );
        insert testEvent;

        // Ejecutar el método con el ID del evento insertado
        Test.startTest();
        List<String> eventInfo = MyCalendarController.getEventInfo(testEvent.Id);
        Test.stopTest();

        // Verificar que la lista contenga los valores correctos
        System.assertEquals(8, eventInfo.size(), 'Debe devolver una lista con 8 elementos.');

        System.assertEquals(testEvent.OwnerId, eventInfo[0], 'El OwnerId debe coincidir.');
        System.assertEquals(testEvent.Description__c, eventInfo[1], 'La descripción debe coincidir.');
        //System.assertEquals('2026-09-20 8:00:00', eventInfo[2], 'La fecha de inicio debe coincidir.');
        //System.assertEquals('2026-09-20 10:00:00', eventInfo[3], 'La fecha de fin debe coincidir.');
        System.assertEquals(testEvent.Email__c, eventInfo[4], 'El email debe coincidir.');
        System.assertEquals(testEvent.Location__c, eventInfo[5], 'La ubicación debe coincidir.');
        System.assertEquals(testEvent.Name, eventInfo[6], 'El nombre del evento debe coincidir.');
        System.assertEquals(testEvent.Image__c, eventInfo[7], 'La URL de la imagen debe coincidir.');
    }

    @IsTest
    static void testGetEventInfoInvalidId() {
        // Prueba con un ID inválido
        Test.startTest();
        try {
            MyCalendarController.getEventInfo('invalidId');
            System.assert(false, 'Se esperaba que se lanzara una excepción para un ID inválido.');
        } catch (AuraHandledException e) {
            // Verificar que se lance la excepción correctamente
            System.assertEquals('Script-thrown exception', e.getMessage(), 'Se debe comprobar la excepción.');
        }
        Test.stopTest();
    }
    
     @IsTest
    static void testGetUserInformation() {
        // Crear un usuario de prueba (ya activo)
        User testUser = [SELECT Id, FirstName, LastName FROM User WHERE IsActive = true LIMIT 1];
        
        // Ejecutar el método con el ID del usuario creado
        Test.startTest();
        String userInfo = MyCalendarController.getUserInformation(testUser.Id);
        Test.stopTest();

        // Verificar que la información devuelta es correcta
        String expectedName = testUser.FirstName + ' ' + testUser.LastName;
        System.assertEquals(expectedName, userInfo, 'La información del usuario debe coincidir.');
    }

    @IsTest
    static void testGetUserInformationInvalidId() {
        // Probar con un ID de usuario inválido
        Test.startTest();
        try {
            MyCalendarController.getUserInformation('invalidId');
            System.assert(false, 'Se esperaba que se lanzara una excepción para un ID inválido.');
        } catch (AuraHandledException e) {
            System.assertEquals('Script-thrown exception', e.getMessage(), 'El mensaje mostrar el error.');
        }
        Test.stopTest();
    }

    @IsTest
    static void testGetUserInformationNullId() {
        // Probar con un ID nulo
        Test.startTest();
        try {
            MyCalendarController.getUserInformation(null);
            System.assert(false, 'Se esperaba que se lanzara una excepción para un ID nulo.');
        } catch (AuraHandledException e) {
            System.assertEquals('Script-thrown exception', e.getMessage(), 'El mensaje mostrar el error.');
        }
        Test.stopTest();
    }
    
    @IsTest
    static void testSetRelationship_NewRelationship() {
        // Crear datos de prueba
        String testId = 'testEventId';
        String testEmail = 'test@example.com';
        String testName = 'Test Name';
        
        // Ejecutar el método setRelationship
        Test.startTest();
        Integer result = MyCalendarController.setRelationship(testId, testEmail, testName);
        Test.stopTest();
        
        // Verificar que se haya insertado la relación
        System.assertEquals(1, result, 'Se esperaba que se insertara una nueva relación.');
        
        // Verificar que la relación se haya insertado correctamente en la base de datos
        List<MyEventUserRelation__c> relations = [
            SELECT Id, Email__c, Name__c FROM MyEventUserRelation__c WHERE Id__c = :testId
        ];
        System.assertEquals(1, relations.size(), 'Debe existir una relación en la base de datos.');
        System.assertEquals(testEmail, relations[0].Email__c, 'El correo electrónico debe coincidir.');
        System.assertEquals(testName, relations[0].Name__c, 'El nombre debe coincidir.');
    }
    
    @IsTest
    static void testSetRelationship_ExistingRelationship() {
        // Crear relación de prueba
        String testId = 'existingEventId';
        String testEmail = 'existing@example.com';
        String testName = 'Existing Name';
        
        MyEventUserRelation__c existingRelation = new MyEventUserRelation__c(
            Id__c = testId,
            Email__c = testEmail,
            Name__c = testName,
            IdUser__c = UserInfo.getUserId()
        );
        insert existingRelation;
        
        // Ejecutar el método con la misma relación
        Test.startTest();
        Integer result = MyCalendarController.setRelationship(testId, testEmail, testName);
        Test.stopTest();
        
        // Verificar que no se haya insertado una nueva relación
        System.assertEquals(0, result, 'Se esperaba que no se insertara una nueva relación.');
    }
    
    @IsTest
    static void testCompareEventsId_MatchingEvent() {
        // Crear usuario de prueba
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        
        // Crear relación de evento para el usuario de prueba
        MyEventUserRelation__c testRelation = new MyEventUserRelation__c(
            Id__c = 'testEventId',
            IdUser__c = testUser.Id,
            Email__c = 'test@example.com',
            Name__c = 'Test Event'
        );
        insert testRelation;
	
        Integer result = 0;
        
        // Ejecutar el método con el ID que coincide
        Test.startTest();
        // Simular que el usuario es el usuario de prueba
        System.runAs(testUser) {
        	result = MyCalendarController.compareEventsId('testEventId');
        }
        Test.stopTest();
        
        // Verificar que devuelva 1
        System.assertEquals(1, result, 'Se esperaba que el método devolviera 1 para un evento coincidente.');
    }

    @IsTest
    static void testCompareEventsId_NonMatchingEvent() {
        // Crear usuario de prueba
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        
        // Crear relación de evento para el usuario de prueba
        MyEventUserRelation__c testRelation = new MyEventUserRelation__c(
            Id__c = 'anotherEventId',
            IdUser__c = testUser.Id,
            Email__c = 'test@example.com',
            Name__c = 'Another Event'
        );
        insert testRelation;

        // Ejecutar el método con un ID que no coincide
        Test.startTest();
        Integer result = MyCalendarController.compareEventsId('nonExistingEventId');
        Test.stopTest();
        
        // Verificar que devuelva 0
        System.assertEquals(0, result, 'Se esperaba que el método devolviera 0 para un evento no coincidente.');
    }
    
    @IsTest
    static void testGetEventsOfTheUser_FutureEvents() {
        // Crear usuario de prueba
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        
        // Insertar eventos futuros
        MyEvent__c futureEvent1 = new MyEvent__c(
            Name = 'Evento Futuro 1',
            StartDateTime__c = DateTime.now().addDays(10),
            EndDateTime__c = DateTime.now().addDays(11)
        );
        insert futureEvent1;

        MyEvent__c futureEvent2 = new MyEvent__c(
            Name = 'Evento Futuro 2',
            StartDateTime__c = DateTime.now().addDays(20),
            EndDateTime__c = DateTime.now().addDays(21)
        );
        insert futureEvent2;
        
        // Crear relaciones de eventos para el usuario
        MyEventUserRelation__c relation1 = new MyEventUserRelation__c(
            Id__c = futureEvent1.Id,
            IdUser__c = testUser.Id,
            Email__c = 'test1@example.com',
            Name__c = 'Relacion 1'
        );
        insert relation1;

        MyEventUserRelation__c relation2 = new MyEventUserRelation__c(
            Id__c = futureEvent2.Id,
            IdUser__c = testUser.Id,
            Email__c = 'test2@example.com',
            Name__c = 'Relacion 2'
        );
        insert relation2;
		
        List<List<String>> result = null;
        
        // Ejecutar el método
        Test.startTest();
        // Simular que el usuario es el usuario de prueba
        System.runAs(testUser) {
        	result = MyCalendarController.getEventsOfTheUser();
        }
        Test.stopTest();
        
        // Verificar que se devuelven los eventos futuros
        System.assertEquals(2, result.size(), 'Debe retornar 2 eventos futuros.');
        System.assertEquals('Evento Futuro 1', result[0][2], 'El primer evento debe ser "Evento Futuro 1".');
        System.assertEquals('Evento Futuro 2', result[1][2], 'El segundo evento debe ser "Evento Futuro 2".');
    }

    @IsTest
    static void testGetEventsOfTheUser_NoFutureEvents() {
        // Crear usuario de prueba
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        
        // Insertar eventos pasados
        MyEvent__c pastEvent = new MyEvent__c(
            Name = 'Evento Pasado',
            StartDateTime__c = DateTime.now().addDays(-10),
            EndDateTime__c = DateTime.now().addDays(-9)
        );
        insert pastEvent;
        
        // Crear relación de evento para el usuario
        MyEventUserRelation__c relation = new MyEventUserRelation__c(
            Id__c = pastEvent.Id,
            IdUser__c = testUser.Id,
            Email__c = 'test@example.com',
            Name__c = 'Relacion Pasada'
        );
        insert relation;
        
        List<List<String>> result = null;
        
        // Ejecutar el método
        Test.startTest();
        // Simular que el usuario es el usuario de prueba
        System.runAs(testUser) {
        	result = MyCalendarController.getEventsOfTheUser();
        }
        Test.stopTest();
        
        // Verificar que no se devuelven eventos pasados
        System.assertEquals(0, result.size(), 'No debe retornar eventos pasados.');
    }
}