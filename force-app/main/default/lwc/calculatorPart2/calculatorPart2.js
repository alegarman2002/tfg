import { LightningElement } from 'lwc';
import guardarDatos from '@salesforce/apex/CarbonFootprint.guardarDatos'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import image from '@salesforce/resourceUrl/ApagarLuz'

export default class CalculatorPart2 extends LightningElement {

    consumoElectrico = null
    dias = 5
    metodoElegido = null
    valorMotor = null
    consumo = null
    integrantesCoche = 1
    monitores = 1
    tipoCalefaccion
    calefaccion = 4
    distancia = null
    consumoMotorAnterior
    metrosParaCalefaccion = null
    numBombillas = null
    tipoIluminacion = null
    imageUrl = image
    recomendationText = 'Recuerda apagar la luz cuando no la utilices'

    renderedCallback() {

        this.numBombillas = localStorage.getItem('numeroBombillas')
        this.tipoIluminacion = localStorage.getItem('tipoIluminacion')
        this.metrosParaCalefaccion = localStorage.getItem('metrosParaCalefacción')

        this.consumoElectrico = localStorage.getItem('consumoElectrico')
        this.monitores = localStorage.getItem('monitores')
        this.tipoCalefaccion = localStorage.getItem('tipoCalefaccion')
        this.calefaccion = localStorage.getItem('calefaccion')
        this.consumoMotorAnterior = localStorage.getItem('consumoMotor')
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
            input = this.template.querySelector('[data-id="actualizacionConsumoCoche"]')
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

        var valorUltimoMes = parseFloat(this.consumoMotorAnterior)
        var input = this.template.querySelector('[data-id="actualizacionConsumoCoche"]')
        
        console.log(valorUltimoMes)
        console.log(valorUltimoMes - this.comsumoElectrico)
        this.consumo = parseFloat(event.detail.value)

        if (this.consumo < valorUltimoMes) {
            input.innerHTML = "Enhorabuena has reducido el consumo de tu coche en " +  (valorUltimoMes - this.consumo) + " litros cada 100Km"
            input.style.display = 'block'
        } else if (this.consumo == valorUltimoMes || this.consumo == NaN) {
            input.style.display = 'none'
        } else {
            input.innerHTML = "Debes controlar el acelerador tu consumo del coche ha aumentado en " +  (this.consumo - valorUltimoMes) + " litros cada 100Km"
            input.style.display = 'block'
        }
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
        
        if(this.distancia == null) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Por favor completa todos los campos requeridos',
                variant: 'error',
            });
            this.dispatchEvent(event)
            return
        }
        if (this.metodoElegido == null) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Por favor completa todos los campos requeridos',
                variant: 'error',
            });
            this.dispatchEvent(event)
            return
        }
 
        if (this.metodoElegido == 'metodoCoche' && (this.consumo == null || this.valorMotor == null)) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Por favor completa todos los campos requeridos',
                variant: 'error',
            });
            this.dispatchEvent(event)
            return
        }

        var list = [this.consumoElectrico, this.dias, this.metodoElegido, this.valorMotor, this.consumo, this.integrantesCoche, this.monitores, this.tipoCalefaccion, this.calefaccion, this.distancia, this.metrosParaCalefaccion, this.numBombillas, this.tipoIluminacion]
        var guardado = 1
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