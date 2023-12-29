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

const createPDFBi = async () => {
  var fonts = {
    Roboto: {
      normal: "src/controllers/Roboto-Regular.ttf",
    },
  };
  var printer = new PdfPrinter(fonts);
  var docDefinition = {
    content: [
      "First paragraph",
      "Another paragraph, this time a little bit longer to make sure, this line will be divided into at least two lines",
    ],
  };
  var pdfDoc = pdfMake.createPdf(docDefinition);
  pdfDoc.getDataUrl((dataUrl) => {
    // res.send(buffer);
    res.contentType("application/pdf");

    res.send(dataUrl);
  });
  // return  pdfDoc.getDataUrl();
};
// Genera PDF y envio al front
export const getPDF = async (req, res) => {
  try {
    var fonts = {
      Roboto: {
        normal: "src/controllers/Roboto-Regular.ttf",
      },
    };
    var printer = new PdfPrinter(fonts);
    var docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [40, 60, 40, 60],
      content: [
        {
          style: "tableMargin",
          table: {
            widths: ["*", "*"],
            body: [
              /* [{ image: await getBase64ImageFromURL('/assets/images/logo-dark.png'), width: 150 }, { text: 'Nº de Boleta: ' + numeroBoleta, style: 'tableHeader', rowSpan: 4, alignment: 'right' }], */
              [
                {
                  image: await getBase64ImageFromURL(
                    "/assets/images/logo-dark.png"
                  ),
                  width: 150,
                },
                {
                  text: "",
                  style: "tableHeader",
                  rowSpan: 3,
                  alignment: "right",
                },
              ],
            ],
          },
          layout: "noBorders",
        },
      ],
    };
    var pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBase64((base64) => {
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
