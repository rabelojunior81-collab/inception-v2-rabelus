# 🎯 HANDOFF: Inception Framework v2.0

> **Documento de Transferência de Conhecimento**  
> **Data:** 2026-03-12  
> **Versão:** 1.0.0  
> **Autor:** Rabelus Lab  

---

## 📋 TL;DR (Resumo Rápido)

Este é um **novo repositório** que contém a evolução do `inception-tui` para um **runtime completo de agentes autônomos** ao estilo ZeroClaw/OpenClaw.

**O que já existe:**
- ✅ Arquitetura completa definida (trait-driven)
- ✅ Tipagens TypeScript (@inception/types)
- ✅ Estrutura de monorepo configurada
- ✅ Documentação internacionalizada

**O que falta implementar:**
- ⏳ Código fonte dos pacotes (core, providers, channels, etc.)
- ⏳ CLI interativo (Opencode-inspired)
- ⏳ Integração Telegram/Discord
- ⏳ Runtime engine

---

## 🚀 Tutorial para Leigos: Instalação do Zero

### Passo 0: O que você precisa (Pré-requisitos)

Antes de começar, verifique se você tem:

#### 1. Node.js (Versão 20 ou superior)

**Windows:**
```powershell
# Baixe em: https://nodejs.org/en/download/
# Escolha a versão LTS (20.x.x)
# Instale com todas as opções padrão

# Depois, abra um NOVO terminal e verifique:
node --version
# Deve mostrar: v20.x.x
```

**Mac/Linux:**
```bash
# Usando navegador (recomendado para iniciantes):
# 1. Acesse: https://nodejs.org/en/download/
# 2. Baixe o instalador para seu sistema
# 3. Execute o instalador

# Ou usando terminal (avançado):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifique a instalação:
node --version
# Deve mostrar: v20.x.x
```

#### 2. pnpm (Gerenciador de pacotes)

**Windows/Mac/Linux (todos os sistemas):**
```bash
# Execute este comando no terminal:
npm install -g pnpm

# Verifique:
pnpm --version
# Deve mostrar: 8.x.x ou superior
```

#### 3. Git (Controle de versão)

**Windows:**
```powershell
# Baixe em: https://git-scm.com/download/win
# Instale com opções padrão
# Importante: escolha "Use Git from the Windows Command Prompt"

# Verifique no NOVO terminal:
git --version
```

**Mac:**
```bash
# Git geralmente já vem instalado no Mac
# Verifique:
git --version

# Se não tiver, instale o Xcode Command Line Tools:
xcode-select --install
```

**Linux:**
```bash
sudo apt update
sudo apt install git

# Verifique:
git --version
```

#### 4. Uma conta no GitHub

Se ainda não tiver, crie em: https://github.com/signup

---

### Passo 1: Clonar o Repositório

Abra o terminal (Prompt de Comando no Windows, Terminal no Mac/Linux) e execute:

```bash
# Navegue para a pasta onde quer guardar o projeto
# Windows:
cd Documents

# Mac/Linux:
cd ~

# Clone o repositório (quando estiver no GitHub)
git clone https://github.com/rabeluslab/inception.git

# Entre na pasta do projeto
cd inception

# Veja o que temos até agora
ls  # Mac/Linux
dir  # Windows
```

---

### Passo 2: Instalar Dependências

```bash
# Instale TODAS as dependências do monorepo
pnpm install

# Isso pode demorar 2-5 minutos na primeira vez
# Você verá barras de progresso baixando pacotes
```

**Se der erro:**
- Verifique se está na pasta correta (`pwd` no Mac/Linux, `cd` no Windows)
- Verifique se o pnpm está instalado (`pnpm --version`)

---

### Passo 3: Verificar a Instalação

```bash
# Verifique se o TypeScript está ok
pnpm typecheck

# Deve mostrar algo como:
# > @inception/root@2.0.0 typecheck /caminho/inception
# > tsc --noEmit
# 
# (sem erros = sucesso!)
```

---

### Passo 4: Build dos Pacotes

```bash
# Compile todos os pacotes
pnpm build

# Você verá:
# - Compilação do @inception/types
# - Criação das pastas dist/
```

---

### Passo 5: Testar

```bash
# Rode os testes (quando existirem)
pnpm test

# Por enquanto, pode mostrar "No tests found" - isso é normal!
```

---

## 🎉 Sucesso! Agora o que?

Se você chegou até aqui sem erros, parabéns! O ambiente está configurado.

---

## 📁 Estrutura do Projeto Explicada

Imagine o projeto como um **shopping center**:

```
inception/                      ← Shopping center (monorepo)
├── packages/                   ← Lojas do shopping
│   ├── types/                  ← Loja de "definições"
│   │                           └─ Tipos TypeScript (já implementado!)
│   ├── core/                   ← Loja do "motor principal"
│   │                           └─ Runtime engine (VOCÊ VAI FAZER)
│   ├── providers/              ← Loja de "cérebros de IA"
│   │   ├── openai/             └─ Conecta com ChatGPT
│   │   ├── anthropic/          └─ Conecta com Claude
│   │   ├── gemini/             └─ Conecta com Google
│   │   └── ollama/             └─ Conecta com modelos locais
│   ├── channels/               ← Loja de "comunicação"
│   │   ├── cli/                └─ Terminal
│   │   ├── telegram/           └─ Bot do Telegram
│   │   ├── discord/            └─ Bot do Discord
│   │   └── http/               └─ API Web
│   ├── memory/                 ← Loja de "memória"
│   │                           └─ SQLite + Gemini Embeddings
│   ├── tools/                  ← Loja de "ferramentas"
│   │   ├── shell/              └─ Executa comandos
│   │   ├── filesystem/         └─ Lê/escreve arquivos
│   │   ├── browser/            └─ Navegador automático
│   │   └── http/               └─ Faz requisições web
│   ├── security/               ← Loja de "segurança"
│   │                           └─ Autenticação, Gates
│   └── protocol/               ← Loja da "metodologia"
│                               └─ IMP/IEP/ISP implementados
├── apps/
│   ├── cli/                    ← Aplicativo principal (terminal)
│   └── daemon/                 ← Serviço de fundo (futuro)
└── docs/                       ← Manual de instruções
    ├── en/                     └─ Em inglês
    ├── pt/                     └─ Em português
    └── ...
```

### O que já está pronto (✅)

1. **@inception/types** - Todas as interfaces TypeScript
   - Como usar: `import type { IProvider, IChannel } from '@inception/types'`
   
2. **Configuração do monorepo** - Turborepo + pnpm configurados
   
3. **Documentação** - CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md

### O que você precisa implementar (⏳)

Veja a seção "Próximos Passos Priorizados" abaixo.

---

## 🔧 Comandos Úteis (Guia de Bolso)

```bash
# Desenvolvimento
pnpm dev              # Inicia modo de desenvolvimento (hot reload)
pnpm build            # Compila tudo
pnpm build --filter=@inception/types   # Compila só um pacote

# Qualidade de código
pnpm lint             # Verifica erros de estilo
pnpm lint:fix         # Corrige erros automaticamente
pnpm format           # Formata o código
pnpm typecheck        # Verifica tipos TypeScript

# Testes
pnpm test             # Roda todos os testes
pnpm test:coverage    # Roda testes com cobertura

# Limpeza
pnpm clean            # Limpa builds e node_modules
```

---

## 🐛 Troubleshooting (Problemas Comuns)

### "pnpm não é reconhecido como comando"

**Windows:**
```powershell
# Feche e REABRA o terminal (Prompt de Comando ou PowerShell)
# O PATH só atualiza em novas janelas
```

**Mac/Linux:**
```bash
# Adicione ao PATH manualmente:
export PATH="$HOME/.local/share/pnpm:$PATH"

# Ou recarregue o shell:
source ~/.zshrc  # Se usar zsh
source ~/.bashrc # Se usar bash
```

### "Cannot find module '@inception/types'"

```bash
# Significa que os pacotes não foram buildados
pnpm build

# Ou a versão está desatualizada
pnpm install
pnpm build
```

### "permission denied" (Mac/Linux)

```bash
# Use sudo para comandos globais
sudo npm install -g pnpm

# Ou configure npm para não precisar de sudo:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Erros de TypeScript estranhos

```bash
# Limpe tudo e reinstale
pnpm clean
pnpm install
pnpm build
```

---

## 📚 Documentação Importante

Leia estes arquivos na ordem:

1. **`packages/types/src/`** - Veja as interfaces que já existem (LEIA PRIMEIRO — é o contrato de tudo!)
2. **`docs/audit-research/claude-sonnet-audit-2026-03-16.md`** - Auditoria técnica completa e roadmap revisado
3. **`CONTRIBUTING.md`** - Como contribuir, commits, padrões
4. **`SECURITY.md`** - Políticas de segurança

> **Nota:** O arquivo `MISSION_BRIEFING.md` foi referenciado aqui anteriormente mas não chegou a ser criado.
> A auditoria técnica em `docs/audit-research/` cobre o mesmo propósito.

---

## 🎯 Próximos Passos Priorizados

### Fase 1: Fundação (FAÇA PRIMEIRO)

#### 1.1 Config Package
```
packages/config/
├── src/
│   ├── index.ts
│   ├── schema.ts          # Zod schemas
│   ├── loader.ts          # Cosmiconfig integration
│   └── validation.ts
├── package.json
└── tsconfig.json
```

**Tarefa:** Criar validação de configuração usando Zod

#### 1.2 Core Package
```
packages/core/
├── src/
│   ├── index.ts
│   ├── runtime.ts         # Main runtime class
│   ├── events.ts          # Event bus
│   ├── container.ts       # Dependency injection
│   └── errors.ts          # Error classes
```

**Tarefa:** Implementar o runtime engine com event bus

### Fase 2: Provedores

#### 2.1 OpenAI Provider
Implementar `IProvider` para OpenAI

#### 2.2 Gemini Embeddings
Implementar `IEmbeddingProvider` usando API Gemini

### Fase 3: Canais

#### 3.1 CLI Channel (Ink-based)
Interface terminal rica

#### 3.2 Telegram Channel
Bot do Telegram

### Fase 4: Memória

#### 4.1 SQLite Backend
Implementar `IMemoryBackend` com SQLite

#### 4.2 Gemini Integration
Integrar embeddings da Gemini

### Fase 5: CLI App

```
apps/cli/
├── src/
│   ├── index.ts           # Entry point
│   ├── commands/
│   │   ├── init.ts        # inception init
│   │   ├── start.ts       # inception start
│   │   └── config.ts      # inception config
│   └── components/        # Ink React components
```

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/rabeluslab/inception
- **Documentação:** https://inception.rabeluslab.dev (futuro)
- **Issues:** https://github.com/rabeluslab/inception/issues
- **Discord:** https://discord.gg/inception (futuro)

### Referências Técnicas

- [Turborepo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Zod Documentation](https://zod.dev/)
- [Ink (React for CLI)](https://github.com/vadimdemedes/ink)
- [Gemini Embeddings API](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/)

---

## 💡 Dicas para Novos Desenvolvedores

### 1. Comece pelo types
Veja como as interfaces estão definidas em `packages/types/src/`. Isso mostra o "contrato" que todas as implementações devem seguir.

### 2. Use o Zod Playground
Teste seus schemas de validação em: https://zod-playground.vercel.app/

### 3. Teste pequenas partes
Não tente implementar tudo de uma vez. Faça um pacote, teste, depois vá para o próximo.

### 4. Siga os exemplos
Veja como outros projetos open source estruturam monorepos:
- https://github.com/vercel/turborepo (exemplos)
- https://github.com/calcom/cal.com

### 5. Pergunte!
Se travar em algo por mais de 30 minutos, pergunte. Não fique preso.

---

## ✅ Checklist de Transferência

Antes de assumir o projeto, verifique:

- [ ] Node.js 20+ instalado
- [ ] pnpm instalado
- [ ] Git instalado
- [ ] Repositório clonado
- [ ] `pnpm install` executado sem erros
- [ ] `pnpm build` executado sem erros
- [ ] Leu `MISSION_BRIEFING.md` completo
- [ ] Leu `CONTRIBUTING.md`
- [ ] Entendeu a estrutura do monorepo
- [ ] Sabe quais pacotes já existem vs. o que precisa criar

---

## 🆘 Contato de Emergência

Se absolutamente travar:

1. Leia a mensagem de erro **completamente**
2. Google o erro (copie e cole a mensagem)
3. Verifique se seguiu o tutorial passo a passo
4. Pergunte no GitHub Issues

---

## 📝 Notas do Desenvolvedor Anterior

> Este projeto é ambicioso mas totalmente factível. A arquitetura está bem definida, os tipos TypeScript são rigorosos, e a estrutura do monorepo é profissional.
> 
> O maior desafio será o runtime engine (packages/core) - é o coração de tudo. Depois disso, os provedores e canais são mais mecânicos.
> 
> Não tenha medo de Typescript strict - ele vai te salvar de muitos bugs.
> 
> Boa sorte! 🚀

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-03-12  
**Next Review:** 2026-03-19
