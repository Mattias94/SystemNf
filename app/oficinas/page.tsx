'use client';

import React from 'react';
import Link from 'next/link';
import { OficinasManager } from '@/components/OficinasManager';
import { useAuth } from '@/app/providers';
import { truncateDisplayName } from '@/lib/string-utils';

export default function OficinasPage() {
  const { usuario, isLoading } = useAuth();
  const usuarioExibido = usuario ? truncateDisplayName(usuario) : '';

  if (isLoading || !usuario) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Oficinas</h1>
            <p className="text-gray-600 mt-1" title={usuario}>Usuário: {usuarioExibido}</p>
          </div>
          <div className="space-x-3">
            <Link href="/relatorio">
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition inline-block">
                📊 Relatório
              </button>
            </Link>
            <Link href="/lancar">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition inline-block">
                📄 Lançar Nota
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition inline-block">
                ← Voltar
              </button>
            </Link>
          </div>
        </div>

        {/* Gerenciador de Oficinas */}
        <div className="bg-white rounded-lg shadow p-6">
          <OficinasManager />
        </div>
      </div>
    </div>
  );
}
