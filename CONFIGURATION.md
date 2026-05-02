# Configurações do Projeto NF System

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto se precisar de configurações:

```env
# Exemplo (opcional por enquanto)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## TypeScript

### tsconfig.json
Configurações importantes:
- `"strict": true` - Type checking rigoroso
- `"paths"` - Alias de imports (@/* para ./src/*)
- `"skipLibCheck": true` - Acelera compilação

## Next.js

### next.config.ts
Configurações específicas do Next.js:
- Turbopack habilitado (mais rápido)
- ESLint integrado
- Image optimization
- Font optimization

## Tailwind CSS

### tailwind.config.ts
- Suporte a tema light/dark (pronto para expansão)
- Cores customizadas (opção de adicionar later)
- Plugins (opcional)

## Storage (localStorage)

### Estrutura de Dados em localStorage

```javascript
// Notas lançadas
localStorage.getItem('nf_notes') // Array[ExtractedNote]

// Próximo número de ordem
localStorage.getItem('nf_next_order') // number

// Usuário atual
localStorage.getItem('nf_current_user') // string
```

## Componentes React

### 'use client' Directive
Todos os componentes que usam:
- State (useState)
- Effects (useEffect)
- Event handlers
- localStorage

São marcados com `'use client'` para rodar no browser.

## API Routes

### /api/pdf [POST]
**Entrada:**
```json
{
  "text": "string (PDF text extracted)",
  "usuario": "string (username)"
}
```

**Saída (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "numeroNota": "string",
    "cnpjFornecedor": "string",
    "placa": "string",
    "valorNota": "number",
    "dataEmissao": "string (DD/MM/YYYY)",
    "usuario": "string",
    "numeroOrdem": 0,
    "criadoEm": "ISO string"
  }
}
```

**Saída (erro):**
```json
{
  "success": false,
  "error": "string (mensagem erro)"
}
```

## Padrões de Código

### Imports
```typescript
// Sempre usar alias de path
import { ExtractedNote } from '@/types/notes';
import { saveNote } from '@/lib/storage';
import { PDFUploader } from '@/components/PDFUploader';
```

### Componentes
```typescript
'use client'; // Se usar estado ou eventos

import React from 'react';

interface Props {
  prop1: type;
  prop2: type;
}

export function MyComponent({ prop1, prop2 }: Props) {
  return <div>{/* jsx */}</div>;
}
```

### Tipos
```typescript
// Preferir interfaces para objetos
interface MyType {
  field: type;
}

// Preferir types para unions
type MyType = 'A' | 'B';
```

## Git

### .gitignore
Já configurado com:
- node_modules/
- .next/
- .env.local
- Build artifacts

### Commits Recomendados
```bash
git commit -m "feat: add novo recurso"
git commit -m "fix: corrigir bug"
git commit -m "refactor: reorganizar código"
git commit -m "docs: melhorar documentação"
```

## Performance

### Otimizações Já Implementadas
- ✅ Code splitting automático (Next.js)
- ✅ Image optimization (se usar <Image>)
- ✅ Font optimization (Google Fonts)
- ✅ Turbopack (build mais rápido)
- ✅ Dynamic imports (PDFjs carregado sob demanda)

### Próximas Otimizações
- Lazy loading de componentes
- Caching de requisições
- Compressão de assets
- CDN para distribução

## Deploy

### Vercel (Recomendado)
```bash
# Conectar repositório GitHub
# Vercel detecta Next.js automaticamente
# Deploy automático em cada push
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next .next
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-hosted
```bash
npm run build
npm start
```

## Testing (Futura)

Quando adicionar testes:

```bash
npm install --save-dev jest @testing-library/react
```

Estrutura:
```
tests/
├── unit/
├── integration/
└── e2e/
```

## Linting e Formatting

### ESLint
Já configurado com:
- next/core-web-vitals
- TypeScript support

### Prettier
Já configurado com:
- 2 espaços de indentação
- Aspas simples
- Sem semicolons à noite (configurável)

Arquivo: `.prettierrc`

## Melhorias Futuras - Checklist

- [ ] Adicionar Storybook
- [ ] Testes unitários com Jest
- [ ] Testes E2E com Cypress/Playwright
- [ ] CI/CD pipeline
- [ ] Error tracking (Sentry)
- [ ] Analytics
- [ ] Performance monitoring
- [ ] Documentação API (OpenAPI/Swagger)

## Recursos Úteis

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [PDF.js Documentation](https://mozilla.github.io/pdf.js)

---

**Last Updated**: 18 de abril de 2026
