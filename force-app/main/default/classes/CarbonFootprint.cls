public with sharing class CarbonFootprint {
    
    @AuraEnabled
    public static integer comprobarUltimoGuardado() {
        Date diaActual = Date.today();
        Id userId = UserInfo.getUserId();
        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        for(integer i = 0; i < diasCreados.size(); i++) {
            sObject event = diasCreados[i];
            Date mesSiguiente = (Date) event.get('DiaCreacion__c');
            mesSiguiente = mesSiguiente.addMonths(1);
            if (diaActual <= mesSiguiente) {
                return 0;
            }
        }
        return 1;
    }


    @AuraEnabled
    public static integer guardarDatos(List<string> parametros) {
        System.debug('Hola');
        Date diaActual = Date.today();
        Date diaHaceUnAnio = diaActual;
        Id userId = UserInfo.getUserId();
        System.debug(parametros);
        // List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        // for(integer i = 0; i < diasCreados.size(); i++) {
        //     sObject event = diasCreados[i];
        //     Date mesSiguiente = (Date) event.get('DiaCreacion__c');
        //     mesSiguiente = mesSiguiente.addMonths(1);
        //     if (diaActual <= mesSiguiente) {
        //         return 0;
        //     }
        // }
        integer consumoElectrico = Integer.valueOf(parametros[0]);
        integer dias = Integer.valueOf(parametros[1]);
        string metodoElegido = (string) (parametros[2]);
        string valorMotor = (string) (parametros[3]);
        double consumo = 0;
        if (parametros[4] != null) {
            consumo = double.valueOf(parametros[4]);
        }
        integer integrantesCoche = Integer.valueOf(parametros[5]);
        integer monitores = Integer.valueOf(parametros[6]);
        System.debug(monitores);
        string tipoCalefaccion = (string) (parametros[7]);
        integer usoCalefaccion = Integer.valueOf(parametros[8]);
        integer distancia = Integer.valueOf(parametros[9]);
        CarboonFootprint__c cf = new CarboonFootprint__c(
            ConsumoElectrico__c=consumoElectrico,
            ConsumoMotor__c=consumo,
            DiaCreacion__c=diaActual,
            DiasOficina__c=dias,
            IntegrantesCoche__c=integrantesCoche,
            MetodoTransporte__c=metodoElegido,
            Monitores__c=monitores,
            TipoCalefaccion__c=tipoCalefaccion,
            TipoMotor__c=valorMotor,
            UserId__c=userId,
            UsoCalefaccion__c=usoCalefaccion,
            Distancia__c=distancia
            );
        insert cf;
        System.debug(cf);

        return 1;
    }


    @AuraEnabled
    public static List<List<double>> calcularHuellaUsuario() {
        //Consideramos 0 para el propio usuario y 1 para todos los usuarios
        // System.debug('Empezamos el metodo');
        // Valorar que tenemos que hacerlo desde los primeros datos introducidos hasta a ver cuando o el dia actual o el dia 
        // Date diaActual = Date.today();
        Id userID = UserInfo.getUserId();
        
        List<List<double>> listaADevolver = new List<List<double>>();
        List<double> listaValoresTotales = new List<double>();
        List<double> listaValoresDesplazamientoAlMes = new List<double>();
        List<double> listaValoresOrdenadorAlMes = new List<double>();
        double gastoTotal = 0;
        
        double gastoTransporteTotal = 0;
        double gastoOrdenadorTotal = 0;


        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        System.debug(diasCreados);
        List<CarboonFootprint__c> resultados = [SELECT ConsumoElectrico__c, ConsumoMotor__c, DiaFin__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, TipoCalefaccion__c, TipoMotor__c, UsoCalefaccion__c, Distancia__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        System.debug(resultados);
        
        //259 gCO2eq
        // double gastoElectrico = 0;
        double gastoTransporte = 0;
        double gastoOrdenador = 0;
        
        if (!diasCreados.isEmpty()) {
            //Replantear lo siguiente 
            //No poner caducidad a los datos, que se usen desde el primer dato introducido hasta la fecha actual
            //De esta manera añado tambien la lista con los meses y asi se actualiza dinamicamente
            //Quiero mantener que solo se puedan actualizar los datos una vez por mes
            //Indiferentemente
            //Falta por contemplar el uso de la calefaccion/aire acondicionado
            for(integer i = 0; i < diasCreados.size()-1; i++) {
                sObject dia = diasCreados[i];
                sObject dia2 = diasCreados[i+1];
                sObject objetoMes = resultados[i];
                sObject objetoMes2 = resultados[i+1];
                Date diaConvertido = (Date) dia.get('DiaCreacion__c');
                Date diaConvertido2 = (Date) dia2.get('DiaCreacion__c');
                integer mesesDeDiferencia = diaConvertido.monthsBetween(diaConvertido2);

                integer diasHabiles = contarDiasHabiles(diaConvertido, diaConvertido2);
                
                gastoOrdenador = gastoOrdenador + diasHabiles  * 0.14 + (double) objetoMes.get('Monitores__c') * 0.030 * (diasHabiles- ((double) objetoMes.get('DiasOficina__c')*mesesDeDiferencia));
                if (objetoMes.get('MetodoTransporte__c') == 'metodoCoche') {
                    if (objetoMes.get('TipoMotor__c') == 'motorGasolina') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2370 * mesesDeDiferencia) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorDiesel') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2650 * mesesDeDiferencia) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorElectrico') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2490 * mesesDeDiferencia) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                }

                if (objetoMes.get('MetodoTransporte__c') == 'metodoTren') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 23 * mesesDeDiferencia);
                }
                if (objetoMes.get('MetodoTransporte__c') == 'metodoAutobus') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 96.6 * mesesDeDiferencia);
                } 


                agregarElementosLista(listaValoresDesplazamientoAlMes, gastoTransporte/mesesDeDiferencia, mesesDeDiferencia);
                agregarElementosLista(listaValoresOrdenadorAlMes, gastoOrdenador/mesesDeDiferencia, mesesDeDiferencia);
                System.debug(listaValoresOrdenadorAlMes.size());

                gastoTotal = gastoTotal + gastoOrdenador + gastoTransporte;
                gastoTransporteTotal = gastoTransporteTotal + gastoTransporte;
                gastoOrdenadorTotal = gastoOrdenadorTotal + gastoOrdenador;
            }
            
            

            
        }
        // for(integer i = 0; i < diasCreadosDate.size()-1; i++) {
        //     Date dia1 = diasCreados[i];
        //     Date dia2 = diasCreados[i+1];
        //     integer monthsDifference = dia1.monthsBetween(dia2);
        //     // if (monthsDifference > 6) {
                
        //     // }
        // }
        //Tengo la primera lista con los datos, ahora necesito generar otra lista con el gaasto total para cada mes
        listaValoresTotales.add(gastoTotal);
        listaValoresTotales.add(gastoTransporteTotal);
        listaValoresTotales.add(gastoOrdenadorTotal);

        listaADevolver.add(listaValoresTotales);
        listaADevolver.add(listaValoresDesplazamientoAlMes);
        listaADevolver.add(listaValoresOrdenadorAlMes);

        return listaADevolver;
    }

    public static Integer contarDiasHabiles(Date startDate, Date endDate) {
        Integer diasHabiles = 0;

        // Iterar a través de cada día en el rango de fechas
        while (startDate <= endDate) {
            // Verificar si el día actual es un día laborable (lunes a viernes)
            DateTime dt = (DateTime) startDate;
            string diaSemana = dt.format('EEEE');
            if (diaSemana != 'Saturday' && diaSemana !=  'Sunday') {
                diasHabiles++;
            }

            // Moverse al siguiente día
            startDate = startDate.addDays(1);
        }

        return diasHabiles;
    }

    @AuraEnabled
    public static List<integer> obtainLastDayDataIsRecorded(){
        Id userId = UserInfo.getUserId();
        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        List<integer> fecha = new List<integer>();
        if (!diasCreados.isEmpty()) {
            
            sObject dia = diasCreados[diasCreados.size()-1];
            Date diaConvertido = (Date) dia.get('DiaCreacion__c');
            
            fecha.add(diaConvertido.day());
            fecha.add(diaConvertido.month()-1);
            fecha.add(diaConvertido.year());
            return fecha;
        } else {
            return null;
        }

    }

    public static void agregarElementosLista(List<double> lista, double elemento, Integer veces) {
        for (Integer i = 0; i < veces; i++) {
            lista.add(elemento);
        }
    }

}