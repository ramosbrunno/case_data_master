import { NextApiRequest, NextApiResponse } from 'next'; // Importa tipos para requisições e respostas da API Next.js
import { BlobServiceClient } from "@azure/storage-blob"; // Importa o cliente de serviço de blob do Azure

// Função padrão do manipulador de requisições da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método da requisição é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' }); // Retorna erro 405 se não for GET
  }

  // Extrai os parâmetros database e table da query da requisição
  const { database, table } = req.query;

  // Verifica se os parâmetros database e table foram fornecidos
  if (!database || !table) {
    return res.status(400).json({ message: 'Os parâmetros database e table são obrigatórios' }); // Retorna erro 400 se os parâmetros não estiverem presentes
  }

  try {
    // Obtém as credenciais da conta de armazenamento do Azure a partir das variáveis de ambiente
    const accountName = process.env.AZURE_ADLS_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_ADLS_ACCOUNT_KEY;
    const containerName = process.env.AZURE_ADLS_CONTAINER_NAME;

    // Verifica se todas as credenciais da conta de armazenamento estão configuradas
    if (!accountName || !accountKey || !containerName) {
      throw new Error("Os detalhes da conta de armazenamento do Azure não estão configurados corretamente");
    }

    // Cria um cliente de serviço de blob usando a string de conexão
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
    );

    // Obtém o cliente do contêiner de blobs
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const prefix = `${database}/${table}/`; // Define o prefixo para listar os blobs

    let fileCount = 0; // Inicializa o contador de arquivos
    // Itera sobre os blobs no contêiner que correspondem ao prefixo fornecido
    for await (const { name } of containerClient.listBlobsFlat({ prefix })) {
      fileCount++; // Incrementa o contador para cada blob encontrado
    }

    // Retorna a contagem de arquivos como resposta
    res.status(200).json({ fileCount });
  } catch (error) {
    console.error("Erro ao buscar a contagem de arquivos:", error); // Registra o erro no console
    // Retorna erro 500 se ocorrer uma exceção
    res.status(500).json({ message: 'Erro ao buscar a contagem de arquivos', error: error instanceof Error ? error.message : 'Erro desconhecido' });
  }
}
