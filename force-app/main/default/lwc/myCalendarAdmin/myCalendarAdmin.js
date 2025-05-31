import { LightningElement, wire, track, api } from 'lwc'
import fullCalendar from "@salesforce/resourceUrl/fullCalendar"
import { NavigationMixin } from "lightning/navigation";
import { loadStyle, loadScript } from "lightning/platformResourceLoader"
//import { jsToApexDate } from 'c/calendarUtils'
import getEvents from '@salesforce/apex/MyCalendarController.getEvents'
import {publish, MessageContext, createMessageContext} from 'lightning/messageService'
import fDer from '@salesforce/resourceUrl/FlechaDerecha'
import fIzq from '@salesforce/resourceUrl/FlechaIzquierda'
import getHolidayDays from '@salesforce/apex/MyCalendarController.getHolidayDays'

// import insertarDatos from '@salesforce/apex/CarbonFootprint.insertarDatos'

export default class MyCalendar extends NavigationMixin(LightningElement) {

    calendarLabel = ''
    calendar
    initialized = false
    clickedEvent = ''
    listUsedDays = []
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
     //    await insertarDatos()
       try {
        // core 📆
     //    console.log(fullCalendar)
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
          // console.log("Primera prueba")
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
               //Comentar el tema de por que ajusta bien desde que abro la consola
               eventRender(event) {
                    var element = event.el
                   
                    
                    if (event.event.extendedProps.image) {
                         // await compareEventsId({id: event.event.id}).then((atribute => {control = atribute}))
                         var timeElement = element.querySelector('span.fc-time')

                         // Crea un nuevo elemento span con la clase 'fc-image'
                         var imageElement = document.createElement('span')
                         imageElement.className = 'fc-image'

                         var htmlString = event.event.extendedProps.image
                       

                         imageElement.innerHTML = '<lightning-formatted-rich-text c-customlayout_customlayout="" class="slds-rich-text-editor__output image_calendar"><span part="formatted-rich-text">' + htmlString + '</span></lightning-formatted-rich-text>'
                         

                         // Inserta el elemento 'fc-image' antes del elemento 'fc-time'
                         timeElement.parentNode.insertBefore(imageElement, timeElement)
                    }
                    
                },
               //eventDrop: info => { console.log('event drag start', info) },
               eventClick: info => { 
                    this.clickedEvent = '' + info.event.id
                    // localStorage.setItem('event', this.clickedEvent)
                    this.event('fceventclick', info) },

        })


        this.calendar.render()
        this.calendarLabel = this.calendar.view.title
        this.paintHolidayDays()
        this.showEvents()
    }

    nextHandler() {
        this.calendar.next();
        this.calendarLabel  = this.calendar.view.title;
        this.paintFreeDays()
        this.calendar.render()
        // this.setDates()
   }
    
   previousHandler() {
        this.calendar.prev();
        this.calendarLabel  = this.calendar.view.title;
        this.paintFreeDays()
        // this.setDates()
        this.calendar.render()
   }
   
   today() {
        this.calendar.today();
        this.calendarLabel = this.calendar.view.title;
        this.paintFreeDays()
        // this.setDates()
        this.calendar.render()
   }
    
   monthlyViewHandler() {
        this.calendar.changeView('dayGridMonth');
        this.calendarLabel = this.calendar.view.title;
        this.calendar.render()
   }

   listViewEvents() {
          this.calendar.changeView('listMonth');
          this.calendarLabel = this.calendar.view.title;
          this.calendar.render()
   }
    
   handleMessageChange(event) {
     this.message = event.detail;
     this.calendar.render()
   }  

   handleEventClick = (info) => {
     try {


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
     // console.log("Entramos en el metodo de los festivos")
     var listaFestivos = await getHolidayDays()
     for (var i = 0; i < listaFestivos.length; i++) {
          var eventStart = listaFestivos[i].substring(0, 10)
          // console.log(eventStart)
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
     // console.log(listaFestivos)
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
          this.calendar.render()
         
        } catch (error) {
          console.error("Error al obtener eventos: ", error)
        }
          
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