import AWS from "../db.js";
import { v4 } from "uuid";
import { codeForTables } from "../utils/codigosTablas.js";
import { validarDni } from "../helpers/helperFunctions.js";
import { castIsoDateToDate } from "../helpers/helperFunctions.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import { prueba } from "./googleDriveApi.controller.js";

const TABLE_NAME_CLIENTE = "Clientes";
const dynamoClient = new AWS.DynamoDB.DocumentClient();

/* Funciones que se utilizan en el archivo */
async function sortArrayJsonByDate(arrayJson) {
  arrayJson.sort((a, b) => {
    return new Date(b.fecha_creacion) - new Date(a.fecha_creacion); // descending
  });
  return arrayJson;
}
/* End funciones que se utilizan en el archivo */

export const getAllClientsBySedeMinified = async (req, res) => {
  try {
    const id_sede = req.params.idSede;
    /*Primero obtengo el json con todos los clientes */
    const params = {
      TableName: TABLE_NAME_CLIENTE,
      FilterExpression:
        "#habilitado = :valueHabilitado and  #id_sede = :valueSede",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
        ":valueSede": id_sede,
      },
      //Envio solamente ciertos campos
      ProjectionExpression:
        "id_cliente, apellidos ,nombres,dni,email,telefono,fecha_nacimiento,direccion,medidas",
      ExpressionAttributeNames: {
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

export const getAllClientsMinified = async (req, res) => {
  try {
    /*Primero obtengo el json con todos los clientes */
    const params = {
      TableName: TABLE_NAME_CLIENTE,
      FilterExpression: "#habilitado = :valueHabilitado",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
      },
      //Envio solamente ciertos campos
      ProjectionExpression:
        "id_cliente, apellidos ,nombres,dni,email,telefono,fecha_nacimiento,direccion,medidas",
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
    return res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const getClientById = async (req, res) => {
  const id_cliente = req.params.idCliente;
  try {
    /*Primero obtengo el json con todos los usuarios */
    const params = {
      TableName: TABLE_NAME_CLIENTE,
      FilterExpression:
        "#habilitado = :valueHabilitado and #id_cliente = :valueIdCliente",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
        ":valueIdCliente": id_cliente,
      },
      ExpressionAttributeNames: {
        "#habilitado": "habilitado",
        "#id_cliente": "id_cliente",
      },
      ProjectionExpression:
        "id_cliente,medidas,apellidos,nombres,dni,email,telefono,fecha_nacimiento,direccion",
    };
    const cliente = await dynamoClient.scan(params).promise();
    return res.json(cliente.Items);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

export const getAllClients = async (req, res) => {
  const TABLE_NAME_CLIENTE = "Clientes";
  try {
    /*Primero obtengo el json con todos los clientes */
    const params = {
      TableName: TABLE_NAME_CLIENTE,
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
    return res.json(rpta);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

/* Dar de Baja al Cliente */
export const darBajaClienteById = async (req, res) => {
  const id_cliente = req.params.idCliente;
  try {
    //Primero actualizo datos de la tabla cliente
    const paramsUsuario = {
      TableName: TABLE_NAME_CLIENTE,
      Key: {
        id_cliente: id_cliente,
      },
      UpdateExpression: "SET habilitado = :habilitado",
      ExpressionAttributeValues: {
        ":habilitado": false,
      },
    };
    const usuario = await dynamoClient.update(paramsUsuario).promise();
    return res.json(usuario);
  } catch (error) {
    return res.status(500).json({
      message: "Algo anda mal",
    });
  }
};

export const editClientById = async (req, res) => {
  const id_cliente = req.params.idCliente;
  const {
    medidas,
    direccion,
    apellidos,
    nombres,
    telefono,
    email,
    fecha_nacimiento,
    antecedentes,
  } = req.body;
  try {
    //Primero actualizo datos de la tabla cliente
    const paramsCliente = {
      TableName: TABLE_NAME_CLIENTE,
      Key: {
        id_cliente: id_cliente,
      },
      UpdateExpression: `SET medidas = :medidas, antecedentes = :antecedentes, apellidos = :apellidos, nombres = :nombres,
                                    telefono = :telefono,fecha_nacimiento=:fecha_nacimiento,direccion=:direccion,
                                    email=:email `,
      ExpressionAttributeValues: {
        ":medidas": medidas,
        ":antecedentes": antecedentes,
        ":direccion": direccion,
        ":apellidos": apellidos,
        ":nombres": nombres,
        ":telefono": telefono,
        ":fecha_nacimiento": fecha_nacimiento,
        ":email": email,
      },
    };
    const cliente = await dynamoClient.update(paramsCliente).promise();
    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

/*
     Validaciones
     1.- Validamos que el dni ingresado no exista en la tabla Clientes
*/
export const createNewClient = async (req, res) => {
  //estado bool
  try {
    const id_cliente = v4() + codeForTables.tablaClients;
    const fecha = new Date();
    const fecha_creacion = await castIsoDateToDate(fecha);
    const {
      nombres,
      apellidos,
      direccion,
      antecedentes,
      medidas,
      dni,
      fecha_nacimiento,
      email,
      fecha_modificacion,
      telefono,
      habilitado,
    } = req.body;
    const dniValidado = await validarDni(dni, TABLE_NAME_CLIENTE);
    if (dniValidado > 0) {
      return res.status(400).json({
        message: "Dni Duplicado",
      });
    }
    const newCliente = {
      id_cliente,
      habilitado,
      direccion,
      antecedentes,
      medidas,
      apellidos,
      dni,
      fecha_nacimiento,
      fecha_creacion,
      fecha_modificacion,
      nombres,
      email,
      telefono,
    };
    const createdClient = await dynamoClient
      .put({
        TableName: TABLE_NAME_CLIENTE,
        Item: newCliente,
      })
      .promise();
    return res.json(createdClient);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

//Generar pdf Receta y enviar al front
export const getRecetaPDF = async (req, res) => {
  let { cliente, sede } = req.body;
  //Cliente y sede imprimelos adentro contiene atributos, cliente.nombre, etc ...

  console.log(req.body);
  var fecha_hoy = new Date(Date.now()).toLocaleDateString("en-GB");

  var numeroReceta = "Nº 000901";
  var propietarioEmpresa = "Raúl J. Condori Ramos";
  var direccionEmpresa = sede.direccion ? sede.direccion : " ";
  var felefonoEmpresa = sede.telefono ? sede.telefono : " ";
  var primeraRecomnedacion =
    "Al empezar a usar los nuevos lentes, es de esperar ciertas incomodidades; ejemplo enturbamiento en la visión a distancia, elevación o inclinacion del nivel del piso, ligera sensación de mareo, que luego desaparece.";
  var segundaRecomendacion =
    "Acuda personalmente donde el óptico, para un correcto montaje de sus lentes. Vuelva al optómetra para verificar la correcta preparación de sus lentes.";

  var nombresCliente = cliente.nombres;
  var apellidosCliente = cliente.apellidos;
  var dniCliente = cliente.dni;
  var fnacimientoCliente = new Date(
    cliente.fecha_nacimiento
  ).toLocaleDateString("en-GB");
  var telefonoCliente = cliente.telefono
    ? cliente.telefono
    : "Sin especificar.";

  var od_esf_Cliente =
    cliente.medidas[0].od_esferico > 0
      ? "+" + cliente.medidas[0].od_esferico.toFixed(2)
      : cliente.medidas[0].od_esferico.toFixed(2);
  var od_cil_Cliente =
    cliente.medidas[0].od_cilindrico > 0
      ? "+" + cliente.medidas[0].od_cilindrico.toFixed(2)
      : cliente.medidas[0].od_cilindrico.toFixed(2);
  var od_eje_Cliente = cliente.medidas[0].od_eje;

  var oi_esf_Cliente =
    cliente.medidas[0].oi_esferico > 0
      ? "+" + cliente.medidas[0].oi_esferico.toFixed(2)
      : cliente.medidas[0].oi_esferico.toFixed(2);
  var oi_cil_Cliente =
    cliente.medidas[0].oi_cilindrico > 0
      ? "+" + cliente.medidas[0].oi_cilindrico.toFixed(2)
      : cliente.medidas[0].oi_cilindrico.toFixed(2);
  var oi_eje_Cliente = cliente.medidas[0].oi_eje;

  var dip_Cliente = cliente.medidas[0].dip;
  var add_Cliente =
    cliente.medidas[0].add > 0
      ? "+" + cliente.medidas[0].add.toFixed(2)
      : cliente.medidas[0].add.toFixed(2);

  var encargadoCliente = cliente.medidas[0].encargado
    ? cliente.medidas[0].encargado
    : " ";

  try {
    var docDefinition = {
      pageSize: "A4",
      //pageOrientation: 'landscape',
      pageMargins: [40, 10, 40, 10], // left, top, right, botton
      content: [
        // LOGO y DATOS DE LA EMPRESA
        {
          style: "tableBasic",
          table: {
            widths: ["auto", "*"],
            body: [
              [
                {
                  image:
                    "data:image/png;base64," + (await prueba(sede.logoURL)),
                  width: 230,
                  rowSpan: 4,
                },
                { text: "Receta:", style: "subtitle", alignment: "right" },
              ],
              [{}, { text: numeroReceta, alignment: "right" }],
              [{}, { text: "Fecha:", style: "subtitle", alignment: "right" }],
              [{}, { text: fecha_hoy, alignment: "right" }],
              [{ text: "De " + propietarioEmpresa, alignment: "center" }, {}],
              [
                {
                  text: direccionEmpresa,
                  style: "header",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
                {
                  text: "Cel: " + felefonoEmpresa,
                  style: "header",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
              ],
            ],
          },
          layout: {
            defaultBorder: false,
          },
        },

        // DATOS DEL CLIENTE
        {
          style: "tableBasic",
          table: {
            widths: ["*", "*", "*"],
            body: [
              [
                {
                  text: "Paciente: " + nombresCliente + apellidosCliente,
                  style: "title",
                  alignment: "left",
                  colSpan: 2,
                },
                {},
                {
                  text: "DNI: " + dniCliente,
                  style: "text",
                  alignment: "left",
                },
              ],
              [
                {
                  text: "F. Nac.: " + fnacimientoCliente,
                  style: "text",
                  alignment: "left",
                },
                { text: "Ocupación: ", style: "text", alignment: "left" },
                {
                  text: "Cel: " + telefonoCliente,
                  style: "text",
                  alignment: "left",
                },
              ],
            ],
          },
          layout: {
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 1 : 0;
            },
          },
        },

        // VISION DE LEJOS
        {
          style: "tableBasic",
          table: {
            widths: [150],
            heights: [15],
            body: [
              [
                {
                  text: "VISIÓN DE LEJOS: ",
                  style: "title2",
                  alignment: "left",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            paddingLeft: function (i, node) {
              return 10;
            },
          },
        },

        {
          style: "tableBasic",
          table: {
            widths: ["*", "*", "*", "*", "*", "*"],
            heights: [15, 15, 15],
            headerRows: 2,
            body: [
              [
                {
                  text: "REF.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
                {
                  text: "ESF.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
                {
                  text: "CIL.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
                {
                  text: "EJE.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
                {
                  text: "AV.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
                {
                  text: "DIP.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 2, 0, 2],
                },
              ],
              [
                {
                  text: "O.D.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: od_esf_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: od_cil_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: od_eje_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: "",
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: dip_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
              ],
              [
                {
                  text: "O.I.",
                  style: "title",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: oi_esf_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: oi_cil_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: oi_eje_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: "",
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
                {
                  text: dip_Cliente,
                  style: "text",
                  alignment: "center",
                  margin: [0, 1, 0, 1],
                },
              ],
            ],
          },
          layout: {
            fillColor: function (rowIndex) {
              return rowIndex === 0 ? "#d8e3fc" : null;
            },
          },
        },

        // VISION DE CERCA
        {
          style: "tableBasic",
          table: {
            widths: [150, "*", 150],
            heights: [15],
            body: [
              [
                {
                  text: "VISIÓN DE CERCA: ",
                  alignment: "left",
                  style: "title2",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
                [
                  {
                    table: {
                      widths: ["auto", "*"],
                      body: [
                        [
                          {
                            text: "ADD.",
                            style: "title",
                            alignment: "center",
                            fillColor: "#d8e3fc",
                          },
                          {
                            text: add_Cliente,
                            style: "text",
                            alignment: "center",
                          },
                        ],
                      ],
                    },
                  },
                ],
                {},
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            paddingLeft: function (i, node) {
              return 10;
            },
          },
        },

        // DIAGNÓSTICO
        {
          style: "tableBasic",
          table: {
            widths: ["*", "*", "*", "*"],
            heights: [15],
            body: [
              [
                {
                  text: "DIAGNÓSTICO: ",
                  alignment: "left",
                  style: "title2",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Miopia",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Hipermetropía",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Astigmatismo",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],

              [
                "",
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Presbicia",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Ojo Vago",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "Ambliopia",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            paddingLeft: function (i, node) {
              return 10;
            },
          },
        },

        // TIPO DE LENTES
        {
          style: "tableBasic",
          table: {
            widths: ["*", "*", "*"],
            heights: [15],
            body: [
              [
                {
                  text: "TIPO DE LENTES: ",
                  alignment: "left",
                  style: "title2",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
                "",
                {
                  text: "SE RECOMIENDA",
                  alignment: "center",
                  style: "title2",
                  fillColor: "#2D4497",
                  fillOpacity: 0.8,
                },
              ],
              [
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "MONOFOCALES",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "ORGÁNICOS",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "ANTIREFLEX",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],

              [
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "BIFOCALES",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "CRISTALES",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "FOTOCROMÁTICOS",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],

              [
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "MULTIFOCALES",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "POLICARBONATO",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
                [
                  {
                    table: {
                      widths: [10, "*"],
                      body: [
                        [
                          " ",
                          {
                            text: "LC",
                            style: "text",
                            alignment: "left",
                            border: [true, false, false, false],
                          },
                        ],
                      ],
                    },
                  },
                ],
              ],
            ],
          },
          layout: {
            paddingLeft: function (i, node) {
              return 10;
            },
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 1 : 0;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 1 : 0;
            },
          },
        },

        // OBSERVACIONES
        {
          style: "tableBasic2",
          table: {
            widths: [350, "*"],
            heights: [30],
            body: [
              [
                { text: "OBSERVACIONES: ", style: "title", alignment: "left" },
                { text: encargadoCliente, style: "text", alignment: "center" },
              ],
              [
                {},
                {
                  text: "Especialista",
                  style: "text",
                  alignment: "center",
                  border: [false, true, false, false],
                },
              ],
            ],
          },
          layout: {
            defaultBorder: false,
          },
        },

        // TICKET
        {
          style: "tableBasic",
          table: {
            widths: ["auto", "*"],
            body: [
              [
                {
                  image:
                    "data:image/png;base64," + (await prueba(sede.logoURL)),
                  width: 150,
                  rowSpan: 3,
                  border: [false, true, false, false],
                },
                { text: " ", border: [false, true, false, false] },
              ],
              [
                {},
                { text: direccionEmpresa, style: "title", alignment: "center" },
              ],
              [
                {},
                {
                  text: "Cel: " + felefonoEmpresa,
                  style: "title",
                  alignment: "center",
                },
              ],
              [{ text: "De " + propietarioEmpresa, alignment: "left" }, {}],
            ],
          },
          layout: {
            defaultBorder: false,

            hLineStyle: function (i, node) {
              if (i === 0) {
                return { dash: { length: 10, space: 4 } };
              }
              return null;
            },
          },
        },

        // DATOS DEL CLIENTE
        {
          style: "tableBasic",
          table: {
            widths: ["*", 100],
            body: [
              [
                {
                  text: "Paciente: " + nombresCliente + apellidosCliente,
                  style: "title",
                  alignment: "left",
                },
                {
                  text: "DNI: " + dniCliente,
                  style: "text",
                  alignment: "left",
                },
              ],
              [
                {
                  text: "FECHA DE CONTROL: ",
                  color: "#2D4497",
                  style: "title",
                  alignment: "left",
                },
                {
                  text: "Cel: " + telefonoCliente,
                  style: "text",
                  alignment: "left",
                },
              ],
            ],
          },
          layout: {
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 1 : 0;
            },
          },
        },

        // RECOMENDACIONES
        {
          style: "tableBasic",
          table: {
            widths: [350, "*"],
            body: [
              [
                {
                  text: "RECOMENDACIONES: ",
                  color: "#2D4497",
                  style: "subtitle",
                  alignment: "left",
                },
                {},
              ],
              [
                {
                  text: primeraRecomnedacion,
                  color: "#2D4497",
                  style: "small",
                  alignment: "left",
                },
                { text: encargadoCliente, style: "text", alignment: "center" },
              ],
              [
                {
                  text: segundaRecomendacion,
                  color: "#2D4497",
                  style: "small",
                  alignment: "left",
                },
                {
                  text: "Especialista",
                  color: "#2D4497",
                  style: "text",
                  alignment: "center",
                  border: [false, true, false, false],
                },
              ],
            ],
          },
          layout: {
            defaultBorder: false,
          },
        },
      ],
      styles: {
        header: {
          fontSize: 15,
          bold: true,
          color: "white",
          alignment: "center",
          margin: [0, 0, 0, 0],
        },

        title: {
          fontSize: 13,
          bold: true,
          color: "#2D4497",
          margin: [0, 0, 0, 0],
        },

        title2: {
          fontSize: 13,
          bold: true,
          color: "white",
          margin: [0, 0, 0, 0],
        },

        subtitle: {
          fontSize: 12,
          bold: true,
          color: "#2D4497",
          margin: [0, 0, 0, 0],
        },

        text: {
          fontSize: 11,
          color: "#2D4497",
          margin: [0, 0, 0, 0],
        },

        small: {
          fontSize: 9,
          color: "#2D4497",
          margin: [0, 0, 0, 0],
        },

        tableBasic: {
          color: "#2D4497",
          margin: [0, 3, 0, 3],
        },

        tableBasic2: {
          color: "#2D4497",
          margin: [0, 3, 0, 7],
        },
      },
    }; //Chino rellenar el doc definition y queda
    var pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBase64(async (base64) => {
      res.json(base64);
    });
  } catch (error) {
    console.log(error);
  }
};
