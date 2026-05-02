'use client';

import React from 'react';
import Link from 'next/link';
import { NotesReport } from '@/components/NotesReport';
import { useAuth } from '@/app/providers';

export default function RelatorioPage() {
  const { usuario, isLoading } = useAuth();

  if (isLoading || !usuario) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Relatório de Notas Fiscais</h1>
            <p className="text-gray-600 mt-1">Usuário: {usuario}</p>
          </div>
          <div className="space-x-3">
            <Link href="/lancar">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition inline-block">
                ➕ Lançar Nova Nota
              </button>
            </Link>
            <Link href="/oficinas">
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition inline-block">
                🏢 Oficinas
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition inline-block">
                ← Voltar
              </button>
            </Link>
          </div>
        </div>

        {/* Relatório */}
        <div className="bg-white rounded-lg shadow p-6">
          <NotesReport />
        </div>
      </div>
    </div>
  );
}
