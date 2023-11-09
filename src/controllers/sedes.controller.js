import AWS from "../db.js";
/* Libreria para poder generar ID's aleatorios*/
import { v4 } from "uuid";
/* Archivo util donde se especifica el codigo que se concatenera a cada ID de cada tabla */
import { codeForTables } from "../utils/codigosTablas.js";
import { DEFAULT_LOGO_URL } from "../utils/constants.js";
import { castIsoDateToDate } from "../helpers/helperFunctions.js";
import axios from "axios";

/* Constantes Globales que utilizan las funciones de este archivo */
const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME_SEDE = "Sedes";

/* Esta funcion lista todas las sedes que se encuentran con "estado = Habikitado" */
export const getAllSedes = async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAME_SEDE,
      FilterExpression: "#habilitado = :valueHabilitado",
      ExpressionAttributeValues: {
        ":valueHabilitado": true,
      },
      ExpressionAttributeNames: {
        "#habilitado": "habilitado",
      },
    };
    // const sedes = await dynamoClient.scan(params).promise();
    // return res.json(sedes.Items);
    const scanResults = [];
    let items;
    do {
      // items = await dynamoClient.scan(params).promise();
      // items.Items.forEach((item) => scanResults.push(item));
      // params.ExclusiveStartKey = items.LastEvaluatedKey;

      items = await dynamoClient.scan(params).promise();
      items.Items.forEach((item) => {
        // item.logoBase64 = getBase64(item.logoURL);
        // getBase64(item.logoURL);
        // item.logoBase64 = "hola";
        scanResults.push(item);
      });

      params.ExclusiveStartKey = items.LastEvaluatedKey;
    } while (typeof items.LastEvaluatedKey !== "undefined");
    // let a = await getBase64(
    //   "https://drive.google.com/uc?id=1UUw_qSesVIf7e1_0sAQCGYoqD3bJ0BQx&export=download"
    // );
    // console.log(a);
    return res.json(scanResults);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

// Get Base 64 from image using Axios
const getBase64 = async (url) => {
  console.log(url, url);
  let image = await axios.get(
    "https://drive.google.com/uc?id=1UUw_qSesVIf7e1_0sAQCGYoqD3bJ0BQx&export=download",
    {
      responseType: "arraybuffer",
    }
  );

  // console.log(image.data);
  let returnedB64 = Buffer.from(image.data).toString("base64");
  return returnedB64;
};

export const createNewSede = async (req, res) => {
  try {
    // Concateno el id_sede + su codigo especificado en el archivo util "CodigosTablas.js"
    const id_sede = v4() + codeForTables.tablaSedes;
    const fecha = new Date();
    const fecha_creacion_sede = await castIsoDateToDate(fecha);
    let logoURL = req.body.logoURL;
    if (!logoURL) {
      logoURL = DEFAULT_LOGO_URL;
    }
    const {
      habilitado,
      direccion,
      fecha_modificacion_sede,
      nombre_sede,
      color,
      telefono,
      ruc,
    } = req.body;

    const datosSede = {
      id_sede,
      habilitado,
      direccion,
      fecha_creacion_sede,
      fecha_modificacion_sede,
      nombre_sede,
      color,
      telefono,
      ruc,
      logoURL,
    };
    const newSede = await dynamoClient
      .put({
        TableName: TABLE_NAME_SEDE,
        Item: datosSede,
      })
      .promise();
    return res.json(newSede);
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
};

const validateSede = async (idSede) => {
  const id_sede = idSede;
  try {
    const paramsSede = {
      TableName: TABLE_NAME_SEDE,
      KeyConditionExpression: "id_sede = :id_sede",
      ExpressionAttributeValues: {
        ":id_sede": id_sede,
      },
    };
    const sede = await dynamoClient.query(paramsSede).promise();
    return sede.Items;
  } catch (error) {
    return error;
  }
};

/*
    1.-  Funcion para Dar de Baja a una Sede en especifico  
    2.-  Antes de dar de baja a un accesorio valido que exista
    3.-  Funcion Verificada al 100%
*/
export const unsubscribeSedeById = async (req, res) => {
  const id_sede = req.params.idSede;
  const existeSede = await validateSede(id_sede);
  if (existeSede.length > 0) {
    try {
      const paramsSede = {
        TableName: TABLE_NAME_SEDE,
        Key: {
          id_sede: id_sede,
        },
        UpdateExpression: "SET habilitado = :habilitado",
        ExpressionAttributeValues: {
          ":habilitado": false,
        },
      };
      const sede = await dynamoClient.update(paramsSede).promise();
      res.json(sede);
      return sede;
    } catch (error) {
      return res.status(500).json({
        message: "Algo anda mal",
      });
    }
  } else {
    return res.status(500).json({
      message: "La sede no existe",
    });
  }
};

export const editSedeById = async (req, res) => {
  const id_sede = req.params.idSede;
  const logoURL = req.body.logoURL || "";
  const {
    direccion,
    nombre_sede,
    fecha_modificacion_sede,
    color,
    telefono,
    ruc,
  } = req.body;
  try {
    const paramsSede = {
      TableName: TABLE_NAME_SEDE,
      Key: {
        id_sede: id_sede,
      },
      UpdateExpression: `SET  direccion= :direccion, nombre_sede=:nombre_sede, 
                              fecha_modificacion_sede = :fecha_modificacion_sede, logoURL = :logoURL
                              , ruc = :ruc, telefono = :telefono`,
      ConditionExpression: "id_sede = :id_sede",
      ExpressionAttributeValues: {
        ":id_sede": id_sede,
        ":direccion": direccion,
        ":nombre_sede": nombre_sede,
        ":fecha_modificacion_sede": fecha_modificacion_sede,
        // ":color": color,
        ":telefono": telefono,
        ":ruc": ruc,
        ":logoURL": logoURL,
      },
    };
    const sede = await dynamoClient.update(paramsSede).promise();
    return res.json(sede);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Ocurrio un error o no se encuentra la sede",
    });
  }
};
