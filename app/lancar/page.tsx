'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFUploader } from '@/components/PDFUploader';
import { createNote } from '@/lib/notes-api';
import { ExtractedNote } from '@/types/notes';
import { useAuth } from '@/app/providers';
import { truncateDisplayName } from '@/lib/string-utils';

export default function LancarPage() {
  const { usuario, isLoading } = useAuth();
  const usuarioExibido = usuario ? truncateDisplayName(usuario) : '';
  const [notaSalva, setNotaSalva] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [uploaderKey, setUploaderKey] = useState(0);

  const handleNoteExtracted = async (note: Omit<ExtractedNote, 'id' | 'numeroOrdem' | 'criadoEm'>) => {
    try {
      await createNote(note as Omit<ExtractedNote, 'id'>);
      setNotaSalva(true);
      setErro(null);

      // Mostrar mensagem de sucesso por 2 segundos
      setTimeout(() => {
        setNotaSalva(false);
        setUploaderKey((prev) => prev + 1);
      }, 2000);
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar a nota. Tente novamente.';
      setErro(message.includes('já lançada') ? `⚠️ DUPLICIDADE DETECTADA: Nota fiscal #${note.numeroNota} já foi lançada. Lançamento bloqueado.` : message);
    }
  };

  if (isLoading || !usuario) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lançar Nota Fiscal</h1>
            <p className="text-gray-600 mt-1" title={usuario}>Usuário: {usuarioExibido}</p>
          </div>
          <div className="space-x-3">
            <Link href="/relatorio">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition inline-block">
                📊 Relatório
              </button>
            </Link>
            <Link href="/oficinas">
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition inline-block">
                🏢 Oficinas
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition">
                ← Voltar
              </button>
            </Link>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {notaSalva && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg">
            ✓ Nota fiscal salva com sucesso!
          </div>
        )}

        {/* Mensagem de erro/duplicidade */}
        {erro && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg shadow">
            {erro}
          </div>
        )}

        {/* Uploader */}
        <PDFUploader key={uploaderKey} usuario={usuario} onNoteExtracted={handleNoteExtracted} />

        {/* Instruções */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Instruções:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Selecione um arquivo PDF contendo a sua nota fiscal</li>
            <li>
              O sistema extrairá automaticamente: número da NF, CNPJ do fornecedor, placa do veículo, valor e data
            </li>
            <li>Revise os dados extraídos e edite se necessário</li>
            <li>Clique em &quot;Salvar Nota&quot; para registrar a operação</li>
            <li>A ordem será incrementada automaticamente a cada nota lançada</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
