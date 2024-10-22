import { NextApiRequest, NextApiResponse } from 'next';
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { IncomingForm, Fields } from 'formidable';
import fs from 'fs';

// Configuração para desativar o bodyParser do Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Definição de tipos para os campos e arquivos
type CustomFields = {
  database?: string[];
  table?: string[];
};

type CustomFiles = {
  file: {
    filepath: string;
    originalFilename: string;
  }[];
};

// Verifique se as propriedades existem
const isCustomFields = (fields: Fields): fields is CustomFields => {
  return fields && typeof fields === 'object' && 'database' in fields && 'table' in fields;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files]: [CustomFields, CustomFiles] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // Verifique se fields contém as propriedades necessárias
    if (!isCustomFields(fields)) {
      return res.status(400).json({ message: 'Invalid fields format' });
    }

    const file = files.file[0]; // O arquivo enviado
    const database = fields.database ? fields.database[0] : undefined; // O nome do banco de dados
    const table = fields.table ? fields.table[0] : undefined; // O nome da tabela

    if (!file || !database || !table) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verifica se o arquivo é um TXT
    if (file.originalFilename && !file.originalFilename.endsWith('.txt')) {
      return res.status(400).json({ message: 'File must be a TXT' });
    }

    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!accountName || !accountKey || !containerName) {
      return res.status(500).json({ message: 'Azure storage account details are not properly configured' });
    }

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(`${database}/${table}/${file.originalFilename}`);

    const fileBuffer = fs.readFileSync(file.filepath);
    await blobClient.upload(fileBuffer, fileBuffer.length);

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
