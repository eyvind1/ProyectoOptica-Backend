import AWS from '../db.js'
import {v4} from 'uuid';

import {codeForTables} from '../utils/codigosTablas.js';
import { castIsoDateToDate}  from '../helpers/helperFunctions.js';

const TABLE_NAME_VENTAS = "Ventas";
const TABLE_NAME_CAJA   = "Caja";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */ 

async function sortArrayJsonByDate(arrayJson){
    arrayJson.sort((a, b) => {
        return new Date(b.fecha_creacion_venta) - new Date(a.fecha_creacion_venta); // descending
      })
      return arrayJson
}
/* End funciones que se utilizan en el archivo */ 

/* Insertar un nuevo ingreso */

async function createNewIngreso(objetoJson){
    const id_caja = v4() + codeForTables.tablaCaja;
    try {
        const {id_sede,metodo_pago,monto,descripcion,encargado,habilitado,egreso,fecha_creacion_caja} = (objetoJson);
        const datosCaja = {
            id_caja,
            id_sede,
            metodo_pago,
            monto,
            egreso,
            descripcion,
            encargado,
            habilitado,
            fecha_creacion_caja,
        }
        const newCaja = await dynamoClient.put({
            TableName: TABLE_NAME_CAJA,
            Item: datosCaja
        }).promise()
        return json(newCaja);       
    } catch (error) {
        return error;
    }
};

/* Fin Insertar un nuevo ingreso */


async function restarStockProductos(list_monturas, list_lunas,list_accesorios){
    const tableName = ['Monturas','Lunas','Accesorios']
    
    if(list_monturas.length>0){
        list_monturas.map(async(row,i)=>{   
            try {
                // Hago la resta de lo que hay en stock menos lo vendido
                const params = {
                    TableName: tableName[0],
                    Key: {
                        "id_producto": row.id_producto,
                    },
                    UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
                    ExpressionAttributeValues: {
                        ":cant_vendida": row.cant_vendida
                    }
                };
                const montura = await dynamoClient.update(params).promise();      
                return montura;
            } catch (error) {
                return res.status(500).json({
                    message:'Algo anda mal'
                })
            }
        })
    }
    if(list_lunas.length>0){
        list_lunas.map(async(row,i)=>{   
            try {
                // Hago la resta de lo que hay en stock menos lo vendido
                const params = {
                    TableName: tableName[1],
                    Key: {
                        "id_producto": row.id_producto,
                    },
                    UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
                    ExpressionAttributeValues: {
                        ":cant_vendida": row.cant_vendida
                    }
                };
                const luna = await dynamoClient.update(params).promise();      
                return luna;
            } catch (error) {
                return res.status(500).json({
                    message:'Algo anda mal'
                })
            }
        })
    }
    if(list_accesorios.length>0){
        list_accesorios.map(async(row,i)=>{   
            try {
                // Hago la resta de lo que hay en stock menos lo vendido
                const params = {
                    TableName: tableName[2],
                    Key: {
                        "id_producto": row.id_producto,
                    },
                    UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
                    ExpressionAttributeValues: {
                        ":cant_vendida": row.cant_vendida
                    }
                };
                const accesorio = await dynamoClient.update(params).promise();      
                return accesorio;
            } catch (error) {
                return res.status(500).json({
                    message:'Algo anda mal'
                })
            }
        })
    }

}

export const createNewVenta = async (req, res) => {
    try {
        const id_ventas = v4() + codeForTables.tablaVentas;
        const fecha_creacion_venta = await castIsoDateToDate(req.body.fecha_creacion_venta);
        const {id_sede,nombre_cliente,list_monturas,list_lunas,list_accesorios,id_vendedor,
               tipo_venta,observaciones,id_cliente,habilitado} = (req.body);
        const datosVenta = {
            id_ventas,
            nombre_cliente,
            list_monturas,
            list_lunas,
            list_accesorios,
            id_vendedor,
            observaciones,
            habilitado,
            fecha_creacion_venta,
            tipo_venta,
            id_sede,
            id_cliente
        }
        const newVenta = await dynamoClient.put({
            TableName: TABLE_NAME_VENTAS,
            Item: datosVenta
        }).promise()
        
        //Una vez que se realiza la venta restamos del STOCK
        //const restarStock  = await restarStockProductos(list_monturas,list_lunas,list_accesorios);
        /* Agregamos la venta como un ingreso mas */
        let monto = 0;
        if(tipo_venta[0].forma_pago === 'credito'){
            monto = tipo_venta[0].cantidad_recibida;
        }
        else{
            monto = tipo_venta[0].precio_total;
        }
        const objetoJsonIngreso = {
            id_sede:id_sede,
            metodo_pago: tipo_venta[0].metodo_pago,
            monto: monto,
            descripcion: 'Ingreso por Venta',
            encargado: id_vendedor,
            habilitado: true,
            egreso: false, //False porque es un ingreso
            fecha_creacion_caja: fecha_creacion_venta
        }
        const newIngreso = await createNewIngreso(objetoJsonIngreso);
        /* Fin Agregamos la venta como un ingreso mas */
        console.log('resultado ingreso', newIngreso);
        return res.json(newVenta);       

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message:error
        })
    }
};
/* Esta funcion permite actualizar el tipo de venta
   - El tipo de venta se refiere al pago de una  o varias cuotas
*/
export const updatePagoCuotasVentaById = async (req, res) => {
    let id_venta = req.params.idVenta;
    const {tipo_venta} = req.body;  
    try {
        const paramsVenta = {
            TableName: TABLE_NAME_VENTAS,
            Key: {
                "id_ventas":id_venta,
            },
            UpdateExpression: `SET tipo_venta = :tipo_venta`,
            ConditionExpression: "id_ventas = :id_venta",
            ExpressionAttributeValues: {
                ":id_venta": id_venta,
                ":tipo_venta": tipo_venta            }
        }
        const venta = await dynamoClient.update(paramsVenta).promise();     
        
        /* Agregamos la venta como un ingreso mas */
        const objetoJsonIngreso = {
            id_sede:id_sede,
            metodo_pago: tipo_venta[0].metodo_pago,
            monto: tipo_venta[0].cantidad_recibida,
            descripcion: 'Ingreso por Pago de cuota',
            encargado: id_vendedor,
            habilitado: true,
            egreso: false, //False porque es un ingreso
            fecha_creacion_caja: fecha_creacion_venta
        }
        const newIngreso = await createNewIngreso(objetoJsonIngreso); 
        /* Fin Agregamos la venta como un ingreso mas */
        return res.json(venta);
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:error
        })
    }
}
/* Esta funcion busca todas las ventas de una sede en especifica */
export const getAllVentasBySede = async (req, res) => {
    try{
        let id_sede = req.params.idsede;
        const params = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#idsede = :valueSede",
            ExpressionAttributeValues: {
                ":valueSede": id_sede
            },
            ExpressionAttributeNames:{
                "#idsede": "id_sede"
            }
        };
        const ventasBySede = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(ventasBySede.Items); 
        return res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};

/* Esta funcion lista todas las ventas */
export  const getAllVentas = async (req, res) => {
    try{
        const params = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#habilitado = :valueHabilitado",
            ExpressionAttributeValues: {
                ":valueHabilitado":true
            },
            ExpressionAttributeNames:{
                "#habilitado": "habilitado"
            }
        };
        const sedes = await dynamoClient.scan(params).promise();
        //Ordeno los datos en forma descendente antes de enviar al Front
        const rpta  = await sortArrayJsonByDate(sedes.Items); 
        res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};
/* Esta funcion lista todas las ventas por vendedor */
export const getAllVentasBySeller = async (req, res) => {
    try{
        let id_vendedor = req.params.idvendedor;
        const params    = {
            TableName: TABLE_NAME_VENTAS,
            FilterExpression : "#idVendedor = :valueIdVendedor",
            ExpressionAttributeValues: {
                ":valueIdVendedor": id_vendedor
            },
            ExpressionAttributeNames:{
                "#idVendedor": "id_vendedor"
            }
        };
        const ventasBySeller = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(ventasBySeller.Items); 
        res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};


export const getAllVentasByDate = async (req, res) => {
    try{
        let fechaIni = req.params.fechaIni;
        let fechaFin = req.params.fechaFin;
        fechaIni     = await castIsoDateToDate(fechaIni);
        fechaFin     = await castIsoDateToDate(fechaFin); 
        console.log(fechaFin,fechaIni,'fechaFin');
        //fechaIni     = await castIsoDateToDate(fechaIni);
        //fechaFin     = await castIsoDateToDate(fechaFin); 
        const params = {
            TableName: TABLE_NAME_VENTAS,
            //FilterExpression : "#habilitado = :valueHabilitado and #fecha_venta  between :val1 and :val2",
            FilterExpression : "#habilitado = :valueHabilitado and #fecha_venta  between :val1 and :val2",
            ExpressionAttributeValues: {
                ":valueHabilitado":true,
                ":val1" : fechaIni,
                ":val2" : fechaFin
            },
            ExpressionAttributeNames:{
                "#fecha_venta": "fecha_creacion_venta",
                "#habilitado": "habilitado"
            }
        };
        const ventasBySeller = await dynamoClient.scan(params).promise();
        const rpta  = await sortArrayJsonByDate(ventasBySeller.Items); 
        res.json(rpta);
    } 
     catch(error) {
        return res.status(500).json({
            message:error
        })
    }
};



/* 
    1.- Esta funcion permite validar si una venta que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/
const validateVenta  = async (idVenta) => {
    const id_venta  = idVenta;
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    try {
        const paramsVenta = {
            TableName: TABLE_NAME_VENTAS,
            KeyConditionExpression:
              'id_ventas = :id_venta',
            ExpressionAttributeValues: {
                ":id_venta": id_venta,
            }
        };              
        const venta  = await dynamoClient.query(paramsVenta).promise();      
        return venta.Items;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/*
    1.-  Funcion para Dar de Baja a una venta en especifico  
    2.-  Antes de dar de baja a una venta, valido que exista
    3.-  Funcion Verificada al 100%
*/ 
export const unsubscribeVentasById = async (req, res) => {
    const id_venta = req.params.idVenta;
    const existeVenta = await validateVenta(id_venta);
    const dynamoClient = new AWS.DynamoDB.DocumentClient();
    if(existeVenta.length > 0) {
        try {
            const paramsVenta = {
                TableName: TABLE_NAME_VENTAS,
                Key: {
                    "id_ventas":id_venta,
                },
                UpdateExpression: "SET habilitado = :habilitado",
                ExpressionAttributeValues: {
                    ":habilitado": false
                }
            };
            const venta = await dynamoClient.update(paramsVenta).promise();      
            res.json(venta);
            return venta;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message:'Algo anda mal'
            })
        }
    }
    else{
        console.log('la venta no existe')
        return res.status(500).json({
            message:'La venta no existe'
        })
    }
};