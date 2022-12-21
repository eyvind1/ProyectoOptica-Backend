import AWS from '../db.js'

/* Libreria para poder generar ID's aleatorios*/
import {v4} from 'uuid';

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();



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


export const updateListOfProducts=async(req,res)=>{
    try {
        const array_productos = req.body;
        const tipo = array_productos[0].tipo;
        const fecha_actual = new Date();
        if(tipo ==='montura'){
            const params = {
                TableName: 'Monturas',
                Key: {
                    "id_montura":row.id_montura,
                },
                UpdateExpression: `SET  cantidad= :cantidad, codigo=:codigo, fecha_modificacion_monturas = :fecha_modificacion_monturas,
                                        marca=:marca, material=:material, precio_montura_c=:precio_montura_c,precio_montura_v=:precio_montura_v,
                                        talla=:talla`,
                ExpressionAttributeValues: {
                    ":cantidad" : row.cantidad,
                    ":codigo"   : row.codigo,
                    ":fecha_modificacion_monturas": fecha_actual,
                    ":marca"    : row.marca,
                    ":material" : row.material,
                    ":precio_montura_c"   : row.precio_montura_c,
                    ":precio_montura_v"   : row.precio_montura_v,
                    ":talla"   : row.talla
                }
            };
            const product = await dynamoClient.update(params).promise();      
            if(arr.length-1 === i){
                res.json(product);
            }
        }
        else if(tipo ==='luna'){
            const params= {
                TableName: 'Lunas',
                Key: {
                    "id_luna":row.id_luna,
                },
                UpdateExpression: `SET  cantidad= :cantidad,
                                        material=:material, precio_luna_c=:precio_luna_c,precio_luna_v=:precio_luna_v`,
                ExpressionAttributeValues: {
                    ":cantidad" : row.cantidad,
                    //":fecha_modificacion_luna": fecha_modificacion_luna,
                    ":material" : row.material,
                    ":precio_luna_c"   : row.precio_luna_c,
                    ":precio_luna_v"   : row.precio_luna_v
                }
            };            
        }
        else if(tipo ==='accesorio'){
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
                const product = await dynamoClient.update(params).promise();      
                if(arr.length-1 === i){
                    res.json(product);
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