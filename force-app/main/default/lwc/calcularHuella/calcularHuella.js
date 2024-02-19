import { LightningElement, api } from 'lwc';
import calcularHuellaUsuario from '@salesforce/apex/CarbonFootprint.calcularHuellaUsuario'
import chartjs from '@salesforce/resourceUrl/chartjs'
import jsPDF from '@salesforce/resourceUrl/pdfGenerator'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';

export default class CacularHuella extends LightningElement {


    // async calcularValor() {
    //     var numero = 0
    //     await calcularHuellaUsuario({valorControl: 1}).then((atribute => {numero = atribute}))
    //     console.log(numero)
    // }

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
  
  async renderedCallback() {   
    Promise.all([
        loadScript(this, jsPDF).then(() => {
            console.log("JS loaded");
        }).catch(error => {
            console.error("Error " + error);
        })
    ])
    await calcularHuellaUsuario().then((atribute => {this.lista = atribute}))
    console.log(this.lista)
    if (this.lista.length != 0) {
        this.listaValoresTotales = this.lista[0]
        this.listaValoresDesplazamientoAlMes = this.lista[1]
        this.listaValoresOrdenadorAlMes = this.lista[2]
        this.listaMeses = this.lista[3]
    //Vamos a considerar que el donut muestre todos los valores del historico mientras que el diagrama de linea los muestre del propio año
    //si veo que es facil hacemos que se puedan ver años anteriores
    }
    console.log(this.listaMeses)
    for (var i = 0; i < listaMeses.length; i++) {
        this.listaMeses[i] = this.obtenerNombreMes(listaMeses[i])
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

    generateText()
    {
        try
        {
            this.listaValoresTotales = this.lista[0]
            this.listaValoresDesplazamientoAlMes = this.lista[1]
            this.listaValoresOrdenadorAlMes = this.lista[2]
            this.listaMeses
            // Importar jsPDF
            const { jsPDF } = window.jspdf;

            // Crear una nueva instancia de jsPDF
            const doc = new jsPDF();

            // Agregar título
            doc.setFontSize(18);
            doc.text("Informe de Huella de Carbono", 10, 10);

            // Agregar detalles del informe
            doc.setFontSize(12);
            doc.text("Nombre: Juan Perez", 10, 20);
            doc.text(Date.toString(), 10, 30);

            // Definir datos de la tabla
            const carbonFootprintData = [
            ["Actividad", "Cantidad", "Huella de carbono"],
            ["Electricidad", "500 kWh", "200 kg CO2"],
            ["Transporte", "500 km", "300 kg CO2"],
            ["Residuos", "50 kg", "100 kg CO2"],
            // Agregar más filas según sea necesario
            ];

            // Definir posición inicial de la tabla
            let y = 40;

            // Definir ancho de las columnas
            const columnWidths = [80, 40, 80];

            // Dibujar la tabla
            carbonFootprintData.forEach(row => {
            row.forEach((cell, i) => {
                doc.text(cell, 10 + (i * columnWidths[i]), y);
            });
            y += 10; // Ajustar la posición vertical para la siguiente fila
            });

            // Guardar el PDF
            doc.save("Informe_Huella_Carbono.pdf");
            
            // console.log("Empezamos")
            // const { jsPDF } = window.jspdf;
            // console.log("creamos el objeto")
            // var verticalOffset=0.5;
            // var size=12;
            // var margin=0.5;


            // const doc = new jsPDF('p', 'in', 'letter');
            // console.log("Inicializamos")
            // //Landscape PDF
            // //new jsPDF({   orientation: 'landscape',   unit: 'in',   format: [4, 2] })  
            // // jsPDF('p', 'in', 'letter')

            // //Sets the text color setTextColor(ch1, ch2, ch3, ch4) 
            // doc.setTextColor(100); 
            // //Create Text
            // doc.text("Hello SalesforceCodex!", 10, 10);
            // doc.rect(20, 20, 10, 10);
            
            // // Set Margins:
            // doc.setDrawColor(0, 255, 0)   //Draw Color
            // .setLineWidth(1 / 72)  // Paragraph line width
            // .line(margin, margin, margin, 11 - margin) // Margins
            // .line(8.5 - margin, margin, 8.5 - margin, 11 - margin)

            // console.log("Ponemos todos los atributos")

            // var stringText='SalesforceCodex.com is started in 2016 as a personal blog where I tried to solve problems with simple and understandable content. Initially, my focus was on sharing content on which feature I was working. \n\nToday, SalesforceCodex.com is focused on helping salesforce developers, programmers and other IT professionals improve their careers. We are helping developers in integrating other technologies,  coding best practices, lightning web components, architecture, design solutions, etc.';
            
            // var lines=doc.setFont('Helvetica', 'Italic')
            //                     .setFontSize(12)
            //                     .splitTextToSize(stringText, 7.5);

            // //doc.setFontSize(40);
            // doc.text(0.5, verticalOffset + size / 72, lines);
            // verticalOffset += (lines.length + 0.5) * size / 72;
            // const chartDataUrl = this.ctx.toDataURL()
            // doc.addImage(chartDataUrl, 'PNG', 20, 40, 150, 100);
            // //Save File
            // console.log("Antes de guardar")
            // doc.save("a4.pdf");
            // console.log("Despues de guardar")
            
        }
        catch(error) {
            alert("Error " + error);
        }
    }
    //Convert Image into Base64
    
    //Create PDF with Image and Text
}