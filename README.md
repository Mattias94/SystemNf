# NF System - Sistema de Lançamento de Notas Fiscais

Sistema simples e eficiente para gerenciamento de notas fiscais com extração automática de dados via upload de PDF, construído com Next.js 14, TypeScript, Tailwind CSS e Prettier.

## 🚀 Recursos Implementados

### Funcionalidades Principais
- ✅ **Upload de PDF**: Carregar notas fiscais em formato PDF
- ✅ **Extração Automática de Dados**: Extração inteligente de:
  - Número da nota fiscal
  - CNPJ do fornecedor
  - Placa do veículo (extraída da descrição)
  - Valor da nota (em R$)
  - Data de emissão
  
- ✅ **Edição de Campos**: Possibilidade de editar campos extraídos (especialmente útil quando não há placa)
- ✅ **Controle de Ordem**: Incremento automático de número de ordem a cada nota lançada
- ✅ **Código do Fornecedor**: Campo para associar código do fornecedor (cadastro futuro)
- ✅ **Relatório de Notas**: Tela com visualização de todas as notas lançadas
- ✅ **Identificação de Usuário**: Cada nota registra o usuário que a lançou

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Processamento de PDF**: pdfjs-dist
- **Formatação**: Prettier
- **Fontes**: Google Fonts (Poppins)
- **Gerenciamento de Estado**: localStorage (cliente)

## 📁 Estrutura do Projeto

```
nf-system/
├── app/
│   ├── layout.tsx              # Layout principal com Google Fonts
│   ├── page.tsx                # Página de login/menu principal
│   ├── api/
│   │   └── pdf/
│   │       └── route.ts        # API Route para processar dados extraída
│   ├── lancar/
│   │   └── page.tsx            # Página de lançamento de notas
│   └── relatorio/
│       └── page.tsx            # Página de relatório
├── components/
│   ├── PDFUploader.tsx         # Componente de upload e extração de PDF
│   ├── NoteForm.tsx            # Formulário de edição/confirmação de dados
│   └── NotesReport.tsx         # Componente de relatório de notas
├── lib/
│   ├── pdf-utils.ts            # Utilitários para processamento de PDF
│   └── storage.ts              # Funções de gerenciamento localStorage
├── types/
│   └── notes.ts                # Types/Interfaces do projeto
├── .prettierrc                 # Configuração do Prettier
├── tailwind.config.ts          # Configuração do Tailwind CSS
├── tsconfig.json               # Configuração do TypeScript
├── next.config.ts              # Configuração do Next.js
└── package.json                # Dependências do projeto
```

## 🎯 Fluxo de Uso

### 1. Login (Página Inicial)
- Usuário insere seu nome
- Clica em "Entrar"
- Acessa o menu principal com duas opções

### 2. Lançar Nota Fiscal
- Seleciona um arquivo PDF da nota fiscal
- Sistema extrai automaticamente os dados
- Usuário revisa os dados e edita se necessário
- Clica em "Salvar Nota"
- Sistema incrementa o número de ordem automaticamente

### 3. Ver Relatório
- Exibe tabela com todas as notas lançadas
- Mostra: Ordem, NF, CNPJ, Código do Fornecedor, Placa, Valor, Data, Usuário
- Permite deletar notas
- Exibe totais e estatísticas

## 💾 Gerenciamento de Dados

Os dados são armazenados no **localStorage** do navegador com as seguintes chaves:
- `nf_notes`: Array de todas as notas lançadas
- `nf_next_order`: Próximo número de ordem
- `nf_current_user`: Usuário atualmente autenticado

## 🚀 Como Executar

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`

### Build para Produção
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Formatação com Prettier
```bash
npx prettier . --write
```

## 📋 Interface de Dados

### ExtractedNote (Nota Extraída)
```typescript
interface ExtractedNote {
  id: string;                    // ID único (timestamp-based)
  numeroNota: string;            // Número da nota fiscal
  cnpjFornecedor: string;        // CNPJ do fornecedor
  placa: string;                 // Placa do veículo
  valorNota: number;             // Valor em R$
  dataEmissao: string;           // Data (DD/MM/YYYY)
  usuario: string;               // Nome do usuário
  numeroOrdem: number;           // Número de ordem (auto-incrementado)
  codigoFornecedor?: string;     // Código do fornecedor (opcional)
  criadoEm: string;              // Data/hora de criação (ISO)
}
```

## 🎨 Design e UX

- **Layout Responsivo**: Otimizado para desktop e mobile
- **Cores Profissionais**: Paleta azul e verde para diferentes seções
- **Feedback Visual**: Mensagens de sucesso e erro clara
- **Navegação Intuitiva**: Botões de ação bem definidos
- **Tabela Interativa**: Relatório com informações organizadas

## 🔧 Configurações

### Tailwind CSS
- Configuração padrão do create-next-app
- Classes utilitárias para styling
- Suporte a dark mode (opcional)

### Google Fonts
- Font "Poppins" (pesos: 400, 500, 600, 700)
- Totalmente integrada ao layout

### TypeScript
- Strict mode habilitado
- Tipagem completa de componentes
- Interfaces bem definidas

## 📝 Regras de Extração de Dados

A função `extractNotaInfo()` busca por padrões de texto comum:

- **Número NF**: Busca por "NF", "Nota" ou "Nota Fiscal" seguido de números
- **CNPJ**: Padrão com "/" e "-" (XX.XXX.XXX/XXXX-XX) ou 14 dígitos
- **Placa**: Padrão ABC-1234 ou ABC1234
- **Valor**: Busca por "Total" ou "Valor" seguido de números
- **Data**: Formato DD/MM/YYYY ou DD-MM-YYYY

> **Nota**: A extração depende de como o PDF está estruturado. Alguns arquivos podem não extrair todos os dados corretamente, daí a importância da edição manual.

## 🔄 Fluxo de Incremento de Ordem

1. Primeira nota lançada: `numeroOrdem = 1`
2. Segunda nota: `numeroOrdem = 2`
3. E assim sucessivamente...

O sistema usa uma chave no localStorage (`nf_next_order`) para manter o controle.

## 📱 Recursos Adicionais

### Placeholders para Expansão Futura
- **Cadastro de Fornecedores**: Tela para gerenciar código e dados de fornecedores
- **Banco de Dados**: Migrar de localStorage para banco de dados persistente
- **Autenticação**: Integrar sistema de autenticação real
- **Relatórios Avançados**: Filtros, exportação em Excel/PDF
- **Webhooks**: Integration com outros sistemas

## ⚠️ Limitações Conhecidas

1. **localStorage**: Dados são perdidos se limpar cache do navegador
2. **Extração de PDF**: Depende da estrutura e qualidade do PDF
3. **Sem Backup**: Sem persistência em servidor
4. **Sem Validação CNPJ**: Aceita qualquer formato de CNPJ

## 🚀 Próximas Melhorias Sugeridas

1. Backend com banco de dados (PostgreSQL/MongoDB)
2. Autenticação real (JWT/OAuth)
3. Tela de cadastro de fornecedores com banco de dados
4. Exportação de relatórios (PDF/Excel)
5. Histórico de alterações
6. Integração com APIs de validação de CNPJ e placas
7. Notificações em tempo real
8. Dashboard com gráficos e análises

## 📄 Licença

Projeto desenvolvido para fins educacionais e comerciais.

## 👨‍💻 Autor

Sistema de Gerenciamento de Notas Fiscais - 2026
