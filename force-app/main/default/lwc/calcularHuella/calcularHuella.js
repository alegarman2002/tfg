import { LightningElement } from 'lwc';
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'

export default class CacularHuella extends LightningElement {


    async calcularValor() {
        var numero = 0
        await calcularHuellaUsuario({valorControl: 1}).then((atribute => {numero = atribute}))
        console.log(numero)
    }
}