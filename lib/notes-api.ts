import { ExtractedNote } from '@/types/notes';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    if (response.status === 403) {
      throw new Error('Acesso negado (403) na API de notas. Verifique protecao de deploy/autenticacao no ambiente publicado.');
    }

    const apiError = payload?.error || 'Erro na API de notas';
    throw new Error(`${apiError} (HTTP ${response.status})`);
  }

  return payload;
}

export async function listNotes(): Promise<ExtractedNote[]> {
  const response = await fetch('/api/notes', { method: 'GET' });
  const payload = await parseJson<ExtractedNote[]>(response);
  return payload.data || [];
}

export async function createNote(note: Omit<ExtractedNote, 'id'>): Promise<ExtractedNote> {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });

  const payload = await parseJson<ExtractedNote>(response);
  return payload.data as ExtractedNote;
}

export async function updateNote(id: string, updates: Partial<ExtractedNote>): Promise<ExtractedNote> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const payload = await parseJson<ExtractedNote>(response);
  return payload.data as ExtractedNote;
}

export async function deleteNote(id: string, usuarioAtual: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: { 'x-current-user': usuarioAtual },
  });
  await parseJson<{ id: string }>(response);
}

export async function findDuplicateNote(numeroNota: string, usuario: string | null): Promise<ExtractedNote | null> {
  if (!usuario) return null;
  const notes = await listNotes();
  const duplicate = notes.find((note) => note.numeroNota === numeroNota && note.usuario === usuario);
  return duplicate || null;
}
