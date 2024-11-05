import { NextApiRequest, NextApiResponse } from 'next'; // Importa tipos para requisições e respostas da API Next.js
import { ClientSecretCredential } from "@azure/identity"; // Importa a classe ClientSecretCredential para autenticação
import { CostManagementClient } from "@azure/arm-costmanagement"; // Importa o cliente de gerenciamento de custos do Azure

// Função padrão do manipulador de requisições da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica se o método da requisição é GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' }); // Retorna erro 405 se não for GET
  }

  try {
    // Obtém as credenciais do Azure a partir das variáveis de ambiente
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const resourceGroupName = process.env.AZURE_RESOURCE_GROUP_NAME;

    // Verifica se todas as credenciais e detalhes da assinatura estão configurados
    if (!tenantId || !clientId || !clientSecret || !subscriptionId || !resourceGroupName) {
      throw new Error("Credenciais do Azure ou detalhes da assinatura não estão configurados corretamente");
    }

    // Usa ClientSecretCredential para autenticação
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new CostManagementClient(credential); // Cria uma instância do cliente de gerenciamento de custos

    const endDate = new Date(); // Data final é a data atual
    const startDate = new Date(); // Data inicial é 30 dias atrás
    startDate.setDate(startDate.getDate() - 30);

    // Função para formatar a data no formato ISO
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Define o escopo para a consulta de custos
    const scope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;

    // Realiza a consulta de uso com as configurações especificadas
    const result = await client.query.usage(scope, {
      type: "ActualCost", // Tipo de consulta: custo real
      timeframe: "Custom", // Intervalo de tempo personalizado
      timePeriod: {
        from: startDate, // Data inicial
        to: endDate,     // Data final
      },
      dataset: { // Corrigido de dataSet para dataset
        granularity: "None", // Granularidade da consulta
        aggregation: { // Agregação dos dados
          totalCost: {
            name: "Cost", // Nome do campo de custo
            function: "Sum", // Função de soma
          }
        }
      }
    });

    // Verifica se há dados de custo disponíveis
    if (result.rows && result.rows.length > 0) {
      const [cost, currency] = result.rows[0]; // Obtém o custo total e a moeda
      res.status(200).json({
        totalCost: parseFloat(cost as string), // Converte o custo para número
        currency: currency as string, // Define a moeda
        timeframe: `${formatDate(startDate)} to ${formatDate(endDate)}` // Define o intervalo de tempo
      });
    } else {
      throw new Error("Nenhum dado de custo disponível"); // Erro se não houver dados
    }
  } catch (error) {
    console.error("Erro ao buscar dados de custo:", error); // Registra erro no console
    const errorMessage = (error as Error).message || 'Erro desconhecido'; // Mensagem de erro
    res.status(500).json({ message: 'Erro ao buscar dados de custo', error: errorMessage }); // Retorna erro 500
  }
}
