import { LightningElement } from "lwc";
import guardarDatos from "@salesforce/apex/CarbonFootprint.guardarDatos";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import imageLuz from "@salesforce/resourceUrl/ApagarLuz";
import imageBombilla from "@salesforce/resourceUrl/Bombilla";
import imageBicicleta from "@salesforce/resourceUrl/Bicicleta";
import imageLuzNatural from "@salesforce/resourceUrl/LuzNatural";
import imageTransportePublico from "@salesforce/resourceUrl/TransportePublico";

export default class calculadoraConsumoDesplazamiento extends LightningElement {
  randomIndex = Math.floor(Math.random() * 5);

  listImages = [
    imageLuz,
    imageBombilla,
    imageBicicleta,
    imageLuzNatural,
    imageTransportePublico
  ];
  listText = [
    "Recuerda apagar la luz cuando no la utilices",
    "Utiliza bombillas LED en vez de incandescentes",
    "Camina o usa la bicicleta en vez del coche",
    "Aprovecha la luz natural",
    "Siempre que puedas utiliza el transporte público"
  ];

  consumoElectrico = null;
  dias = 5;
  metodoElegido = null;
  valorMotor = null;
  consumo = null;
  integrantesCoche = 1;
  monitores = 1;
  tipoCalefaccion;
  calefaccion = 4;
  distancia = null;
  consumoMotorAnterior;
  metrosParaCalefaccion = null;
  numBombillas = null;
  tipoIluminacion = null;
  imageUrl = this.listImages[this.randomIndex];
  recomendationText = this.listText[this.randomIndex];

  renderedCallback() {
    this.numBombillas = localStorage.getItem("numeroBombillas");
    this.tipoIluminacion = localStorage.getItem("tipoIluminacion");
    this.metrosParaCalefaccion = localStorage.getItem("metrosParaCalefacción");

    this.consumoElectrico = localStorage.getItem("consumoElectrico");
    this.monitores = localStorage.getItem("monitores");
    this.tipoCalefaccion = localStorage.getItem("tipoCalefaccion");
    this.calefaccion = localStorage.getItem("calefaccion");
    this.consumoMotorAnterior = localStorage.getItem("consumoMotor");
  }

  get metodosDeTransporte() {
    return [
      { label: "Andando", value: "metodoAndando" },
      { label: "Bicicleta", value: "metodoBicicleta" },
      { label: "Coche", value: "metodoCoche" },
      { label: "Autobus", value: "metodoAutobus" },
      { label: "Tren", value: "metodoTren" }
    ];
  }

  get tiposDeMotor() {
    return [
      { label: "Gasolina", value: "motorGasolina" },
      { label: "Diesel", value: "motorDiesel" },
      { label: "Eléctrico", value: "motorElectrico" }
    ];
  }

  handleMethodOptionChange(event) {
    this.metodoElegido = event.detail.value;
    if (this.metodoElegido == "metodoCoche") {
      var input = this.template.querySelector('[data-id="consumoCoche"]');
      // console.log("Valor del input: ", input);
      input.style.display = "block";
      input = this.template.querySelector('[data-id="motorCoche"]');
      input.style.display = "block";
      input = this.template.querySelector('[data-id="integrantesCoche"]');
      input.style.display = "block";
    } else {
      var input = this.template.querySelector('[data-id="consumoCoche"]');
      // console.log("Valor del input: ", input);
      input.style.display = "none";
      input = this.template.querySelector('[data-id="motorCoche"]');
      input.style.display = "none";
      input = this.template.querySelector('[data-id="integrantesCoche"]');
      input.style.display = "none";
      input = this.template.querySelector(
        '[data-id="actualizacionConsumoCoche"]'
      );
      input.style.display = "none";
    }
  }

  handleMotorChange(event) {
    this.valorMotor = event.detail.value;
  }

  integCoche(event) {
    this.integrantesCoche = event.detail.value;
  }

  consElectrico(event) {
    this.consumoElectrico = event.detail.value;
  }

  dist(event) {
    this.distancia = event.detail.value;
  }

  cons(event) {
    var valorUltimoMes = parseFloat(this.consumoMotorAnterior);
    var input = this.template.querySelector(
      '[data-id="actualizacionConsumoCoche"]'
    );

    if (this.consumoMotorAnterior != -1) {
      this.consumo = parseFloat(event.detail.value);

      if (this.consumo < valorUltimoMes) {
        input.innerHTML =
          "Enhorabuena has reducido el consumo de tu coche en " +
          (valorUltimoMes - this.consumo) +
          " litros cada 100Km";
        input.style.display = "block";
      } else if (this.consumo == valorUltimoMes || this.consumo == NaN) {
        input.style.display = "none";
      } else {
        input.innerHTML =
          "Debes controlar el acelerador tu consumo del coche ha aumentado en " +
          (this.consumo - valorUltimoMes) +
          " litros cada 100Km";
        input.style.display = "block";
      }
    } else {
      this.consumo = parseFloat(event.detail.value);
    }
  }

  diasMes(event) {
    this.dias = event.detail.value;
  }

  moni(event) {
    this.monitores = event.detail.value;
  }

  cale(event) {
    this.calefaccion = event.detail.value;
  }

  async registrateData() {
    if (this.distancia == null) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Por favor completa todos los campos requeridos",
        variant: "error"
      });
      this.dispatchEvent(event);
      return;
    }
    if (this.metodoElegido == null) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Por favor completa todos los campos requeridos",
        variant: "error"
      });
      this.dispatchEvent(event);
      return;
    }

    if (
      this.metodoElegido == "metodoCoche" &&
      (this.consumo == null || this.valorMotor == null)
    ) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Por favor completa todos los campos requeridos",
        variant: "error"
      });
      this.dispatchEvent(event);
      return;
    }
    
    if (this.valorMotor == null) {
      this.valorMotor = ""
      this.consumo = 0
    }
    if (this.metrosParaCalefaccion == "null") {
      this.metrosParaCalefaccion = 0
    }
    var list = [
      this.consumoElectrico,
      this.dias,
      this.metodoElegido,
      this.valorMotor,
      this.consumo,
      this.integrantesCoche,
      this.monitores,
      this.tipoCalefaccion,
      this.calefaccion,
      this.distancia,
      this.metrosParaCalefaccion,
      this.numBombillas,
      this.tipoIluminacion
    ];
    console.log(list)
    var guardado = 1;
    await guardarDatos({ parametros: list }).then((atribute) => {
      guardado = atribute;
    });
    if (guardado == 1) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message: "Sus datos se han guardado correctamente",
        variant: "success"
      });
      // console.log("Antes")
      let botonSiguiente = this.template.querySelector(
        '[data-id="registrar"]'
      );
      // console.log("Despues")
      botonSiguiente.disabled = true;
      botonSiguiente.style.opacity = 0.5;
      this.dispatchEvent(event);
      setTimeout(() => {window.open("/s/", "_self")}, 3500);
    } else {
      const event = new ShowToastEvent({
        title: "Alerta",
        message:
          "Ha habido un problema guardando sus datos por favor reviselos y vuelva a enviarlos",
        variant: "error"
      });
      this.dispatchEvent(event);
    }
  }
}
