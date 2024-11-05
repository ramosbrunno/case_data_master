import { NextApiRequest, NextApiResponse } from 'next'; // Importa os tipos de requisição e resposta da API do Next.js
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob"; // Importa o cliente de serviço Blob e credenciais de chave compartilhada do Azure
import { IncomingForm, Fields, Files } from 'formidable'; // Importa o módulo formidable para manipulação de formulários
import fs from 'fs'; // Importa o módulo de sistema de arquivos do Node.js

// Configuração para desativar o bodyParser do Next.js
export const config = {
  api: {
    bodyParser: false, // Desabilita o bodyParser padrão do Next.js para permitir o upload de arquivos
  },
};

// Definição de tipos personalizados para os campos
type CustomFields = {
  database?: string[]; // Nome do banco de dados
  table?: string[]; // Nome da tabela
};

// Função para verificar se os campos personalizados estão corretos
const isCustomFields = (fields: Fields): fields is CustomFields => {
  return fields && typeof fields === 'object' && 'database' in fields && 'table' in fields;
};

// Função padrão para manipular a requisição da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método da requisição é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' }); // Retorna erro 405 se não for POST
  }

  try {
    const form = new IncomingForm(); // Cria uma nova instância do IncomingForm
    // Promessa para analisar os campos e arquivos do formulário
    const [fields, files]: [Fields, Files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err); // Reject se houver um erro na análise
        resolve([fields, files]); // Resolve com os campos e arquivos
      });
    });

    // Verifica se fields contém as propriedades necessárias
    if (!isCustomFields(fields)) {
      return res.status(400).json({ message: 'Formato de campos inválido' }); // Retorna erro 400 se o formato estiver incorreto
    }

    // Ajusta o tipo do arquivo, considerando que pode ser um array
    const file = files.file instanceof Array ? files.file[0] : files.file; // O arquivo enviado
    const database = fields.database ? fields.database[0] : undefined; // O nome do banco de dados
    const table = fields.table ? fields.table[0] : undefined; // O nome da tabela

    // Verifica se o arquivo, banco de dados ou tabela estão ausentes
    if (!file || !database || !table) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes' }); // Retorna erro 400 se faltar campos obrigatórios
    }

    // Verifica se o arquivo é um TXT
    if (file.originalFilename && !file.originalFilename.endsWith('.txt')) {
      return res.status(400).json({ message: 'O arquivo deve ser um TXT' }); // Retorna erro 400 se o arquivo não for TXT
    }

    // Obtém as credenciais da conta de armazenamento do Azure a partir das variáveis de ambiente
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    // Verifica se as credenciais da conta de armazenamento estão configuradas corretamente
    if (!accountName || !accountKey || !containerName) {
      return res.status(500).json({ message: 'As informações da conta de armazenamento do Azure não estão configuradas corretamente' }); // Retorna erro 500 se as credenciais não estiverem disponíveis
    }

    // Cria credenciais de chave compartilhada para o serviço Blob
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    // Cria um cliente de serviço Blob com o endpoint de blob
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      sharedKeyCredential
    );

    // Obtém o cliente do contêiner
    const containerClient = blobServiceClient.getContainerClient(containerName);
    // Obtém o cliente do blob com o caminho do banco de dados e da tabela
    const blobClient = containerClient.getBlockBlobClient(`${database}/${table}/${file.originalFilename}`);

    // Lê o conteúdo do arquivo enviado
    const fileBuffer = fs.readFileSync(file.filepath);
    // Realiza o upload do arquivo
    await blobClient.upload(fileBuffer, fileBuffer.length);

    // Retorna a resposta informando que o upload foi bem-sucedido
    res.status(200).json({ message: 'Arquivo enviado com sucesso' });
  } catch (error) {
    // Log do erro para debug
    console.error('Erro ao enviar o arquivo:', error);
    // Retorna erro 500 se ocorrer uma exceção
    res.status(500).json({ message: 'Erro ao enviar o arquivo', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
}
