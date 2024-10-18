import { DefaultAzureCredential } from "@azure/identity"
import { CostManagementClient, QueryResult } from "@azure/arm-costmanagement"

interface CostDetails {
  totalCost: number
  currency: string
  timeframe: string
}

export async function getCostFromAzure(): Promise<CostDetails> {
  // Replace these with your actual Azure subscription and resource group details
  const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID
  const resourceGroupName = process.env.AZURE_RESOURCE_GROUP_NAME

  if (!subscriptionId || !resourceGroupName) {
    throw new Error("Azure subscription details are not properly configured")
  }

  // Use DefaultAzureCredential, which tries multiple authentication methods
  const credential = new DefaultAzureCredential()

  // Create a Cost Management client
  const client = new CostManagementClient(credential, subscriptionId)

  // Get the current date and the date 30 days ago
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  // Format dates as required by the API (YYYY-MM-DD)
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  try {
    const result: QueryResult = await client.query.usage(
      `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}`,
      {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: {
          from: formatDate(startDate),
          to: formatDate(endDate)
        },
        dataSet: {
          granularity: "None",
          aggregation: {
            totalCost: {
              name: "Cost",
              function: "Sum"
            }
          }
        }
      }
    )

    if (result.rows && result.rows.length > 0) {
      const [cost, currency] = result.rows[0]
      return {
        totalCost: parseFloat(cost as string),
        currency: currency as string,
        timeframe: `${formatDate(startDate)} to ${formatDate(endDate)}`
      }
    } else {
      throw new Error("No cost data available")
    }
  } catch (error: unknown) {
    console.error("Error fetching cost data:", error)
    throw new Error(`Failed to retrieve cost data: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
  }
}