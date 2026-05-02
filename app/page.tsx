'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './providers';

export default function Home() {
  const { usuario: usuarioAutenticado, setUsuario, logout } = useAuth();
  const [usuarioInput, setUsuarioInput] = useState('');

  useEffect(() => {
    if (usuarioAutenticado) {
      setUsuarioInput(usuarioAutenticado);
    }
  }, [usuarioAutenticado]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioInput.trim()) {
      setUsuario(usuarioInput);
    }
  };

  if (usuarioAutenticado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">NF System</h1>
          <p className="text-gray-600 text-center mb-8">
            Bem-vindo, <strong>{usuarioAutenticado}</strong>!
          </p>

          <div className="space-y-3">
            <Link href="/lancar">
              <button className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md">
                📄 Lançar Nota Fiscal
              </button>
            </Link>

            <Link href="/relatorio">
              <button className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md">
                📊 Ver Relatório
              </button>
            </Link>

            <Link href="/oficinas">
              <button className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition shadow-md">
                🏢 Oficinas
              </button>
            </Link>

            <button
              onClick={logout}
              className="w-full py-3 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition"
            >
              Sair
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Sistema de gerenciamento de notas fiscais com extração automática de dados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">NF System</h1>
          <p className="text-gray-600">Sistema de Lançamento de Notas Fiscais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Digite seu nome:
            </label>
            <input
              type="text"
              value={usuarioInput}
              onChange={(e) => setUsuarioInput(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-md"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
          <p className="font-semibold mb-2">Recursos:</p>
          <ul className="space-y-1 text-sm">
            <li>✓ Upload de PDF de notas fiscais</li>
            <li>✓ Extração automática de dados</li>
            <li>✓ Edição de campos</li>
            <li>✓ Relatório de notas</li>
            <li>✓ Controle de ordem de processamento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
