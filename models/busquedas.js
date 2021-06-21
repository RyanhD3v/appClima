const fs = require('fs');

const axios = require('axios');

class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //TODO: Leer BD si existe
        this.leerDB();
    }

    get historialCapitalizado(){
        //Capitalizar cada palabra
        return this.historial.map( lugar =>{

            let palabras = lugar.split(' ');
            palabras = palabras.map(p => p[0].toUpperCase() + p.substring(1) );

            return palabras.join( ' ' )

        } )
    }

    get paramsMapbox(){
        return{
            // process.env.MAPBOX_KEY manda a llamara el .env que contiene el token
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenW(){
        return{
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    async ciudad( lugar = '' ){
        //siempre es bueno hacer peticiones http a end points con bloque try catch 
        try {
            
            //petición HTTP
            const instance = axios.create({
                baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/madrid.json?access_token={aqui va el token}&limit=5&language=es');
            return resp.data.features.map( lugar => ({

                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
                
            }));

        } catch (error) {
            //para reventar la aplicacion usar un Throw
            //pero usaremos un arreglo vacio por si no escribieron correctamente en la peticion 
            return [];

        }

       // return [];//Retornar un arreglo con los lugares
    }

    //------------------------------------------------------------------------------------------------------------------------------------------

    async climaLugar( lat, lon){

    try {
        //Instance de axios.create()
        const instance = axios.create({
                //si la Url no trae https:// es necesario agregarselo 
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenW, lat, lon}
                
            });
            
            
        const resp = await instance.get();
        //Desestructuracion de arreglos
        const { weather, main } = resp.data;

        //resp.data
        return{
            desc: weather[0].description,
            min: main.temp_min,
            max: main.temp_max,
            temp: main.temp 
        }
    } catch (error) {
        console.log('Error desde el catch por que no esta compliendo el try '+error);
    }

    }
    //------------------------------------------------------------------------------------------------------------------------------------------
    agregarHistorial( lugar = '' ){

        //TODO: prevenir duplicados
        if (this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }

        this.historial = this.historial.splice(0,5);
        
        //agregar el lugar al principio del arreglo con unshift()
        this.historial.unshift( lugar.toLocaleLowerCase() );

        //Grabar en DB
        this.guardarDB();

    }

    //-----------------------------------------------------------------------------------------------------------------------------------------

    guardarDB(){

        const payload = {
            historial : this.historial
        };

            fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB(){

        if(!fs.existsSync(this.dbPath) ) return;
            
        
            const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
            const data = JSON.parse(info);

            this.historial = data.historial;
            

    }

    

}


module.exports = Busquedas;