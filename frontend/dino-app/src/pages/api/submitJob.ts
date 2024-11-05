/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NextApiRequest, NextApiResponse } from 'next'; // Importa tipos para requisições e respostas da API Next.js

// Interface para a requisição de submissão de job
interface SubmitJobRequest extends NextApiRequest {
    body: {
        run_name: string; // Nome da execução do job
        tasks: {
          task_key: string; // Chave da tarefa
          description: string; // Descrição da tarefa
          notebook_task: {
            base_parameters: {
              database_name: string; // Nome do banco de dados
              table_name: string; // Nome da tabela
            };
            notebook_path: string; // Caminho do notebook
          };
        }[]; // Array de tarefas
        run_as: {
          service_principal_name: string; // Nome do principal de serviço
        };
      };
}

// Interface para a resposta da API
interface ApiResponse {
  message?: string; // Mensagem opcional
  data?: any; // Dados opcionais da resposta 
  error?: string; // Mensagem de erro opcional
  details?: string; // Detalhes do erro opcional
}

// Função padrão do manipulador de requisições da API
export default async function handler(req: SubmitJobRequest, res: NextApiResponse<ApiResponse>) {
  // Verifica se o método da requisição é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método não permitido" }); // Retorna erro 405 se não for POST
  }

  // Extraindo os dados corretamente da requisição
  const { run_name, tasks, run_as } = req.body;

  // Estrutura o payload a ser enviado para a API do Databricks
  const payload = {
    run_name,
    tasks: tasks.map(task => ({
      task_key: task.task_key, // Chave da tarefa
      description: task.description, // Descrição da tarefa
      notebook_task: {
        base_parameters: task.notebook_task.base_parameters, // Parâmetros base do notebook
        notebook_path: task.notebook_task.notebook_path, // Caminho do notebook
      }
    })),
    run_as: {
      service_principal_name: run_as.service_principal_name, // Nome do principal de serviço
    },
  };

  // Define a URL da API do Databricks
  const url = `${process.env.DATABRICKS_INSTANCE}/api/2.1/jobs/runs/submit`; // Corrigido para 'submit'
  
  // Define os cabeçalhos da requisição
  const headers = {
    "Authorization": `Bearer ${process.env.DATABRICKS_TOKEN}`, // Token de autenticação
    "Content-Type": "application/json" // Tipo de conteúdo
  };

  // Log dos dados para debug
  console.error("url:", url);
  console.error("headers:", headers);
  console.error("payload", payload);

  try {
    // Envia a requisição para a API do Databricks
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    // Verifica se a resposta da API foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro na API do Databricks: ${response.statusText}`); // Lança erro se não for bem-sucedida
    }

    // Obtém os dados da resposta
    const data = await response.json();
    // Retorna a resposta com sucesso
    res.status(200).json({ message: "Job submetido com sucesso", data });
  } catch (error) {
    // Log do erro para debug
    console.error("Falha ao submeter job:", error);
    // Retorna erro 500 se ocorrer uma exceção
    res.status(500).json({ error: "Falha ao submeter job", details: (error as Error).message });
  }
}
