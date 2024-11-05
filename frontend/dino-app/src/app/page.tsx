'use client'

// Importação das dependências e componentes necessários
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, DollarSign, FileText, HardDrive, X } from 'lucide-react'
import { uploadToBlob, getFileCount, getTotalDataIngested } from '@/lib/azure-upload'
import { getCostFromAzure } from '@/lib/azure-cost'
import { useToast } from '@/hooks/use-toast'
import submitJobHandler from '@/lib/submit-job'

// Função principal do componente DataIngestionPortal
// Descrição: Componente que gerencia a interface de ingestão de dados no Azure, 
// permitindo ao usuário fazer upload de arquivos e visualizar informações de custo, 
// número de arquivos e total de dados ingeridos.
export default function DataIngestionPortal() {
  // Declaração dos estados utilizados no componente
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

  // Função para capturar os arquivos selecionados pelo usuário
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }
  
 // Função para atualizar a contagem de arquivos no Azure
  const updateFileCount = async () => {
    if (database && table) {
      try {
        const count = await getFileCount(database, table)
        setTotalFiles(count)
      } catch (error) {
        console.error("Falha ao buscar a contagem de arquivos:", error)
        toast({
          title: "Falha na Contagem de Arquivos",
          description: `Não foi possível obter a contagem mais recente de arquivos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          variant: "destructive",
        })
      }
    }
  }

  // Função para atualizar o total de dados ingeridos
  const updateTotalDataIngested = async () => {
    if (database && table) {
      try {
        const totalData = await getTotalDataIngested(database, table)
        setTotalSize(totalData)
        toast({
          title: "Dados Ingeridos Atualizados",
          description: `Total de dados ingeridos: ${(totalData / (1024 * 1024)).toFixed(2)} MB`,
        })
      } catch (error) {
        console.error("Falha ao buscar o total de dados ingeridos:", error)
        toast({
          title: "Falha na Busca de Dados Ingeridos",
          description: `Não foi possível obter o total de dados ingeridos: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          variant: "destructive",
        })
      }
    }
  }

  // Função para realizar o upload dos arquivos selecionados
  const handleUpload = async () => {
    if (!database || !table) {
      toast({
        title: "Informações Ausentes",
        description: "Por favor, forneça os nomes do Banco de Dados e da Tabela.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)
    let uploadedSize = 0

    for (const file of files) {
      try {
        const result = await uploadToBlob(file, database, table)
        if (result.success) {
          uploadedSize += result.size
          setUploadProgress((prev) => prev + (1 / files.length) * 100)
          toast({
            title: "Arquivo Enviado",
            description: `${file.name} foi enviado com sucesso para ${database}.${table}.`,
          })
        } else {
          throw new Error(result.error || "Erro desconhecido durante o upload")
        }
      } catch (error) {
        console.error(`Falha ao enviar ${file.name}:`, error)
        toast({
          title: "Falha no Upload",
          description: `Falha ao enviar ${file.name}: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          variant: "destructive",
        })
      }
    }

    setTotalSize(prev => prev + uploadedSize)
    setUploading(false)
    setFiles([])
    
    // Atualiza a contagem de arquivos e o total de dados ingeridos após o upload
    await updateFileCount()
    await updateTotalDataIngested()

    // Submete um job ao Databricks após o upload
    try {
      const response = await fetch('/api/submitJob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          run_name: "Data Ingestion Non Optimized",
            tasks: [
              {
                task_key: "DINO",
                description: "Ingestão",
                notebook_task: {
                  base_parameters: {
                    database_name: database, 
                    table_name: table 
                  },
                  notebook_path: "/dino_workspace/DINO" 
                }
              }
            ],
            run_as: {
              service_principal_name: "8541a6b4-fa5d-4897-bd76-8c4399ba1792" 
            }
        })
      });
    
      if (!response.ok) {
        throw new Error(`Falha ao submeter job: ${response.statusText}`);
      }
    
      const data = await response.json();
      toast({
        title: "Job Submetido",
        description: "Job do Databricks foi submetido com sucesso.",
      });
    } catch (error) {
      console.error("Falha ao submeter job:", error);
      toast({
        title: "Falha na Submissão de Job",
        description: `Não foi possível submeter o job para o Databricks: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
    
    // Atualiza o custo após o upload
    try {
      const costDetails = await getCostFromAzure()
      setCost(costDetails.totalCost)
      setCurrency(costDetails.currency)
      setCostTimeframe(costDetails.timeframe)
      toast({
        title: "Custo Atualizado",
        description: `Custo total para ${costDetails.timeframe}: ${costDetails.totalCost} ${costDetails.currency}`,
      })
    } catch (error) {
      console.error("Falha ao buscar custo:", error)
      toast({
        title: "Falha na Busca de Custo",
        description: `Não foi possível obter as informações mais recentes de custo: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      })
    }
  }

  // Interface de retorno do componente
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DINO - Data Ingestion Non Optimized</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload de Arquivos para o Azure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="database" className="block text-sm font-medium text-gray-700 mb-1">Banco de Dados</label>
              <Input
                id="database"
                type="text"
                placeholder="Insira o nome do banco de dados"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-1">Tabela</label>
              <Input
                id="table"
                type="text"
                placeholder="Insira o nome da tabela"
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

{/* Cards informativos de custo, arquivos e dados ingeridos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Custo das Ingestões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4" />
              <span className="text-2xl font-bold">{cost.toFixed(2)} {currency}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Período: {costTimeframe}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivos Ingeridos</CardTitle>
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
            <CardTitle>Total de Dados Ingeridos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HardDrive className="mr-2 h-4 w-4" />
              <span className="text-2xl font-bold">{(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensagens de Toast */}
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
