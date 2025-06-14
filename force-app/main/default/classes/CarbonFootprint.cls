public with sharing class CarbonFootprint {
    
    @AuraEnabled
    public static integer comprobarUltimoGuardado() {
        Date diaActual = Date.today();
        Id userId = UserInfo.getUserId();
        List<CarboonFootprint__c> diasCreados = [SELECT DiaCreacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId];
        for(integer i = 0; i < diasCreados.size(); i++) {
            sObject event = diasCreados[i];
            Date mesSiguiente = (Date) event.get('DiaCreacion__c');
            mesSiguiente = mesSiguiente.addMonths(2);
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
        Date diaGuardar = null;
        if (diaActual.month() == 1) {
            diaGuardar = Date.newInstance(diaActual.year()-1, 12, 1);
        } else {
            diaGuardar = Date.newInstance(diaActual.year(), diaActual.month()-1, 1);
        }
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
            DiaCreacion__c=diaGuardar,
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
        Integer control = 0;
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
        //Hay que modificar la consulta para añadir
        //ConsumoCalefaccion__c	
        List<CarboonFootprint__c> resultados = [SELECT DiaCreacion__c, ConsumoElectrico__c, ConsumoMotor__c, DiasOficina__c, IntegrantesCoche__c, MetodoTransporte__c, Monitores__c, TipoCalefaccion__c, TipoMotor__c, UsoCalefaccion__c, Distancia__c, Metros__c, NumeroBombillas__c, TipoIluminacion__c FROM CarboonFootprint__c WHERE UserId__c = :userId ORDER BY DiaCreacion__c];
        //259 gCO2eq
        // double gastoElectrico = 0;

        integer contadorMeses = 0;
        integer controlRepeticion = 0;
        if (!diasCreados.isEmpty()) {
            System.debug('DIAS ' + diasCreados.size());
            for(integer i = diasCreados.size()-1; i > 0 || (diasCreados.size() == 1 && i==0); i--) {
                double gastoTransporte = 0;
                double gastoOrdenador = 0;
                double gastoCalefaccion = 0;
                double gastoIluminacion = 0;
                double gastoMonitores = 0;
                sObject objetoMes = null;
                Date diaConvertido2 = null;
                Date diaConvertido = null;
                sObject dia2 = null;
                sObject dia = null;
                if (contadorMeses >= 12) {
                    contadorMeses = 12;
                    break;
                }
                if (diasCreados.size() != 1) {
                    if (controlRepeticion == 1) {
                        controlRepeticion = 2;
                    }

                    dia2 = diasCreados[i];
                    dia = diasCreados[i-1];
                
                    

                    objetoMes = resultados[i-1];
                    //habria que tener en cuenta la ultima fecha para que la coja cuando hace la diferencia con la actual
                    

                    diaConvertido2 = (Date) dia2.get('DiaCreacion__c');
                    
                    diaConvertido = (Date) dia.get('DiaCreacion__c');
                // if (i != diasCreados.size()-1) {
                //     diaConvertido2 = (Date) dia2.get('DiaCreacion__c');
                // } else {
                //     diaConvertido2 = diaActual;
                // }
                }
                if (i == diasCreados.size()-1 && controlRepeticion == 0) {
                    dia2 = diasCreados[i];
                    diaConvertido =  (Date) dia2.get('DiaCreacion__c');
                    
                    diaConvertido2 = diaActual;
                    controlRepeticion = 1;
                    objetoMes = resultados[i];
                    i = diasCreados.size();
                }
                Integer mesesEntre = diaConvertido.monthsBetween(diaConvertido2);
                contadorMeses = contadorMeses + mesesEntre;
                integer diasHabiles = contarDiasHabiles(diaConvertido, diaConvertido2);
                gastoOrdenador = gastoOrdenador + diasHabiles  * 0.14 + (double) objetoMes.get('Monitores__c') * 30 * Math.abs(diasHabiles- ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                gastoMonitores = gastoOrdenador;
                if (objetoMes.get('TipoCalefaccion__c') == 'tipoElectrica') {
                    gastoOrdenador = gastoOrdenador + ( (double) objetoMes.get('Metros__c') * (double) objetoMes.get('UsoCalefaccion__c') * 200) * Math.abs(diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoCalefaccion = gastoOrdenador - gastoMonitores;
                } 
                if (objetoMes.get('TipoCalefaccion__c') == 'tipoGas') {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('Metros__c') * (double) objetoMes.get('UsoCalefaccion__c') * 200) * Math.abs(diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoCalefaccion = gastoOrdenador - gastoMonitores;
                }
                if (objetoMes.get('TipoIluminacion__c') == 'tipoLED')  {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('NumeroBombillas__c') * 15 * 200) * Math.abs(diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
                    gastoIluminacion = gastoOrdenador - gastoCalefaccion - gastoMonitores;
                } 
                if (objetoMes.get('TipoIluminacion__c') == 'tipoIncandescente')  {
                    gastoOrdenador = gastoOrdenador + ((double) objetoMes.get('NumeroBombillas__c') * 6 * 200) * Math.abs(diasHabiles - ((double) objetoMes.get('DiasOficina__c'))) / mesesEntre;
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
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 23);
                }
                if (objetoMes.get('MetodoTransporte__c') == 'metodoAutobus') {
                    gastoTransporte = gastoTransporte + ((double) objetoMes.get('DiasOficina__c') * (double) objetoMes.get('Distancia__c') * 96.6);
                } 

                System.debug('Gasto ordenador: ' + gastoOrdenador);
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
        }
        if (contadorMeses > 12) {
            contadorMeses = 12;
        }

        
        System.debug(contadorMeses);
        Integer mesActual = diaActual.month();
        for (Integer i = contadorMeses; i > 0; i--) {
            Integer mes = mesActual - i;
            if (mes <= 0) {
                mes += 12;
            }
            ultimos12Meses.add(mes);
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
        listaADevolver.add(recortarEInvertir(listaValoresDesplazamientoAlMes, contadorMeses));
        listaADevolver.add(recortarEInvertir(listaValoresOrdenadorAlMes, contadorMeses));
        listaADevolver.add(ultimos12Meses);
        listaADevolver.add(recortarEInvertir(listaValoresIluminacionAlMes, contadorMeses));
        listaADevolver.add(recortarEInvertir(listaValoresMonitoresAlMes, contadorMeses));
        listaADevolver.add(recortarEInvertir(listaValoresCalefaccionAlMes, contadorMeses));

        return listaADevolver;
    }


    public static List<Double> recortarEInvertir(List<Double> lista, Integer maxElements) {
        Integer count = Math.min(maxElements, lista.size());
        List<Double> resultado = new List<Double>();
        for (Integer i = count - 1; i >= 0; i--) {
            resultado.add(lista[i]);
        }
        return resultado;
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