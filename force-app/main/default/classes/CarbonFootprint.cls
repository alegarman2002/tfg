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
        Id userId = UserInfo.getUserId();
        string fullName = UserInfo.getFirstName() + ' ' + UserInfo.getLastName();
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
        double metros = 0;
        if (parametros[10] != null) {
            metros = Integer.valueOf(parametros[10]);
        }
        integer numBombillas = Integer.valueOf(parametros[11]);
        string tipoIluminacion = (string) (parametros[12]);

        CarboonFootprint__c cf = new CarboonFootprint__c(
            ConsumoElectrico__c=consumoElectrico,
            NombreCompleto__c=fullName,
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
            Distancia__c=distancia,
            Metros__c=metros,
            NumeroBombillas__c=numBombillas,
            TipoIluminacion__c=tipoIluminacion
            );
        insert cf;
        System.debug(cf);

        return 1;
    }


    @AuraEnabled
    public static List<List<double>> calcularHuellaUsuario() {
        Date diaActual = Date.today();
        Id userID = UserInfo.getUserId();
        System.debug(userId);
        List<List<double>> listaADevolver = new List<List<double>>();
        List<double> listaValoresTotales = new List<double>();
        List<double> listaValoresDesplazamientoAlMes = new List<double>();
        List<double> listaValoresOrdenadorAlMes = new List<double>();
        List<double> listaValoresCalefaccionAlMes = new List<double>();
        List<double> listaValoresIluminacionAlMes = new List<double>();
        List<double> listaValoresMonitoresAlMes = new List<double>();
        List<double> ultimos12Meses = new List<double>();
        double gastoTotal = 0;
        
        double gastoTransporteTotal = 0;
        double gastoOrdenadorTotal = 0;
        double gastoCalefaccionTotal = 0;
        double gastoIluminacionTotal = 0;
        double gastoMonitoresTotal = 0;

        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c];
        System.debug(diasCreados);
        //Hay que modificar la consulta para añadir
        //ConsumoCalefaccion__c	
        List<CarboonFootprint__c> resultados = [SELECT DiaCreacion__c, ConsumoElectrico__c, ConsumoMotor__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, TipoCalefaccion__c, TipoMotor__c, UsoCalefaccion__c, Distancia__c, Metros__c, NumeroBombillas__c, TipoIluminacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c];
        System.debug(resultados);
        
        //259 gCO2eq
        // double gastoElectrico = 0;
        
        
        if (!diasCreados.isEmpty()) {
            for(integer i = 0; i < diasCreados.size()-1; i++) {
                double gastoTransporte = 0;
                double gastoOrdenador = 0;
                double gastoCalefaccion = 0;
                double gastoIluminacion = 0;
                double gastoMonitores = 0;

                sObject dia = diasCreados[i];
                sObject dia2 = null;
                if (i != diasCreados.size()-1) {
                    dia2 = diasCreados[i+1];
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
                System.debug(diaConvertido);
                System.debug(mesesEntre);

                integer diasHabiles = contarDiasHabiles(diaConvertido, diaConvertido2);

                gastoOrdenador = gastoOrdenador + diasHabiles  * 0.14 + (double) objetoMes.get('Monitores__c') * 30 * (diasHabiles- ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                gastoMonitores = gastoOrdenador;
                if (objetoMes.get('TipoCalefaccion__c') == 'tipoElectrica') {
                    gastoOrdenador = gastoOrdenador + ( (double) objetoMes.get('Metros__c') * (double) objetoMes.get('UsoCalefaccion__c') * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoCalefaccion = gastoOrdenador - gastoMonitores;
                } 
                if (objetoMes.get('TipoCalefaccion__c') == 'tipoGas') {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('Metros__c') * (double) objetoMes.get('UsoCalefaccion__c') * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoCalefaccion = gastoOrdenador - gastoMonitores;
                }
                if (objetoMes.get('TipoIluminacion__c') == 'tipoLED')  {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('NumeroBombillas__c') * 15 * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoIluminacion = gastoOrdenador - gastoCalefaccion - gastoMonitores;
                } 
                if (objetoMes.get('TipoIluminacion__c') == 'tipoIncandescente')  {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('NumeroBombillas__c') * 6 * 200) * (diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoIluminacion = gastoOrdenador - gastoCalefaccion - gastoMonitores;
                } 
                if (objetoMes.get('MetodoTransporte__c') == 'metodoCoche') {
                    
                    if (objetoMes.get('TipoMotor__c') == 'motorGasolina') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2370) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorDiesel') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2650) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                    if (objetoMes.get('TipoMotor__c') == 'motorElectrico') {
                        gastoTransporte = gastoTransporte + ((double) objetoMes.get('ConsumoMotor__c') * (double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 2490) /(100 * (double) objetoMes.get('IntegrantesCoche__c'));
                    }
                }

                if (objetoMes.get('MetodoTransporte__c') == 'metodoTren') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 23)  / mesesEntre;
                }
                if (objetoMes.get('MetodoTransporte__c') == 'metodoAutobus') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 96.6) / mesesEntre;
                } 
                System.debug('Gasto calefaccion ');
                System.debug(gastoCalefaccion);
                System.debug('Gasto iluminacion ');
                System.debug(gastoIluminacion);
                System.debug('Gasto monitor ');
                System.debug(gastoMonitores);
                gastoOrdenadorTotal = gastoOrdenadorTotal + gastoOrdenador;
                gastoTransporteTotal = gastoTransporteTotal + gastoTransporte;
                // gastoCalefaccionTotal = gastoCalefaccionTotal + gastoCalefaccion;
                // gastoIluminacionTotal = gastoIluminacionTotal + gastoIluminacion;
                // gastoMonitoresTotal = gastoMonitoresTotal + gastoMonitores;

                agregarElementosLista(listaValoresDesplazamientoAlMes, gastoTransporte, mesesEntre);
                agregarElementosLista(listaValoresOrdenadorAlMes, gastoOrdenador, mesesEntre);
                agregarElementosLista(listaValoresCalefaccionAlMes, gastoCalefaccion, mesesEntre);
                agregarElementosLista(listaValoresIluminacionAlMes, gastoIluminacion, mesesEntre);
                agregarElementosLista(listaValoresMonitoresAlMes, gastoMonitores, mesesEntre);
            }     
            System.debug(listaValoresCalefaccionAlMes);      
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
        Decimal myDecimal = gastoTotal;
        Decimal divDec = myDecimal.divide(1000, 3);
        listaValoresTotales.add(divDec);
        myDecimal = gastoTransporteTotal;
        divDec = myDecimal.divide(1000, 3);
        listaValoresTotales.add(divDec);
        myDecimal = gastoOrdenadorTotal;
        divDec = myDecimal.divide(1000, 3);
        listaValoresTotales.add(divDec);

        listaADevolver.add(listaValoresTotales);
        listaADevolver.add(listaValoresDesplazamientoAlMes);
        listaADevolver.add(listaValoresOrdenadorAlMes);
        listaADevolver.add(ultimos12Meses);
        listaADevolver.add(listaValoresIluminacionAlMes);
        listaADevolver.add(listaValoresMonitoresAlMes);
        listaADevolver.add(listaValoresCalefaccionAlMes);


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
        if (lista == null || veces == null || veces <= 0) {
            return;  // No se hace nada si la lista es nula o 'veces' es nulo o no positivo
        }
    
        // Realizar la conversión de 'elemento' solo una vez antes del ciclo
        Decimal myDecimal = elemento;
        Decimal divDec = myDecimal.divide(1000, 3);  // Dividir en mil y redondear a 3 decimales
        
        // Agregar el elemento dividido 'veces' veces a la lista
        for (Integer i = 0; i < veces; i++) {
            lista.add(divDec);
        }
    }


    @AuraEnabled
    public static List<CarboonFootprint__c> obtenerDatosUltimoMes(){
        Id userId = UserInfo.getUserId();
        List<CarboonFootprint__c> dias = [SELECT ConsumoElectrico__c, ConsumoMotor__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, UsoCalefaccion__c, Distancia__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c DESC LIMIT 1];
        return dias;
        //Revisar metodo pues igual podemos simplificar la consulta cosa que puede venirnos muy bien
    }
}