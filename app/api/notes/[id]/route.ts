import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getNoteById, updateNoteById, deleteNoteById } from '@/lib/notes';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || request.nextUrl.pathname.split('/').pop();
  try {
    if (!id) return NextResponse.json({ success: false, error: 'id not provided' }, { status: 400 });
    const note = await getNoteById(id);
    if (!note) return NextResponse.json({ success: false, error: 'Nota não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: note });
  } catch (e) {
    console.error('Erro ao obter nota:', e);
    return NextResponse.json({ success: false, error: 'Erro ao obter nota' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || request.nextUrl.pathname.split('/').pop();
  try {
    if (!id) return NextResponse.json({ success: false, error: 'id not provided' }, { status: 400 });
    const updates = await request.json();
    const updateSchema = z.object({
      numeroNota: z.string().optional(),
      nomeFornecedor: z.string().optional(),
      cnpjFornecedor: z.string().optional(),
      placa: z.string().optional(),
      valorNota: z.preprocess((v) => {
        if (typeof v === 'string') return Number(v.replace(/\./g, '').replace(',', '.'));
        return typeof v === 'number' ? v : undefined;
      }, z.number().nonnegative().optional()),
      dataEmissao: z.string().optional(),
      usuario: z.string().optional(),
      numeroOrdem: z.number().optional(),
      codigoFornecedor: z.string().optional(),
      bp: z.string().optional(),
      criadoEm: z.string().optional(),
      dataLancamento: z.string().optional(),
    }).partial();

    try {
      updateSchema.parse(updates);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return NextResponse.json({ success: false, error: err.errors.map((er) => er.message).join('; ') }, { status: 400 });
      }
      throw err;
    }

    const updated = await updateNoteById(id, updates);
    if (!updated) return NextResponse.json({ success: false, error: 'Nota não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (e) {
    console.error('Erro ao atualizar nota:', e);
    const message = e instanceof Error ? e.message : 'Erro ao atualizar nota';
    const status = message.includes('já lançada') ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || request.nextUrl.pathname.split('/').pop();
  const usuarioAtual = request.headers.get('x-current-user') || '';
  try {
    if (!id) return NextResponse.json({ success: false, error: 'id not provided' }, { status: 400 });
    if (!usuarioAtual) {
      return NextResponse.json({ success: false, error: 'Usuário não informado' }, { status: 400 });
    }

    const ok = await deleteNoteById(id, usuarioAtual);
    if (!ok) return NextResponse.json({ success: false, error: 'Nota não encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, data: { id } });
  } catch (e) {
    console.error('Erro ao deletar nota:', e);
    const message = e instanceof Error ? e.message : 'Erro ao deletar nota';
    const status = message.includes('somente pode deletar') || message.includes('lançadas por você') ? 403 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
