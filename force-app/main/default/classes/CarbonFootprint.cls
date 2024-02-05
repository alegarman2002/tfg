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

        //Falta por añadir lo siguiente
        //ConsumoCalefaccion__c	
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
        Date diaActual = Date.today();
        Id userID = UserInfo.getUserId();
        
        List<List<double>> listaADevolver = new List<List<double>>();
        List<double> listaValoresTotales = new List<double>();
        List<double> listaValoresDesplazamientoAlMes = new List<double>();
        List<double> listaValoresOrdenadorAlMes = new List<double>();
        List<double> ultimos12Meses = new List<double>();
        double gastoTotal = 0;
        
        double gastoTransporteTotal = 0;
        double gastoOrdenadorTotal = 0;


        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c];
        System.debug(diasCreados);
        //Hay que modificar la consulta para añadir
        //ConsumoCalefaccion__c	
        List<CarboonFootprint__c> resultados = [SELECT DiaCreacion__c, ConsumoElectrico__c, ConsumoMotor__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, TipoCalefaccion__c, TipoMotor__c, UsoCalefaccion__c, Distancia__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c];
        System.debug(resultados);
        
        //259 gCO2eq
        // double gastoElectrico = 0;
        
        
        if (!diasCreados.isEmpty()) {
            for(integer i = 0; i < diasCreados.size(); i++) {
                double gastoTransporte = 0;
                double gastoOrdenador = 0;
                sObject dia = diasCreados[i];
                sObject dia2 = null;
                if (i != diasCreados.size()-1) {
                    dia2 = diasCreados[i+1];
                } else {

                }
                
                sObject objetoMes = resultados[i];
                //habria que tener en cuenta la ultima fecha para que la coja cuando hace la diferencia con la actual
                sObject objetoMes2 = null;
                if (i != diasCreados.size()-1) {
                    objetoMes2 = resultados[i+1];
                } else {
                    objetoMes2 = resultados[i];
                }

                Date diaConvertido = (Date) dia.get('DiaCreacion__c');
                Date diaConvertido2 = null;
                if (i != diasCreados.size()-1) {
                    diaConvertido2 = (Date) dia2.get('DiaCreacion__c');
                } else {
                    diaConvertido2 = diaActual;
                }

                Integer mesesEntre = diaConvertido.monthsBetween(diaConvertido2);
                System.debug(mesesEntre);
                integer diasHabiles = contarDiasHabiles(diaConvertido, diaConvertido2);
                
                gastoOrdenador = gastoOrdenador + diasHabiles  * 0.14 + (double) objetoMes.get('Monitores__c') * 0.030 * (diasHabiles- ((double) objetoMes.get('DiasOficina__c') * mesesEntre));
                
                if (objetoMes.get('TipoCalefaccion__c') == 'aaaaaa') {
                    gastoOrdenador = gastoOrdenador + (1.5 * (double) objetoMes.get('UsoCalefaccion__c') * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c') * mesesEntre));
                } 
                if (objetoMes.get('TipoCalefaccion__c') == 'tipoGas') {
                    gastoOrdenador = gastoOrdenador + (1.5 * (double) objetoMes.get('UsoCalefaccion__c') * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c') * mesesEntre));
                }
                                
                if (objetoMes.get('MetodoTransporte__c') == 'metodoCoche') {
                    
                    if (objetoMes.get('TipoMotor__c') == 'motorGasolina') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2370 * mesesEntre) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorDiesel') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2650 * mesesEntre) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorElectrico') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2490 * mesesEntre) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                }

                if (objetoMes.get('MetodoTransporte__c') == 'metodoTren') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 23 * mesesEntre);
                }
                if (objetoMes.get('MetodoTransporte__c') == 'metodoAutobus') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 96.6 * mesesEntre);
                } 

                gastoOrdenadorTotal = gastoOrdenadorTotal + gastoOrdenador;
                gastoTransporteTotal = gastoTransporteTotal + gastoTransporte;

                agregarElementosLista(listaValoresDesplazamientoAlMes, gastoTransporte, mesesEntre);
                agregarElementosLista(listaValoresOrdenadorAlMes, gastoOrdenador, mesesEntre);
            }           
        }


        

        for (Integer i = 0; i < 12; i++) {
            ultimos12Meses.add(Math.mod((diaActual.month() + i), 12) + 1);
        }
        // for(integer i = 0; i < diasCreadosDate.size()-1; i++) {
        //     Date dia1 = diasCreados[i];
        //     Date dia2 = diasCreados[i+1];
        //     integer monthsDifference = dia1.monthsBetween(dia2);
        //     // if (monthsDifference > 6) {
                
        //     // }
        // }
        //Tengo la primera lista con los datos, ahora necesito generar otra lista con el gaasto total para cada mes
        gastoTotal = gastoOrdenadorTotal + gastoTransporteTotal;
        listaValoresTotales.add(gastoTotal);
        listaValoresTotales.add(gastoTransporteTotal);
        listaValoresTotales.add(gastoOrdenadorTotal);

        listaADevolver.add(listaValoresTotales);
        listaADevolver.add(listaValoresDesplazamientoAlMes);
        listaADevolver.add(listaValoresOrdenadorAlMes);
        listaADevolver.add(ultimos12Meses);


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