import { LightningElement } from 'lwc';
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'

export default class CacularHuella extends LightningElement {


    async calcularValor() {
        var numero = await calcularHuellaUsuario()
    }
}