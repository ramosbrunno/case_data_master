// Interface UploadResult
// Define a estrutura dos dados de resposta da função uploadToBlob
interface UploadResult {
  success: boolean        // Indica se o upload foi bem-sucedido
  size: number            // Tamanho do arquivo em bytes
  error?: string          // Mensagem de erro (opcional) em caso de falha
}

// Função assíncrona uploadToBlob
// Objetivo: Fazer upload de um arquivo para o armazenamento Blob no Azure
// Parâmetros:
//   - file: Arquivo a ser enviado
//   - database: Nome do banco de dados de destino
//   - table: Nome da tabela de destino
// Retorna: Uma Promise que resolve com um objeto do tipo UploadResult
export async function uploadToBlob(file: File, database: string, table: string): Promise<UploadResult> {
  try {
    // Criação de um objeto FormData com os dados necessários para o upload
    const formData = new FormData()
    formData.append('file', file)
    formData.append('database', database)
    formData.append('table', table)

    // Requisição à API para upload do arquivo
    const response = await fetch('/api/upload-adls', {
      method: 'POST',
      body: formData,
    })

    // Verificação do tipo de resposta
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Falha no upload')
      }
      return { success: true, size: file.size }
    } else {
      const text = await response.text()
      console.error('Resposta inesperada:', text)
      throw new Error(`Resposta inesperada: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Erro ao fazer upload do arquivo ${file.name}:`, error)
    return { 
      success: false, 
      size: 0, 
      error: error instanceof Error ? error.message : "Erro desconhecido durante o upload"
    }
  }
}

// Função assíncrona getFileCount
// Objetivo: Obter a contagem de arquivos em uma tabela específica no Azure
// Parâmetros:
//   - database: Nome do banco de dados
//   - table: Nome da tabela
// Retorna: Uma Promise que resolve com o número de arquivos (contagem)
export async function getFileCount(database: string, table: string): Promise<number> {
  try {
    const response = await fetch(`/api/file-count?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Falha ao buscar a contagem de arquivos')
    }

    const data = await response.json()
    return data.fileCount
  } catch (error) {
    console.error("Erro ao buscar a contagem de arquivos:", error)
    throw new Error(`Falha ao recuperar a contagem de arquivos: ${error instanceof Error ? error.message : "Erro desconhecido ocorreu"}`)
  }
}

// Função assíncrona getTotalDataIngested
// Objetivo: Obter o tamanho total de dados ingeridos em uma tabela específica no Azure
// Parâmetros:
//   - database: Nome do banco de dados
//   - table: Nome da tabela
// Retorna: Uma Promise que resolve com o total de dados ingeridos em bytes
export async function getTotalDataIngested(database: string, table: string): Promise<number> {
  try {
    const response = await fetch(`/api/total-data?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Falha ao buscar o total de dados ingeridos')
    }

    const data = await response.json()
    return data.totalSize
  } catch (error) {
    console.error("Erro ao buscar o total de dados ingeridos:", error)
    throw new Error(`Falha ao recuperar o total de dados ingeridos: ${error instanceof Error ? error.message : "Erro desconhecido ocorreu"}`)
  }
}
