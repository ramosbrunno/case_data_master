// Interface CostDetails
// Define a estrutura dos dados de custo que serão retornados pela função
interface CostDetails {
  totalCost: number        // Custo total acumulado no período especificado
  currency: string         // Moeda do custo retornado
  timeframe: string        // Período de tempo ao qual o custo se refere (ex: "mensal")
}

// Função assíncrona getCostFromAzure
// Objetivo: Buscar os dados de custo de uma API de custos do Azure
// Retorna: Uma Promise que resolve com um objeto do tipo CostDetails
export async function getCostFromAzure(): Promise<CostDetails> {
  try {
    // Realiza a requisição para a rota da API que fornece os dados de custo
    const response = await fetch('/api/cost')
    
    // Verifica se a resposta é bem-sucedida
    if (!response.ok) {
      // Caso contrário, lança um erro com a mensagem fornecida pela API ou uma mensagem padrão
      const errorData = await response.json()
      throw new Error(errorData.message || 'Falha ao buscar os dados de custo')
    }

    // Converte a resposta para JSON e retorna os dados de custo
    const data = await response.json()
    return data
  } catch (error) {
    // Em caso de erro, exibe uma mensagem no console e lança um erro com uma mensagem descritiva
    console.error("Erro ao buscar os dados de custo:", error)
    throw new Error(`Falha ao recuperar os dados de custo: ${error instanceof Error ? error.message : "Erro desconhecido ocorreu"}`)
  }
}
