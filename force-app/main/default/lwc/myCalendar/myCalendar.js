import { LightningElement, wire, track, api } from 'lwc'
import fullCalendar from "@salesforce/resourceUrl/fullCalendar"
import { NavigationMixin } from "lightning/navigation";
import { loadStyle, loadScript } from "lightning/platformResourceLoader"
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
import getHolidayDays from '@salesforce/apex/MyCalendarController.getHolidayDays'


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
             loadScript(this, fullCalendar + "/packages/list/main.js"),
             loadStyle(this, fullCalendar + "/packages/list/main.css"),
             loadScript(this, fullCalendar + "/packages/timegrid/main.js"),
             loadStyle(this, fullCalendar + "/packages/timegrid/main.css"),
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
        const calendarEl = this.template.querySelector(".calendar")

        this.calendar = new FullCalendar.Calendar(calendarEl, {
               plugins: ["dayGridMonth","dayGrid", "timeGrid", "list","interaction","moment"],
               views: {
                    listMonth: { buttonText: "list month"},
                    month: { displayEventEnd: true },
                    dayGridMonth: { buttonText: "month" },

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
               eventRender: function(event) {
                    var element = event.el
                    // console.log("AAAAAAAAAAAAA")
                    // console.log(event.event.extendedProps.image)
                    // console.log(element)
                    
                    if (event.event.extendedProps.image) {
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
                    // console.log("Ayuda")
                },
               //eventDrop: info => { console.log('event drag start', info) },
               eventClick: info => { 
                    this.clickedEvent = '' + info.event.id
                    this.event('fceventclick', info) },
               //eventMouseEnter: info => {console.log("mouse enter", info) },
               //dateClick: info => { this.event('fcdateclick', info) },   
                     
        })
        const info = await getUserLogInfo()
        this.userName = info[0].split(" ")[0]
        this.calendar.render()
        this.calendarLabel = this.calendar.view.title
        this.paintHolidayDays()
        this.showEvents()
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
          

          // Verifica si se encontró una coincidencia
          const eventsToAdd = events.map(event => {
               event.id = event.id
               event.title = event.title
               event.start = event.start
               event.end = event.end
               event.image = event.img
               // console.log(event.image)
               this.calendar.addEvent(event)
               // console.log(event.image)
          })
          

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


