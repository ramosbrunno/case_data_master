import { NextApiRequest, NextApiResponse } from 'next'
import { BlobServiceClient } from "@azure/storage-blob"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  const { database, table } = req.query

  if (!database || !table) {
    return res.status(400).json({ message: 'Database and table parameters are required' })
  }

  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME

    if (!accountName || !accountKey || !containerName) {
      throw new Error("Azure storage account details are not properly configured")
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      `DefaultEndpointsProtocol=https;AccountName=${accountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
    )

    const containerClient = blobServiceClient.getContainerClient(containerName)
    const prefix = `${database}/${table}/`
    
    let fileCount = 0
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const { name } of containerClient.listBlobsFlat({ prefix })) {
      fileCount++
    }

    res.status(200).json({ fileCount })
  } catch (error) {
    console.error("Error fetching file count:", error)
    res.status(500).json({ message: 'Error fetching file count', error: error instanceof Error ? error.message : 'Unknown error' })
  }
}
