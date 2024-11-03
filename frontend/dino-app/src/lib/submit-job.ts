import type { NextApiRequest, NextApiResponse } from 'next';

interface SubmitJobRequest extends NextApiRequest {
  body: {
    run_name: string;
    notebook_path: string;
    base_parameters?: Record<string, string>;
    timeout_seconds?: number;
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

  const { run_name, notebook_path, base_parameters, timeout_seconds } = req.body;

  const url = `${process.env.NEXT_PUBLIC_DATABRICKS_INSTANCE}/api/2.1/jobs/runs/submit`;
  console.log("Submitting to URL:", url);
  const headers = {
    "Authorization": `Bearer ${process.env.NEXT_PUBLIC_DATABRICKS_TOKEN}`, 
    "Content-Type": "application/json"
  };

  const payload = {
    run_name,
    notebook_task: {
      notebook_path,
      base_parameters
    },
    timeout_seconds
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();  // Captura a resposta do erro
      throw new Error(`Databricks API error: ${response.statusText} - ${errorData.error || errorData.details}`);
    }

    const data = await response.json();
    res.status(200).json({ message: "Job submitted successfully", data });
  } catch (error) {
    console.error("Failed to submit job:", error);
    res.status(500).json({ error: "Failed to submit job", details: (error as Error).message });
  }
}
