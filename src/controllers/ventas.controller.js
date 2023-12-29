import AWS from "../db.js";
import { v4 } from "uuid";

import { codeForTables } from "../utils/codigosTablas.js";
import { castIsoDateToDate } from "../helpers/helperFunctions.js";

import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import fs from "fs";
import PdfPrinter from "pdfmake";
import { Blob } from "buffer";
import { prueba } from "./googleDriveApi.controller.js";

const TABLE_NAME_VENTAS = "Ventas";
const TABLE_NAME_CAJA = "Caja";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */

async function sortArrayJsonByDate(arrayJson) {
  arrayJson.sort((a, b) => {
    return new Date(b.fecha_creacion_venta) - new Date(a.fecha_creacion_venta); // descending
  });
  return arrayJson;
}
/* End funciones que se utilizan en el archivo */

/* Insertar un nuevo ingreso */
async function createNewIngreso(objetoJson) {
  const id_caja = v4() + codeForTables.tablaCaja;
  const fecha_creacion_caja = await castIsoDateToDate(
    objetoJson.fecha_creacion_caja
  );
  try {
    const {
      id_sede,
      metodo_pago,
      monto,
      descripcion,
      id_encargado,
      nombre_encargado,
      habilitado,
      egreso,
    } = objetoJson;
    const datosCaja = {
      id_caja,
      id_sede,
      metodo_pago,
      monto,
      egreso,
      descripcion,
      id_encargado,
      nombre_encargado,
      habilitado,
      fecha_creacion_caja,
    };
    const newCaja = await dynamoClient
      .put({
        TableName: TABLE_NAME_CAJA,
        Item: datosCaja,
      })
      .promise();
    return newCaja;
  } catch (error) {
    return error;
  }
}

/* Fin Insertar un nuevo ingreso */

async function aumentarStockProductos(
  list_monturas,
  list_lunas,
  list_accesorios
) {
  const tableName = ["Monturas", "Lunas", "Accesorios"];

  if (list_monturas.length > 0) {
    list_monturas.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[0],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad + :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const montura = await dynamoClient.update(params).promise();
        return montura;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
  if (list_lunas.length > 0) {
    list_lunas.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[1],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad + :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const luna = await dynamoClient.update(params).promise();
        return luna;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
  if (list_accesorios.length > 0) {
    list_accesorios.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[2],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad + :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const accesorio = await dynamoClient.update(params).promise();
        return accesorio;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
}

async function restarStockProductos(
  list_monturas,
  list_lunas,
  list_accesorios
) {
  const tableName = ["Monturas", "Lunas", "Accesorios"];

  if (list_monturas.length > 0) {
    list_monturas.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[0],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const montura = await dynamoClient.update(params).promise();
        return montura;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
  if (list_lunas.length > 0) {
    list_lunas.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[1],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const luna = await dynamoClient.update(params).promise();
        return luna;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
  if (list_accesorios.length > 0) {
    list_accesorios.map(async (row, i) => {
      try {
        // Hago la resta de lo que hay en stock menos lo vendido
        const params = {
          TableName: tableName[2],
          Key: {
            id_producto: row.id_producto,
          },
          UpdateExpression: "SET cantidad = cantidad - :cant_vendida",
          ExpressionAttributeValues: {
            ":cant_vendida": row.cant_vendida,
          },
        };
        const accesorio = await dynamoClient.update(params).promise();
        return accesorio;
      } catch (error) {
        return res.status(500).json({
          message: "Algo anda mal",
        });
      }
    });
  }
}

export const createNewVenta = async (req, res) => {
  try {
    const id_ventas = v4() + codeForTables.tablaVentas;
    const fecha = new Date();
    const fecha_creacion_venta = await castIsoDateToDate(fecha);

    const {
      id_sede,
      nombre_cliente,
      nombre_vendedor,
      list_monturas,
      list_lunas,
      list_accesorios,
      id_vendedor,
      tipo_venta,
      observaciones,
      id_cliente,
      habilitado,
      nombre_jalador,
      encargado_medicion,
      medidas,
    } = req.body;

    const datosVenta = {
      id_ventas,
      nombre_vendedor,
      nombre_cliente,
      encargado_medicion,
      list_monturas,
      list_lunas,
      list_accesorios,
      id_vendedor,
      nombre_jalador,
      observaciones,
      habilitado,
      fecha_creacion_venta,
      tipo_venta,
      id_sede,
      id_cliente,
      medidas,
    };

    const newVenta = await dynamoClient
      .put({
        TableName: TABLE_NAME_VENTAS,
        Item: datosVenta,
      })
      .promise();
    //Una vez que se realiza la venta restamos del STOCK
    const restarStock = await restarStockProductos(
      list_monturas,
      list_lunas,
      list_accesorios
    );
    /* Agregamos la venta como un ingreso mas */
    let monto = 0;
    if (tipo_venta[0].forma_pago === "credito") {
      monto = tipo_venta[0].cantidad_recibida;
    } else {
      monto = tipo_venta[0].precio_total;
    }

    const objetoJsonIngreso = {
      id_sede: id_sede,
      metodo_pago: tipo_venta[0].metodo_pago,
      monto: monto,
      descripcion: "Ingreso por Venta",
      id_encargado: id_vendedor,
      nombre_encargado: nombre_vendedor,
      habilitado: true,
      egreso: false, //False porque es un ingreso
      fecha_creacion_caja: fecha_creacion_venta,
    };
    const newIngreso = await createNewIngreso(objetoJsonIngreso);
    /* Fin Agregamos la venta como un ingreso mas */
    return res.json(newVenta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};
/* Esta funcion permite actualizar el tipo de venta
   - El tipo de venta se refiere al pago de una  o varias cuotas
*/
export const updatePagoCuotasVentaById = async (req, res) => {
  let id_venta = req.params.idVenta;
  const fecha = new Date();
  const fecha_update = await castIsoDateToDate(fecha);
  const { tipo_venta, id_sede, id_vendedor, nombre_vendedor } = req.body;
  try {
    const paramsVenta = {
      TableName: TABLE_NAME_VENTAS,
      Key: {
        id_ventas: id_venta,
      },
      UpdateExpression: `SET tipo_venta = :tipo_venta`,
      ConditionExpression: "id_ventas = :id_venta",
      ExpressionAttributeValues: {
        ":id_venta": id_venta,
        ":tipo_venta": tipo_venta,
      },
    };
    const venta = await dynamoClient.update(paramsVenta).promise();

    /* Agregamos la venta como un ingreso mas */
    const objetoJsonIngreso = {
      id_sede: id_sede,
      metodo_pago: tipo_venta[0].metodo_pago,
      monto: tipo_venta[0].cantidad_recibida,
      descripcion: "Ingreso por Pago de cuota",
      encargado: id_vendedor,
      nombre_encargado: nombre_vendedor,
      habilitado: true,
      egreso: false, //False porque es un ingreso
      //fecha_creacion_caja: tipo_venta[0].fecha_pago
      fecha_creacion_caja: fecha_update,
    };
    const newIngreso = await createNewIngreso(objetoJsonIngreso);
    /* Fin Agregamos la venta como un ingreso mas */
    return res.json(venta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};
/* Esta funcion busca todas las ventas de una sede en especifica */
export const getAllVentasBySede = async (req, res) => {
  try {
    let id_sede = req.params.idsede;
    const params = {
      TableName: TABLE_NAME_VENTAS,
      FilterExpression:
        "#idsede = :valueSede and #habilitado = :valueHabilitado ",
      ExpressionAttributeValues: {
        ":valueSede": id_sede,
        ":valueHabilitado": true,
      },
      ExpressionAttributeNames: {
        "#idsede": "id_sede",
        "#habilitado": "habilitado",
      },
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    const rpta = await sortArrayJsonByDate(scanResults);
    return res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

/* Esta funcion devuelve todas las ventas que fueron dadas de baja */
export const getAllVentasEliminadasBySede = async (req, res) => {
  try {
    let id_sede = req.params.idsede;
    const params = {
      TableName: TABLE_NAME_VENTAS,
      FilterExpression:
        "#idsede = :valueSede and #habilitado = :valueHabilitado ",
      ExpressionAttributeValues: {
        ":valueSede": id_sede,
        ":valueHabilitado": false,
      },
      ExpressionAttributeNames: {
        "#idsede": "id_sede",
        "#habilitado": "habilitado",
      },
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    const rpta = await sortArrayJsonByDate(scanResults);
    return res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

/* Esta funcion lista todas las ventas */
export const getAllVentas = async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME_VENTAS,
      FilterExpression: "#habilitado = :valueHabilitado",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
      },
      ExpressionAttributeNames: {
        "#habilitado": "habilitado",
      },
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    const rpta = await sortArrayJsonByDate(scanResults);
    res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};
/* Esta funcion lista todas las ventas por vendedor */
export const getAllVentasBySeller = async (req, res) => {
  try {
    let id_vendedor = req.params.idvendedor;
    const params = {
      TableName: TABLE_NAME_VENTAS,
      FilterExpression: "#idVendedor = :valueIdVendedor",
      ExpressionAttributeValues: {
        ":valueIdVendedor": id_vendedor,
      },
      ExpressionAttributeNames: {
        "#idVendedor": "id_vendedor",
      },
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    const rpta = await sortArrayJsonByDate(scanResults);
    res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const getAllVentasByDate = async (req, res) => {
  try {
    let fechaIni = req.params.fechaIni;
    let fechaFin = req.params.fechaFin;
    let id_sede = req.params.idSede;

    fechaIni = await castIsoDateToDate(fechaIni);
    fechaFin = await castIsoDateToDate(fechaFin);
    const params = {
      TableName: TABLE_NAME_VENTAS,
      //FilterExpression : "#habilitado = :valueHabilitado and #fecha_venta  between :val1 and :val2",
      FilterExpression:
        "#habilitado = :valueHabilitado and #fecha_venta  between :val1 and :val2 and #id_sede = :id_sede",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
        ":val1": fechaIni,
        ":val2": fechaFin,
        ":id_sede": id_sede,
      },
      ExpressionAttributeNames: {
        "#fecha_venta": "fecha_creacion_venta",
        "#habilitado": "habilitado",
        "#id_sede": "id_sede",
      },
    };
    const scanResults = [];
    let items;
    do {
      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => scanResults.push(item));
      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    const rpta = await sortArrayJsonByDate(scanResults);
    return res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};
/* 
    1.- Esta funcion permite validar si una venta que se envia desde el front existe en la BD 
    2.- Funcion validada al 100%    
*/
const validateVenta = async (idVenta) => {
  const id_venta = idVenta;
  const dynamoClient = new AWS.DynamoDB.DocumentClient();
  try {
    const paramsVenta = {
      TableName: TABLE_NAME_VENTAS,
      KeyConditionExpression: "id_ventas = :id_venta",
      ExpressionAttributeValues: {
        ":id_venta": id_venta,
      },
    };
    const venta = await dynamoClient.query(paramsVenta).promise();
    return venta.Items;
  } catch (error) {
    return error;
  }
};

/*
    1.-  Funcion para Dar de Baja a una venta en especifico  
    2.-  Antes de dar de baja a una venta, valido que exista
    3.-  Descuento del stock al dar de baja
    5.-  OJO cuando se devuelve el dinero, tiene que ser por el mismo metodo
    4.-  Funcion Verificada al 100%
*/
export const unsubscribeVentasById = async (req, res) => {
  const id_venta = req.params.idVenta;
  const existeVenta = await validateVenta(id_venta);
  //console.log(existeVenta[0].list_accesorios)
  const dynamoClient = new AWS.DynamoDB.DocumentClient();
  if (existeVenta.length > 0) {
    try {
      //Antes de darle baja a una venta, aumentamos al stock los productos que no se vendieron
      const aumentarStock = await aumentarStockProductos(
        existeVenta[0].list_monturas,
        existeVenta[0].list_lunas,
        existeVenta[0].list_accesorios
      );
      const paramsVenta = {
        TableName: TABLE_NAME_VENTAS,
        Key: {
          id_ventas: id_venta,
        },
        UpdateExpression: "SET habilitado = :habilitado",
        ExpressionAttributeValues: {
          ":habilitado": false,
        },
      };
      const venta = await dynamoClient.update(paramsVenta).promise();
      //Obtengo el tipo de venta desde la venta
      const tipo_venta = existeVenta[0].tipo_venta[0];
      let monto = 0;
      if (tipo_venta.forma_pago === "credito") {
        monto = tipo_venta.cantidad_recibida;
      } else {
        monto = tipo_venta.precio_total;
      }

      //Al eliminar la venta tengo que generar un egreso de devolucion
      const objetoJsonIngreso = {
        id_sede: existeVenta[0].id_sede,
        metodo_pago: tipo_venta.metodo_pago,
        monto: monto,
        descripcion: "Egreso por baja de una venta",
        id_encargado: existeVenta[0].id_vendedor,
        nombre_encargado: existeVenta[0].nombre_vendedor,
        habilitado: true,
        egreso: true, //True porque es un egreso
        fecha_creacion_caja: existeVenta[0].fecha_creacion_venta,
      };
      const newIngreso = await createNewIngreso(objetoJsonIngreso);
      return res.json(venta);
    } catch (error) {
      return res.status(500).json({
        message: "Algo anda mal",
      });
    }
  } else {
    return res.status(500).json({
      message: "La venta no existe",
    });
  }
};

// Genera PDF y envio al front
export const getPDF = async (req, res) => {
  let id_sede = req.params.urlImgSede;
  try {
    var fonts = {
      Roboto: {
        normal: "src/controllers/Roboto-Regular.ttf",
      },
    };
    var printer = new PdfPrinter(fonts);
    // var docDefinition = {
    //   content: [
    //     "First paragraph",
    //     "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
    //   ],
    // };
    var docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          // style: "tableMargin",
          table: {
            widths: ["*", "*"],
            body: [
              /* [{ image: await getBase64ImageFromURL('/assets/images/logo-dark.png'), width: 150 }, { text: 'Nº de Boleta: ' + numeroBoleta, style: 'tableHeader', rowSpan: 4, alignment: 'right' }], */
              [
                {
                  image:
                    "data:image/png;base64," +
                    `/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAJRBQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK8q8eftLfC3wLI9k2rPrWoRtta10sLNsPP35CRGMEYIDFhkfLXPicXQwcPaYiaivM78uyvG5tV9hgaUqku0Ve3r2Xmz1WivjTxT+2h481PzIfCug6ZokLxhRJLuu7hHzyysdseCMDBjPfn0811r47fGDXpknvviHrMTRrtAsp/san6rAEBPuRXzOI4zwFJ2pKU/lZfjr+B+j4DwgzzEpSxMoUl2b5pf8Akqa/8mP0Vor8zLzx5441KQTah4z126ccbptRmc/mWqSz+IvxB01THp/jrxDaqf4YdUnQfo1cf+vFG/8ABdvVf5HrvwVxfLpi43/wu333/Q/S+ivz00P9ob4zeH4fs9n48v54928/blju2PtvmVmA9ga9V8J/tsazDKkPjfwhaXULOoa40yRoXjT+I+XIWEjd8bkFd+G4wy+u+WpeD81p+F/yPCzHwkz/AAcXPD8lVf3ZWf3SSX3Nn1tRXC+AfjZ8N/iR5dv4d8QxLfuoJ0+7Hk3IJUsVCtxIQFOTGWAx1ruq+loYiliYe0oyUl3TufnOMwOKy6s6GLpyhNdJJp/j+YUUUVscoUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFch8SPip4P+Fekpqfim+YSTtttrOAB7i4I67EJHA7sxCjIGckA9TeLeNZzrp8sMV0Y2EDzRl41kwdpZQyllBxkBgSO461+c3xb0v4haT45v4fibJcT61IfMNxI26OeIk7XhIAXy+oAUALgrhSpUfP8Q5vVymgpUYXctL9F6+fY+94B4Tw3FWNlTxVZRjDVxXxyXl5L7T1autNbroPil+0R48+JzS2D3P8AY+iP8o02zkOJFyf9dJw0pwQCOE+UHaDzXl1FFfk+JxVbGVHVrycpeZ/UmXZZg8ooLDYGmoQXRfm+rfm7sKKKK5zvCiiigAooooAAxUhlJBHQ17x8Kf2sPF3hGSPS/HLXHiPSOnnO+b6DLZJEjH96PvfK5zyMOAMV4PRXZgsfiMvqe0w8uV/g/VdTyc4yPL8+w/1fMKanHp3XnF7p+nzP058L+LPDvjTR4te8L6tBqNjLwJIj91sAlWU/MjAEZVgCMjitevz4+D138ZvDrX/i74XaZqN1Z2RjGpRxQGa3uAGGI2j6yEBv4PnVWYgqCTX1P8Hf2kfCnxNEOi6ps0XxFsG61lceTctnB8hyfmPQ7D8wycbwpav1DKeI6WOjGGIXJOW1/hl/hf6fmfzTxV4fYrJJ1a2Al7ajB+9ZpzhdX9+K206rS2rSPYKKKK+kPzsKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5vx58PfCnxI0STQvFWmJcRlW8mdcLPbOf44nxlW4HscYYEZFdJRUVKUK0HTqK6e6Zth8TWwlWNfDycZxd007NPyZ8MfFL9lvx14Hln1Lw3BJ4i0UMWWS2jzdQrxgSRDk9T8ybhhSxCdK8Wr9UK4Dx98C/hp8Rmkute8PpDqEgP8AxMLI+RcZOBuYj5ZCAoA8xWwOmK+GzLgyM26mBlb+69vk9/vv6n7Vw74wVKMY0M7p839+Fr/9vR0T9U1/hZ+d1FfTvin9iXVI5Gm8FeM7WeNpDtt9UiaJo07ZljDBz/wBRXm2rfsw/GzSjcN/wh/2yGAn97aXkEnmD1RN4kP0259q+SxGQ5lhnadGT9Fzflc/VcBxxw9mMU6OLgn2k+R+lpW/A8rorrJPhJ8VI2Kt8NfFBI/u6RcMPzCYp9r8HvivdyCGL4b+JFY8Zl0yaMfmygCuH6niG7ezl9zPbeb5elzOvC3+KP8AmchRXsGj/sofGrVLpYLvQbPSomXd9ovNQiKD2IiLvn/gNen+E/2JbKMR3HjjxlNMxQ+Za6XC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W4v71/n+J/PfV3Q9a1Xw3rWn+ItDvZLPUtKuor2zuI8boZ4nDxuM8ZDKDz6Ua5BplrrWoW2i3T3WnxXUsdpPIuGlhDkI5HYlcHHvVKv13ScdVoz4TWL0P30+E3jqP4m/DHwr8QkhhhbxDpFrqEsMLl0hmkjVpIgx5Oxyy5/2a6yvDP2H9L1DSP2VPh5a6lGyTSafLdKGznyprmWWI89jG6Eexr3Ov50x9KNDF1aVP4Yykl6Js/WMLOVWhCct2k/wCiiiuQ3CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACviz/AIKCfsh6h8WNLT4v/C/RFufF2kQeXqthbofP1ezQfK0aj/WXEQ4C43SJ8oLMkcbfadFd+W5jWyrExxVB6r7muqfkc2LwlPG0XRqbP8PM/nfor9a/2oP+CffgX41XN742+H9zbeEfGd1JJc3T+WTYapKykkzovMUjPtLTRgk5cskjNuH5zfFr9mH45fBSe5bx14A1GLTbY/8AIYs4zc6eyFyiN58eVTcQMJJsfkZUZxX7VlHEmBzeK5Jcs/5Xv8u/y/A/PMdlGJwMnzRvHutv+AcZ4R+IPj34fzz3XgTxtr3hya7VUuJNJ1Ka0aZVOQrmJl3AEng+tey2/wC3/wDtdW1vHbx/F6QpEgRTJommuxAGBlmtyzH1JJJ71890V6lfL8JinzV6UZPzin+aOKliq9BWpzcfRtHonxE/aI+OHxWF1D4++KGv6paXmzz7D7UYLF9mNp+yxbYQQQDkJ156153RWp4b8K+KPGWqJoXg/wAN6prmpSqzpZ6bZyXM7KoyxEcYLEADJ44rWnSo4Wny04qMV2skRKdSvK8m5N/NmXXvf7I/7KviL9pTxoFuPtGm+DNIkV9a1QRn58FT9ltyRtM7gjk8IpLkE7Uf2P4B/wDBMfx94quotb+Ol43hPRlJP9l2c0c2pXI2grl13xQL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LyIXFlO4GCTG3MbEBQzRsjEKoJwBXsPxg/4Jr/HbwDcS3vgFbXx7oyq0gksittfRqqqTvtpG+YklgoheRjtyQuQK+YvFPgnxl4Hvl0vxt4R1rw/eOglW31SwltJWQ5wwWRVJBwecdjX6tSxeW51R5ISjUi+mj+9PVfcfEzoYvLqnNJODXX/g7H1n/wAPVv2hP+hN+Hn/AIL77/5Lrz34wft7ftC/GTQbnwpqWr6X4e0W/t2tb+z0G1aAXkbH5lklleSUKRlWVXVWUlWDAmvnWp7GxvtTu4tP02znu7q4cRxQwRmSSRicBVVQSST2FZ0sgyvDTVWFCKa622+8qeaY2rHklUdmQV1fwq+GviT4wfELRPhz4ThV9R1u5EKu/wByCMAtJM+OdiIGc45wpwCcCvWfhZ+wf+0l8TryNZPAlz4U03zGjmv/ABIjWIiwueIGHnvnoCsZXPBYckfpb+zR+yX8Of2aNKnbQfM1jxLqMKw6jr13GqzSIMExQoCRBCWAbYCSxC72fYm3zc84qweWUpRozU6r2S1Sfdvy7bv8Tsy3JMRjJqVSLjDq3pf0/wAz1rwr4b0rwZ4X0fwfoUbx6boVhb6bZpI5dlghjWOMFjyxCqOT1rVoor8TlJzblLdn6IkoqyCiiikMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDg/EfwF+CHi67u9Q8TfCHwbqV7ff8AHxeXGh2zXMhxjJm2b84A53Zrz2b9gv8AZLuJGmk+D9qGY5OzVL9B+AWcAfhXv1FdtLMsbQVqVaUV5Sa/U554TD1HedOL9UjyDw3+yF+zJ4USWPS/gl4WnE3Lf2lZjUSP903RkK/hivT9C8P6D4X0uHRPDOh6fpGnW42w2djbJbwxj0VEAUfgK0KKyrYvEYn+NNy9W3+ZdOhSpfw4peisFFFFc5qFfJv/AAU2/wCTZJP+w/Yfykr6yr5N/wCCm3/Jskn/AGH7D+Ulezw9/wAjXD/4l+Z5+a/7lV/ws/JGvdf2G/8Ak634e/8AX9P/AOks1eFV7r+w3/ydb8Pf+v6f/wBJZq/b83/5F9f/AAS/9JZ+c4H/AHqn/ij+aP2rpkkcc0bRTRrIjDDKwyCPcGn0V/O5+rFSz0nS9PZpNP021tmf7zQwqhP1wOat0UU229wSsFFFFIAooooAKpXGh6LeTfaLrR7KaX/npJbozfmRmrtFNNrYTVxscaRoI40VFUYVVGABTqKKQwooooAKKKKACiiigAooooAoy6Hok8/2qfR7GSYHd5jW6Fs+uSM1dVQqhVAAHAA7UtFNtvcVrBRRRSGFFFFACEBgQRkGqK6Docc32mPRbFZh/wAtBboG/PGav0U02thNXCiiikMKKKKACiiigAooooAz5fD+gzy+fNodhJJ13tbIW/MirsMMNvGIoIkjReiooAH4Cn0U3JvcSSQUUUUhhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV8m/8ABTb/AJNkk/7D9h/KSvrKvBP21vg741+OXwUfwN4Bt7SbVDq1rebbq4EKeXHv3fMe/wAw4r1cjqwoZlQqVHaKkrt9DizKEqmEqQgrtpn4tV7r+w3/AMnW/D3/AK/p/wD0lmrtP+Haf7UX/QI8Pf8Ag4T/AAr1D9mL9hP4/wDwr+PHhH4geLdN0WPSNHupZbpoNTSRwrQSIMKBk8sK/XszzzLauBrQhXi24SSV1vZnwmDy3GQxFOUqcklJdPM/Seiiivww/SAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k=`,
                  width: 150,
                },
                // {
                //   text: "",
                //   style: "tableHeader",
                //   rowSpan: 3,
                //   alignment: "right",
                // },
              ],
            ],
          },
          // layout: "noBorders",
        },
      ],
    };
    var pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBase64(async (base64) => {
      console.log(await prueba());
      res.json(base64);
      // res.contentType("application/pdf");
      // console.log(dataUrl);
      // res.json("hola");
    });
  } catch (error) {
    console.log(error);
  }
  // return blob;

  // var blob = new Blob([pdfDoc], {
  //   type: "application/pdf",
  // });
  // console.log(pdfDoc.getData);

  // // console.log(blob);
  // // res.contentType("blob");
  // res.type(blob.type);

  // return res.send(blob);
  // pdfDoc.download();

  // pdfDoc.pipe(fs.createWriteStream("lists.pdf"));
  // pdfDoc.end();
};

// async createPDF(venta: VentasModel, cliente: any) {

//   var fonts = {
//     Roboto: {
//       normal: 'fonts/Roboto-Regular.ttf',
//       bold: 'fonts/Roboto-Medium.ttf',
//       italics: 'fonts/Roboto-Italic.ttf',
//       bolditalics: 'fonts/Roboto-MediumItalic.ttf'
//     },
//   };

//   var estadoBoleta = "Pagado"
//   var fecha_hoy = new Date (venta.fecha_creacion_venta).toLocaleDateString('en-GB');
//   var fecha_entrega = new Date(venta.fecha_creacion_venta).toLocaleDateString("es-CL", {
//     weekday: "long", // narrow, short
//     year: "numeric", // 2-digit
//     month: "long", // numeric, 2-digit, narrow, long
//     day: "numeric" // 2-digit
//   });
//   var hora_entrega = new Date(venta.fecha_creacion_venta).toLocaleTimeString("es-CL", {
//     timeZone: "America/Bogota",
//     hour12: true, // false
//     hour: "numeric", // 2-digit
//     minute: "2-digit", // numeric
//     second: "2-digit" // numeric
//   });
//   var simboloNuevoSol = 'S/ ';
//   var numeroBoleta = '#MN0131';

//   var direccionEmpresa = 'Calle Santa Marta 218, Arequipa';
//   var correoEmpresa = 'raulcg1234@hotmail.com ';
//   var felefonoEmpresa = '955 739 464';

//   var nombresCliente = cliente.nombres + ' ' + cliente.apellidos;
//   var fnacimientoCliente = cliente.fecha_nacimiento ? new Date(cliente.fecha_nacimiento).toLocaleDateString('en-GB') : "Sin fecha de nacimiento";
//   //var direccionCliente = 'Calle';
//   var correoCliente = cliente.email ? cliente.email : "Sin correo";
//   var telefonoCliente = cliente.telefono ? cliente.telefono : "Sin telefono";

//   var externalDataRetrievedFromServer = [];
//   var peruIGV = 0.18;

//   function buildData() {
//     var numOrdenItems = 1;
//     var totalMonturas, totallunas, totalAccesorios = 0;
//     var subTotal = 0;

//     // Monturas
//     if (venta.list_monturas.length > 0) {
//       for (var i = 0; i < venta.list_monturas.length; i++) {
//         numOrdenItems += 1;
//         totalMonturas = venta.list_monturas[i].precio_montura_v * venta.list_monturas[i].cant_vendida;
//         subTotal += totalMonturas;
//         externalDataRetrievedFromServer.push({ num_orden: numOrdenItems, detalle: venta.list_monturas[i].marca, precio: venta.list_monturas[i].precio_montura_v, cantidad: venta.list_monturas[i].cant_vendida, total: totalMonturas },) // Añade
//       }
//     }

//     // Lunas
//     if (venta.list_lunas.length > 0) {
//       for (var i = 0; i < venta.list_lunas.length; i++) {
//         numOrdenItems += 1;
//         totallunas = venta.list_lunas[i].precio_luna_v * venta.list_lunas[i].cant_vendida;
//         subTotal += totallunas;
//         externalDataRetrievedFromServer.push({ num_orden: numOrdenItems, detalle: venta.list_lunas[i].material, precio: venta.list_lunas[i].precio_luna_v, cantidad: venta.list_lunas[i].cant_vendida, total: totallunas },) // Añade
//       }
//     }

//     // Accesorios
//     if (venta.list_accesorios.length > 0) {
//       for (var i = 0; i < venta.list_accesorios.length; i++) {
//         numOrdenItems += 1;
//         totalAccesorios = venta.list_accesorios[i].precio_accesorio_v * venta.list_accesorios[i].cant_vendida;
//         subTotal += totalAccesorios;
//         externalDataRetrievedFromServer.push({ num_orden: numOrdenItems, detalle: venta.list_accesorios[i].nombre_accesorio, precio: venta.list_accesorios[i].precio_accesorio_v, cantidad: venta.list_accesorios[i].cant_vendida, total: totalAccesorios },) // Añade
//       }
//     }
//     return subTotal;
//   }

//   function buildTableBody(data, columns, subtotal) {
//     var body = [];

//     body.push([{ text: 'No.', style: 'tableHeader', alignment: 'center' }, { text: 'Detalle', style: 'tableHeader', alignment: 'center' }, { text: 'Precio', style: 'tableHeader', alignment: 'center' }, { text: 'Cantidad', style: 'tableHeader', alignment: 'center' }, { text: 'Total', style: 'tableHeader', alignment: 'center' }]);

//     data.forEach(function (row) {
//       var dataRow = [];

//       columns.forEach(function (column) {
//         //dataRow.push({ text: row[column].toString(), style: 'cell', alignment: 'center' },);
//         dataRow.push(row[column].toString());
//       })

//       body.push(dataRow);
//     });

//     /* var totalIGV = round(subtotal * peruIGV, 2);
//     var total = round(subtotal + totalIGV, 1); */

//     var total = round(subtotal, 1);

//     /* body.push([{ text: ' ', rowSpan: 3, colSpan: 2}, { }, {text: 'Sub. Total:', style: 'tableHeader', alignment: 'right', colSpan: 2 }, { }, { text: simboloNuevoSol + subtotal, style: 'contenido', alignment: 'right' }]);
//     body.push([{ }, { }, { text: 'IGV (18%) :', style: 'tableHeader', alignment: 'right', colSpan: 2}, { }, { text: simboloNuevoSol + totalIGV, style: 'contenido', alignment: 'right' }]); */
//     body.push([{ text: '', border: [false, false, false, false], colSpan: 2 }, {}, { text: 'Total:', style: 'tableHeader', alignment: 'right', colSpan: 2 }, {}, { text: simboloNuevoSol + total, style: 'contenido', alignment: 'right' }]);

//     return body;
//   }

//   function table(data, columns) {
//     var subtotal = buildData();
//     return {
//       style: 'tableMargin',
//       color: '#444',
//       table: {
//         widths: [25, '*', 63, 60, 63],
//         heights: [20, 20, 20, 20],
//         headerRows: 1,
//         body: buildTableBody(data, columns, subtotal)
//       }
//     };
//   }

//   function estadoBoletaFunc(estado) {
//     return {
//       text: estado, background: 'yellow'
//     };
//   }

//   const pdfDefinition: any = {
//     pageSize: 'A4',
//     //pageOrientation: 'landscape',
//     pageMargins: [40, 60, 40, 60],
//     content: [
//       {
//         style: 'tableMargin',
//         table: {
//           widths: ['*', '*'],
//           body: [
//             /* [{ image: await getBase64ImageFromURL('/assets/images/logo-dark.png'), width: 150 }, { text: 'Nº de Boleta: ' + numeroBoleta, style: 'tableHeader', rowSpan: 4, alignment: 'right' }], */
//             [{ image: await getBase64ImageFromURL('/assets/images/logo-dark.png'), width: 150 }, { text: '', style: 'tableHeader', rowSpan: 3, alignment: 'right' }],
//             [{ text: direccionEmpresa, style: 'datosempresa' }, {}],
//             [{ text: correoEmpresa, style: 'datosempresa' }, {}],
//             [{ text: felefonoEmpresa, style: 'datosempresa' }, {}],
//           ]
//         },
//         layout: 'noBorders'
//       },

//       {
//         style: 'tableMargin',
//         table: {
//           widths: ['*', '*'],
//           body: [
//             /* [{ text: 'Facturado a:', style: 'tableHeader' }, { text: 'Nº de Boleta:', style: 'tableHeader', alignment: 'right' }],
//             [{ text: nombresCliente, style: 'subtitulo' }, {text: numeroBoleta, style: 'contenido', alignment: 'right'}], */
//             [{ text: 'Facturado a:', style: 'tableHeader' }, { text: 'Fecha de la Boleta:', style: 'tableHeader', alignment: 'right' }],
//             [{ text: nombresCliente, style: 'subtitulo' }, { text: fecha_hoy, style: 'contenido', alignment: 'right' }],
//             [{ text: 'Fecha de Nacimiento: ' + fnacimientoCliente, style: 'contenido' }, { text: '', style: 'tableHeader', alignment: 'right' }],
//             [{ text: 'Correo: ' + correoCliente, style: 'contenido' }, { text: '', style: 'contenido', alignment: 'right' }],
//             [{ text: 'Telefono: ' + telefonoCliente, style: 'contenido' }, {}],
//           ]
//         },
//         layout: 'noBorders'
//       },

//       { text: 'Resumen del pedido:', style: 'subtitulo' },

//       table(externalDataRetrievedFromServer, ['num_orden', 'detalle', 'precio', 'cantidad', 'total']),

//       {
//         text: [,
//           { text: 'Fecha de Entrega: ', style: 'textBold' },
//           fecha_entrega,
//           '   ',
//           { text: 'Hora: ', style: 'textBold' },
//           hora_entrega,
//         ]
//       },

//       { text: 'Nota:', style: 'subtitulo2' },
//       { text: 'Todo trabajo se efectuara con un adelanto del 50%.', style: 'contenido2', alignment: 'justify' },
//       { text: 'La empresa no se responsabiliza de los pedidos no recogidos después de un mes.', style: 'contenido2', alignment: 'justify' },
//     ],
//     styles: {
//       subtitulo: {
//         bold: true,
//         fontSize: 13,
//         color: 'black',
//         margin: [0, 10, 0, 5]
//       },
//       subtitulo2: {
//         bold: true,
//         fontSize: 10,
//         color: 'black',
//         margin: [0, 10, 0, 5]
//       },
//       contenido: {
//         fontSize: 12,
//       },
//       contenido2: {
//         fontSize: 8,
//       },
//       textBold: {
//         fontSize: 12,
//         bold: true,
//       },

//       datosempresa: {
//         fontSize: 10,
//       },

//       header: {
//         fontSize: 17,
//         bold: true,
//         margin: [0, 0, 0, 10]
//       },
//       subheader: {
//         fontSize: 13,
//         bold: true,
//         margin: [0, 10, 0, 5]
//       },
//       subtitle: {
//         fontSize: 12,
//         bold: true,
//         margin: [0, 10, 0, 5]
//       },
//       tableMargin: {
//         margin: [0, 15, 0, 15]
//       },
//       tableOpacityExample: {
//         margin: [0, 5, 0, 15],
//         fillColor: 'blue',
//         fillOpacity: 0.3
//       },
//       tableHeader: {
//         bold: true,
//         fontSize: 13,
//         color: 'black'
//       },

//     },

//   }

//   const pdf = pdfMake.createPdf(pdfDefinition);
//   pdf.open();
// }
