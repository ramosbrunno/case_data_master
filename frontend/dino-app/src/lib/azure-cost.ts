import { DefaultAzureCredential } from "@azure/identity";
import { CostManagementClient, QueryResult } from "@azure/arm-costmanagement";

interface CostDetails {
  totalCost: number;
  currency: string;
  timeframe: string;
}

export async function getCostFromAzure(): Promise<CostDetails> {
  // Substitua pelos detalhes reais da sua assinatura e grupo de recursos do Azure
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
  const resourceGroupName = process.env.AZURE_RESOURCE_GROUP_NAME;

  if (!subscriptionId || !resourceGroupName) {
    throw new Error("Azure subscription details are not properly configured");
  }

  // Use DefaultAzureCredential, que tenta múltiplos métodos de autenticação
  const credential = new DefaultAzureCredential();

  // Crie um cliente de gerenciamento de custos
  const client = new CostManagementClient(credential, subscriptionId);

  // Obter a data atual e a data de 30 dias atrás
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Formatar datas para exibição (YYYY-MM-DD)
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  try {
    // Consulta o uso e custo para o grupo de recursos
    const result: QueryResult = await client.query.usage(
      `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
      {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: {
          from: startDate, // Passar como Date
          to: endDate,     // Passar como Date
        },
        dataSet: {
          granularity: "None",
          aggregation: {
            totalCost: {
              name: "Cost",
              function: "Sum",
            },
          },
        },
      }
    );

    // Verifica se há dados e extrai as informações de custo
    if (result.rows && result.rows.length > 0) {
      const [cost, currency] = result.rows[0];
      return {
        totalCost: parseFloat(cost as string),
        currency: currency as string,
        timeframe: `${formatDate(startDate)} to ${formatDate(endDate)}`, // Apenas formatar para exibição
      };
    } else {
      throw new Error("No cost data available");
    }
  } catch (error: unknown) {
    console.error("Error fetching cost data:", error);
    throw new Error(
      `Failed to retrieve cost data: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`
    );
  }
}
