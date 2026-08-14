---
name: tarefas
description: >
  Mantém o pipeline do negócio em `tarefas.md` — adiciona, fecha, prioriza e mostra o que está em jogo.
  Use quando o usuário disser "minhas tarefas", "o que tenho pra fazer", "anota aí", "adiciona na lista",
  "fechei o X", "pipeline", "/tarefas", ou pedir prioridade do dia/semana.
---

# /tarefas — Pipeline do negócio

Arquivo único, `tarefas.md` na raiz, legível por humano. Não é gerenciador de projeto — é a lista curta do que está em jogo agora, que o `/abrir` lê no começo de cada sessão.

## Formato do arquivo

```markdown
# Tarefas

> Atualizado em YYYY-MM-DD

## Agora (essa semana)

- [ ] Enviar proposta pra Acme — vence 12/05
- [ ] Renderizar carrossel de "conservar X" (HTML pronto, falta PNG)

## Depois

- [ ] Refazer pesquisa de concorrência (último rodou em 03/2026)

## Esperando resposta

- [ ] Acme — proposta enviada 05/05, follow-up dia 12/05
- [ ] Fornecedor Y — orçamento pedido 06/05

## Feito (últimos 30 dias)

- [x] 08/05 — Campanha Google Ads no ar
- [x] 05/05 — Proposta Acme enviada
```

Quatro seções, sempre nessa ordem. Item tem: ação em verbo, contexto curto, data quando houver prazo.

## Workflow

### Mostrar (`/tarefas` sem argumento)

Ler `tarefas.md` e devolver o "Agora" completo + contagem das outras seções:

```
Agora (3):
1. Enviar proposta pra Acme — vence 12/05 ⚠️
2. Renderizar carrossel de "conservar X"
3. ...

Esperando resposta: 2 · Depois: 5
```

Marcar com ⚠️ o que vence em 3 dias ou menos, e com 🔴 o que já venceu.

### Adicionar

Pegar o que o usuário falou e transformar em item com verbo no início. Perguntar prazo **só** se o item tiver cara de compromisso com terceiro (proposta, entrega, resposta). Para ideia solta, jogar em "Depois" sem prazo e sem perguntar nada.

### Fechar

Mover pra "Feito" com a data. Se o item fechado destrava outro ("proposta enviada" → "follow-up dia X"), oferecer criar o próximo:
> "Fechei. Crio o follow-up pra dia 12?"

### Priorizar

Quando o usuário perguntar "o que faço primeiro?", ordenar por: prazo vencido → prazo próximo → o que ataca o gargalo de `_memoria/estrategia.md` → o resto. Responder com **um** item recomendado e o motivo em uma linha. Não devolver a lista inteira reordenada.

### Limpar

Item em "Feito" com mais de 30 dias sai do arquivo (o histórico fica no git). Item em "Depois" que ninguém tocou em 90 dias: perguntar se ainda importa antes de remover.

---

## Regras

- Um arquivo só, `tarefas.md` na raiz. Não criar board, JSON nem pasta de tarefas
- Não inventar tarefa que o usuário não pediu, e não sugerir "revisar estratégia" pra encher lista
- Não reescrever o arquivo inteiro pra adicionar um item — edição cirúrgica
- Data sempre absoluta (`12/05/2026`), nunca "semana que vem"
- Máximo 5 itens em "Agora". Se passar, perguntar o que sai: lista de 15 itens urgentes não é pipeline, é ansiedade
- Outras skills alimentam esse arquivo (`/proposta` cria follow-up, `/relatorio-ads` cria as ações da semana). Ao adicionar por conta de outra skill, marcar a origem no item
