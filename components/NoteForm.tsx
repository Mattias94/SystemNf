'use client';

import React, { useState, useEffect } from 'react';
import { ExtractedNote } from '@/types/notes';
import { getOficinaByCnpj } from '@/lib/storage';

interface NoteFormProps {
  initialData: any;
  usuario: string;
  onSuccess: (note: Omit<ExtractedNote, 'id' | 'numeroOrdem' | 'criadoEm'>) => void;
  onBack?: () => void;
}

export function NoteForm({ initialData, usuario, onSuccess, onBack }: NoteFormProps) {
  const [formData, setFormData] = useState({
    numeroNota: initialData.numeroNota || '',
    nomeFornecedor: initialData.nomeFornecedor || '',
    cnpjFornecedor: initialData.cnpjFornecedor || '',
    placa: initialData.placa || '',
    valorNota: initialData.valorNota || 0,
    dataEmissao: initialData.dataEmissao || '',
    codigoFornecedor: initialData.codigoFornecedor || '',
    bp: initialData.bp || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.cnpjFornecedor && !formData.codigoFornecedor) {
      const oficina = getOficinaByCnpj(formData.cnpjFornecedor);
      if (oficina) {
        setFormData((prev) => ({
          ...prev,
          codigoFornecedor: oficina.codigo,
          nomeFornecedor: oficina.nome,
          bp: oficina.bp || '',
        }));
      }
    }
  }, [formData.cnpjFornecedor]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numeroNota) newErrors.numeroNota = 'Número da nota é obrigatório';
    if (!formData.cnpjFornecedor) newErrors.cnpjFornecedor = 'CNPJ do fornecedor é obrigatório';
    if (!formData.valorNota || formData.valorNota <= 0)
      newErrors.valorNota = 'Valor da nota deve ser maior que 0';
    if (!formData.dataEmissao) newErrors.dataEmissao = 'Data de emissão é obrigatória';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'valorNota' ? parseFloat(value) || 0 : value,
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSuccess({
        ...formData,
        usuario,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Revisar e Editar Dados</h2>

      {/* Resumo dos dados extraídos */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-3">📄 Dados Extraídos do PDF:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-600">Número da Nota:</p>
            <p className="font-semibold text-gray-800">{formData.numeroNota || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">Nome Fornecedor:</p>
            <p className="font-semibold text-gray-800">{formData.nomeFornecedor || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">CNPJ Fornecedor:</p>
            <p className="font-semibold text-gray-800">{formData.cnpjFornecedor || '—'}</p>
          </div>
          {formData.codigoFornecedor && (
            <div>
              <p className="text-gray-600">Código da Oficina:</p>
              <p className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">✓ {formData.codigoFornecedor}</p>
            </div>
          )}
          {formData.bp && (
            <div>
              <p className="text-gray-600">BP:</p>
              <p className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">✓ {formData.bp}</p>
            </div>
          )}
          <div>
            <p className="text-gray-600">Placa do Veículo:</p>
            <p className="font-semibold text-gray-800">{formData.placa || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">Valor:</p>
            <p className="font-semibold text-gray-800">R$ {formData.valorNota.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Data de Emissão:</p>
            <p className="font-semibold text-gray-800">{formData.dataEmissao || '—'}</p>
          </div>
          <div>
            <p className="text-gray-600">📅 Data de Lançamento:</p>
            <p className="font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">{new Date().toLocaleString('pt-BR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-6">Altere os campos abaixo se necessário:</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número da Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número da Nota Fiscal
            </label>
            <input
              type="text"
              name="numeroNota"
              value={formData.numeroNota}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
            {errors.numeroNota && <p className="text-red-600 text-sm mt-1">{errors.numeroNota}</p>}
          </div>

          {/* CNPJ Fornecedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ do Fornecedor
            </label>
            <input
              type="text"
              name="cnpjFornecedor"
              value={formData.cnpjFornecedor}
              onChange={handleChange}
              placeholder="00.000.000/0000-00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
            {errors.cnpjFornecedor && (
              <p className="text-red-600 text-sm mt-1">{errors.cnpjFornecedor}</p>
            )}
          </div>

          {/* Nome Fornecedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Fornecedor
            </label>
            <input
              type="text"
              name="nomeFornecedor"
              value={formData.nomeFornecedor}
              onChange={handleChange}
              placeholder="Nome da empresa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
          </div>

          {/* Código do Fornecedor (Oficina) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código da Oficina (Fornecedor)
            </label>
            <input
              type="text"
              name="codigoFornecedor"
              value={formData.codigoFornecedor}
              onChange={handleChange}
              placeholder="Preenchido automaticamente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
          </div>

          {/* BP (Business Partner) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              BP
            </label>
            <input
              type="text"
              name="bp"
              value={formData.bp}
              onChange={handleChange}
              placeholder="Preenchido automaticamente"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
          </div>

          {/* Placa do Veículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Placa do Veículo</label>
            <input
              type="text"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
              placeholder="ABC-1234 ou não informado"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
          </div>



          {/* Valor da Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Nota (R$)
            </label>
            <input
              type="number"
              name="valorNota"
              value={formData.valorNota}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
            {errors.valorNota && <p className="text-red-600 text-sm mt-1">{errors.valorNota}</p>}
          </div>

          {/* Data de Emissão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Emissão
            </label>
            <input
              type="date"
              name="dataEmissao"
              value={formData.dataEmissao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 text-blue-600"
            />
            {errors.dataEmissao && (
              <p className="text-red-600 text-sm mt-1">{errors.dataEmissao}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
          >
            ✓ Salvar Nota
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-2 px-4 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded transition"
            >
              ← Voltar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
