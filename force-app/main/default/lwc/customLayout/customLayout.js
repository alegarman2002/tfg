import { LightningElement, api, wire, track } from 'lwc';
import getEventInfo  from '@salesforce/apex/MyCalendarController.getEventInfo'
import getUserInformation from '@salesforce/apex/MyCalendarController.getUserInformation'
import getUserLogInfo from '@salesforce/apex/MyCalendarController.getUserLogInfo'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import setRelationship from '@salesforce/apex/MyCalendarController.setRelationship'
import compareEventsId from '@salesforce/apex/MyCalendarController.compareEventsId'
export default class CustomLayout extends LightningElement {

    startDateTime = ""
    endDateTime = ""
    ownerName = ""
    ownerEmail = ""
    description = ""
    location = ""
    eventName = ""
    timeOfEvent = ""
    eventid = ""
    fechaDeInicioEvento = ""
    imageUrl

    @track name = ''
    @track email = ''
    @track observations = ''

    @track showForm = false;
    


    async renderedCallback() {
        try {
            // this.eventId = localStorage.getItem('event')
            this.init()
            var control = 0;
            await compareEventsId({id: this.eventid}).then((atribute => {control = atribute}))
            console.log(control)
            if (control == 1) {
                var alerta = this.template.querySelector('[data-id="controlRegistration"]')
                alerta.style.display = 'block'
                alerta = this.template.querySelector('[data-id="button"]')
                alerta.style.display = 'none'
            }

        } catch (error) {
            console.error("Error when loading scripts", error)
        }
    }


    async init() {

        const currentUrl = window.location.href

        // Dividir la URL por "/"
        const urlParts = currentUrl.split("/")
        // console.log(currentUrl)
        // console.log("Antes de obtener la id")
        const tracker = urlParts[urlParts.indexOf("s") + 2]
        // console.log(tracker)
        this.eventid = tracker
        // console.log(this.eventid)
        // console.log("Antes de obtener atributos")
        let myData = null
        await getEventInfo({id: tracker}).then((atribute) => {myData = (atribute)})
        // console.log(myData.length)
        

        const owner = myData[0]
        // console.log(owner)
        let ownerData = null
        // console.log("Obtenemos el valor de los atributos del propietario del evento")
        await getUserInformation({eventId: owner}).then((atribute => {ownerData = atribute}))
        const ownerName = ownerData
        // console.log(ownerName)
        const description = myData[1]
        // console.log(description)
        const startDateTime = myData[2]
        // console.log(startDateTime)
        const endDateTime = myData[3]
        // console.log(endDateTime)
        const email = myData[4]
        // console.log(email)
        const location = myData[5]
        // console.log(location)
        const eventName = myData[6]
        // console.log(eventName)
        var imageUrl = myData[7]
        // console.log(imageUrl)

        this.fechaDeInicioEvento = new Date(startDateTime)
        let dateObjectEnd = new Date(endDateTime)
        let daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]


        let dayStart = this.fechaDeInicioEvento.getDate(); // Día del mes (1-31)
        let dayEnd = dateObjectEnd.getDate()
        let monthDayStart = this.fechaDeInicioEvento.getMonth() + 1 // Mes (0-11), sumamos 1
        let yearStart = this.fechaDeInicioEvento.getFullYear()
        let yearEnd = dateObjectEnd.getFullYear()

        let dayOfWeekStart = daysOfWeek[this.fechaDeInicioEvento.getDay()]
        let dayOfWeekEnd = daysOfWeek[dateObjectEnd.getDay()]
        let monthStart = months[this.fechaDeInicioEvento.getMonth()]
        let monthEnd = months[dateObjectEnd.getMonth()]


        // Suponiendo que timeOfEvent tiene el formato "11:00 - 16:00"
        this.timeOfEvent = startDateTime.split(" ")[1].substr(0,5) + " - " + endDateTime.split(" ")[1].substr(0,5)


        // Dividir la cadena en la parte de inicio y fin
        const [start, end] = this.timeOfEvent.split(" - ");


        // Obtener las horas y minutos de inicio
        var [startHour, startMinute] = start.split(":").map(Number);


        // Obtener las horas y minutos de fin
        var [endHour, endMinute] = end.split(":").map(Number);

        // Sumar una hora a ambas partes
        const newStartHour = startHour + 1;
        const newEndHour = endHour + 1;

        if (endMinute == 0) {
            endMinute = "00"
        }
        if (startMinute == 0) {
            startMinute = "00"
        }

        // Formatear las nuevas horas
        const newStart = `${newStartHour.toString().padStart(2, "0")}:` + startMinute;
        const newEnd = `${newEndHour.toString().padStart(2, "0")}:` + endMinute;

        
        // Formar la cadena del resultado
        const newTimeOfEvent = `${newStart} - ${newEnd}`;
        this.timeOfEvent = newTimeOfEvent
        
        
        

        this.startDateTime = dayOfWeekStart + " " + dayStart + ", " + monthStart + ", " + yearStart + " - " + dayOfWeekEnd + " " + dayEnd + ", " + monthEnd + ", " + yearEnd
        this.endDateTime = endDateTime
        this.ownerName = ownerName
        this.ownerEmail = email
        this.description = description
        this.location = location
        this.eventName = eventName
        this.imageUrl = imageUrl

        
        
    }

    handleChangeName(event) {
        this.name = event.target.value
        console.log(this.name)
    }

    handleChangeEmail(event) {
        this.email = event.target.value
        console.log(this.email)
    }

    handleChangeObservations(event) {
        this.observations = event.target.value
        console.log(this.observations)
    }

    async registerForEvent() {
        const fechaActual = new Date()
        if (fechaActual.getTime() > this.fechaDeInicioEvento.getTime() ) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'El evento en el que se intenta registrar ya ha empezado',
                variant: 'success',
            });
            this.dispatchEvent(event);
            return
        }
        let listOfAttributes = null
        console.log("Entra por aqui")
        await getUserLogInfo().then(atribute => {listOfAttributes = atribute})
        console.log("Obtenemos los valores")
        const name = listOfAttributes[0]
        const email = listOfAttributes[1]
        console.log(name)
        console.log(email)

        const number = await setRelationship({
            id: this.eventid,
            email: email,
            name: name,
            // observations: this.observations
        })
        console.log(number)

        if (number == 0) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Ya estaba registado para el evento',
                variant: 'error',
            });
            this.dispatchEvent(event);
        }
        if (number == 1) {
            const event = new ShowToastEvent({
                title: 'Alerta',
                message: 'Su registro para el evento ha sido procesado con exito',
                variant: 'success',
            });
            this.dispatchEvent(event);
        }
        console.log(number)
        

        } catch (error) {
        console.log(error)
    }
    

}