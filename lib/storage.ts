import { ExtractedNote } from '@/types/notes';

interface OficinaBase {
  codigo: string;
  cnpj: string;
}

const NOTES_STORAGE_KEY = 'nf_notes';
const NEXT_ORDER_KEY = 'nf_next_order';

function normalizeCnpj(value: string) {
  return value.replace(/\D/g, '');
}

function sharedPrefixLength(left: string, right: string) {
  const limit = Math.min(left.length, right.length);
  let index = 0;

  while (index < limit && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

export function getNextOrderNumber(): number {
  if (typeof window === 'undefined') return 1;

  const nextOrder = localStorage.getItem(NEXT_ORDER_KEY);
  return nextOrder ? parseInt(nextOrder, 10) : 1;
}

export function incrementOrderNumber(): number {
  if (typeof window === 'undefined') return 1;

  const currentOrder = getNextOrderNumber();
  const nextOrder = currentOrder + 1;
  localStorage.setItem(NEXT_ORDER_KEY, nextOrder.toString());
  return currentOrder;
}

export function saveNote(note: Omit<ExtractedNote, 'id' | 'numeroOrdem' | 'criadoEm' | 'dataLancamento'>): ExtractedNote {
  const numeroOrdem = incrementOrderNumber();
  const criadoEm = new Date().toISOString();
  const dataLancamento = new Date().toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const newNote: ExtractedNote = {
    ...note,
    id: `note_${Date.now()}`,
    numeroOrdem,
    criadoEm,
    dataLancamento,
  } as ExtractedNote;

  const notes = getNotes();
  notes.push(newNote);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));

  return newNote;
}

export function checkNotaDuplicada(numeroNota: string, usuario: string): ExtractedNote | null {
  if (typeof window === 'undefined') return null;

  const notes = getNotes();
  const notaDuplicada = notes.find(
    (n) => n.numeroNota === numeroNota && n.usuario === usuario
  );

  return notaDuplicada || null;
}

export function getNotes(): ExtractedNote[] {
  if (typeof window === 'undefined') return [];

  const notesJson = localStorage.getItem(NOTES_STORAGE_KEY);
  return notesJson ? JSON.parse(notesJson) : [];
}

export function updateNote(id: string, updates: Partial<ExtractedNote>): ExtractedNote | null {
  const notes = getNotes();
  const noteIndex = notes.findIndex((n) => n.id === id);

  if (noteIndex === -1) return null;

  notes[noteIndex] = { ...notes[noteIndex], ...updates };
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));

  return notes[noteIndex];
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filteredNotes = notes.filter((n) => n.id !== id);

  if (filteredNotes.length === notes.length) return false;

  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
  return true;
}

export function getOficias() {
  if (typeof window === 'undefined') return [];

  const oficinasJson = localStorage.getItem('nf_oficinas');
  return oficinasJson ? JSON.parse(oficinasJson) : [];
}

export function getOficinaByCodigo(codigo: string) {
  if (typeof window === 'undefined') return null;

  const oficinas = getOficias();
  const oficina = oficinas.find((o: OficinaBase) => o.codigo.trim() === codigo.trim());
  return oficina || null;
}

export function getOficinaByCnpj(cnpj: string) {
  if (typeof window === 'undefined') return null;

  const oficinas = getOficias();
  const cnpjNormalizado = normalizeCnpj(cnpj);
  if (!cnpjNormalizado) return null;

  const exactMatch = oficinas.find((o: OficinaBase) => normalizeCnpj(o.cnpj) === cnpjNormalizado);
  if (exactMatch) return exactMatch;

  const candidates = oficinas
    .map((oficina: OficinaBase) => {
      const oficinaCnpj = normalizeCnpj(oficina.cnpj);
      const prefixScore = sharedPrefixLength(oficinaCnpj, cnpjNormalizado);
      const includesScore = oficinaCnpj.includes(cnpjNormalizado) || cnpjNormalizado.includes(oficinaCnpj) ? Math.min(oficinaCnpj.length, cnpjNormalizado.length) : 0;
      const score = Math.max(prefixScore, includesScore);

      return { oficina, score };
    })
    .filter(({ score }) => score >= 6)
    .sort((left, right) => right.score - left.score);

  if (candidates.length === 0) return null;

  if (candidates.length > 1 && candidates[0].score === candidates[1].score) {
    return null;
  }

  return candidates[0].oficina;
}
