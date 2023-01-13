import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';
import {codeForTables,prefixesForProducts} from '../utils/codigosTablas.js';
import { customAlphabet} from 'nanoid';


/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient         = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_ACCESORIO = "Accesorios";
const TABLE_NAME_LUNA      = "Lunas";
const TABLE_NAME_MONTURAS  = "Monturas";


/* Esta funcion lista todas las sedes que se encuentran con "estado = Habikitado" */

export const getProductBySede = async (req, res) => {
    let id_sede      = req.params.idSede;
    let product_name = req.params.productName;
    try{
        const params = {
            TableName: product_name,
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
        res.json(sedes.Items);
    } 
     catch(error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
    }
};

/* Funcion que guarda productos en la base de datos a partir de un excel en el front o un JSON 

*/



export const createListOfProducts=async(req,res)=>{
    try {
        const array_productos = req.body;
        const tipo = array_productos[0].tipo;
        if(tipo === 'montura'){
            array_productos.map(async(row,i,arr)=>{    
                const id_montura   = v4() + codeForTables.tablaMonturas;
                const nanoid       = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',6)
                let codigo_interno = nanoid() + prefixesForProducts.ProdMontura; 

                const {id_sede,tipo,habilitado,color,cantidad,codigo,fecha_creacion_monturas,fecha_modificacion_monturas, marca, material, precio_montura_c,precio_montura_v, talla} = row;
                const datosMontura = {
                    id_montura,
                    tipo,
                    color,
                    cantidad,
                    habilitado,
                    codigo,
                    id_sede,
                    codigo_interno,
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
                    console.log(error)
                    return res.status(500).json({
                        message:'Algo anda mal'
                    })
                }
            });
        }
        else if(tipo === 'luna'){
            array_productos.map(async(row,i,arr)=>{
                const id_luna = v4() + codeForTables.tablaLunas;
                let codigo_interno = nanoid(8) + prefixesForProducts.ProdLuna;
                const {id_sede,tipo,cantidad,habilitado,fecha_creacion_luna,fecha_modificacion_luna, material, precio_luna_c,precio_luna_v} = row;
                const datosLuna = {
                    id_luna,
                    id_sede,
                    tipo,
                    codigo_interno,
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
                let codigo_interno  = nanoid(8) + prefixesForProducts.ProdAccesorio; 
                const id_accesorio  = v4() + codeForTables.tablaAccesorios;
                const {habilitado,tipo,nombre_accesorio,id_sede,cantidad,fecha_creacion_accesorio,fecha_modificacion_accesorio,precio_accesorio_c,precio_accesorio_v} = row;
                const datosAccesorio = {
                    id_accesorio,
                    tipo,
                    cantidad,
                    id_sede,
                    codigo_interno,
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
        console.log(error)
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
}

/* Esta funcion queda pendiente cuadno se envian 2 o mas productos y uno falla en su ID se salta al otro y al retornar
sale cannot set headers before ..... entonces al encontrar al menos un id fallido debe retornar error defrente */

export const updateListOfProducts=async(req,res)=>{
    try {
        const array_productos = req.body;
        const tipo = array_productos[0].tipo;
        const fecha_actual = new Date();
        if(tipo ==='montura'){
            array_productos.map(async(row,i,arr)=>{
                const params = {
                    TableName: 'Monturas',
                    Key: {
                        "id_montura":row.id_montura,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, codigo=:codigo, fecha_modificacion_monturas = :fecha_modificacion_monturas,
                                            marca=:marca, material=:material, precio_montura_c=:precio_montura_c,precio_montura_v=:precio_montura_v,
                                            talla=:talla, color=:color`,
                    ExpressionAttributeValues: {
                        ":cantidad" : row.cantidad,
                        ":codigo"   : row.codigo,
                        ":fecha_modificacion_monturas": fecha_actual,
                        ":marca"    : row.marca,
                        ":material" : row.material,
                        ":color" : row.color,
                        ":precio_montura_c"   : row.precio_montura_c,
                        ":precio_montura_v"   : row.precio_montura_v,
                        ":talla"   : row.talla
                    }
                };
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    console.log(product);    
                    if(arr.length-1 === i){
                        res.json(product);
                    }           
                } catch (error) {
                    console.log(error)
                    return res.status(500).json({
                        message:'Algo anda mal'
                    })
                }
            });
        }
        else if(tipo ==='luna'){
            console.log('en luna: ',array_productos )
            array_productos.map(async(row,i,arr)=>{
                const params= {
                    TableName: 'Lunas',
                    Key: {
                        "id_luna":row.id_luna,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, precio_luna_c=:precio_luna_c,precio_luna_v=:precio_luna_v`,
                    ConditionExpression: "id_luna = :id_luna", 
                    ExpressionAttributeValues: {
                        ":id_luna" : row.id_luna,
                        ":cantidad" : row.cantidad,
                        //":fecha_modificacion_luna": fecha_modificacion_luna,
                        //":material" : row.material,
                        ":precio_luna_c"   : row.precio_luna_c,
                        ":precio_luna_v"   : row.precio_luna_v
                    }
                };     
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    console.log(product);    
                    if(arr.length-1 === i){
                        res.json(product); 
                    }           
                } catch (error) {
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
                const params = {
                    TableName: 'Accesorios',
                    Key: {
                        "id_accesorio":row.id_accesorio,
                    },
                    UpdateExpression: `SET  cantidad= :cantidad, 
                                            nombre_accesorio=:nombre_accesorio,
                                            precio_accesorio_c=:precio_accesorio_c,
                                            precio_accesorio_v=:precio_accesorio_v`,
                    ExpressionAttributeValues: {
                        ":cantidad" : row.cantidad,
                        ":nombre_accesorio" : row.nombre_accesorio,
                        ":precio_accesorio_c"   : row.precio_accesorio_c,
                        ":precio_accesorio_v"   : row.precio_accesorio_v
                    }
                };
                //Intento actualizar
                try {
                    const product = await dynamoClient.update(params).promise();  
                    console.log(product);    
                    if(arr.length-1 === i){
                        res.json(product);
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
        console.log(error)
        return res.status(500).json({
            message:'Algo anda mal'
        })
    }
}