/* eslint-disable @typescript-eslint/no-explicit-any */
// Tipagem para SubmitJobRequest
// Define a estrutura da requisição recebida pela API
interface SubmitJobRequest extends NextApiRequest {
  body: {
    run_name: string;                     // Nome do job a ser executado
    notebook_path: string;                // Caminho do notebook no Databricks
    base_parameters?: Record<string, string>; // Parâmetros opcionais para o notebook
    timeout_seconds?: number;             // Tempo limite (em segundos) para a execução do job
  };
}

// Tipagem para ApiResponse
// Define a estrutura de resposta para a API
interface ApiResponse {
  message?: string;   // Mensagem de sucesso
  data?: any;         // Dados retornados da API Databricks
  error?: string;     // Mensagem de erro, se ocorrer
  details?: string;   // Detalhes adicionais sobre o erro
}

// Função assíncrona handler
// Objetivo: Enviar um job para o Databricks através de uma requisição POST
// Parâmetros:
//   - req: SubmitJobRequest - A requisição com dados do job
//   - res: NextApiResponse<ApiResponse> - A resposta da API
// Retorna: JSON indicando sucesso ou erro
export default async function handler(req: SubmitJobRequest, res: NextApiResponse<ApiResponse>) {
  // Verifica se o método HTTP é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Desestruturação dos parâmetros enviados no corpo da requisição
  const { run_name, notebook_path, base_parameters, timeout_seconds } = req.body;

  // URL da API do Databricks para submissão do job
  const url = `${process.env.NEXT_PUBLIC_DATABRICKS_INSTANCE}/api/2.1/jobs/runs/submit`;
  console.log("Enviando job para URL:", url);

  // Configuração dos headers da requisição
  const headers = {
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DATABRICKS_TOKEN}`,  // Token de autenticação
    "Content-Type": "application/json"
  };

  // Montagem do payload de dados para enviar ao Databricks
  const payload = {
    run_name,
    notebook_task: {
      notebook_path,
      base_parameters
    },
    timeout_seconds
  };

  try {
    // Envia a requisição para o Databricks
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    // Verifica se a resposta é bem-sucedida
    if (!response.ok) {
      const errorData = await response.json();  // Captura a resposta do erro
      throw new Error(`Erro na API Databricks: ${response.statusText} - ${errorData.error || errorData.details}`);
    }

    // Converte a resposta em JSON
    const data = await response.json();
    res.status(200).json({ message: "Job enviado com sucesso", data });
  } catch (error) {
    console.error("Falha ao enviar job:", error);
    res.status(500).json({ error: "Falha ao enviar job", details: (error as Error).message });
  }
}
