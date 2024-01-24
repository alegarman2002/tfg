import { LightningElement, api } from 'lwc';
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'
import chartjs from '@salesforce/resourceUrl/chartjs'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

export default class CacularHuella extends LightningElement {


    async calcularValor() {
        var numero = 0
        await calcularHuellaUsuario({valorControl: 1}).then((atribute => {numero = atribute}))
        console.log(numero)
    }

    @api chartDataset; 
    chart;    
  
  renderedCallback() {    
    Promise.all([loadScript(this, chartjs)])
      .then(() => {        
      const ctx = this.template.querySelector("canvas");
       this.chart = new window.Chart(ctx, {
            type:"doughnut",
            data:{
                labels:["Vino","Tequila","Cerveza","Ron"],
                datasets:[
                    {
                        label:"Mi grafica de bebidas",
                        backgroundColor:[
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)'
                        ],
                        borderColor:"rgb(0,255,0)",
                        data:[12,39,5,30]
                    }
                ]
            }
       });         
           })
           .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error loading Chart",
                        message: error.message,
                        variant: "error",
                    })
                );
            });
    }
    initializeChart() {
        console.log("Entramos")
        let miCanva = this.template.querySelector('[data-id="consumoCoche"]').getContext('2d')
        console.log("Primer paso")
        var chart = new Chart(miCanva,{
            type:"bar",
            data: {
                labels:["Vino","Tequila","Cerveza","Ron"],
                datasets:[
                    {
                        label:"Mi gráfica de bebida",
                        backgroundColor:"rgb(0,0,0)",
                        borderColor:"rgb(0,255,0)",
                        data:[12,39,5,30]
                    }
                ]
            }
            
        }
        )
    }
}