import { LightningElement, api } from 'lwc'
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'
import chartjs from '@salesforce/resourceUrl/chartjs'
import jsPDF from '@salesforce/resourceUrl/pdfGenerator'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { loadScript, loadStyle } from 'lightning/platformResourceLoader'
import getUserLogInfo from '@salesforce/apex/MyCalendarController.getUserLogInfo'
import capLogo from '@salesforce/resourceUrl/CapgeminiLogo'

export default class CacularHuella extends LightningElement {



    @api chartDataset 
    chart
    ctx
    bar
    ctx2
    lista = 0
    listaValoresTotales 
    listaValoresDesplazamientoAlMes
    listaValoresOrdenadorAlMes
    listaMeses
    listaValoresCalefaccionAlMes
    listaValoresIluminacionAlMes
    listaValoresMonitoresAlMes
  
  async renderedCallback() {   
    Promise.all([
        loadScript(this, jsPDF).then(() => {
            console.log("JS loaded");
        }).catch(error => {
            console.error("Error " + error);
        })
    ])
    console.log("Antes de calcular")
    await calcularHuellaUsuario().then((atribute => {this.lista = atribute}))
    console.log("Despues de calcular")
    console.log(this.lista)
    if (this.lista.length != 0) {
        this.listaValoresTotales = this.lista[0]
        this.listaValoresDesplazamientoAlMes = this.lista[1]
        this.listaValoresOrdenadorAlMes = this.lista[2]
        this.listaMeses = this.lista[3]
        this.listaValoresIluminacionAlMes = this.lista[4]
        this.listaValoresMonitoresAlMes = this.lista[5]
        this.listaValoresCalefaccionAlMes = this.lista[6]
    //Vamos a considerar que el donut muestre todos los valores del historico mientras que el diagrama de linea los muestre del propio año
    //si veo que es facil hacemos que se puedan ver años anteriores
    }
    console.log(this.listaMeses)
    for (var i = 0; i < this.listaMeses.length; i++) {
        this.listaMeses[i] = this.obtenerNombreMes(this.listaMeses[i])
    }

    var longitudMaxima = Math.min(12, this.listaValoresOrdenadorAlMes.length)
    var startIndex = Math.max(0, this.listaValoresOrdenadorAlMes.length - longitudMaxima);
    this.listaValoresDesplazamientoAlMes.splice(0, startIndex)
    this.listaValoresOrdenadorAlMes.splice(0, startIndex)

    console.log(this.listaValoresDesplazamientoAlMes)
    console.log(this.listaValoresOrdenadorAlMes)

    console.log(this.listaMeses)
    console.log(this.listaValoresTotales[1])
    console.log(this.listaValoresTotales[2])

    Promise.all([loadScript(this, chartjs)])
      .then(() => {        
      this.ctx = this.template.querySelector("canvas");
       this.chart = new window.Chart(this.ctx, {
            type:"doughnut",
            data:{
                labels:["Transporte","Ordenador"],
                datasets:[
                    {
                        label:"Grafico de consumo",
                        backgroundColor:[
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)'
                        ],
                        borderColor:['rgb(255, 99, 132)','rgb(54, 162, 235)'],
                        data:[this.listaValoresTotales[1],this.listaValoresTotales[2]]
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

        this.initializeChart()
    }


    initializeChart() {
        console.log("Entramos")
        Promise.all([loadScript(this, chartjs)])
        .then(() => { 
        this.ctx2 = this.template.querySelector('[data-id="linearChart"]').getContext('2d')
       this.bar = new window.Chart(this.ctx2,{
            type:"line",
            data: {
                labels: this.listaMeses,
                datasets: [{
                    label: 'Consumo electrico',
                    data: this.listaValoresOrdenadorAlMes,
                    fill: false,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                  }
                ,
                {
                    label: 'Consumo en desplazamiento',
                    data: this.listaValoresDesplazamientoAlMes,
                    fill: false,
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                  }
                ,
                {
                    label: 'Consumo en iluminacion',
                    data: this.listaValoresIluminacionAlMes,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
                ,
                {
                    label: 'Consumo de monitores',
                    data: this.listaValoresMonitoresAlMes,
                    fill: false,
                    borderColor: 'rgb(255, 205, 86)',
                    tension: 0.1
                }
                ,
                {
                    label: 'Consumo de calefacción',
                    data: this.listaValoresCalefaccionAlMes,
                    fill: false,
                    borderColor: 'rgb(255, 159, 64)',
                    tension: 0.1
                }
                ]
            }
            
        }
        )
    })
    }


    obtenerNombreMes (numero) {
        let miFecha = new Date();
        if (0 < numero && numero <= 12) {
          miFecha.setMonth(numero - 1);
          return new Intl.DateTimeFormat('es-ES', { month: 'long'}).format(miFecha);
        } else {
          return null;
        }
    }


    obtenerPdf() {
        
        this.generateText()

    }

    async generateText()
    {
        try
        {
            // Importar jsPDF
            const { jsPDF } = window.jspdf;

            // Crear una nueva instancia de jsPDF
            const doc = new jsPDF();

            // Agregar título
            doc.setFontSize(18);
            doc.text("Informe de Huella de Carbono", 10, 10);
            var imgData = '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'
            doc.addImage(imgData, 'PNG', 160, -5, 40, 40);

            // Agregar detalles del informe
            doc.setFontSize(12);
            var nombre = await getUserLogInfo()
            console.log(nombre)
            doc.text("Nombre: " + nombre[0], 10, 20)
            var diaActual = new Date()
            console.log(diaActual)
            doc.text(diaActual + '', 10, 30)
            console.log('Ver si la fecha peta')

            // Definir datos de la tabla
            const carbonFootprintData = [
                ["Mes", "Consumo en desplazamiento", "Consumo electrico"]
            // Agregar más filas según sea necesario
            ];

            const matriz = this.listaMeses.map((elemento, indice) => {
                return [elemento.charAt(0).toUpperCase() + elemento.slice(1), this.listaValoresDesplazamientoAlMes[indice] + ' Kg de CO2 emitidos', 
                this.listaValoresOrdenadorAlMes[indice] + ' Kg de CO2 emitidos'
            ]
            })
            console.log(matriz)

            // Definir posición inicial de la tabla
            let y = 40;

            // Definir ancho de las columnas
            const columnWidths = [20, 40, 60];

            // Dibujar la tabla
            carbonFootprintData.forEach(row => {
            row.forEach((cell, i) => {
                doc.setFont(undefined, 'bold')
                doc.text(cell, 10 + (i * columnWidths[i]), y)
                doc.setFont(undefined, 'normal')
            });
            y += 10; // Ajustar la posición vertical para la siguiente fila
            });

            matriz.forEach(row => {
                row.forEach((cell, i) => {
                    doc.text(cell, 10 + (i * columnWidths[i]), y)
            })
            y += 10 // Ajustar la posición vertical para la siguiente fila
            })


            doc.text('Aquí tienes el resumen de tu consumo en el último año', 10, 170)
            doc.text('Esperamos que te sea de utilidad y te ayude a mejorar tu consumo', 10, 180)
            // Guardar el PDF
            doc.save("Informe_Huella_Carbono.pdf");
            
        }
        catch(error) {
            alert("Error " + error);
        }
    }
    //Convert Image into Base64
    
    //Create PDF with Image and Text
}