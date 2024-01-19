import { LightningElement } from 'lwc';
import guardarDatos from '@salesforce/apex/CarbonFootprint.guardarDatos'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class Calculator extends LightningElement {

    consumoElectrico = null
    dias = 5
    metodoElegido
    valorMotor
    consumo = null
    integrantesCoche = 1
    monitores = 1
    tipoCalefaccion
    calefaccion = 4
    distancia = null

    get tiposDeCalefaccion() {
        return [
            {label: 'No utilizo calefacción', value: 'sinCalefaccion'},
            {label: 'Electrica', value: 'tipoElectrica'},
            {label: 'Gas', value: 'tipoGas'}
        ]
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

    handleMethodOptionChange(event) {
        this.metodoElegido = event.detail.value
        if (this.metodoElegido == 'metodoCoche') {
            var input = this.template.querySelector('[data-id="consumoCoche"]');
            console.log("Valor del input: ", input)
            input.style.display = 'block'
            input = this.template.querySelector('[data-id="motorCoche"]')
            input.style.display = 'block'
            input = this.template.querySelector('[data-id="integrantesCoche"]')
            input.style.display = 'block'
        }else {
            var input = this.template.querySelector('[data-id="consumoCoche"]');
            console.log("Valor del input: ", input)
            input.style.display = 'none'
            input = this.template.querySelector('[data-id="motorCoche"]')
            input.style.display = 'none'
            input = this.template.querySelector('[data-id="integrantesCoche"]')
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
        //Consumo electrico total
        console.log("Consumo electrico ", this.consumoElectrico)
        //Dias que se van a la oficina por mes
        console.log("Dias a la oficina ", this.dias)
        //Metodo de transporte elegido
        console.log("Metodo de transporte ", this.metodoElegido)
        //Tipo de motor elegido
        console.log("Tipo de motor ", this.valorMotor)
        //Consumo del motor
        console.log("Consumo del motor ", this.consumo)
        //Numero de integrantes del coche
        console.log("Numero de integrantes del coche ", this.integrantesCoche)
        //Numero de monitores auxiliares
        console.log("Monitores para trabajar ", this.monitores)
        //Tipo de calefaccion
        console.log("Tipo de calefaccion ", this.tipoCalefaccion)
        //Horas de uso de la calefaccion
        console.log("Horas de uso de la calefaccion ", this.calefaccion)
        // if(this.consumoElectrico == null || this.distancia == null) {
        //     const event = new ShowToastEvent({
        //         title: 'Alerta',
        //         message: 'Por favor completa todos los campos requeridos',
        //         variant: 'error',
        //     });
        //     this.dispatchEvent(event)
        //     return
        // }
        // if (this.consumo == null && this.metodoElegido == 'metodoCoche') {
        //     const event = new ShowToastEvent({
        //         title: 'Alerta',
        //         message: 'Por favor completa todos los campos requeridos',
        //         variant: 'error',
        //     });
        //     this.dispatchEvent(event)
        //     return
        // }
        var list = [this.consumoElectrico, this.dias, this.metodoElegido, this.valorMotor, this.consumo, this.integrantesCoche, this.monitores, this.tipoCalefaccion, this.calefaccion, this.distancia]
        var guardado = 0
        await guardarDatos({parametros: list}).then((atribute => {guardado = atribute}))
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