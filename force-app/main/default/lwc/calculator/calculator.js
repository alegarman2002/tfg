import { LightningElement } from 'lwc';
import guardarDatos from '@salesforce/apex/CarbonFootprint.guardarDatos'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import iMonitor from '@salesforce/resourceUrl/iconoMonitor'
import comprobarUltimoGuardado from '@salesforce/apex/CarbonFootprint.comprobarUltimoGuardado'
import obtenerDatosUltimoMes from '@salesforce/apex/CarbonFootprint.obtenerDatosUltimoMes'
export default class Calculator extends LightningElement {



    //Obtenemos los valores de la ultima insercion que tenemos de datos para compararlos con los introducidos actualmente
    //De esta manera con el onchange le podemos enseñar al usuario como evolucionan los datos conforme los introduce
    //A su vez tenemos que tener en cuenta que cuando lo inyectemos en el proyecto no tenemos que crearlo
    consumoElectrico = null
    dias = 5
    metodoElegido
    valorMotor
    consumo = null
    integrantesCoche = 1
    monitores = 1
    tipoCalefaccion
    calefaccion = -4
    distancia = null
    iconoMonitor = iMonitor
    controlVecesQueAparece = 0
    listaValoresAnteriores

    async renderedCallback() {
        if (this.controlVecesQueAparece == 0) {
            
            var guardado = await comprobarUltimoGuardado()
            if (guardado == 0) {
                this.controlVecesQueAparece = 1
                const event = new ShowToastEvent({
                    title: 'Aviso',
                    message: 'Tenga en cuenta que actualmente no puede actualizar sus datos pues este mes ya los ha actualizado',
                    variant: 'error',
                });
                this.dispatchEvent(event)
                var botonSiguiente = this.template.querySelector('button')
                botonSiguiente.style.disabled = true
            } 
            this.listaValoresAnteriores = await obtenerDatosUltimoMes()
        }
    }

    get tiposDeCalefaccion() {
        return [
            {label: 'No utilizo calefacción', value: 'sinCalefaccion'},
            {label: 'Electrica', value: 'tipoElectrica'},
            {label: 'Gas', value: 'tipoGas'}
        ]
    }

    saveMonitor() {
        this.monitores = this.template.querySelector("[data-id='input-17']").value
        // console.log(this.monitores)
    }

    get metodosDeTransporte() {
        return    [
            {label: 'Andando', value: 'metodoAndando'},
            {label: 'Bicicleta', value: 'metodoBicicleta'},
            {label: 'Coche', value: 'metodoCoche'},
            {label: 'Autobus', value: 'metodoAutobus'},
            {label: 'Tren', value: 'metodoTren'}
        ]
    }

    get tiposDeMotor() {
        return [
            {label: 'Gasolina', value: 'motorGasolina'},
            {label: 'Diesel', value: 'motorDiesel'},
            {label: 'Eléctrico', value: 'motorElectrico'}
        ]
    } 

    diasMes(event) {
        this.dias = event.detail.value
    }

    moni(event) {
        this.monitores = event.detail.value
    }

    cale(event) {
        this.calefaccion = event.detail.value
    }

    handleHeatingOptionChange(event) {
        this.tipoCalefaccion = event.detail.value
        if (this.tipoCalefaccion != 'sinCalefaccion') {
            var input = this.template.querySelector('[data-id="horasDeUso"]');
            input.style.display = 'block'
        } else {
            var input = this.template.querySelector('[data-id="horasDeUso"]');
            input.style.display = 'none'
        }
    }

    handleMotorChange(event) {
        this.valorMotor = event.detail.value
    }

    integCoche(event) {
        this.integrantesCoche = event.detail.value
    }

    consElectrico(event) {
        this.consumoElectrico = event.detail.value
    }

    dist(event) {
        this.distancia = event.detail.value
    }

    cons(event) {
        this.consumo = event.detail.value
    }

    async registrateData() {

        // await guardarDatos()
        //Consumo electrico total
        // console.log("Consumo electrico ", this.consumoElectrico)
        //Dias que se van a la oficina por mes
        // console.log("Dias a la oficina ", this.dias)
        //Metodo de transporte elegido
        // console.log("Metodo de transporte ", this.metodoElegido)
        //Tipo de motor elegido
        // console.log("Tipo de motor ", this.valorMotor)
        //Consumo del motor
        // console.log("Consumo del motor ", this.consumo)
        //Numero de integrantes del coche
        // console.log("Numero de integrantes del coche ", this.integrantesCoche)
        //Numero de monitores auxiliares
        // console.log("Monitores para trabajar ", this.monitores)
        //Tipo de calefaccion
        // console.log("Tipo de calefaccion ", this.tipoCalefaccion)
        //Horas de uso de la calefaccion
        // console.log("Horas de uso de la calefaccion ", this.calefaccion)

        localStorage.setItem('consumoElectrico', this.consumoElectrico)
        localStorage.setItem('monitores', this.monitores)
        localStorage.setItem('tipoCalefaccion', this.tipoCalefaccion)
        localStorage.setItem('calefaccion', this.calefaccion)
        localStorage.setItem('valoresAnteriores', this.listaValoresAnteriores)
        
        if(this.consumoElectrico == null) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Por favor completa todos los campos requeridos',
                variant: 'error',
            });
            this.dispatchEvent(event)
            return
        }
        
        window.open("/s/footprintcalculatorpart2", "_self")
        // var list = [this.consumoElectrico, this.dias, this.metodoElegido, this.valorMotor, this.consumo, this.integrantesCoche, this.monitores, this.tipoCalefaccion, this.calefaccion, this.distancia]
        // var guardado = 0
        // await guardarDatos({parametros: list}).then((atribute => {guardado = atribute}))
        // if (guardado == 1) {
        //     const event = new ShowToastEvent({
        //         title: 'Alerta',
        //         message: 'Sus datos se han guardado correctamente',
        //         variant: 'success',
        //     });
        //     this.dispatchEvent(event);
        // } else {
        //     const event = new ShowToastEvent({
        //         title: 'Alerta',
        //         message: 'Ha habido un problema guardando sus datos por favor reviselos y vuelva a enviarlos',
        //         variant: 'error',
        //     });
        //     this.dispatchEvent(event);
        // }
    }


    // email = ''
    // selectedCarOption = ''
    // carOptions = [
    //     { label: 'Gasolina', value: 'typeCarPetrol' },
    //     { label: 'Gasóleo', value: 'typeCarFuel'    },
    //     { label: 'LPG', value: 'typeCarLPG'}
    // ]

    // handleCarOptionChange(event) {
    //     this.selectedCarOption = event.target.value
    //     console.log(this.selectedCarOption)
    // }

    // handleEmailChange(event) {
    //     this.email = event.target.value
    //     console.log(this.email)
    // }

    // calcFootprint() {
    //     console.log('Antes de obtener los datos')
        
    //     // console.log(distance)
    //     // console.log(consumption)
    //     // console.log(numberPassengers)
    //     //console.log(yearOfCar)
    //     //console.log(email)


    //     //calculateFootprint();
    // }

    // configureSettingsForCar() {
        
        
    //     if (optionSelected == 'typeCarPetrol') {
    //         //6 litros de consumo cada 100 
    //         //Co2 2.881kg/ud
    //         //cooger el valor de abajo por el consumo medio del coche y multiplicarlo por el numero de kilometros 
    //     } else if (optionSelected == 'typeCarFuel') {
            
    //     } else if (optionSelected == 'typeCarLPG') {
    //         //realizar calculos oportunos
    //     }
        
    // }

    // configureSettingsForVan() {
        
    // }
}