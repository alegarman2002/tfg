import { LightningElement } from 'lwc';
import guardarDatos from '@salesforce/apex/CarbonFootprint.guardarDatos'


export default class CalculatorPart2 extends LightningElement {

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

    renderedCallback() {
        this.consumoElectrico = localStorage.getItem('consumoElectrico')
        this.monitores = localStorage.getItem('monitores')
        this.tipoCalefaccion = localStorage.getItem('tipoCalefaccion')
        this.calefaccion = localStorage.getItem('calefaccion')
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

    handleMethodOptionChange(event) {
        this.metodoElegido = event.detail.value
        if (this.metodoElegido == 'metodoCoche') {
            var input =     
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

    diasMes(event) {
        this.dias = event.detail.value
    }

    moni(event) {
        this.monitores = event.detail.value
    }

    cale(event) {
        this.calefaccion = event.detail.value
    }

    async registrateData() {
        

        var list = [this.consumoElectrico, this.dias, this.metodoElegido, this.valorMotor, this.consumo, this.integrantesCoche, this.monitores, this.tipoCalefaccion, this.calefaccion, this.distancia]
        var guardado = 0
        await guardarDatos({parametros: list}).then((atribute => {guardado = atribute}))
        if (guardado == 1) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Sus datos se han guardado correctamente',
                variant: 'success',
            });
            this.dispatchEvent(event);
        } else {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Ha habido un problema guardando sus datos por favor reviselos y vuelva a enviarlos',
                variant: 'error',
            });
            this.dispatchEvent(event);
        }
    }
}