'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, DollarSign, FileText, HardDrive, X } from 'lucide-react'
import { uploadToBlob } from '@/lib/azure-upload'
import { getCostFromAzure } from '@/lib/azure-cost'
import { useToast } from '@/hooks/use-toast'

export default function DataIngestionPortal() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [cost, setCost] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [costTimeframe, setCostTimeframe] = useState('')
  const [database, setDatabase] = useState('')
  const [table, setTable] = useState('')
  const { toast, toasts, dismissToast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const handleUpload = async () => {
    if (!database || !table) {
      toast({
        title: "Missing Information",
        description: "Please provide both Database and Table names.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)
    let uploadedFiles = 0
    let uploadedSize = 0

    for (const file of files) {
      try {
        const result = await uploadToBlob(file, database, table)
        if (result.success) {
          uploadedFiles++
          uploadedSize += result.size
          setUploadProgress((uploadedFiles / files.length) * 100)
          toast({
            title: "File Uploaded",
            description: `${file.name} was successfully uploaded to ${database}.${table}.`,
          })
        } else {
          throw new Error(result.error || "Unknown error occurred during upload")
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          variant: "destructive",
        })
      }
    }

    setTotalFiles(prev => prev + uploadedFiles)
    setTotalSize(prev => prev + uploadedSize)
    setUploading(false)
    setFiles([])

    // Get updated cost
    try {
      const costDetails = await getCostFromAzure()
      setCost(costDetails.totalCost)
      setCurrency(costDetails.currency)
      setCostTimeframe(costDetails.timeframe)
      toast({
        title: "Cost Updated",
        description: `Total cost for ${costDetails.timeframe}: ${costDetails.totalCost} ${costDetails.currency}`,
      })
    } catch (error) {
      console.error("Failed to fetch cost:", error)
      toast({
        title: "Cost Fetch Failed",
        description: `Unable to retrieve the latest cost information: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Data Ingestion Portal</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload Files to Azure Blob Storage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">Database</label>
              <Input
                id="database"
                type="text"
                placeholder="Enter database name"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">Table</label>
              <Input
                id="table"
                type="text"
                placeholder="Enter table name"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <Input type="file" multiple onChange={handleFileChange} className="mb-2" />
          <Button onClick={handleUpload} disabled={uploading || files.length === 0 || !database || !table}>
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          {uploading && (
            <Progress value={uploadProgress} className="mt-2" />
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingestion Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              <span className="text-2xl font-bold">{cost.toFixed(2)} {currency}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Timeframe: {costTimeframe}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files Ingested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span className="text-2xl font-bold">{totalFiles}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Ingested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HardDrive className="mr-2 h-4 w-4" />
              <span className="text-2xl font-bold">{(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toast messages */}
      <div className="fixed bottom-0 right-0 p-6 space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-white border-l-4 ${
              toast.variant === 'destructive' ? 'border-red-500' : 'border-green-500'
            } rounded-lg shadow-md p-4 max-w-md`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{toast.title}</h3>
                <p className="text-sm text-gray-600">{toast.description}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}