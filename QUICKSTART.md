# GUIA DE INÍCIO RÁPIDO - NF System

## ✅ Sistema Pronto para Usar!

O projeto foi criado com sucesso e está rodando em **http://localhost:3000**

## 🎯 Como Testar o Sistema

### 1️⃣ Acesse a Página Inicial
- Abra o navegador em `http://localhost:3000`
- Você verá a tela de login com um campo "Digite seu nome"

### 2️⃣ Faça Login
- Digite um nome (ex: "João Silva")
- Clique em "Entrar"
- Você será redirecionado para o menu principal com duas opções:
  - 📄 **Lançar Nota Fiscal**
  - 📊 **Ver Relatório**

### 3️⃣ Teste Lançar Nota Fiscal
- Clique em "Lançar Nota Fiscal"
- Você verá uma interface para upload de PDF
- **Para testar sem um PDF real**, você tem duas opções:

#### Opção A: Criar um PDF de Teste
Se tiver uma nota fiscal em PDF, faça upload direto!

#### Opção B: Teste Manual
1. Clique em "Lançar Nota" sem enviar um arquivo para ver a validação
2. Quando enviar um PDF, o sistema tentará extrair:
   - Número da nota (busca por "NF", "Nota")
   - CNPJ (formato XX.XXX.XXX/XXXX-XX)
   - Placa (formato ABC-1234)
   - Valor total (em R$)
   - Data de emissão

### 4️⃣ Revise e Edite os Dados
Após o upload do PDF:
- O sistema mostrará um formulário com os dados extraídos
- Você pode editar qualquer campo
- O campo "Placa" pode ficar em branco se não encontrado (editável depois)
- Clique em "Salvar Nota"

### 5️⃣ Veja o Relatório
- Volte ao menu principal
- Clique em "Ver Relatório"
- Você verá uma tabela com:
  - **Ordem**: 1, 2, 3... (auto-incrementado)
  - **NF**: Número da nota fiscal
  - **CNPJ Fornecedor**: CNPJ extraído
  - **Código Fornecedor**: (opcional)
  - **Placa**: Com badging visual (verde se tem, amarelo se vazio)
  - **Valor**: Formatado em R$ (Brazilian Real)
  - **Data Emissão**: Formatada em DD/MM/YYYY
  - **Usuário**: Nome do usuário que lançou
  - **Ação**: Botão para deletar a nota

### 6️⃣ Teste Múltiplas Notas
- Lance múltiplas notas para ver:
  - A ordem incrementando (+1 a cada nota)
  - A tabela sendo atualizada
  - Diferentes usuários (faça logout e entre com outro nome)

## 🔍 Dados de Teste - Formato Esperado

Para melhor funcionamento da extração, o PDF deve conter texto com padrões como:

```
NF: 123456
CNPJ: 12.345.678/0001-90
Placa: ABC-1234
Valor Total: R$ 1.500,00
Data de Emissão: 15/04/2026
```

## 📱 Funcionalidades Disponíveis

### Tela de Lançamento
- ✅ Upload de PDF
- ✅ Extração automática de dados
- ✅ Formulário de edição
- ✅ Validação de campos obrigatórios
- ✅ Mensagem de sucesso

### Tela de Relatório
- ✅ Visualização em tabela
- ✅ Formatação de moeda (R$)
- ✅ Formatação de datas
- ✅ Badging visual para placas
- ✅ Opção de deletar notas
- ✅ Estatísticas (total de notas e valor total)

### Gerenciamento
- ✅ Ordem auto-incrementada
- ✅ Identificação de usuário
- ✅ Armazenamento em localStorage
- ✅ Navegação entre seções

## 🛠 Comandos Úteis

```bash
# Rodar em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Rodar versão produção
npm start

# ESLint
npm run lint

# Formatar código com Prettier
npx prettier . --write
```

## 🐛 Troubleshooting

### Problema: Página em branco
- **Solução**: Limpar cache do navegador (Ctrl+F5 ou abra em modo anônimo)

### Problema: Dados não aparecem no relatório
- **Solução**: Dados são salvos em localStorage, verifique se:
  - Você está no mesmo navegador/perfil
  - Não limpou os dados do site (Settings → Clear browsing data)

### Problema: PDF não extrai dados
- **Solução**: A extração depende da estrutura do PDF:
  - PDFs com texto extraível funcionam melhor
  - PDFs que são apenas imagens (scanned) não funcionam
  - Você sempre pode editar manualmente após o upload

### Problema: Ordem não incrementa
- **Solução**: Verifique se o localStorage não foi limpo

## 📝 Notas Importantes

1. **Dados Locais**: Todos os dados são salvos no localStorage do navegador
   - ⚠️ Serão perdidos se limpar dados do site
   - ⚠️ Não sincronizam entre abas/janelas diferentes
   - 💡 Será necessário um backend para persistência

2. **Extração de Dados**: É um "best effort"
   - A extração busca por padrões comuns
   - Nem sempre consegue extrair se o PDF tem layout irregular
   - Você pode sempre editar após a extração

3. **Segurança**: Atualmente NÃO tem autenticação
   - Qualquer pessoa consegue acessar digitando um nome
   - Para produção, será necessário implementar autenticação real

## 🚀 Próximas Etapas

Para produção, você precisará:

1. **Banco de Dados**: Substituir localStorage por um banco real
2. **API Backend**: Criar endpoints para:
   - Salvar notas
   - Recuperar notas
   - Deletar notas
   - Validar dados

3. **Autenticação**: Implementar login/registro real
4. **Fornecedores**: Criar tela de cadastro de fornecedores
5. **Relatórios Avançados**: Filtros, exportação, gráficos

## 📞 Suporte

Para mais informações sobre o projeto, consulte:
- [README.md](./README.md) - Documentação completa
- Arquivos de tipo em `/types`
- Componentes em `/components`
- Utilitários em `/lib`

---

**Aproveite o sistema! 🎉**
