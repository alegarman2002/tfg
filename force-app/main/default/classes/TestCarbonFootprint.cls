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
private class TestCarbonFootprint {

   // Método auxiliar para crear un usuario de prueba
    private static User crearUsuarioPrueba() {
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User' LIMIT 1];
        User testUser = new User(
            FirstName = 'Test',
            LastName = 'User',
            Email = 'testuser@example.com',
            Username = 'testuser' + DateTime.now().getTime() + '@example.com',
            Alias = 'tuser',
            TimeZoneSidKey = 'Europe/Madrid',
            LocaleSidKey = 'es_ES',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'es',
            ProfileId = p.Id
        );
        insert testUser;
        return testUser;
    }
    
    // Test cuando no hay registros de CarboonFootprint__c
    @isTest
    public static void testSinRegistros() {
        // Crear usuario de prueba
        User testUser = crearUsuarioPrueba();
        System.runAs(testUser) {
            // Ejecutamos el método sin ningún registro de CarboonFootprint__c
            Test.startTest();
            Integer resultado = CarbonFootprint.comprobarUltimoGuardado(); // Reemplaza "MyClass" con el nombre de tu clase real
            Test.stopTest();

            // Verificamos que el resultado es 1 (no hay registros, por lo tanto, ya pasó más de un mes)
            System.assertEquals(1, resultado, 'El resultado debería ser 1 cuando no hay registros.');
        }
    }
    
    // Test cuando hay un registro creado hace menos de un mes
    @isTest
    public static void testRegistroReciente() {
        // Crear usuario de prueba
        User testUser = crearUsuarioPrueba();
        System.runAs(testUser) {
            // Creamos un registro de CarboonFootprint__c con una fecha de creación dentro del último mes
            CarboonFootprint__c registroReciente = new CarboonFootprint__c(
                DiaCreacion__c = Date.today().addDays(-15), // Hace 15 días
                UserId__c = testUser.Id,
                Metros__c = 0,
                NumeroBombillas__c = 0,
                TipoIluminacion__c = 'Incandescente'
            );
            insert registroReciente;

            // Ejecutamos el método
            Test.startTest();
            Integer resultado = CarbonFootprint.comprobarUltimoGuardado();
            Test.stopTest();

            // Verificamos que el resultado es 0 (no ha pasado más de un mes)
            System.assertEquals(0, resultado, 'El resultado debería ser 0 cuando hay un registro reciente.');
        }
    }
    
    // Test cuando hay un registro creado hace más de un mes
    @isTest
    public static void testRegistroAntiguo() {
        // Crear usuario de prueba
        User testUser = crearUsuarioPrueba();
        System.runAs(testUser) {
            // Creamos un registro de CarboonFootprint__c con una fecha de creación de más de un mes
            CarboonFootprint__c registroAntiguo = new CarboonFootprint__c(
                DiaCreacion__c = Date.today().addMonths(-2), // Hace 2 meses
                UserId__c = testUser.Id,
                Metros__c = 0,
                NumeroBombillas__c = 0,
                TipoIluminacion__c = 'Incandescente'
            );
            insert registroAntiguo;

            // Ejecutamos el método
            Test.startTest();
            Integer resultado = CarbonFootprint.comprobarUltimoGuardado();
            Test.stopTest();

            // Verificamos que el resultado es 1 (ya ha pasado más de un mes)
            System.assertEquals(1, resultado, 'El resultado debería ser 1 cuando hay un registro antiguo.');
        }
    }
    
    @isTest
    public static void testGuardarDatos() {
        // Crear usuario de prueba
        User testUser = crearUsuarioPrueba();
        
        System.runAs(testUser) {
            // Crear una lista de parámetros de prueba
            List<String> parametros = new List<String>{
                '500',      // Consumo eléctrico
                '5',        // Días en oficina
                'metodoCoche',    // Método de transporte
                'motorGasolina', // Valor motor
                '8.5',      // Consumo motor
                '4',        // Integrantes del coche
                '2',        // Monitores
                'tipoElectrica',      // Tipo de calefacción
                '6',        // Uso de calefacción
                '20',       // Distancia en km
                '85',       // Metros cuadrados
                '10',       // Número de bombillas
                'tipoLed'       // Tipo de iluminación
            };

            // Ejecutamos el método guardarDatos
            Test.startTest();
            Integer resultado = CarbonFootprint.guardarDatos(parametros); // Reemplaza "MyClass" con el nombre de tu clase real
            Test.stopTest();

            // Verificamos que el resultado sea 1
            System.assertEquals(1, resultado, 'El resultado debería ser 1 después de guardar los datos.');

            // Verificar que se creó el registro de CarboonFootprint__c
            List<CarboonFootprint__c> registros = [SELECT Id, ConsumoElectrico__c, NombreCompleto__c, ConsumoMotor__c, MetodoTransporte__c 
                                                   FROM CarboonFootprint__c WHERE UserId__c = :testUser.Id];
            System.assertEquals(1, registros.size(), 'Debería haberse creado un registro de CarboonFootprint__c.');
            System.assertEquals(500, registros[0].ConsumoElectrico__c, 'El consumo eléctrico debería ser 500.');
            System.assertEquals(testUser.FirstName + ' ' + testUser.LastName, registros[0].NombreCompleto__c, 'El nombre completo debería coincidir con el del usuario.');
            System.assertEquals(8.5, registros[0].ConsumoMotor__c, 'El consumo del motor debería ser 8.5.');
            System.assertEquals('metodoCoche', registros[0].MetodoTransporte__c, 'El método de transporte debería ser "Coche".');
        }
    }
    
     // Test del método calcularHuellaUsuario
    @isTest
    public static void testCalcularHuellaUsuario() {
        // Crear usuario de prueba
        User testUser = crearUsuarioPrueba();

        System.runAs(testUser) {
            // Crear registros de prueba para CarboonFootprint__c
            List<CarboonFootprint__c> registros = new List<CarboonFootprint__c>();
            for (Integer i = 1; i <= 13; i++) {
                registros.add(new CarboonFootprint__c(
                    DiaCreacion__c = Date.today().addMonths(-i),
                    ConsumoElectrico__c = 500,
                    ConsumoMotor__c = 7.5,
                    DiasOficina__c = 10,
                    IntegrantesCoche__c = 4,
                    MetodoTransporte__c = 'metodoCoche',
                    Monitores__c = 2,
                    TipoCalefaccion__c = 'tipoElectrica',
                    TipoMotor__c = 'motorGasolina',
                    UsoCalefaccion__c = 5,
                    Distancia__c = 20,
                    Metros__c = 100,
                    NumeroBombillas__c = 8,
                    TipoIluminacion__c = 'tipoLED',
                    UserId__c = testUser.Id
                ));
            }
            insert registros;

            // Ejecutar el método a probar
            Test.startTest();
            List<List<Double>> resultado = CarbonFootprint.calcularHuellaUsuario(); // Reemplaza "MyClass" con el nombre de tu clase real
            Test.stopTest();

            // Validar que se han calculado 7 listas de resultados
            System.assertEquals(7, resultado.size(), 'El método debería devolver 7 listas.');

            // Validar que la lista de valores totales tiene al menos 3 elementos
            System.assertEquals(3, resultado[0].size(), 'La lista de valores totales debería tener 3 elementos.');

            // Validar que las otras listas también tienen datos (se puede ajustar según los datos)
            System.assertEquals(12, resultado[1].size(), 'La lista de desplazamiento mensual debería tener 12 elementos.');
            System.assertEquals(12, resultado[2].size(), 'La lista de ordenador mensual debería tener 12 elementos.');
            System.assertEquals(12, resultado[3].size(), 'La lista de últimos 12 meses debería tener 12 elementos.');
            System.assertEquals(12, resultado[4].size(), 'La lista de iluminación mensual debería tener 12 elementos.');
            System.assertEquals(12, resultado[5].size(), 'La lista de monitores mensual debería tener 12 elementos.');
            System.assertEquals(12, resultado[6].size(), 'La lista de calefacción mensual debería tener 12 elementos.');

            // Verificar valores calculados 
            Double totalGasto = resultado[0][0];
            System.assert(totalGasto > 0, 'El gasto total debería ser mayor que 0.');
        }
    }
    
     @IsTest
    static void testContarDiasHabilesSinFinesDeSemana() {
        // Configurar fechas de prueba
        Date fechaInicio = Date.newInstance(2024, 9, 2);  // Lunes
        Date fechaFin = Date.newInstance(2024, 9, 6);     // Viernes
        
        // Llamar al método a probar
        Integer diasHabiles = CarbonFootprint.contarDiasHabiles(fechaInicio, fechaFin);
        
        // Assert para validar el resultado
        System.assertEquals(5, diasHabiles, 'Debe contar correctamente los días hábiles de lunes a viernes');
    }

    @IsTest
    static void testContarDiasHabilesConFinesDeSemana() {
        // Configurar fechas de prueba (incluye un fin de semana)
        Date fechaInicio = Date.newInstance(2024, 9, 1);  // Domingo
        Date fechaFin = Date.newInstance(2024, 9, 10);    // Martes

        // Llamar al método a probar
        Integer diasHabiles = CarbonFootprint.contarDiasHabiles(fechaInicio, fechaFin);
        
        // Assert para validar que excluye el fin de semana
        System.assertEquals(7, diasHabiles, 'Debe excluir los fines de semana y contar solo los días hábiles');
    }

    @IsTest
    static void testContarDiasHabilesConSoloFinDeSemana() {
        // Configurar fechas de prueba (solo un fin de semana)
        Date fechaInicio = Date.newInstance(2024, 9, 7);  // Sábado
        Date fechaFin = Date.newInstance(2024, 9, 8);     // Domingo

        // Llamar al método a probar
        Integer diasHabiles = CarbonFootprint.contarDiasHabiles(fechaInicio, fechaFin);
        
        // Assert para validar que no cuenta días hábiles si es solo fin de semana
        System.assertEquals(0, diasHabiles, 'No debe contar días hábiles si las fechas corresponden a un fin de semana');
    }

    @IsTest
    static void testContarDiasHabilesUnSoloDiaHabil() {
        // Configurar fechas de prueba (un solo día hábil)
        Date fechaInicio = Date.newInstance(2024, 9, 4);  // Miércoles
        Date fechaFin = Date.newInstance(2024, 9, 4);     // Miércoles (mismo día)

        // Llamar al método a probar
        Integer diasHabiles = CarbonFootprint.contarDiasHabiles(fechaInicio, fechaFin);
        
        // Assert para validar que cuenta solo un día hábil
        System.assertEquals(1, diasHabiles, 'Debe contar un solo día hábil si la fecha de inicio y fin son el mismo día laborable');
    }
    
    

    @IsTest
    static void testObtainLastDayDataIsRecordedWithoutData() {
        // Crear un usuario de prueba
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];
        
        // No se insertan registros en CarboonFootprint__c para este usuario
        
        // Ejecutar el método obtainLastDayDataIsRecorded
        Test.startTest();
        List<Integer> result = CarbonFootprint.obtainLastDayDataIsRecorded();
        Test.stopTest();
        
        // Comprobar que el resultado sea null cuando no hay registros
        System.assertEquals(null, result, 'Debe retornar null cuando no hay registros de CarboonFootprint');
    }
    
     // Test para verificar que los elementos se agregan correctamente a la lista
    @IsTest
    static void testAgregarElementosLista() {
        // Lista de prueba
        List<Double> lista = new List<Double>();
        
        // Llamada al método con un valor y una cantidad específica de veces
        CarbonFootprint.agregarElementosLista(lista, 5000, 3);
        
        // Verificar que la lista tiene el tamaño esperado
        System.assertEquals(3, lista.size(), 'La lista debe tener 3 elementos');

        // Verificar que los valores son los esperados (5000 / 1000 = 5.000)
        System.assertEquals(5.000, lista[0], 'El primer elemento debe ser 5.000');
        System.assertEquals(5.000, lista[1], 'El segundo elemento debe ser 5.000');
        System.assertEquals(5.000, lista[2], 'El tercer elemento debe ser 5.000');
    }
    
    // Test para verificar que no se agrega nada si 'veces' es 0
    @IsTest
    static void testAgregarElementosListaVecesCero() {
        // Lista de prueba
        List<Double> lista = new List<Double>();
        
        // Llamada al método con 'veces' igual a 0
        CarbonFootprint.agregarElementosLista(lista, 5000, 0);
        
        // Verificar que la lista está vacía
        System.assertEquals(0, lista.size(), 'La lista debe estar vacía si "veces" es 0');
    }

    // Test para verificar que no se agrega nada si 'veces' es negativo
    @IsTest
    static void testAgregarElementosListaVecesNegativo() {
        // Lista de prueba
        List<Double> lista = new List<Double>();
        
        // Llamada al método con 'veces' negativo
        CarbonFootprint.agregarElementosLista(lista, 5000, -5);
        
        // Verificar que la lista está vacía
        System.assertEquals(0, lista.size(), 'La lista debe estar vacía si "veces" es negativo');
    }

    // Test para verificar el comportamiento cuando la lista es nula
    @IsTest
    static void testAgregarElementosListaNula() {
        // Definir lista nula
        List<Double> lista = null;
        
        // Llamada al método con lista nula
        CarbonFootprint.agregarElementosLista(lista, 5000, 3);
        
        // No podemos verificar nada directamente porque la lista es nula,
        // pero aseguramos que no haya excepciones ni errores.
    }

    // Test para verificar el comportamiento cuando 'veces' es nulo
    @IsTest
    static void testAgregarElementosListaVecesNulo() {
        // Lista de prueba
        List<Double> lista = new List<Double>();
        
        // Llamada al método con 'veces' nulo
        Integer veces = null;
        CarbonFootprint.agregarElementosLista(lista, 5000, veces);
        
        // Verificar que la lista está vacía
        System.assertEquals(0, lista.size(), 'La lista debe estar vacía si "veces" es nulo');
    }

    @IsTest
    static void testObtenerDatosUltimoMesSinRegistros() {
        // Crear un usuario de prueba sin registros de huella de carbono
        User testUser = [SELECT Id FROM User WHERE IsActive = true LIMIT 1];

        // Ejecutar el método para obtener los datos del último mes
        Test.startTest();
        List<CarboonFootprint__c> result = CarbonFootprint.obtenerDatosUltimoMes();
        Test.stopTest();

        // Comprobar que la lista está vacía si no hay registros
        System.assertEquals(0, result.size(), 'Debe retornar una lista vacía si no hay registros para el último mes');
    }
}