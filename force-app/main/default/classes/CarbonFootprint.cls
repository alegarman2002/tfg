public with sharing class CarbonFootprint {
    
    @AuraEnabled
    public static integer guardarDatos(List<string> parametros) {
        System.debug('Hola');
        Date diaActual = Date.today();
        diaActual = diaActual.addMonths(3);
        Date diaEn6Meses = diaActual.addMonths(6);
        Id userId = UserInfo.getUserId();
        System.debug(parametros);
        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        for(integer i = 0; i < diasCreados.size(); i++) {
            sObject event = diasCreados[i];
            Date mesSiguiente = (Date) event.get('DiaCreacion__c');
            mesSiguiente = mesSiguiente.addMonths(1);
            if (diaActual <= mesSiguiente) {
                return 0;
            }
        }
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
            DiaFin__c=diaEn6Meses,
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
    public static double calcularHuellaUsuario(Integer valorControl) {
        //Consideramos 0 para el propio usuario y 1 para todos los usuarios
        // System.debug('Empezamos el metodo');
        Id userID = null
        
        if (valorControl == 0) {
            userId = UserInfo.getUserId();
        } else {

        }
        
        // System.debug('Id de usuario: ' + userId);
        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        // System.debug(diasCreados);
        List<CarboonFootprint__c> resultados = [SELECT ConsumoElectrico__c, ConsumoMotor__c, DiaFin__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, TipoCalefaccion__c, TipoMotor__c, UsoCalefaccion__c, Distancia__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        // System.debug(resultados);
        List<Date> diasCreadosDate = new List<Date>();
        //259 gCO2eq
        double gastoTotal = 0;
        double gastoElectrico = 0;
        double gastoTransporte = 0;
        double gastoOrdenador = 0;
        for(integer i = 0; i < diasCreados.size()-1; i++) {
            sObject dia = diasCreados[i];
            sObject dia2 = diasCreados[i+1];
            sObject objetoMes = resultados[i];
            sObject objetoMes2 = resultados[i+1];
            Date diaConvertido = (Date) dia.get('DiaCreacion__c');
            Date diaConvertido2 = (Date) dia2.get('DiaCreacion__c');
            integer mesesDeDiferencia = diaConvertido.monthsBetween(diaConvertido2);
            Integer mesesEntre = diaConvertido.monthsBetween(diaConvertido2);
            if (mesesDeDiferencia > 6) {
                mesesEntre = 6;
            } 
            integer diasHabiles = contarDiasHabiles(diaConvertido, diaConvertido2);
            
            gastoOrdenador = gastoOrdenador + diasHabiles  * 0.14 + (integer) objetoMes.get('Monitores__c') * 0.030 * (diasHabiles- ((integer) objetoMes.get('DiasOficina__c')*mesesEntre));
            if (objetoMes.get('MetodoTransporte__c') == 'metodoCoche') {
                if (objetoMes.get('TipoMotor__c') == 'motorGasolina') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (integer) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2370 * mesesEntre) /(100 * (integer) objetoMes.get('IntegrantesCoche__c'));
                }
                if (objetoMes.get('TipoMotor__c') == 'motorDiesel') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (integer) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2650 * mesesEntre) /(100 * (integer) objetoMes.get('IntegrantesCoche__c'));
                }
                if (objetoMes.get('TipoMotor__c') == 'motorElectrico') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (integer) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2490 * mesesEntre) /(100 * (integer) objetoMes.get('IntegrantesCoche__c'));
                }
            }

            if (objetoMes.get('MetodoTransporte__c') == 'metodoTren') {
                gastoTransporte = gastoTransporte + ((integer) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 23 * mesesEntre);
            }
            if (objetoMes.get('MetodoTransporte__c') == 'metodoAutobus') {
                gastoTransporte = gastoTransporte + ((integer) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 96.6 * mesesEntre);
            } 
        }
        gastoTotal = gastoTotal + gastoOrdenador + gastoTransporte;


        System.debug();
        // for(integer i = 0; i < diasCreadosDate.size()-1; i++) {
        //     Date dia1 = diasCreados[i];
        //     Date dia2 = diasCreados[i+1];
        //     integer monthsDifference = dia1.monthsBetween(dia2);
        //     // if (monthsDifference > 6) {
                
        //     // }
        // }


        return 0;
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
}