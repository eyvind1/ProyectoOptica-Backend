import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';
import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';


/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient         = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_ACCESORIO = "Accesorios";
const TABLE_NAME_LUNA      = "Lunas";
const TABLE_NAME_MONTURAS  = "Monturas";


async function sortArrayJsonByDate(arrayJson,nameOfTable){
    arrayJson.sort((a, b) => {
        if(nameOfTable==='Lunas'){
            return new Date(b.fecha_creacion_luna) - new Date(a.fecha_creacion_luna); // descending order
        }
        if(nameOfTable==='Monturas'){
            return new Date(b.fecha_creacion_monturas) - new Date(a.fecha_creacion_monturas); // descending order
        }
        if(nameOfTable==='Accesorios'){
            return new Date(b.fecha_creacion_accesorio) - new Date(a.fecha_creacion_accesorio); // descending order
        }
      })
      return arrayJson;
}

/* Esta funcion lista todas las sedes que se encuentran con "estado = Habikitado" 
    Cabe recalcar que el product name que viene por parametro debe ser [luna, accesorio,montura] 
    es decir en minuscula y en singular
*/

export const getProductBySede = async (req, res) => {
    let id_sede       = req.params.idSede;
    let product_name  = req.params.productName;
    const nameOfTable = product_name.replace(product_name[0],product_name[0].toUpperCase())+'s';
    try{
        const params = {
            TableName: nameOfTable,
            FilterExpression : "#habilitado = :valueHabilitado and #idsede =:idsede",
            ExpressionAttributeValues: {
                ":valueHabilitado": true,
                ":idsede": id_sede
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado",
                "#idsede": "id_sede"
            }
        };
        const sedes = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(sedes.Items,nameOfTable); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};

/* Funcion que guarda productos en la base de datos a partir de un excel en el front o un JSON 

*/

/* Funcion para darle formato de dos digitos al mes, dia y 4 digito al anio ... 01-02-2022*/ 
/*function castIsoDateToDate(fecha){
    const date = new Date(fecha);
    //const timestamp = date
    let mes     = (date.getMonth()+1).toString();
    let anio    = date.getFullYear();
    let dia     = date.getDate().toString();
    let hora    = date.getHours().toString();
    if (mes.length < 2) {
        mes = '0' + mes;
    }
    if (dia.length < 2) {
        dia = '0' + dia;
    }
    if (hora.length < 2) {
        hora = '0' + hora;
    }
    const result = (dia+mes+ anio);
    return result;
}
*/
/* Esta funcion valida al inicio que el array que contiene todos los productos(Excel) no tenga numero de orden repetido */ 
/* Falta Validar esta funcion ojo */  
/*async function validarNroOrdenExcel(arrayProductos){
    const busqueda = arrayProductos.reduce((acc, element) => {
        acc[element.num_orden] = ++acc[element.num_orden] || 0;
        return acc;
      }, {});
      const duplicados = arrayProductos.filter( (element) => {
          return busqueda[element.num_orden];
      });
    return duplicados;
}
*/

export const createListOfProducts=async(req,res)=>{
    const array_productos = req.body;
    const tipo            = array_productos[0].tipo;
    // Le damos formato al string =>  luna = Lunas, accesorio = Acecesorio, montura = Monturas
    //const nameOfTable     = tipo.replace(tipo[0],tipo[0].toUpperCase())+'s';

    //Valido que no haya "Nro_Orden" repetidos en el excel
    /*let validarExcel = await validarNroOrdenExcel(array_productos);
    if(validarExcel.length > 0){
        return res.status(400).json({
            message:'En el excel hay numeros de orden repetidos'
        })
    }
    const validarNro = await Promise.all(
                array_productos.map(async(row,i)=>{   
                    const params = {    
                        TableName: nameOfTable,
                        FilterExpression: 'num_orden = :num_orden',
                        ExpressionAttributeValues: {
                            ":num_orden": parseInt(row.num_orden)
                        }
                    };
                    let result= await  dynamoClient.scan(params).promise(); 
                    return result.Count
                })
    )*/
    //Valido que no se repitan numeros de ordon con la BD
    /*if(validarNro.includes(1) === true ){
        return res.status(400).json({
            message:'Los numeros de orden ya existen en la BD'
        })
    }*/
    //Si paso los 2 filtros de arriba recien inserto
    try {
        if(tipo === 'montura'){
            array_productos.map(async(row,i,arr)=>{    
                const id_producto  = v4() + codeForTables.tablaMonturas;
                //const {id_sede,num_orden,tipo,habilitado,color,cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = row;
                const {id_sede,tipo,habilitado,color,cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = row;
                //Para generar el codigo interno
                //let formatoFecha   = castIsoDateToDate(fecha_creacion_monturas);
                //let codigo_interno = num_orden.toString()+ formatoFecha+prefixesForProducts.ProdMontura; 
                const datosMontura = {
                    id_producto,
                    tipo,
                    //num_orden,
                    color,
                    cantidad,
                    habilitado,
                    codigo,
                    id_sede,
                    //codigo_interno,
                    fecha_creacion_monturas,
                    fecha_modificacion_monturas,
                    marca,
                    material,
                    precio_montura_c,
                    precio_montura_v,
                    talla
                }
                //Intento crear las monturas
                try {
                    const monturas = await dynamoClient.put({
                        TableName: TABLE_NAME_MONTURAS,
                        Item: datosMontura  
                    }).promise()
                    if(arr.length-1 === i){
                        res.json(monturas);
                    }           
                } catch (error) {
                    return res.status(500).json({
                        message:error
                    })
                }
            });
        }
        else if(tipo === 'luna'){
            array_productos.map(async(row,i,arr)=>{
                const id_producto = v4() + codeForTables.tablaLunas;
                //const {id_sede,num_orden,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = row;
                const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = row;
                //let formatoFecha   = castIsoDateToDate(fecha_creacion_luna);
                //let codigo_interno = num_orden.toString()+ formatoFecha+prefixesForProducts.ProdLuna; 

                const datosLuna = {
                    id_producto,
                    //num_orden,
                    id_sede,
                    tipo,
                    //codigo_interno,
                    habilitado,
                    fecha_creacion_luna,
                    fecha_modificacion_luna,
                    material,
                    cantidad,
                    precio_luna_c,
                    precio_luna_v,
                }
                //Intento crear lunas
                try {
                    const lunas = await dynamoClient.put({
                        TableName: TABLE_NAME_LUNA,
                        Item: datosLuna
                    }).promise()
                    if(arr.length-1 === i){
                        res.json(lunas); 
                    }           
                } 
                catch (error) {
                    console.log(error);
                    delete array_productos[0];
                    return res.status(500).json({
                        message:'Algo anda mal',
                    })
                }
            })
        }
        else if(tipo === 'accesorio'){
            array_productos.map(async(row,i,arr)=>{
                const id_producto  = v4() + codeForTables.tablaAccesorios;
                //const {habilitado,num_orden,tipo,nombre_accesorio,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = row;
                const {habilitado,tipo,nombre_accesorio,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = row;
                //let formatoFecha   = castIsoDateToDate(fecha_creacion_accesorio);
                //let codigo_interno = num_orden.toString()+ formatoFecha+prefixesForProducts.ProdAccesorio; 
                const datosAccesorio = {
                    id_producto,
                    tipo,
                    //num_orden,
                    cantidad,
                    id_sede,
                    //codigo_interno,
                    habilitado,
                    nombre_accesorio,
                    fecha_creacion_accesorio,
                    fecha_modificacion_accesorio,
                    precio_accesorio_c,
                    precio_accesorio_v,
                }
                //Intento crear los accesorios
                try {
                    const accesorios = await dynamoClient.put({
                        TableName: TABLE_NAME_ACCESORIO,
                        Item     : datosAccesorio
                    }).promise()    
                    if(arr.length-1 === i){
                        res.json(accesorios);
                    }           
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({
                        message:'Algo anda mal'
                    })
                }
            })
        }
    } catch (error) {
        return res.status(500).json({
            message:error
        })
    }
}

/* Esta funcion queda pendiente cuadno se envian 2 o mas productos y uno falla en su ID se salta al otro y al retornar
sale cannot set headers before ..... entonces al encontrar al menos un id fallido debe retornar error defrente */

export const updateListOfProducts=async(req,res)=>{
    try {
        const array_productos = req.body;
        const tipo = array_productos[0].tipo;
        const fecha_actual    = new Date();
        // const nameOfTable     = tipo.replace(tipo[0],tipo[0].toUpperCase())+'s';

        // //Validamos que todos los productos existan en la base de datos antes de editarlos
        // const validarProducto = await Promise.all(
        //     array_productos.map(async(row,i)=>{   
        //         const params = {    
        //             TableName: nameOfTable,
        //             FilterExpression: 'num_orden = :num_orden',
        //             ExpressionAttributeValues: {
        //                 ":num_orden": parseInt(row.num_orden)
        //             }
        //         };
        //         let result= await  dynamoClient.scan(params).promise(); 
        //         return result.Count
        //     })
        // )
        // //Valido que no se repitan numeros de ordon con la BD
        // if(validarProducto.includes(1) === true ){
        //     return res.status(400).json({
        //         message:'Los numeros de orden ya existen en la BD'
        //     })
        // }

        if(tipo ==='montura'){
            let validarErrorMontura  = false;
            array_productos.map(async(row,i,arr)=>{
                const params = {
                    TableName: 'Monturas',
                    Key: {
                        "id_producto":row.id_producto,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, fecha_modificacion_monturas = :fecha_modificacion_monturas,
                                            precio_montura_c=:precio_montura_c,precio_montura_v=:precio_montura_v`,
                    ConditionExpression: "id_producto = :id_montura", 
                    ExpressionAttributeValues: {
                        ":id_montura" : row.id_producto,
                        ":cantidad" : row.cantidad,
                        ":fecha_modificacion_monturas": fecha_actual,
                        ":precio_montura_c"   : row.precio_montura_c,
                        ":precio_montura_v"   : row.precio_montura_v,
                    }
                };
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    console.log(product);    
                    if(arr.length-1 === i && validarErrorMontura===false){
                        res.json(product);
                    }           
                } catch (error) {
                    validarErrorMontura  = true;
                    let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                    return res.status(400).json({
                        message:'Productos actualizados correctamente, excepto el producto en la posicion: '+ errorPosicion
                    })
                }
            });
        }
        else if(tipo ==='luna'){
            let validarErrorLuna  = false;
            array_productos.map(async(row,i,arr)=>{
                const params= {
                    TableName: 'Lunas',
                    Key: {
                        "id_producto":row.id_producto,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, fecha_modificacion_luna=:fecha_modificacion_luna
                                                        ,precio_luna_c=:precio_luna_c,precio_luna_v=:precio_luna_v`,
                    ConditionExpression: "id_producto = :id_luna", 
                    ExpressionAttributeValues: {
                        ":id_luna" : row.id_producto,
                        ":cantidad" : row.cantidad,
                        ":fecha_modificacion_luna": fecha_modificacion_luna,
                        ":precio_luna_c"   : row.precio_luna_c,
                        ":precio_luna_v"   : row.precio_luna_v
                    }
                };     
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    console.log(product);    
                    if(arr.length-1 === i && validarErrorLuna===false){
                        res.json(product); 
                    }           
                } catch (error) {
                    validarErrorLuna  = true;
                    let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                    return res.status(400).json({
                        message:'Productos actualizados correctamente, excepto el producto en la posicion: '+ errorPosicion
                    })
                }
            })
        }
        else if(tipo === 'accesorio'){
            let validarErrorAccesorio  = false;
            array_productos.map(async(row,i,arr)=>{
                const params = {
                    TableName: 'Accesorios',
                    Key: {
                        "id_producto":row.id_producto,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, 
                                            fecha_modificacion_accesorio = :fecha_modificacion_accesorio,
                                            precio_accesorio_c=:precio_accesorio_c,
                                            precio_accesorio_v=:precio_accesorio_v`,
                    ConditionExpression: "id_producto = :id_accesorio", 
                    ExpressionAttributeValues: {
                        ":id_accesorio" :row.id_producto, 
                        ":cantidad"     : row.cantidad,
                        ":fecha_modificacion_accesorio" : row.fecha_modificacion_accesorio,
                        ":precio_accesorio_c"   : row.precio_accesorio_c,
                        ":precio_accesorio_v"   : row.precio_accesorio_v
                    }
                };
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    if(arr.length-1 === i && validarErrorAccesorio===false){
                        return res.json(product);
                    }           
                } catch (error) {
                    validarErrorAccesorio  = true;
                    let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                    return res.status(400).json({
                        message:'Productos actualizados correctamente, excepto el producto en la posicion: '+ errorPosicion
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
}