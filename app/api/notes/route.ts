import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllNotes, insertNote } from '@/lib/notes';
import { ExtractedNote } from '@/types/notes';

export async function GET() {
  try {
    const notes = await getAllNotes();
    return NextResponse.json({ success: true, data: notes });
  } catch (e) {
    console.error('Erro ao listar notas:', e);

    const message = e instanceof Error ? e.message : 'Erro ao listar notas';
    const status = message.includes('MONGODB_URI is not set') ? 503 : 500;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const noteSchema = z.object({
      numeroNota: z.string().min(1),
      nomeFornecedor: z.string().optional(),
      cnpjFornecedor: z.string().min(1),
      placa: z.string().optional(),
      valorNota: z.preprocess((v) => {
        if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(',', '.'));
        return typeof v === 'number' ? v : undefined;
      }, z.number().nonnegative()),
      dataEmissao: z.string().optional(),
      usuario: z.string().optional(),
      numeroOrdem: z.number().optional(),
      codigoFornecedor: z.string().optional(),
      bp: z.string().optional(),
      criadoEm: z.string().optional(),
      dataLancamento: z.string().optional(),
    });

    const parsed = noteSchema.parse(body);

    const toInsert = {
      usuario: parsed.usuario || 'unknown',
      criadoEm: parsed.criadoEm || new Date().toISOString(),
      dataLancamento:
        parsed.dataLancamento ||
        new Date().toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      ...parsed,
    } as Omit<ExtractedNote, 'id'>;

    const saved = await insertNote(toInsert);
    return NextResponse.json({ success: true, data: saved });
  } catch (e) {
    console.error('Erro ao criar nota:', e);
    if (e instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: e.errors.map((er) => er.message).join('; ') }, { status: 400 });
    }
    const message = e instanceof Error ? e.message : 'Erro ao criar nota';
    const status = message.includes('já lançada') ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
