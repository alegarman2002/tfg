import { LightningElement } from 'lwc';
import calculateFootprint from '@salesforce/apex/CarbonFootprint.calculateFootprint';
export default class Calculator extends LightningElement {

    email = ''
    selectedCarOption = ''
    carOptions = [
        { label: 'Gasolina', value: 'typeCarPetrol' },
        { label: 'Gasóleo', value: 'typeCarFuel'    },
        { label: 'LPG', value: 'typeCarLPG'}
    ]

    handleCarOptionChange(event) {
        this.selectedCarOption = event.target.value
        console.log(this.selectedCarOption)
    }

    handleEmailChange(event) {
        this.email = event.target.value
        console.log(this.email)
    }

    calcFootprint() {
        console.log('Antes de obtener los datos')
        
        // console.log(distance)
        // console.log(consumption)
        // console.log(numberPassengers)
        //console.log(yearOfCar)
        //console.log(email)


        //calculateFootprint();
    }

    configureSettingsForCar() {
        
        
        if (optionSelected == 'typeCarPetrol') {
            //6 litros de consumo cada 100 
            //Co2 2.881kg/ud
            //cooger el valor de abajo por el consumo medio del coche y multiplicarlo por el numero de kilometros 
        } else if (optionSelected == 'typeCarFuel') {
            
        } else if (optionSelected == 'typeCarLPG') {
            //realizar calculos oportunos
        }
        
    }

    configureSettingsForVan() {
        
    }
}