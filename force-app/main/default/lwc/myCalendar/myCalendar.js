import { LightningElement, wire, track, api } from 'lwc'
import fullCalendar from "@salesforce/resourceUrl/fullCalendar"
import { NavigationMixin } from "lightning/navigation";
import { loadStyle, loadScript } from "lightning/platformResourceLoader"
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import { jsToApexDate } from 'c/calendarUtils'
import getEvents from '@salesforce/apex/MyCalendarController.getEvents'
import {publish, MessageContext, createMessageContext} from 'lightning/messageService'
import messageChannel from '@salesforce/messageChannel/MyChannel__c'
import getUserLogInfo from '@salesforce/apex/MyCalendarController.getUserLogInfo'
import calcLogo from '@salesforce/resourceUrl/CalculadoraLogo'
import salesLogo from '@salesforce/resourceUrl/SalesforceLogo'
import capLogo from '@salesforce/resourceUrl/CapgeminiLogo'
import fDer from '@salesforce/resourceUrl/FlechaDerecha'
import fIzq from '@salesforce/resourceUrl/FlechaIzquierda'
import iMonitor from '@salesforce/resourceUrl/iconoMonitor'
import getHolidayDays from '@salesforce/apex/MyCalendarController.getHolidayDays'
import getEventsOfTheUser from '@salesforce/apex/MyCalendarController.getEventsOfTheUser'
import obtainLastDayDataIsRecorded from '@salesforce/apex/CarbonFootprint.obtainLastDayDataIsRecorded'

export default class MyCalendar extends NavigationMixin(LightningElement) {

    calendarLabel = ''
    calendar
    initialized = false
    clickedEvent = ''
    listUsedDays = []
    userName = ""
    calculadoraLogo = calcLogo
    salesforceLogo = salesLogo
    capgeminiLogo = capLogo
    flechaDerecha = fDer
    flechaIzquierda = fIzq
    
    variableControlTabla = 0


    messageContext = createMessageContext()

     connectedCallback() {
          this.addEventListener('fceventclick', this.handleEventClick)
          //this.addEventListener('fcdateclick', this.handleDateClick)
     }

    async renderedCallback() {
         
        if (this.initialized) {
            return
        }

       this.initialized = true

       try {
        // core 📆
        console.log(fullCalendar)
        await Promise.all([
             loadScript(this, fullCalendar + "/packages/core/main.js"),
             loadStyle(this, fullCalendar + "/packages/core/main.css")
        ])
          
        //load core first, then plugins📦
        await Promise.all([
             loadScript(this, fullCalendar + "/packages/daygrid/main.js"),
             loadStyle(this, fullCalendar + "/packages/daygrid/main.css"),
             loadScript(this, fullCalendar + "/packages/interaction/main.js"), //puede que me sobre
             loadScript(this, fullCalendar + "/packages/moment/main.js"),
             loadScript(this, fullCalendar + "/packages/moment-timezone/main.js"),
        ])

        await this.init()

        } catch (error) {
            console.error("Error when loading scripts", error)
        }
    }

    async init() { 
          console.log("Primera prueba")
        const calendarEl = this.template.querySelector(".calendar")

        this.calendar = new FullCalendar.Calendar(calendarEl, {
               plugins: ["dayGridMonth","dayGrid", "timeGrid", "listMonth","interaction","moment"],
               views: {
                    listMonth: { buttonText: "list month"},
                    month: { displayEventEnd: true },
                    dayGridMonth: { buttonText: "month" },
                    listMonth: { buttonText: 'listMonth' }
               },
               firstDay: 1,
               locale: 'es',
               initialView: 'dayGridMonth',
               header: false,
               events: [],
               // eventRendering : 'list-item',
               // eventContent: function (event, element) {  
               //      element.find('span.fc-time').before($("<span class=\"fc-image\"><img src="+event.image+"></span>"))
                        
               // }, 
               // loading: function (bool) {
               //      $('#loading').toggle(bool);
               // },    
               // eventMouseEnter: function (event, element) {     
               //      console.log("Entra") 
               //      console.log(event.event.title)              
               //           var tool = document.createElement("p")
               //           tool.textContent = event.event.title
               //           tool.classList.add("tooltip")
               //           tool.style.backgroundColor = "#ffffff"
               //           document.body.appendChild(tool)
               //      },
               // eventMouseLeave: function (event, element) {     
               //      console.log("Sale")               
               //      // $('.tooltip').remove();
               // },
               // eventAfterRender: function (info) {
               //      // Obtiene la altura del evento y ajusta la altura de la celda en consecuencia
               //      var eventHeight = info.el.offsetHeight;
               //      var cellHeight = info.el.closest('.fc-content-skeleton').offsetHeight;
              
               //      if (eventHeight > cellHeight) {
               //        info.el.closest('.fc-content-skeleton').style.height = eventHeight + 'px';
               //      }
                    
               // },
               //Comentar el tema de por que ajusta bien desde que abro la consola
               eventRender(event) {
                    var element = event.el
                    // console.log("AAAAAAAAAAAAA")
                    // console.log(event.event.extendedProps.image)
                    // console.log(element)
                    // var control = 0
                    // console.log(event.event.id)
                    
                    if (event.event.extendedProps.image) {
                         // await compareEventsId({id: event.event.id}).then((atribute => {control = atribute}))
                         var timeElement = element.querySelector('span.fc-time')

                         // Crea un nuevo elemento span con la clase 'fc-image'
                         var imageElement = document.createElement('span')
                         imageElement.className = 'fc-image'

                         var htmlString = event.event.extendedProps.image
                         // var srcStartIndex = htmlString.indexOf('src="')
                         // var srcEndIndex = htmlString.indexOf('"', srcStartIndex + 5)

                         // var imageRoute = htmlString.substring(srcStartIndex + 5, srcEndIndex)
                         // console.log(htmlString)

                         imageElement.innerHTML = '<lightning-formatted-rich-text c-customlayout_customlayout="" class="slds-rich-text-editor__output image_calendar"><span part="formatted-rich-text">' + htmlString + '</span></lightning-formatted-rich-text>'
                         
                         // Crea un elemento img y establece el atributo src con el valor de event.extendedProps.image
                         // var imgElement = document.createElement('lightning-formatted-rich-text')
                         // var pElement = document.createElement('p')
                         // imgElement.append(pElement)
                         // var image = document.createElement('img')
                         // image.src = imageRoute
                         // pElement.append(image)

                         // // Agrega la imagen al elemento 'fc-image'
                         // imageElement.appendChild(imgElement)

                         // Inserta el elemento 'fc-image' antes del elemento 'fc-time'
                         timeElement.parentNode.insertBefore(imageElement, timeElement)
                    }
                    // if (control == 1) {
                    //      console.log("Logueamos iteracciones")
                    //      var timeElement = element.querySelector('span.fc-image')

                    //      console.log("Logueamos iteracciones")
                    //      var imageElement = document.createElement('span')
                    //      imageElement.className = 'fc-registered'

                    //      console.log("Logueamos iteracciones")
                    //      imageElement.innerHTML = '<p>Ya esta registrado</p>'

                    //      console.log("Logueamos iteracciones")
                    //      timeElement.parentNode.insertBefore(imageElement, timeElement)
                    //      console.log("Despues de insertar")
                    // }
                    // console.log("Ayuda")
                },
               //eventDrop: info => { console.log('event drag start', info) },
               eventClick: info => { 
                    this.clickedEvent = '' + info.event.id
                    // localStorage.setItem('event', this.clickedEvent)
                    this.event('fceventclick', info) },
               //eventMouseEnter: info => {console.log("mouse enter", info) },
               //dateClick: info => { this.event('fcdateclick', info) },   
                     
        })
        const info = await getUserLogInfo()
        var dateString = await obtainLastDayDataIsRecorded()
        console.log("Vemos el dia: ", dateString)
        //'0' + (currentDate.getMonth()+1)).slice(-2)
        var dayToCompare
        var actualDay
        if (dateString != null) {
          dayToCompare = new Date(dateString[2], dateString[1], dateString[0])
          actualDay = new Date()

          var diff = (actualDay.getFullYear() - dayToCompare.getFullYear()) * 12;
               diff += actualDay.getMonth() - dayToCompare.getMonth();

          //this.mensajeDeAviso(diff, dayToCompare)
        }
          


        this.userName = info[0].split(" ")[0]
        this.calendar.render()
        this.calendarLabel = this.calendar.view.title
        this.paintHolidayDays()
        this.showEvents()
    }

    mensajeDeAviso(diff) {
          if (diff >= 3) {
               const event = new ShowToastEvent({
                    title: 'Alerta',
                    message: 'La ultima vez que actualizo sus datos fue el' + dayToCompare.getDate() + '-' + dayToCompare.getMonth()+1 + '-' + dayToCompare.getFullYear() + " por favor entre a actualizarlo",
                    variant: 'error',
                });
                this.dispatchEvent(event);
          }
    }

    async myEventsView() {
               
          if (this.variableControlTabla == 0) {
               console.log("Antes de empezar")
               var eventos
               await getEventsOfTheUser().then(attribute => {eventos = attribute})
               console.log(eventos)
               
               
               var divElement = this.template.querySelector(".contenedorTabla")
               console.log(divElement)
               var stringToInnerHTML = '<table class="tableOfEvents" style="background-color:#ffffff;border:1px solid black;border-collapse:collapse;width:100%;"><tr><td style="border:1px solid black;padding:10px;">Fecha de inicio</td><td>Fecha de fin</td style="border:1px solid black;padding:10px;"><td style="border:1px solid black;padding:10px;">Nombre</td></tr>'
               
               for(var i = 0; i < eventos.length; i++) {
                    //0 start 1 end 2 name
                    stringToInnerHTML = stringToInnerHTML + '<tr><td style="background-color:#ffffff;border:1px solid black;padding:10px;">' + eventos[i][0] + '</td><td style="background-color:#ffffff;border:1px solid black;padding:10px;">' + eventos[i][1] + '</td><td style="background-color:#ffffff;border:1px solid black;padding:10px;">' + eventos[i][2] + '</td></tr>'
               }
               divElement.innerHTML = stringToInnerHTML + '<table>'
               this.variableControlTabla = 1
          } else if(this.variableControlTabla == 1) {
               var table = this.template.querySelector(".contenedorTabla")
               table.style.display = 'none'
               this.variableControlTabla = 2
          } else {
               var table = this.template.querySelector(".contenedorTabla")
               table.style.display = 'block'
               this.variableControlTabla = 1
          }

    }

    nextHandler() {
        this.calendar.next();
        this.calendarLabel  = this.calendar.view.title;
        this.paintFreeDays()

        // this.setDates()
   }
    
   previousHandler() {
        this.calendar.prev();
        this.calendarLabel  = this.calendar.view.title;
        this.paintFreeDays()
        // this.setDates()
   }
   
   today() {
        this.calendar.today();
        this.calendarLabel = this.calendar.view.title;
        this.paintFreeDays()
        // this.setDates()
   }
    
   monthlyViewHandler() {
        this.calendar.changeView('dayGridMonth');
        this.calendarLabel = this.calendar.view.title;
   }

   listViewEvents() {
          this.calendar.changeView('listMonth');
          this.calendarLabel = this.calendar.view.title;
   }
    
   handleMessageChange(event) {
     this.message = event.detail;
   }  

   handleEventClick = (info) => {
     try {

          this.sendMessage()

          this[NavigationMixin.Navigate]({
               type: 'standard__recordPage',
               attributes: {
                    recordId: this.clickedEvent,
                    objectApiName: 'MyEvent__c',
                    actionName: 'view'
               }
          })
     } catch (error) {
          console.log(error)
     }
   }
   async paintHolidayDays() {
     console.log("Entramos en el metodo de los festivos")
     var listaFestivos = await getHolidayDays()
     for (var i = 0; i < listaFestivos.length; i++) {
          var eventStart = listaFestivos[i].substring(0, 10)
          console.log(eventStart)
          var event = {
               id: eventStart,
               start: eventStart,
               end: eventStart,
               rendering: 'background',
               color: 'red'
          }
          this.calendar.addEvent(event)
          this.listUsedDays.push(eventStart)
     }
     console.log(listaFestivos)
   }
   //Poner el lunes como primer dia del calendario
   //Pintarlos en gris clarito y añadir una lista con 
   paintFreeDays () {
     var currentDate = this.calendar.view.activeStart
     var endDate = this.calendar.view.activeEnd
     while(currentDate <= endDate) {
          // var eventStart = currentDate.getFullYear() + "-" + (currentDate.getMonth()+1) + "-" + currentDate.getDate()
          
          var eventStart = currentDate.getFullYear() + '-'
             + ('0' + (currentDate.getMonth()+1)).slice(-2) + '-'
             + ('0' + currentDate.getDate()).slice(-2)
          
          if ((currentDate.getDay() == 0 || currentDate.getDay() == 6) &&  !(this.listUsedDays.includes(eventStart))) {
               this.listUsedDays.push(eventStart)
               var size = this.calendar.getEvents().length
               


               var event = {
                    id: eventStart,
                    start: eventStart,
                    end: eventStart,
                    rendering: 'background',
                    color: 'grey'
               }
               // console.log("Print the event", event)
               var addNewEvent = this.calendar.addEvent(event)
               // console.log("New event ", addNewEvent)
               // console.log(eventStart)
           }
          currentDate.setDate(currentDate.getDate() + 1)
          }

   
     }

     open_capgemini() {
          console.log("antes")
          window.open('https://www.capgemini.com/es-es/', '_blank', 'noopener,noreferrer');
          console.log("despues")
     }

     open_calculator() {
          window.open("/s/footprintcalculator", "_self")
     }


   async showEvents() {
        try {
          const events = await getEvents()
          var htmlString = events[1]
          // console.log("Evento:")
          // console.log(events)

          // Utiliza expresiones regulares para extraer la URL
          
          
          for (var i = 0; i < events.length; i++) {
               var event = events[i]
               var startDate = events[i]['start']
               var endDate = events[i]['end']
               startDate = new Date(startDate)
               endDate = new Date(endDate)
               var aux1 = new Date(startDate)
               var aux2 = new Date(aux1)
               while(aux1 <= endDate) {
                    //currentDate.getDay() == 0 Esto es el domingo el 1 es el lunes
                    if (aux1.getDay() == 0 && aux1.getDate() != endDate.getDate()) {
                         event.id = event.id
                         event.title = event.title
                         event.start = aux2
                         event.end = aux1
                         event.image = event.img
                         // console.log(event.image)
                         this.calendar.addEvent(event)
                         aux1.setDate(aux1.getDate() +1 )
                         aux2 = new Date(aux1)
                         continue
                    }
                    if (aux1.getDate() == endDate.getDate()) {
                         event.id = event.id;
                         event.title = event.title;
                         event.start = aux2;
                         event.end = aux1;
                         event.image = event.img;
                         // console.log(event.image)
                         this.calendar.addEvent(event);
                    }
                    aux1.setDate(aux1.getDate() +1 )
                    
               }
          }

          // Verifica si se encontró una coincidenci
          //Parte para controlar el cambio de color del background   
          this.paintFreeDays()
          
         
        } catch (error) {
          console.error("Error al obtener eventos: ", error)
        }
          
     }

     sendMessage() {
          const message = {
               messageToSend: '' + this.clickedEvent
          }
          publish (this.messageContext, messageChannel, message)
     }

     /**
      * @param {String} name name of event
      * @param {Object} val object containing data to be sent
      */
     event(name, value) {
          this.dispatchEvent(
               new CustomEvent(name, {
                    bubbles: true,
                    composed: true,
                    detail: {
                         value
                         
                    }
               })
          )
     }
}