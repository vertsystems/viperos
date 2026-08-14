---
name: calendario
description: >
  Monta o calendário editorial do mês a partir do banco de pautas, com mix de funil, mix de formato,
  alternância de capas no feed e as datas que importam pro nicho. Use quando o usuário pedir
  "calendário de conteúdo", "planejar o mês", "o que postar essa semana", "cronograma de posts",
  "planejamento editorial", ou /calendario.


---

# /calendario — Planejamento editorial do mês

> **Convenção de pastas:** os caminhos desta skill seguem a convenção **por tipo** (perfis empreendedor solo e empresa). Se o `CLAUDE.md` do workspace usa a convenção **por cliente** (freelancer e agência) e a peça é de um cliente, prefixar com `clientes/<Nome>/`. A pasta nasce só na hora de salvar.

Transforma banco de pautas em plano com data. Resolve o problema de decidir o que postar na pressa — que é onde nasce conteúdo genérico.

## Dependências

- **Banco de pautas:** `conteudo/pautas.md` (do `/ideias`). Se não existir, rodar `/ideias` primeiro
- **Cliente real:** `_memoria/publico.md` se existir (`/publico`) — a dor na palavra dele, e as objeções
- **Histórico:** `conteudo/indice.md` (o que já saiu, e qual foi a última capa)
- **Foco atual:** `_memoria/estrategia.md`
- **Saída:** `conteudo/calendario-<YYYY-MM>.md`

---

## Workflow

### Passo 1 — Definir a capacidade real

> "Quantas publicações por semana você consegue sustentar? Prefiro que você
> diga o número que aguenta no mês ruim, não no mês empolgado."

2 posts por semana mantidos batem 5 por semana abandonados no dia 12. Se ele não souber, sugerir 2 e crescer depois.

Perguntar também os canais (só Instagram? blog também? LinkedIn?) e se tem dia/horário que já funciona.

### Passo 2 — Montar o mix

Distribuir as pautas do banco equilibrando três eixos:

**Funil** — proporção de partida: 50% topo, 30% meio, 20% fundo. Ajustar pelo foco da estratégia: se o gargalo é "ninguém me conhece", mais topo; se é "gente pergunta e não fecha", mais fundo.

**Formato** — alternar entre carrossel educativo, post único de impacto, caso real, bastidor, conteúdo de produto/oferta. Cinco carrosséis seguidos com a mesma estrutura cansam mesmo com tema bom.

**Peso de produção** — não empilhar duas peças pesadas na mesma semana. Carrossel de 10 slides com pesquisa é pesado; post único de citação é leve. Intercalar é o que faz o plano sobreviver.

### Passo 2b — Equilibrar buscável e compartilhável

Além de funil e formato, equilibrar o **tipo de tração** (a classificação vem do `/ideias`):

- **Buscável** (blog, artigo-guia, FAQ) — trabalha sozinho depois de publicado. Proporção de partida: 60%
- **Compartilhável** (opinião, caso real, dado próprio, bastidor) — cria preferência e é o que gera conversa. 40%

Se o negócio ainda não tem nada indexado, começar mais pesado em buscável — é o que constrói base. Se já tem tráfego e falta diferenciação, inverter.

Cada peça do calendário sai marcada com o pilar a que pertence. Mês que não toca todos os pilares deixa um assunto morrer.

### Passo 3 — Encaixar o que tem data

Só o que é real pro negócio:
- Data comercial que move o setor dele
- Sazonalidade do produto (safra, temporada, período letivo, festa regional)
- Evento próprio (lançamento, feira, aniversário da empresa)
- Ciclo do cliente (início de mês, fechamento, virada de ano fiscal)

Conteúdo com data precisa entrar com antecedência: publicar no dia não dá tempo de gerar procura. Marcar a data-limite de produção, não só a de publicação.

### Passo 4 — Alternar as capas

Puxar a última capa publicada do `indice.md` e seguir a alternância do `/carrossel`: claro → foto/escuro → cor da marca → repete. Registrar o tipo de capa previsto em cada item, pra o feed não ficar com três peças iguais em sequência.

### Passo 4b — Conferir os dias da semana (obrigatório)

Dia da semana calculado de cabeça sai errado — em teste real, os 12 dias de um mês inteiro saíram deslocados, e os posts marcados como sexta caíam no sábado.

Antes de escrever, conferir o primeiro dia do mês:

```bash
date -j -f "%Y-%m-%d" "2026-09-01" "+%A"    # macOS
date -d "2026-09-01" "+%A"                   # Linux
```

E depois de escrever o arquivo:

```bash
node scripts/verificar.js datas conteudo/calendario-<AAAA-MM>.md
```

**A tabela precisa ter a coluna `Dia`** — é ela que o verificador confere contra a data. Sem essa coluna ele não tem o que checar e passa em branco.

Só entregar quando sair "Tudo certo". Um calendário com dia errado desorganiza o mês inteiro do usuário.

### Passo 5 — Escrever o calendário

`conteudo/calendario-<YYYY-MM>.md`:

```markdown
# Calendário editorial — <mês/ano>
*Capacidade: [N]/semana · Canais: [lista]*

## Semana 1 (01 a 07)

| Data | Dia | Pauta | Formato | Funil | Capa | Canal | Produzir até | Status |
|---|---|---|---|---|---|---|---|
| 03/06 | qua | Erro de conservação que custa caro | carrossel 7 | topo | escuro | IG+FB | 01/06 | planejado |
| 06/06 | sáb | Quanto custa refazer um lote | post único | meio | cor marca | IG | 04/06 | planejado |

## Semana 2 ...

## Resumo do mês
- **Funil:** 5 topo · 3 meio · 2 fundo
- **Formatos:** 6 carrossel · 3 post único · 1 caso real
- **Blog:** 2 artigos (dias 05 e 19)
- **Pesados:** semanas 1 e 3 — semana 2 mais leve de propósito

## Fora do plano
[Pautas que ficaram de reserva, pra quando cair uma semana livre ou entrar assunto quente]
```

### Passo 6 — Entregar e conectar

> "Calendário do mês fechado: [N] publicações.
>
> No dia de produzir, chama `/carrossel` ou `/publicar-tema` com a pauta da linha —
> o contexto todo já está aqui. Marcar como `produzido` conforme for saindo.
>
> Quer que eu jogue as datas de produção no `tarefas.md`?"

Se sim, criar os itens em "Depois", com a data-limite de produção.

---

## Regras

- **Capacidade honesta acima de volume ambicioso.** Plano abandonado no dia 12 é pior que plano modesto cumprido
- Nunca preencher data com pauta genérica só pra não deixar buraco. Melhor 8 publicações boas que 12 com 4 fracas
- Não usar pauta que já foi publicada: cruzar com o `indice.md`
- Toda pauta no calendário vem do banco (com origem). Pauta nova entra pelo `/ideias`, não direto aqui
- Marcar data-limite de **produção**, separada da data de publicação
- Deixar reserva ("Fora do plano") — mês nenhum acontece como planejado
- Se o banco não tem pautas suficientes pro mês, dizer quantas faltam e sugerir `/ideias` em vez de inventar na hora
