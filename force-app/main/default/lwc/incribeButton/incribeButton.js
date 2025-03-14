import { LightningElement, wire, track, api } from "lwc";
import inscribeUser from "@salesforce/apex/UserInformation.inscribeUser";
import {
  subscribe,
  MessageContext,
  APPLICATION_SCOPE,
  unsubscribe,
  createMessageContext,
  releaseMessageContext
} from "lightning/messageService";
import messageChannel from "@salesforce/messageChannel/MyChannel__c";
import setRelationship from "@salesforce/apex/MyCalendarController.setRelationship";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class NavigateButton extends LightningElement {
  idToRecord = "";
  subscription = null;
  // messageContext = createMessageContext()

  @api textMessage;
  @api recordId;
  @track name = "";
  @track email = "";
  @track observations = "";

  connectedCallback() {
    console.log("Antes de subscribirse");
    // if (this.subscription) {
    //     return
    // } else {
    //     this.indication = 'SUBSCRIBED'
    // }
    // this.subscription = subscribe(this.messageContext, messageChannel, (message) => {this.idToRecord =message.messageToSend},{scope:APPLICATION_SCOPE})
    console.log(this.recordId);
    // console.log(this.idToRecord)
    console.log("Despues de subscribirse");
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
    this.idToRecord = "";
    //releaseMessageContext(this.context)
  }

  handleChangeName(event) {
    this.name = event.target.value;
    console.log(this.name);
  }

  handleChangeEmail(event) {
    this.email = event.target.value;
    console.log(this.email);
  }

  handleChangeObservations(event) {
    this.observations = event.target.value;
    console.log(this.observations);
  }

  async handleClick() {
    console.log("Antes de clickar el inscribete");
    console.log(typeof this.recordId);
    console.log(typeof this.name);
    console.log(typeof this.email);
    console.log(typeof this.observations);
    console.log("Despues de clickar el inscribete");
    const number = await setRelationship({
      id: this.recordId,
      email: this.email,
      name: this.name,
      observations: this.observations
    });
    if (number == 0) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Ya estaba registado para el evento",
        variant: "success"
      });
      this.dispatchEvent(event);
    }
    if (number == 1) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Su registro para el evento ha sido procesado con exito",
        variant: "success"
      });
      this.dispatchEvent(event);
    }
    console.log(number);
  }
  catch(error) {
    console.log(error);
  }
}
