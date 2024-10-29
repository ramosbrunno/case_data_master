interface UploadResult {
  success: boolean
  size: number
  error?: string
}

export async function uploadToBlob(file: File, database: string, table: string): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('database', database)
    formData.append('table', table)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }
      return { success: true, size: file.size }
    } else {
      const text = await response.text()
      console.error('Unexpected response:', text)
      throw new Error(`Unexpected response: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error uploading file ${file.name}:`, error)
    return { 
      success: false, 
      size: 0, 
      error: error instanceof Error ? error.message : "Unknown error occurred during upload"
    }
  }
}

export async function getFileCount(database: string, table: string): Promise<number> {
  try {
    const response = await fetch(`/api/file-count?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch file count')
    }

    const data = await response.json()
    return data.fileCount
  } catch (error) {
    console.error("Error fetching file count:", error)
    throw new Error(`Failed to retrieve file count: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
  }
}

export async function getTotalDataIngested(database: string, table: string): Promise<number> {
  try {
    const response = await fetch(`/api/total-data?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch total data ingested')
    }

    const data = await response.json()
    return data.totalSize
  } catch (error) {
    console.error("Error fetching total data ingested:", error)
    throw new Error(`Failed to retrieve total data ingested: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
  }
}