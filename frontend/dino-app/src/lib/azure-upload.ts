import { DataLakeServiceClient, StorageSharedKeyCredential } from "@azure/storage-file-datalake"
import { AbortController } from "@azure/abort-controller"

interface UploadResult {
  success: boolean
  size: number
  error?: string
}

export async function uploadToADLS(file: File): Promise<UploadResult> {
  // Replace these with your actual Azure storage account details
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY
  const fileSystemName = process.env.AZURE_STORAGE_FILE_SYSTEM_NAME
  const directoryName = "uploads" // You can customize this

  if (!accountName || !accountKey || !fileSystemName) {
    throw new Error("Azure storage account details are not properly configured")
  }

  // Create a service client
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
  const dataLakeServiceClient = new DataLakeServiceClient(
    `https://${accountName}.dfs.core.windows.net`,
    sharedKeyCredential
  )

  // Get a reference to the file system
  const fileSystemClient = dataLakeServiceClient.getFileSystemClient(fileSystemName)

  // Get a reference to the directory
  const directoryClient = fileSystemClient.getDirectoryClient(directoryName)

  // Get a reference to the file
  const fileClient = directoryClient.getFileClient(file.name)

  try {
    // Create the file
    await fileClient.create()

    // Set up the options for upload
    const options = {
      bufferSize: 4 * 1024 * 1024, // 4MB buffer
      maxBuffers: 20, // 20 x 4MB = 80MB max buffering
    }

    // Create an abort controller for the upload operation
    const abortController = new AbortController()
    const signal = abortController.signal

    // Upload the file content
    await fileClient.append(file.stream(), 0, file.size, { abortSignal: signal, ...options })
    await fileClient.flush(file.size)

    console.log(`File ${file.name} uploaded successfully`)
    return { success: true, size: file.size }
  } catch (error: unknown) {
    console.error(`Error uploading file ${file.name}:`, error)
    return { 
      success: false, 
      size: 0, 
      error: error instanceof Error ? error.message : "An unknown error occurred during upload"
    }
  }
}