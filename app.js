require("dotenv").config();

const {
  leerInput,
  pausa,
  inquirerMenu,
  listarLugares,
} = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        //mostrar mensaje para que la persona escriba
        const termino = await leerInput("Ciudad: ");

        //buscar las ciudades
        //utilizo la funcion ciudad para pasarle el lugar que escribio el usuario.

        const lugares = await busquedas.ciudad(termino);
        // console.log(lugares)

        //aqui cargo en consola la lista de ciudades y si elijo una me saca su id al poner {id}
        const id = await listarLugares(lugares);
        if (id === "0") continue; //esta linea evita que salga un error si cancelo

        //aqui encuentro un lugar seleccionado por su id para pasarlo y poder imprimirlo por consola, con find encuentro el primer lugar que haya en el array lugares, y los puedo pasar para verlos en consola.
        const lugarSelec = lugares.find((l) => l.id === id);
        // console.log(lugarSelec);

        //guardar las ciudades en el historial  en DB
        busquedas.agregarHistorial(lugarSelec.nombre);

        //tener los datos del clima
        const clima = await busquedas.climaLugar(
          lugarSelec.lat,
          lugarSelec.lng
        );
        // console.log(clima)

        //mostrar resultados
        console.clear();
        console.log("\nInformacion de la ciudad\n".green);
        console.log("Ciudad: ", lugarSelec.nombre.green);
        console.log("Latitud: ", lugarSelec.lat);
        console.log("Longitud: ", lugarSelec.lng);
        console.log("Temperatura: ", clima.temp);
        console.log("Mínima: ", clima.min);
        console.log("Máxima: ", clima.max);
        console.log("Como está el clima: ", clima.desc.green);

        break;

      case 2:
        //aqui mostramos el historial de las ciudades buscadas
        busquedas.historialCapitalizado.forEach((lugar,i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });

        break;

      default:
        break;
    }

    await pausa();
  } while (opt !== 0);
};

main();
