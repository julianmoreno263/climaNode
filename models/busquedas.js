const fs = require("fs");
const axios = require("axios");

class Busquedas {
  historial = [];
  dbPath = "./db/database.json";

  constructor() {
    //TODO;leer db si existe
    this.leerDB();
  }

  //getter para poner las primeras letras de las palabras en mayuscula de las ciudades
  get historialCapitalizado() {
    //capitalizar

    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));

      return palabras.join(" ");
    });
  }

  //parmetros para mapboxAPI
  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  //parametros para openweather API
  get paramsOpenWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metrics",
      language: "es",
    };
  }

  //metodo para buscar la ciudad
  async ciudad(lugar = "") {
    try {
      //peticion http

      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json `,
        params: this.paramsMapbox,
      });

      const resp = await instance.get(); //esta es en si la peticion ya con las variables creadas con axios
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lng: lugar.center[0],
        lat: lugar.center[1],
      }));
      return []; //retornar las ciudades
    } catch (error) {
      return [];
    }
  }

  //metodo para buscar el clima

  async climaLugar(lat, lon) {
    try {
      //crear instancia de axios.create()
      const instance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}`,
        params: { ...this.paramsOpenWeather, lat, lon },
      });

      //de la respuesta extraer la data
      const resp = await instance.get(); //esta es en si la peticion ya con las variables creadas con axios
      //desestructuro de resp.data(data es el nombre del array que engloba a todos los demas objetos que traen la informacion de la consulta,podemos hacer un console.log(resp) para verlo)
      const { weather, main } = resp.data; //del res.data(osea de la respuesta extraigo los objetos weather y  main que es donde esta la informacion de los datos que necesito, estan en estos dos objetos diferentes entonces los extraigo asi, pero como weather es un array y dentro tiene su objeto entonces para sacar la informacion de la descripcion debo especificarle el indice del objeto,osea, como weather tiene solo un elemento que e s un objeto, ese elemento tiene la posicion 0,hay que especificarla para poder llegar al parametro que necesito,o si no me sale undefined en la descripcion.)

      //aqui retorno facil lo que necesito despues d erealizar la desestructuracion
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp,
      };
    } catch (error) {
      console.log(error);
    }
  }

  //funcion para agregar el historial
  agregarHistorial(lugar = "") {
    //realizar validacion para no guardar lugares repetidos
    if (this.historial.includes(lugar.toLowerCase())) {
      return;
    }

    //para mantener siempre solo 6 ciudades en mi historial
    this.historial = this.historial.splice(0, 5);

    //añadimos el lugar al array historial con el metodo unshift(cada elemento se pone al inicio)
    this.historial.unshift(lugar.toLowerCase());

    //grabar en DB
    this.guardarDB();
  }

  //metodos para guardar en la DB y para leer en DB
  guardarDB() {
    //creamos el archivo de texto y guardar el historial en ese archivo.
    const payload = {
      historial: this.historial,
    };
    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    //validar si existe la DB
    if (!fs.existsSync(this.dbPath)) {
      //aqui si el archivo de la db no existe se termina todo con el return
      return;
    }

    //si existe
    const info = fs.readFileSync(this.dbPath, { encoding: "utf-8" });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
