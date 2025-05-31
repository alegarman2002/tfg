import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import iMonitor from "@salesforce/resourceUrl/iconoMonitor";
import comprobarUltimoGuardado from "@salesforce/apex/CarbonFootprint.comprobarUltimoGuardado";
import obtenerDatosUltimoMes from "@salesforce/apex/CarbonFootprint.obtenerDatosUltimoMes";
import imageLuz from "@salesforce/resourceUrl/ApagarLuz";
import imageBombilla from "@salesforce/resourceUrl/Bombilla";
import imageBicicleta from "@salesforce/resourceUrl/Bicicleta";
import imageLuzNatural from "@salesforce/resourceUrl/LuzNatural";
import imageTransportePublico from "@salesforce/resourceUrl/TransportePublico";
export default class Calculator extends LightningElement {
  //Obtenemos los valores de la ultima insercion que tenemos de datos para compararlos con los introducidos actualmente
  //De esta manera con el onchange le podemos enseñar al usuario como evolucionan los datos conforme los introduce
  //A su vez tenemos que tener en cuenta que cuando lo inyectemos en el proyecto no tenemos que crearlo
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
  numBombillas = null;
  metrosParaCalefaccion = null;
  dias = 5;
  metodoElegido;
  valorMotor;
  consumo = null;
  integrantesCoche = 1;
  monitores = 1;
  tipoCalefaccion = null;
  tipoIluminacion = null;
  calefaccion = 1;
  distancia = null;
  iconoMonitor = iMonitor;
  controlVecesQueAparece = 0;
  listaValoresAnteriores;
  imageUrl = this.listImages[this.randomIndex];
  recomendationText = this.listText[this.randomIndex];

  async renderedCallback() {
    console.log(this.randomIndex);

    if (this.controlVecesQueAparece === 0) {
      let guardado = await comprobarUltimoGuardado();
      if (guardado === 0) {
        this.controlVecesQueAparece = 1;
        const event = new ShowToastEvent({
          title: "Aviso",
          message:
            "Tenga en cuenta que actualmente no puede actualizar sus datos pues este mes ya los ha actualizado",
          variant: "error"
        });
        this.dispatchEvent(event);
        let botonSiguiente = this.template.querySelector(
          '[data-id="buttonSig"]'
        );
        botonSiguiente.disabled = true;
        botonSiguiente.style.opacity = 0.5;
      }
      console.log("Antes de la llamada");
      this.listaValoresAnteriores = await obtenerDatosUltimoMes();
      if (this.listaValoresAnteriores != null) {
        this.listaValoresAnteriores = this.listaValoresAnteriores[0];
      }
      console.log("Lista valores anteriores", this.listaValoresAnteriores);
    }
  }

  get tiposDeIluminacion() {
    return [
      { label: "No utilizo iluminación", value: "sinIluminacion" },
      { label: "Iluminación LED", value: "tipoLED" },
      { label: "Iluminación incandescente", value: "tipoIncandescente" }
    ];
  }

  get tiposDeCalefaccion() {
    return [
      { label: "No utilizo calefacción", value: "sinCalefaccion" },
      { label: "Electrica", value: "tipoElectrica" },
      { label: "Gas", value: "tipoGas" }
    ];
  }

  saveMonitor() {
    this.monitores = this.template.querySelector("[data-id='input-17']").value;
    // console.log(this.monitores)
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

  diasMes(event) {
    this.dias = event.detail.value;
  }

  moni(event) {
    this.monitores = event.detail.value;
  }

  cale(event) {
    //Mismo procedimiento que con el consumo electrico
    var valorUltimoMes = this.listaValoresAnteriores.UsoCalefaccion__c;

    var input = this.template.querySelector(
      '[data-id="actualizacionHorasUsoCale"]'
    );

    console.log(valorUltimoMes);
    console.log(valorUltimoMes - this.calefaccion);
    this.calefaccion = event.detail.value;

    if (this.calefaccion < valorUltimoMes) {
      input.innerHTML =
        "Enhorabuena has reducido tus horas de uso de la calefaccion en " +
        (valorUltimoMes - this.calefaccion);
      input.style.display = "block";
    } else if (this.calefaccion == valorUltimoMes) {
      input.style.display = "none";
    } else {
      input.innerHTML =
        "Vaya parece que el tus horas de uso de calefaccion ha aumentado en " +
        (this.calefaccion - valorUltimoMes);
      input.style.display = "block";
    }
  }

  handleIluminationOptionChange(event) {
    this.tipoIluminacion = event.detail.value;
    if (this.tipoIluminacion != "sinIluminacion") {
      var input = this.template.querySelector('[data-id="numeroBombillas"]');
      input.style.display = "block";
      // var margin = this.template.querySelector('data')
    } else {
      var input = this.template.querySelector('[data-id="numeroBombillas"]');
      input.style.display = "none";
    }
  }

  handleHeatingOptionChange(event) {
    this.tipoCalefaccion = event.detail.value;
    if (this.tipoCalefaccion != "sinCalefaccion") {
      var input = this.template.querySelector('[data-id="horasDeUso"]');
      input.style.display = "block";
      input = this.template.querySelector('[data-id="metrosParaCalefaccion"]');
      input.style.display = "block";
    } else {
      var input = this.template.querySelector('[data-id="horasDeUso"]');
      input.style.display = "none";
      input = this.template.querySelector('[data-id="metrosParaCalefaccion"]');
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
    //Tenemos que obtener el valor del ultimo mes que estaria almacenado en
    var valorUltimoMes = this.listaValoresAnteriores.ConsumoElectrico__c;
    var input = this.template.querySelector(
      '[data-id="actualizacionConsumoElectrico"]'
    );

    console.log(valorUltimoMes);
    console.log(valorUltimoMes - this.consumoElectrico);
    this.consumoElectrico = event.detail.value;

    if (this.consumoElectrico < valorUltimoMes) {
      input.innerHTML =
        "Enhorabuena has reducido tu consumo electrico en " +
        (valorUltimoMes - this.consumoElectrico) +
        "Wh";
      input.style.display = "block";
    } else if (this.consumoElectrico === valorUltimoMes) {
      input.style.display = "none";
    } else {
      input.innerHTML =
        "Vaya parece que el tu consumo ha aumentado en " +
        (this.consumoElectrico - valorUltimoMes) +
        "Wh";
      input.style.display = "block";
    }
  }

  metrosCale(event) {
    this.metrosParaCalefaccion = event.detail.value;
  }

  bombillas(event) {
    this.numBombillas = event.detail.value;
  }

  dist(event) {
    this.distancia = event.detail.value;
  }

  cons(event) {
    this.consumo = event.detail.value;
  }

  async registrateData() {

        if (
      this.consumoElectrico == null ||
      this.numBombillas < 0 ||
      this.consumoElectrico < 0 ||
      this.metrosParaCalefaccion < 0 ||
      this.tipoCalefaccion == null ||
      this.tipoIluminacion == null
    ) {
      const event = new ShowToastEvent({
        title: "Alerta",
        message:
          "Por favor completa todos los campos requeridos con información correcta",
        variant: "error"
      });
      this.dispatchEvent(event);
      return;
    }
    if (
      (this.tiposDeCalefaccion == "sinCalefaccion")
    ) {
      this.metrosParaCalefaccion = 0
    }
    if (this.tipoIluminacion == "sinIluminacion") {
      this.numBombillas = 0
    }


    localStorage.setItem("consumoElectrico", this.consumoElectrico);
    localStorage.setItem("monitores", this.monitores);
    localStorage.setItem("tipoCalefaccion", this.tipoCalefaccion);
    localStorage.setItem("calefaccion", this.calefaccion);
    localStorage.setItem(
      "consumoMotor",
      this.listaValoresAnteriores.ConsumoMotor__c
    );
    localStorage.setItem("numeroBombillas", this.numBombillas);
    localStorage.setItem("tipoIluminacion", this.tipoIluminacion);
    localStorage.setItem("metrosParaCalefacción", this.metrosParaCalefaccion);

    window.open("/s/footprintcalculatorpart2", "_self");

  }


}
