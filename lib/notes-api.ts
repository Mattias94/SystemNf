import { ExtractedNote } from '@/types/notes';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error || 'Erro na API de notas');
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

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
  await parseJson<{ id: string }>(response);
}

export async function findDuplicateNote(numeroNota: string, usuario: string | null): Promise<ExtractedNote | null> {
  if (!usuario) return null;
  const notes = await listNotes();
  const duplicate = notes.find((note) => note.numeroNota === numeroNota && note.usuario === usuario);
  return duplicate || null;
}
