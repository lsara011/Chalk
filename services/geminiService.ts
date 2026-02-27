import { PracticeRoutine } from "../types";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const parseError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    return data?.detail || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
};

export const generateRoutine = async (focusArea: string): Promise<PracticeRoutine> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/generate-routine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ focusArea }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json() as Promise<PracticeRoutine>;
};

export const analyzeFormVideo = async (base64Video: string, mimeType: string): Promise<string> => {
  const response = await fetch(`${BACKEND_BASE_URL}/api/analyze-form`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Video, mimeType }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = await response.json() as { analysis: string };
  return data.analysis;
};
