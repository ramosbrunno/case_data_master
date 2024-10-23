interface CostDetails {
  totalCost: number
  currency: string
  timeframe: string
}

export async function getCostFromAzure(): Promise<CostDetails> {
  try {
    const response = await fetch('/api/cost')
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch cost data')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching cost data:", error)
    throw new Error(`Failed to retrieve cost data: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
  }
}