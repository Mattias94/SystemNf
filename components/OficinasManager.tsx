'use client';

import React, { useEffect, useState } from 'react';

interface Oficina {
  id: string;
  codigo: string;
  nome: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  email: string;
  bp: string;
  telefone: string;
  criadoEm: string;
}

export function OficinasManager() {
  const [oficinas, setOficias] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    email: '',
    bp: '',
    telefone: '',
  });

  const OFICINAS_STORAGE_KEY = 'nf_oficinas';

  useEffect(() => {
    carregarOficias();
    setLoading(false);
  }, []);

  const carregarOficias = () => {
    if (typeof window === 'undefined') return;
    const oficinasJson = localStorage.getItem(OFICINAS_STORAGE_KEY);
    setOficias(oficinasJson ? JSON.parse(oficinasJson) : []);
  };

  const handleAddOficias = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nome || !formData.cnpj) {
      alert('Código, Nome e CNPJ são obrigatórios');
      return;
    }

    // Verificar se CNPJ já existe
    const cnpjExistente = oficinas.find((o) => o.cnpj === formData.cnpj);
    if (cnpjExistente) {
      alert(`⚠️ Esta oficina já está cadastrada!\n\nCódigo: ${cnpjExistente.codigo}\nNome: ${cnpjExistente.nome}\nCNPJ: ${cnpjExistente.cnpj}`);
      return;
    }

    const novaOficias: Oficina = {
      id: `oficina_${Date.now()}`,
      codigo: formData.codigo,
      nome: formData.nome,
      cnpj: formData.cnpj,
      endereco: formData.endereco,
      cidade: formData.cidade,
      estado: formData.estado,
      email: formData.email,
      bp: formData.bp,
      telefone: formData.telefone,
      criadoEm: new Date().toISOString(),
    };

    const oficinasAtualizadas = [...oficinas, novaOficias];
    localStorage.setItem(OFICINAS_STORAGE_KEY, JSON.stringify(oficinasAtualizadas));
    setOficias(oficinasAtualizadas);

    setFormData({ codigo: '', nome: '', cnpj: '', endereco: '', cidade: '', estado: '', email: '', bp: '', telefone: '' });
    setShowForm(false);
  };

  const handleDeleteOficias = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta oficina?')) {
      const oficinasAtualizadas = oficinas.filter((o) => o.id !== id);
      localStorage.setItem(OFICINAS_STORAGE_KEY, JSON.stringify(oficinasAtualizadas));
      setOficias(oficinasAtualizadas);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Oficinas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition"
        >
          {showForm ? '✕ Cancelar' : '➕ Adicionar Oficina'}
        </button>
      </div>

      {/* Formulário de Adição */}
      {showForm && (
        <div className="mb-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-4">Nova Oficina</h3>
          <form onSubmit={handleAddOficias} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: OF001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Oficina *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Oficina XYZ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: São Paulo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  placeholder="Ex: SP"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BP
                </label>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                  placeholder="Ex: BP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 0000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 text-gray-700"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
              >
                💾 Salvar Oficina
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Oficinas */}
      {oficinas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Nenhuma oficina cadastrada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oficinas.map((oficina) => (
            <div
              key={oficina.id}
              className="p-4 border border-orange-200 rounded-lg bg-orange-50 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{oficina.nome}</h3>
                  <p className="text-sm text-gray-600">Código: {oficina.codigo}</p>
                  <p className="text-sm text-gray-600">CNPJ: {oficina.cnpj}</p>
                </div>
                <button
                  onClick={() => handleDeleteOficias(oficina.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                >
                  Deletar
                </button>
              </div>

              {oficina.endereco && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Endereço:</strong> {oficina.endereco}
                </p>
              )}

              {(oficina.cidade || oficina.estado) && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Localização:</strong> {oficina.cidade} {oficina.estado}
                </p>
              )}

              {oficina.email && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Email:</strong> {oficina.email}
                </p>
              )}

              {oficina.bp && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>BP:</strong> {oficina.bp}
                </p>
              )}

              {oficina.telefone && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Telefone:</strong> {oficina.telefone}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Criado em: {new Date(oficina.criadoEm).toLocaleDateString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
