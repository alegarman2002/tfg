import { LightningElement, wire, track, api } from 'lwc'
import fullCalendar from "@salesforce/resourceUrl/fullCalendar"
import { NavigationMixin } from "lightning/navigation";
import { loadStyle, loadScript } from "lightning/platformResourceLoader"
//import { jsToApexDate } from 'c/calendarUtils'
import getEvents from '@salesforce/apex/MyCalendarController.getEvents'
import {publish, MessageContext, createMessageContext} from 'lightning/messageService'
import messageChannel from '@salesforce/messageChannel/MyChannel__c'
import getUserLogInfo from '@salesforce/apex/MyCalendarController.getUserLogInfo'

export default class MyCalendar extends NavigationMixin(LightningElement) {

    calendarLabel = ''
    calendar
    initialized = false
    clickedEvent = ''
    listUsedDays = []
    userName = ""

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
               eventMouseEnter: function (event, element) {     
                    console.log("Entra") 
                    console.log(event.event.title)              
                         var tool = document.createElement("p")
                         tool.textContent = event.event.title
                         tool.classList.add("tooltip")
                         tool.style.backgroundColor = "#ffffff"
                         document.body.appendChild(tool)
                    },
               eventMouseLeave: function (event, element) {     
                    console.log("Sale")               
                    // $('.tooltip').remove();
               },
               eventRender: function(event, elemen) {
                    var element = event.el
                    console.log("AAAAAAAAAAAAA")
                    console.log(event.event.extendedProps.image)
                    console.log(element)
                    
                    if (event.event.extendedProps.image) {
                         var timeElement = element.querySelector('span.fc-time');

                         // Crea un nuevo elemento span con la clase 'fc-image'
                         var imageElement = document.createElement('span');
                         imageElement.className = 'fc-image';

                         // Crea un elemento img y establece el atributo src con el valor de event.extendedProps.image
                         var imgElement = document.createElement('img');
                         imgElement.src = event.event.extendedProps.image;

                         // Agrega la imagen al elemento 'fc-image'
                         imageElement.appendChild(imgElement);

                         // Inserta el elemento 'fc-image' antes del elemento 'fc-time'
                         timeElement.parentNode.insertBefore(imageElement, timeElement);
                    }

                    
                    console.log("Ayuda")
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
        this.showEvents()
    }

    nextHandler() {
        this.calendar.next();
        this.calendarLabel  = this.calendar.view.title;
     //    this.paintFreeDays()

        // this.setDates()
   }
    
   previousHandler() {
        this.calendar.prev();
        this.calendarLabel  = this.calendar.view.title;
     //    this.paintFreeDays()
        // this.setDates()
   }
   
   today() {
        this.calendar.today();
        this.calendarLabel = this.calendar.view.title;
     //    this.paintFreeDays()
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
   

   paintFreeDays () {
     const currentDate = this.calendar.view.activeStart
     const endDate = this.calendar.view.activeEnd
     while(currentDate <= endDate) {
          const eventStart = currentDate.getFullYear() + "-" + (currentDate.getMonth()+1) + "-" + currentDate.getDate()
          if ((currentDate.getDay() == 0 || currentDate.getDay() == 6) &&  !(this.listUsedDays.includes(eventStart))) {
               this.listUsedDays.push(eventStart)
               const size = this.calendar.getEvents().length
               
               const event = {
                    id: eventStart,
                    start: eventStart,
                    end: eventStart,
                    rendering: 'background',
                    color: 'red'
               }
               console.log(this.calendar.addEvent(event))
               console.log(eventStart)
           }
          currentDate.setDate(currentDate.getDate() + 1)
          }

   
     }

     open_capgemini() {
          console.log("antes")
          window.open("https://www.capgemini.com/es-es/", "_blank")
          console.log("despues")
     }

     open_calculator() {
          window.open("/footprintcalculator", "_blank")
     }


   async showEvents() {
        try {
          const events = await getEvents()
          const eventsToAdd = events.map(event => {
               event.id = event.id
               event.title = event.title
               event.start = event.start
               event.end = event.end
               event.image = event.img
               this.calendar.addEvent(event)
               console.log(event.image)
          })
          

          //Parte para controlar el cambio de color del background

          
          
          // this.paintFreeDays()
          
         
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


