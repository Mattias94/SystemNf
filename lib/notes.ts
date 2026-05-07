import { ObjectId } from 'mongodb';
import { getDatabase } from './mongo';
import { ExtractedNote } from '@/types/notes';

type NoteDocument = Omit<ExtractedNote, 'id'> & { _id: ObjectId };
type CounterDocument = {
  _id: string;
  seq: number;
};

let indexesReady: Promise<void> | null = null;

function isDuplicateKeyError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: number }).code === 11000;
}

async function ensureNotesIndexes() {
  if (!indexesReady) {
    indexesReady = (async () => {
      const db = await getDatabase();
      await db.collection<NoteDocument>('notes').createIndex({ usuario: 1, numeroNota: 1 }, { unique: true });
    })();
  }

  return indexesReady;
}

async function getNextOrderNumber() {
  const db = await getDatabase();
  const counters = db.collection<CounterDocument>('counters');
  const result = await counters.findOneAndUpdate(
    { _id: 'notes_order' },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  return result.value?.seq ?? 1;
}

function normalizeNote(doc: NoteDocument): ExtractedNote {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  } as ExtractedNote;
}

export async function insertNote(note: Omit<ExtractedNote, 'id'>) {
  await ensureNotesIndexes();
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');

  const numeroOrdem = await getNextOrderNumber();

  const doc: Omit<ExtractedNote, 'id'> = {
    ...note,
    numeroOrdem,
    criadoEm: note.criadoEm ?? new Date().toISOString(),
    dataLancamento: note.dataLancamento ?? new Date().toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  };

  try {
    const result = await collection.insertOne(doc as NoteDocument);

    return {
      ...doc,
      id: result.insertedId.toString(),
    } as ExtractedNote;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new Error('Nota fiscal já lançada para este usuário');
    }

    throw error;
  }
}

export async function getAllNotes() {
  await ensureNotesIndexes();
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const docs = await collection.find({}).sort({ numeroOrdem: 1 }).toArray();

  return docs.map((d) => normalizeNote(d as NoteDocument));
}

export async function getNoteById(id: string) {
  await ensureNotesIndexes();
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  const doc = await collection.findOne({ _id });
  if (!doc) return null;
  return normalizeNote(doc);
}

export async function updateNoteById(id: string, updates: Partial<ExtractedNote>) {
  await ensureNotesIndexes();
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  try {
    await collection.updateOne({ _id }, { $set: updates });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new Error('Nota fiscal já lançada para este usuário');
    }

    throw error;
  }

  const updated = await collection.findOne({ _id });
  if (!updated) return null;
  return normalizeNote(updated);
}

export async function deleteNoteById(id: string, usuarioAtual: string) {
  await ensureNotesIndexes();
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  const note = await collection.findOne({ _id });

  if (!note) return false;

  if (note.usuario !== usuarioAtual) {
    throw new Error('Você só pode deletar notas que foram lançadas por você');
  }

  const res = await collection.deleteOne({ _id });
  return res.deletedCount === 1;
}
