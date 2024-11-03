// src/pages/api/submitJob.ts
import type { NextApiRequest, NextApiResponse } from 'next';

interface SubmitJobRequest extends NextApiRequest {
    body: {
        run_name: string;
        tasks: {
          task_key: string;
          description: string;
          notebook_task: {
            base_parameters: {
              database_name: string;
              table_name: string;
            };
            notebook_path: string;
          };
        }[];
        run_as: {
          service_principal_name: string;
        };
      };
}

interface ApiResponse {
  message?: string;
  data?: any;
  error?: string;
  details?: string;
}

export default async function handler(req: SubmitJobRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

    // Extraindo os dados corretamente
  const { run_name, tasks, run_as } = req.body;

  const payload = {
    run_name,
    tasks: tasks.map(task => ({
      task_key: task.task_key,
      description: task.description,
      notebook_task: {
        base_parameters: task.notebook_task.base_parameters,
        notebook_path: task.notebook_task.notebook_path,
      }
    })),
    run_as: {
      service_principal_name: run_as.service_principal_name,
    },
  };

  const url = `${process.env.DATABRICKS_INSTANCE}/api/2.1/jobs/runs/submit`;
  const headers = {
    "Authorization": `Bearer ${process.env.DATABRICKS_TOKEN}`, 
    "Content-Type": "application/json"
  };

  console.error("url:", url);
  console.error("headers:", headers);
  console.error("payload", payload)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Databricks API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json({ message: "Job submitted successfully", data });
  } catch (error) {
    console.error("Failed to submit job:", error);
    res.status(500).json({ error: "Failed to submit job", details: (error as Error).message });
  }
}
