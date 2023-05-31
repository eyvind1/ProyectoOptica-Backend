import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';
import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';


/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient         = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_ACCESORIO = "Accesorios";
const TABLE_NAME_LUNA      = "Lunas";
const TABLE_NAME_SEDE      = "Sedes";
const TABLE_NAME_MONTURAS  = "Monturas";

async function validarSedes(idSede){
    const params = {    
        TableName: TABLE_NAME_SEDE,
        FilterExpression: 'id_sede = :id_sede',
        ExpressionAttributeValues: {
            ":id_sede": idSede
        }
    }
    let result = await dynamoClient.scan(params).promise(); 
    return result.Count

}
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
        const scanResults = [];
        let items;
        do{
            items = await dynamoClient.scan(params).promise();
            items.Items.forEach((item) => scanResults.push(item));
            params.ExclusiveStartKey = items.LastEvaluatedKey;
        }while(typeof items.LastEvaluatedKey !== "undefined");
        const rpta     = await sortArrayJsonByDate(scanResults,nameOfTable); 
        return res.json(rpta);     
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const createListOfProducts=async(req,res)=>{
    const array_productos = req.body;
    const tipo            = array_productos[0].tipo;
    //Valido que la sede exista en el primer elemento, porque en el front se valida el resto
    let validarSede = await validarSedes(array_productos[0].id_sede);
    if(validarSede===0){
        return res.status(400).json({
            message:'La sede no existe'
        })
    }
    //Si paso los  filtros de arriba recien inserto
    try {
        if(tipo === 'montura'){
            array_productos.map(async(row,i,arr)=>{    
                const id_producto  = v4() + codeForTables.tablaMonturas;
                const {id_sede,tipo,habilitado,color,codigo_montura,cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = row;
                const datosMontura = {
                    id_producto,
                    tipo,
                    color,
                    codigo_montura,
                    cantidad,
                    habilitado,
                    codigo,
                    id_sede,
                    fecha_creacion_monturas,
                    fecha_modificacion_monturas,
                    marca,
                    material,
                    precio_montura_c,
                    precio_montura_v,
                    talla,
                    //traslado
                }
                //Intento crear las monturas
                try {
                    const monturas = await dynamoClient.put({
                        TableName: TABLE_NAME_MONTURAS,
                        Item: datosMontura  
                    }).promise()
                    if(arr.length-1 === i){
                        return res.json(monturas);
                    }           
                } catch (error) {
                    console.log('ERROR *********** ', error)
                    return res.status(500).json({
                        message:error
                    })
                }
            });
        }
        else if(tipo === 'luna'){
            array_productos.map(async(row,i,arr)=>{
                const id_producto = v4() + codeForTables.tablaLunas;
                const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = row;
                const datosLuna = {
                    id_producto,
                    id_sede,
                    tipo,
                    habilitado,
                    fecha_creacion_luna,
                    fecha_modificacion_luna,
                    material,
                    cantidad,
                    precio_luna_c,
                    precio_luna_v,
                    //traslado
                }
                //Intento crear lunas
                try {
                    const lunas = await dynamoClient.put({
                        TableName: TABLE_NAME_LUNA,
                        Item: datosLuna
                    }).promise()
                    if(arr.length-1 === i){
                        return res.json(lunas); 
                    }           
                } 
                catch (error) {
                    return res.status(500).json({
                        message:error,
                    })
                }
            })
        }
        else if(tipo === 'accesorio'){
            array_productos.map(async(row,i,arr)=>{
                const id_producto  = v4() + codeForTables.tablaAccesorios;
                const {habilitado,tipo,nombre_accesorio,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = row;
                const datosAccesorio = {
                    id_producto,
                    tipo,
                    cantidad,
                    id_sede,
                    habilitado,
                    nombre_accesorio,
                    fecha_creacion_accesorio,
                    fecha_modificacion_accesorio,
                    precio_accesorio_c,
                    precio_accesorio_v,
                    //traslado
                }
                //Intento crear los accesorios
                try {
                    const accesorios = await dynamoClient.put({
                        TableName: TABLE_NAME_ACCESORIO,
                        Item     : datosAccesorio
                    }).promise()    
                    if(arr.length-1 === i){
                        return res.json(accesorios);
                    }           
                } catch (error) {
                    return res.status(500).json({
                        message:error
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
                    if(arr.length-1 === i && validarErrorMontura===false){
                        return res.json(product);
                    }           
                } catch (error) {
                    if(validarErrorMontura===false){
                        validarErrorMontura  = true;
                        let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion +' del excel'
                        })
                    }
                }
            });
        }
        else if(tipo ==='luna'){
            let validarErrorLuna  = false;
            array_productos.forEach(async(row,i) => {
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
                        ":fecha_modificacion_luna": row.fecha_modificacion_luna,
                        ":precio_luna_c"   : row.precio_luna_c,
                        ":precio_luna_v"   : row.precio_luna_v
                    }
                };     
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    if(array_productos.length-1 === i && validarErrorLuna===false){
                        return res.json(product); 
                    }           
                } catch (error) {
                    let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                    if(validarErrorLuna===false){
                        validarErrorLuna  = true;
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion +' del excel'
                        })
                    }
                }
            });
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
                    if(validarErrorAccesorio===false){
                        validarErrorAccesorio  = true;
                        let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion+' del excel'
                        })
                    }
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

export const updateSedeOfProducts=async(req,res)=>{
    try {
        const array_productos = req.body;
        const tipo = array_productos[0].tipo;
        const fecha_actual    = new Date();

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
                    if(arr.length-1 === i && validarErrorMontura===false){
                        return res.json(product);
                    }           
                } catch (error) {
                    if(validarErrorMontura===false){
                        validarErrorMontura  = true;
                        let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion +' del excel'
                        })
                    }
                }
            });
        }
        else if(tipo ==='luna'){
            let validarErrorLuna  = false;
            array_productos.forEach(async(row,i) => {
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
                        ":fecha_modificacion_luna": row.fecha_modificacion_luna,
                        ":precio_luna_c"   : row.precio_luna_c,
                        ":precio_luna_v"   : row.precio_luna_v
                    }
                };     
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    if(array_productos.length-1 === i && validarErrorLuna===false){
                        return res.json(product); 
                    }           
                } catch (error) {
                    let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                    if(validarErrorLuna===false){
                        validarErrorLuna  = true;
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion +' del excel'
                        })
                    }
                }
            });
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
                    if(validarErrorAccesorio===false){
                        validarErrorAccesorio  = true;
                        let errorPosicion      = i+2 // Le sumo dos por la cabecera del excel y por la pos del array
                        return res.status(400).json({
                            message:'Productos actualizados correctamente, excepto el producto en la fila: '+ errorPosicion+' del excel'
                        })
                    }
                }
            })
        }
    } catch (error) {
        return res.status(500).json({
            message:error
        })
    }
}