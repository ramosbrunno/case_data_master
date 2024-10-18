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