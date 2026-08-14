---
name: atualizar
description: >
  Varre o projeto e atualiza os arquivos de contexto (`_memoria/empresa.md`, `preferencias.md`,
  `estrategia.md`, `CLAUDE.md`, `identidade/design-guide.md`) que ficaram desatualizados em relação
  ao estado real do workspace. Use quando o usuário disser "atualiza", "/atualizar", "varre o
  projeto", ou pedir uma reconciliação geral.
---

# /atualizar — Varredura e atualização de contexto

Compara o que está nos arquivos de contexto com o estado real do workspace e propõe atualizações.

## Workflow

### Passo 1 — Levantamento

Listar (ignorando as pastas do sistema — `.claude/`, `templates/`, `scripts/` — que não são contexto do negócio):
- Pastas na raiz do workspace (cada uma representa uma área de trabalho)
- Subpastas em `clientes/` (se existir) — cada uma é um cliente
- Skills em `.claude/skills/` — quais existem hoje, e quais são personalizadas
- Arquivos recentes (últimos 30 dias) em `conteudo/`, `propostas/`, `site/`, `materiais/`, `clientes/<x>/`
- Itens abertos em `tarefas.md` (se existir)

### Passo 2 — Comparação

Ler os arquivos de contexto e identificar:

- **Em `_memoria/empresa.md`:** lista de clientes / serviços / ferramentas — bate com a realidade do workspace? Os canais de contato continuam válidos?
- **Em `_memoria/estrategia.md`:** o foco atual ainda faz sentido? Tem contexto com prazo já vencido?
- **Em `CLAUDE.md`:** a seção "Onde salvar o que" bate com as pastas que existem de verdade? Apareceu pasta fora da convenção (sinal de que a convenção mudou na prática ou algo foi salvo no lugar errado)? Tem skill nova que merece menção?
- **Em `identidade/design-guide.md`:** continua coerente com o que foi gerado nas últimas peças (carrosséis, propostas)?

### Passo 3 — Proposta de mudanças

Apresentar pro usuário uma lista curta no formato:

```
Encontrei [N] coisas pra atualizar:

1. _memoria/empresa.md — falta o cliente "Acme" (vi pasta clientes/Acme/ criada em [data])
2. CLAUDE.md — tem regra "propostas vão em propostas/" mas vejo propostas em clientes/<x>/propostas/
3. _memoria/estrategia.md — fala em "fechar 1º cliente até 28/02", já passou e tem 3 clientes ativos
4. .claude/skills/ — criei /relatorio-semanal na semana passada e o CLAUDE.md não menciona

Quer que eu aplique essas mudanças? Posso aplicar todas, escolher algumas, ou nenhuma.
```

### Passo 4 — Aplicação

Se o usuário aprovar, editar os arquivos com cirurgia — só a linha relevante, sem reformatar o documento todo. Mostrar o diff de cada mudança aplicada.

## Regras

- Não inventar fatos — só registrar o que tem evidência no workspace
- Se a evidência for ambígua (ex: pasta vazia chamada "Cliente Novo"), perguntar antes de adicionar
- Não apagar conteúdo dos arquivos de contexto — só atualizar e adicionar. Informação que virou histórico vai pra uma linha "histórico" em vez de ser removida
- Prazo vencido nunca é apagado em silêncio: perguntar se foi cumprido, adiado ou abandonado
- Não mexer nas seções de regra do sistema no `CLAUDE.md` (correções, contexto, skills, segredos, execução)
- **Não propor mudança em `templates/` nem em `.claude/skills/`.** Atualização do sistema é `/atualizar-sistema`
- Se nenhuma mudança for necessária, responder "Tá tudo coerente, nada pra atualizar"
