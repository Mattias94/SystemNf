# API Documentation - NF System

## Overview

> Total de Endpoints: 1  
> Base URL: `http://localhost:3000`  
> Método de Autenticação: Nenhum (desenvolvimento)

---

## Endpoints

### 1. Extract PDF Data

**POST** `/api/pdf`

Processa o texto extraído de um PDF e retorna os dados estruturados da nota fiscal.

#### Request

**Headers:**
```
Content-Type: multipart/form-data
```

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| text | string | Sim | Texto extraído do PDF |
| usuario | string | Sim | Nome do usuário que está lançando a nota |

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/api/pdf \
  -F "text=NF: 123456 CNPJ: 12.345.678/0001-90" \
  -F "usuario=João Silva"
```

**Exemplo JavaScript:**
```javascript
const formData = new FormData();
formData.append('text', extractedPDFText);
formData.append('usuario', 'João Silva');

const response = await fetch('/api/pdf', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

#### Response

**Status: 200 OK (Sucesso)**
```json
{
  "success": true,
  "data": {
    "id": "note_1713446400000",
    "numeroNota": "123456",
    "cnpjFornecedor": "12.345.678/0001-90",
    "placa": "ABC-1234",
    "valorNota": 1500.50,
    "dataEmissao": "15/04/2026",
    "usuario": "João Silva",
    "numeroOrdem": 0,
    "codigoFornecedor": null,
    "criadoEm": "2026-04-18T14:00:00.000Z"
  }
}
```

**Status: 400 Bad Request**
```json
{
  "success": false,
  "error": "Texto do PDF não fornecido"
}
```

```json
{
  "success": false,
  "error": "Usuário não fornecido"
}
```

**Status: 500 Internal Server Error**
```json
{
  "success": false,
  "error": "Erro ao processar PDF"
}
```

---

## Data Models

### ExtractedNote

Modelo completo da nota fiscal extraída:

```typescript
interface ExtractedNote {
  // Identificação
  id: string;                    // ID único, formato: "note_TIMESTAMP"
  
  // Dados da Nota
  numeroNota: string;            // Número da nota fiscal (ex: "123456")
  cnpjFornecedor: string;        // CNPJ do fornecedor (ex: "12.345.678/0001-90")
  placa: string;                 // Placa do veículo (ex: "ABC-1234" ou "")
  valorNota: number;             // Valor em reais (ex: 1500.50)
  dataEmissao: string;           // Data em formato DD/MM/YYYY
  
  // Controle
  numeroOrdem: number;           // Ordem sequencial de lançamento
  usuario: string;               // Nome do usuário que lançou
  codigoFornecedor?: string;     // Código do fornecedor no sistema
  
  // Metadados
  criadoEm: string;              // ISO 8601 timestamp
}
```

---

## Padrões de Extração

### Reconhecimento de Campos

#### Número da Nota Fiscal
**Padrões Buscados:**
- "NF: 123456"
- "Nota: 123456"
- "Nota Fiscal: 123456"
- "NF 123456"

**Regex:** `/(?:NF|Nota(?:\s+Fiscal)?)[:\s]+(\d+)/i`

#### CNPJ do Fornecedor
**Padrões Buscados:**
- "CNPJ: 12.345.678/0001-90"
- "CNPJ:12.345.678/0001-90"
- "12345678000190"

**Regex:** `/CNPJ[:\s]+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i`

#### Placa do Veículo
**Padrões Buscados:**
- "Placa: ABC-1234"
- "Veículo: ABC-1234"
- "Carro ABC1234BR"

**Regex:** `/(?:Veículo|Placa|Carro)[:\s]*([A-Z]{3}[-\s]?\d{4}[A-Z]{2}|[A-Z0-9-]{8})/i`

#### Valor da Nota
**Padrões Buscados:**
- "Total: R$ 1.500,50"
- "Valor Total: 1500.50"
- "Total: 1.500,50"

**Regex:** `/(?:Total|Valor(?:\s+Total)?)[:\s]*R?\$?\s*([\d.,]+)/i`

**Processamento:**
```javascript
// Substitui ponto por nada (milhar) e vírgula por ponto (decimal)
parseFloat(valorMatch[1].replace('.', '').replace(',', '.'))
// "1.500,50" → "1500.50" → 1500.50
```

#### Data de Emissão
**Padrões Buscados:**
- "Data de Emissão: 15/04/2026"
- "Data: 15-04-2026"
- "Emissão: 15.04.2026"

**Regex:** `/(?:Data|Emissão)[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i`

**Processamento:**
```javascript
// Formata para DD/MM/YYYY com padding de zeros
`${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
```

---

## Códigos de Erro

| Código | Erro | Causa Possível |
|--------|------|----------------|
| 400 | "Texto do PDF não fornecido" | FormData sem campo `text` |
| 400 | "Usuário não fornecido" | FormData sem campo `usuario` |
| 500 | "Erro ao processar PDF" | Erro na extração de dados |

---

## Limitações Atuais

### 1. Sem Autenticação
- [ ] Qualquer pessoa pode acessar
- [ ] Sugestão: Adicionar JWT no futuro

### 2. localStorage Only
- [ ] Dados não persistem entre navegadores
- [ ] Dados perdidos se limpar cache
- [ ] Sugestão: Adicionar banco de dados

### 3. Extração Dependente de Estrutura
- [ ] PDFs mal formatados podem não extrair bem
- [ ] Layouts personalizados podem falhar
- [ ] Sugestão: ML-based extraction ou OCR

---

## Fluxo de Integração

```
┌─────────────────────────────────────────────┐
│  Usuario faz upload de PDF no frontend      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Frontend extrai texto do PDF (pdfjs-dist)  │
│  Usando: extractTextFromPDF()               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Envia texto + usuario para /api/pdf        │
│  POST /api/pdf                              │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Backend processa e extrai dados            │
│  Usando: extractNotaInfo()                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Retorna dados estruturados em JSON         │
│  { success: true, data: {...} }             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Frontend exibe formulário de review        │
│  Usuário pode editar campos                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Usuario clica em "Salvar Nota"             │
│  Dados salvos em localStorage               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Numero de ordem incrementado               │
│  Nota disponível no Relatório               │
└─────────────────────────────────────────────┘
```

---

## Exemplo Completo de Uso

### 1. Extrair PDF no Frontend
```typescript
import { extractTextFromPDF } from '@/lib/pdf-utils';

const file = event.target.files[0]; // File object
const text = await extractTextFromPDF(file);
// Retorna: "NF: 123456\nCNPJ: 12.345.678/0001-90\n..."
```

### 2. Enviar para API
```typescript
const response = await fetch('/api/pdf', {
  method: 'POST',
  body: new FormData([
    ['text', text],
    ['usuario', 'João Silva']
  ])
});

const result = await response.json();
// {
//   success: true,
//   data: {
//     id: "note_1713446400000",
//     numeroNota: "123456",
//     cnpjFornecedor: "12.345.678/0001-90",
//     ...
//   }
// }
```

### 3. Usuário Edita (Opcional)
```typescript
// Usuário vê os dados no formulário
// Pode editar qualquer campo
// Clica em "Salvar Nota"
```

### 4. Salvar Localmente
```typescript
import { saveNote } from '@/lib/storage';

const savedNote = saveNote({
  numeroNota: "123456",
  cnpjFornecedor: "12.345.678/0001-90",
  placa: "ABC-1234",
  valorNota: 1500.50,
  dataEmissao: "15/04/2026",
  usuario: "João Silva",
  codigoFornecedor: undefined
});

// Retorna a nota com id, numeroOrdem, criadoEm preenchidos
```

---

## Testing

### cURL Examples

**Teste básico:**
```bash
curl -X POST http://localhost:3000/api/pdf \
  -F "text=NF 123456 CNPJ 12.345.678/0001-90 Valor 1500 Data 15/04/2026" \
  -F "usuario=Test User"
```

**Com arquivo PDF real:**
```bash
# First, need to extract PDF text manually or with pdfjs
# Then send as above
```

---

## Próximas Versões

### API v2 (Planejada)
- [ ] Autenticação com JWT
- [ ] Database backend
- [ ] Endpoints CRUD completos
- [ ] Validação de CNPJ/CPF
- [ ] Rate limiting

---

**Última atualização**: 18 de abril de 2026
