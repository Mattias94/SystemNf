'use client';

import React, { useEffect, useState } from 'react';
import { ExtractedNote } from '@/types/notes';
import { getNotes, deleteNote } from '@/lib/storage';

export function NotesReport() {
  const [notes, setNotes] = useState<ExtractedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchNumeroNota, setSearchNumeroNota] = useState('');
  const [searchCnpj, setSearchCnpj] = useState('');

  useEffect(() => {
    setNotes(getNotes());
    setLoading(false);
  }, []);

  const filteredNotes = notes.filter((note) => {
    const matchNumero = note.numeroNota.includes(searchNumeroNota);
    const matchCnpj = note.cnpjFornecedor.includes(searchCnpj);
    
    if (searchNumeroNota && searchCnpj) {
      return matchNumero && matchCnpj;
    }
    if (searchNumeroNota) {
      return matchNumero;
    }
    if (searchCnpj) {
      return matchCnpj;
    }
    return true;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta nota?')) {
      deleteNote(id);
      setNotes(getNotes());
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma nota lançada ainda.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Relatório de Notas Fiscais</h2>

      {/* Seção de Busca */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">🔍 Pesquisar Notas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número da Nota</label>
            <input
              type="text"
              placeholder="Digite o número da nota"
              value={searchNumeroNota}
              onChange={(e) => setSearchNumeroNota(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ do Fornecedor</label>
            <input
              type="text"
              placeholder="Digite o CNPJ (ex: 00.000.000/0000-00)"
              value={searchCnpj}
              onChange={(e) => setSearchCnpj(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-gray-800"
            />
          </div>
        </div>
        {(searchNumeroNota || searchCnpj) && (
          <div className="mt-3">
            <button
              onClick={() => {
                setSearchNumeroNota('');
                setSearchCnpj('');
              }}
              className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded transition"
            >
              ✕ Limpar Filtros
            </button>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Resultados: <span className="font-semibold">{filteredNotes.length}</span> nota(s)
        </p>
      </div>

      <div className="overflow-x-auto shadow rounded-lg">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 bg-white">
            <p className="text-gray-500">
              {searchNumeroNota || searchCnpj 
                ? 'Nenhuma nota encontrada com os filtros aplicados.' 
                : 'Nenhuma nota lançada ainda.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ordem</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">NF</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">CNPJ Fornecedor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cód. Oficina</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">BP</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Placa</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Valor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data Emissão</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Data Lançamento</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuário</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note, index) => (
                <tr key={note.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-semibold">{note.numeroOrdem}</td>
                  <td className="px-4 py-3 text-gray-900">{note.numeroNota}</td>
                  <td className="px-4 py-3 text-gray-900">{note.cnpjFornecedor}</td>
                  <td className="px-4 py-3 text-gray-900">{note.codigoFornecedor || '-'}</td>
                  <td className="px-4 py-3 text-gray-900">{note.bp || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        note.placa ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {note.placa || 'Sem placa'}
                    </span>
                  </td>
                <td className="px-4 py-3 text-gray-900 font-semibold">
                  {formatCurrency(note.valorNota)}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {new Date(note.dataEmissao).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-gray-900 text-xs">
                  {note.dataLancamento}
                </td>
                <td className="px-4 py-3 text-gray-900">{note.usuario}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-gray-700">
          <p>
            <strong>Total de notas:</strong> {notes.length}
          </p>
          <p>
            <strong>Valor total:</strong>{' '}
            {formatCurrency(notes.reduce((sum, note) => sum + note.valorNota, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
