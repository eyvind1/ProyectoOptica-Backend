import { google } from "googleapis";
import { Duplex } from "stream";
import axios from "axios";

const auth = new google.auth.GoogleAuth({
  //   scopes: process.env.GOOGLE_SCOPES,
  //   credentials: {
  //     client_email: process.env.GOOGLE_CLIENT_EMAIL,
  //     private_key: process.env.GOOGLE_CLIENT_PRIVATE_KEY.replace(/\\n/g, "\n"),
  // //   },
  //   projectId: process.env.GOOGLE_PROJECT_ID,

  credentials: {
    client_email: "googledrive@optica-403623.iam.gserviceaccount.com",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvRyYvYIxGj8Uv\ntZirzXanjvQGxF0uZlNnjflPf9dILf/tMo1mWml+wTxfZtR9omteyLAl7o1pwExw\nMtH57zyFNS4Y7L3enfkxgHygWi0rDc5iNwVmCX82J/ameVfixxm+cRR3hsykQO28\n2DU0RjN1rWTsxuPv+ne5RQqCPKBW+HoBXe+1RkbeLp2Xtia/50kTZ2FKQuOFAzcN\nFSkA0FaqC4dPg6q0EO/lyVjbaEhHxgu94772TB9gG6L8fo1qSKnxv/c34SYundgq\naYqwYerLnx5AEsoZhvk5WEPNaszGPKsu33cWirNmGkcRUM3z5SLQP3QqCgey50d2\n38bDuL+FAgMBAAECggEABrqyD7T8UOpmVSZHksAw806AAurmDIjkLQ0cpCQFC8hF\n7TR48xPuI4fF5BnEEOciVsGL6O20L/oW7skDGiSu5T3wVtRvMICBist88JqvS9n1\nvi9dMMvIWDfUXROg8qikARV0hjQ+kuD+35zjY6FJ8RVaBkpXTouf4UglY6OlOkGA\nNun0npha4V3Ur0jqaxZha4J9Jz4VY4RKU8uUFZQoGuk2yvoDFr0vRpvzmgoNXaPa\nDkfpVXvfHN+fgHzVEMfVtHpsPO7pqTLb9vfTdJcafRim5cIug5KV9lciMBFSW5m3\nddqNSpA008wB2aYM5kA+wBoSZZBEdDkT7IB6W3sVoQKBgQDesAOmD/siKEBvL3nd\nbLqvNjFiN/5vtLXIFy6GXg9pF+LMxMAJXWptSnSoj6RM7fqcqaMQkvQVoMHKPxJS\nxxPvRlRfX136qGWsfaul92Dpv+KJoprb4jC4epUfIlPeLQRGuFCkARfHaF6QmuUI\njgv78MVyuhXNfOtwdFClBE2KdQKBgQDJf4xASkkR/2OUUCmi4/ehx+T9rzcR3Szh\nfGWQYH5G0yGgYmlldNx0KN17vueU8giX1bFxg7/BzJWVX6a8r7Xa3D6pN9JbynUj\nyWoVeiPX+LTMNRc0X7L4KGTk6jijMXaspNSGeoW8QykNlLhzg3YspbQh7lW3qcQc\nCSRN0U0e0QKBgQCnTUvgdj8xwVXvcpa28VosCqX9aZ4BpJ2xzyDIGGCxjx14xBSW\ntJUhuP9+KDTDC0PucVAuQomYuib94HbOs/xZFtiKsqZzjBKfDedokDtCQkRbLUv1\nCLGb15SzSGIEGIQO8ai8HooT6WiqcYTC8Z01UgW1lPKOaFymJuzznRD4hQKBgCsT\n7K0V9Jc3bVeY573eVOOuc6NUoUZdbanrSV9bccO8gZTjVTsOh88BqZA6GRJ7yCCF\n3ACztPw+u8AKigAO5KccrPzKZVugZfi3p8ldqmoSzrxVoVdeGkn5gNB7zo39Fi0E\ntDbn3M2J4i34HJL9iPc0mdUjOgog7j88KRnF5GHxAoGAWHrD+3a0G3OreYqWlz4M\ncFGgoW4iUwbSmo+cq9IKp1KzMGXhRtrr8qu5sTFD2Yj+GrwBhy/tOeUdsd+xucmc\nyc15mkK0SgjaYN6zZPH40ocqMLebUXly+cXAYWVtEgbguTelemlrj2EkWmRzLFWb\ne2fqeyxu4igU4u3u35lxBjM=\n-----END PRIVATE KEY-----\n",
  },
  scopes: "https://www.googleapis.com/auth/drive",
  projectId: "optica-403623",
});

const driveService = google.drive({
  version: "v3",
  auth: auth,
});
export const GOOGLE_FOLDER_SEDES = "1iu_1peN6a6bwZiswH-jt0Fpb7NNRbice";

// * This function uploads a document to Google Drive
const uploadToGoogleDrive = async (
  bufferStream,
  filename,
  folder,
  mimeType
) => {
  try {
    const requestBody = {
      name: filename,
      parents: [folder], // what folder to upload
      fields: "id",
    };
    const media = {
      mimeType: mimeType,
      body: bufferStream,
    };
    const response = await driveService.files.create({
      requestBody,
      media: media,
    });
    return response.data.id;
  } catch (err) {
    return err;
  }
};

//* Function to create a public Url for specific realId
const generatePublicUrl = async (realId) => {
  try {
    await driveService.permissions.create({
      fileId: realId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    const result = await driveService.files.get({
      fileId: realId,
      fields: "webViewLink, webContentLink",
    });
    console.log(result.data.webViewLink);
    return result.data.webContentLink;
  } catch (error) {
    return error;
  }
};

export const uploadFile = async (req, res) => {
  const file = req.file;
  const tmp = new Duplex();
  tmp.push(file.buffer);
  tmp.push(null);

  const realId = await uploadToGoogleDrive(
    tmp,
    file.originalname,
    GOOGLE_FOLDER_SEDES,
    file.mimetype
  );

  const logoURL = await generatePublicUrl(realId);
  res.json(logoURL); //Response From google Drive
};

export const prueba = async (req, res) => {
  let image = await axios.get(
    "https://drive.google.com/uc?id=1UUw_qSesVIf7e1_0sAQCGYoqD3bJ0BQx&export=download",
    {
      responseType: "arraybuffer",
    }
  );
  let returnedB64 = Buffer.from(image.data).toString("base64");
  res.json(returnedB64);
};

//   export const deleteFileDrive=async(realId)=> {
//     try {
//       const response = await this.driveService.files.delete({
//         fileId: realId,
//       });
//       return response;
//     } catch (error) {
//       return error.message;
//     }
//   }
