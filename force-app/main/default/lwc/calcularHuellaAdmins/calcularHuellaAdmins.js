import { LightningElement } from 'lwc';

export default class CalcularHuellaAdmins extends LightningElement {

    async renderedCallback() {   
        var lista = 0
        await calcularHuellaUsuario({valorControl: 1}).then((atribute => {lista = atribute}))
        console.log(lista) 
        Promise.all([loadScript(this, chartjs)])
          .then(() => {        
          const ctx = this.template.querySelector("canvas");
           this.chart = new window.Chart(ctx, {
                type:"doughnut",
                data:{
                    labels:["Transporte","Ordenador"],
                    datasets:[
                        {
                            label:"Mi grafica de bebidas",
                            backgroundColor:[
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)'
                            ],
                            borderColor:['rgb(255, 99, 132)','rgb(54, 162, 235)'],
                            data:[lista[1],lista[2]]
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
}