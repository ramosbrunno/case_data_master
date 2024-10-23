import { ClientSecretCredential } from "@azure/identity";
import { CostManagementClient } from "@azure/arm-costmanagement";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;
    const resourceGroupName = process.env.AZURE_RESOURCE_GROUP_NAME;

    if (!tenantId || !clientId || !clientSecret || !subscriptionId || !resourceGroupName) {
      throw new Error("Azure credentials or subscription details are not properly configured");
    }

    // Use ClientSecretCredential instead of DefaultAzureCredential
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = new CostManagementClient(credential, subscriptionId);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const scope = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`;

    const result = await client.query.usage(scope, {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: {
            from: startDate, // Enviando como Date
            to: endDate,     // Enviando como Date
        },
        dataset: {  // Corrigido de dataSet para dataset
            granularity: "None",
            aggregation: {
            totalCost: {
                name: "Cost",
                function: "Sum",
          }
        }
      }
    });

    if (result.rows && result.rows.length > 0) {
      const [cost, currency] = result.rows[0];
      res.status(200).json({
        totalCost: parseFloat(cost as string),
        currency: currency as string,
        timeframe: `${formatDate(startDate)} to ${formatDate(endDate)}`
      });
    } else {
      throw new Error("No cost data available");
    }
  } catch (error) {
    console.error("Error fetching cost data:", error);
    res.status(500).json({ message: 'Error fetching cost data', error: error.message });
  }
}
