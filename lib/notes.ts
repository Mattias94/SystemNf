import { ObjectId } from 'mongodb';
import { getDatabase } from './mongo';
import { ExtractedNote } from '@/types/notes';

type NoteDocument = Omit<ExtractedNote, 'id'> & { _id: ObjectId };

function normalizeNote(doc: NoteDocument): ExtractedNote {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  } as ExtractedNote;
}

export async function insertNote(note: Omit<ExtractedNote, 'id'>) {
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');

  const existing = await collection.findOne({ numeroNota: note.numeroNota, usuario: note.usuario });
  if (existing) {
    throw new Error('Nota fiscal já lançada para este usuário');
  }

  const numeroOrdem = (await collection.countDocuments({})) + 1;

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

  const result = await collection.insertOne(doc as NoteDocument);

  return {
    ...doc,
    id: result.insertedId.toString(),
  } as ExtractedNote;
}

export async function getAllNotes() {
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const docs = await collection.find({}).sort({ numeroOrdem: 1 }).toArray();

  return docs.map((d) => normalizeNote(d as NoteDocument));
}

export async function getNoteById(id: string) {
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  const doc = await collection.findOne({ _id });
  if (!doc) return null;
  return normalizeNote(doc);
}

export async function updateNoteById(id: string, updates: Partial<ExtractedNote>) {
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  await collection.updateOne({ _id }, { $set: updates });
  const updated = await collection.findOne({ _id });
  if (!updated) return null;
  return normalizeNote(updated);
}

export async function deleteNoteById(id: string) {
  const db = await getDatabase();
  const collection = db.collection<NoteDocument>('notes');
  const _id = new ObjectId(id);
  const res = await collection.deleteOne({ _id });
  return res.deletedCount === 1;
}
