'use client';

import React, { useState } from 'react';
import { ExtractedNote } from '@/types/notes';
import { NoteForm } from './NoteForm';
import { extractTextFromPDF } from '@/lib/pdf-utils';

interface PDFUploaderProps {
  usuario: string;
  onNoteExtracted: (note: Omit<ExtractedNote, 'id' | 'numeroOrdem' | 'criadoEm'>) => void;
}

export function PDFUploader({ usuario, onNoteExtracted }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ExtractedNote> | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Por favor, selecione um arquivo PDF válido');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Extrair texto do PDF no cliente
      const text = await extractTextFromPDF(file);

      const formData = new FormData();
      formData.append('text', text);
      formData.append('usuario', usuario);

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao processar PDF');
      }

      const result = await response.json();

      if (result.success) {
        setExtractedData(result.data);
      } else {
        setError(result.error || 'Erro ao extrair dados');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar PDF');
    } finally {
      setLoading(false);
    }
  };

  if (extractedData) {
    return (
      <NoteForm
        initialData={extractedData}
        usuario={usuario}
        onSuccess={onNoteExtracted}
        onBack={() => {
          setExtractedData(null);
          setFile(null);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Carregar Nota Fiscal (PDF)</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o PDF</label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
          <p>
            <strong>Arquivo selecionado:</strong> {file.name}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">{error}</div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded transition"
      >
        {loading ? 'Processando...' : 'Extrair Dados'}
      </button>
    </div>
  );
}
