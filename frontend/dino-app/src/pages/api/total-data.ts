import { NextApiRequest, NextApiResponse } from 'next' // Importa os tipos de requisição e resposta da API do Next.js
import { BlobServiceClient } from "@azure/storage-blob" // Importa o cliente de serviço Blob do Azure

// Função padrão para manipular a requisição da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método da requisição é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' }) // Retorna erro 405 se não for GET
  }

  // Extrai os parâmetros database e table da query
  const { database, table } = req.query

  // Verifica se os parâmetros database e table foram fornecidos
  if (!database || !table) {
    return res.status(400).json({ message: 'Os parâmetros database e table são obrigatórios' }) // Retorna erro 400 se faltar parâmetros
  }

  try {
    // Obtém as credenciais da conta de armazenamento do Azure a partir das variáveis de ambiente
    const accountName = process.env.AZURE_ADLS_ACCOUNT_NAME
    const accountKey = process.env.AZURE_ADLS_ACCOUNT_KEY
    const containerName = process.env.AZURE_ADLS_CONTAINER_NAME

    // Verifica se as credenciais da conta de armazenamento estão configuradas corretamente
    if (!accountName || !accountKey || !containerName) {
      throw new Error("As informações da conta de armazenamento do Azure não estão configuradas corretamente") // Lança erro se as credenciais não estiverem disponíveis
    }

    // Cria um cliente de serviço Blob a partir da string de conexão
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
    )

    // Obtém o cliente do contêiner
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const prefix = `${database}/${table}/` // Define o prefixo baseado no banco de dados e tabela

    let totalSize = 0 // Inicializa a variável para o tamanho total dos blobs
    // Itera sobre todos os blobs no contêiner que correspondem ao prefixo
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      totalSize += blob.properties.contentLength || 0 // Soma o tamanho de cada blob ao total
    }

    // Retorna a resposta com o tamanho total dos dados ingeridos
    res.status(200).json({ totalSize })
  } catch (error) {
    // Log do erro para debug
    console.error("Erro ao buscar o total de dados ingeridos:", error)
    // Retorna erro 500 se ocorrer uma exceção
    res.status(500).json({ message: 'Erro ao buscar o total de dados ingeridos', error: error instanceof Error ? error.message : 'Erro desconhecido' })
  }
}
