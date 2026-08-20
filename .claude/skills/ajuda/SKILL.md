---
name: ajuda
description: >
  Responde "o que eu faço agora?" — recomenda a skill certa a partir do que o usuário quer fazer e do
  estado atual do workspace, em vez de listar tudo. Use quando o usuário disser "ajuda", "o que eu
  faço", "quais comandos existem", "como faço pra", "tô perdido", "não sei onde começar",
  "o que esse sistema faz", ou /ajuda.
---

# /ajuda — Qual skill usar agora

O ViperOS tem 40 skills. Ninguém decora isso, e ninguém precisa — o usuário fala o que quer em português e a skill certa roda sozinha. Essa aqui responde a outra pergunta: **o que faz sentido fazer agora.**

Ao recomendar, falar pelo resultado, não pelo comando: "eu monto o banco de pautas" em vez de "roda /ideias". O nome da skill entra entre parênteses, no máximo — nunca como exigência.

## Regra central

Não despejar a lista inteira. Ler o estado do workspace, entender o que o usuário quer, e recomendar **1 a 3 caminhos** — com o motivo.

---

## Workflow

### Passo 1 — Ler o estado

Antes de responder, conferir em silêncio:

| Sinal | O que indica |
|---|---|
| Não existe `_memoria/` | Nem instalou → `/instalar` |
| `_memoria/*` vazio | Instalação incompleta → `/instalar` é a única resposta |
| Não existe `identidade/` | Peça visual vai sair sem marca → `/design-system` |
| Não existe `_memoria/publico.md` | Tudo vai sair genérico → `/publico` é o maior ganho disponível |
| Não existe `_memoria/oferta.md` | Vende sem saber o que vende → `/oferta` |
| `conteudo/pautas.md` não existe | Não tem o que postar → `/ideias` |
| Banco de pautas cheio, sem calendário | Tem tema, falta plano → `/calendario` |
| Blog em `draft` há dias | Conteúdo parado perto do fim → destravar |
| `tarefas.md` com item vencido | Prioridade clara já definida |
| Nada em `seo/` | Não sabe o que o público busca → `/seo` |
| Última `revisao-semanal` há mais de 10 dias | Loop aberto |

### Passo 2 — Entender a intenção

Se o pedido foi vago ("ajuda", "tô perdido"), fazer **uma** pergunta:

> "Você quer atrair gente nova, vender pra quem já te conhece, organizar o que
> está espalhado, ou produzir uma peça específica?"

Se o pedido já foi concreto ("preciso de um site", "quero postar mais"), pular a pergunta.

### Passo 3 — Recomendar por objetivo

**"Quero aparecer / atrair gente nova"**
`/seo` (descobrir o que buscam) → `/ideias` (banco de pautas) → `/carrossel` ou `/publicar-tema` (produzir) → `/anuncio-google` (acelerar com pago)

**"Quero vender pra quem já me conhece"**
`/oferta` (desenhar o que vende) → `/preco` (quanto cobrar) → `/proposta` → `/vender` (conversa que fecha) → `/landing` · `/apresentacao` (pitch)

**"Pedem orçamento e desaparecem" / "acham caro"**
`/oferta` (quase sempre a oferta está incompleta) → `/preco` (traduzir o "tá caro") → `/vender` (investigação antes de apresentar)

**"Não sei pra quem estou falando"**
`/publico` — minera avaliação, grupo e conversa real. Alimenta todas as outras

**"Minha página recebe visita e ninguém compra"**
`/conversao` (diagnóstico em 7 pontos) → `/landing` (refazer) ou `/oferta` (se o problema é o que se vende)

**"Pareço igual a todo mundo"**
`/marca` (posicionamento e voz) → `/design-system` (visual)

**"Quero aparecer sem pagar anúncio"**
`/imprensa` (mídia local e do setor) → `/seo` (orgânico) → `/publicar-tema`

**"Não sei o que postar"**
`/ideias` → `/angulos` (10 tratamentos do mesmo tema) → `/calendario` (distribuir no mês)
E se ele já tem conteúdo antigo: `/reaproveitar` — quase sempre o caminho mais rápido

**"Meu conteúdo sai genérico / fraco"**
`/pesquisa` (dado e citação real antes de escrever) → `/angulos` (ângulo em vez de tema solto) → `/revisar` (cortar clichê e gordura)

**"Minhas peças não parecem a mesma marca"**
`/design-system` (tokens) → `/revisar-design` (auditar o que já existe)

**"Quero que ele crie as imagens/fotos"**
Dá pra ligar — o usuário conecta a conta dele de OpenAI ou Gemini (o Gemini tem
cota gratuita e não pede cartão). São 2 minutos: guia em
`templates/imagem-ia.md`. Sem isso, o `/carrossel` continua entregando
peça com tipografia, que funciona bem.

**"Preciso de um material / documento"**
`/documento` (e-book, apostila, guia em PDF) · `/apresentacao` (deck) · `/landing` (página)

**"Estou perdido no que já produzi"**
`/biblioteca` (catalogar ativos) → `/atualizar` (reconciliar contexto) → `/tarefas` (pipeline)

**"Quero saber se está funcionando"**
`/relatorio-ads` (mídia paga) → `/revisao-semanal` (fechar o loop) → `/analisar-dados` (qualquer planilha)

**"Preciso de um sistema / API / banco de dados"**
`/backend` — servidor, API, banco, login e publicação. Também é a skill de "está dando erro em produção" e "a consulta está lenta"

**"Faço a mesma coisa toda semana"**
`/mapear-rotinas` — transforma a rotina em skill própria

**"Saiu versão nova do ViperOS" / "quero atualizar o sistema"**
`/atualizar-sistema` — puxa a versão nova e sincroniza as skills sem tocar no seu trabalho

### Passo 4 — Responder curto

Formato da resposta (nunca mais de 8 linhas):

```
Pelo que vi aqui: você tem 12 pautas no banco e nenhum calendário do mês.

Faz mais sentido agora:
1. /calendario — distribui as pautas nas próximas 4 semanas (10 min)
2. /carrossel — se preferir só produzir a próxima peça sem planejar

Se quiser ver tudo que dá pra fazer: pede "lista tudo".
```

Só listar tudo se o usuário pedir explicitamente.

---

## Regras

- **Recomendar, não catalogar.** No máximo 3 opções, com o motivo de cada
- Ler o workspace antes de responder — recomendação genérica não ajuda ninguém
- Se a memória não foi preenchida, a resposta é `/instalar` e nada mais
- Nunca recomendar skill que depende de coisa que não existe (não sugerir `/calendario` sem banco de pautas — sugerir `/ideias` primeiro)
- Dizer quanto tempo custa cada caminho, quando for curto. Isso decide mais que a descrição
- `/aprovar-post` não entra em recomendação nenhuma. É opt-in de quem já configurou API da Meta
- **Falar pelo resultado, não pelo comando.** O usuário não precisa saber o nome das skills pra usar o sistema
- Se o usuário pergunta como uma skill específica funciona, explicar o fluxo dela em 3-4 linhas em vez de mandar ele ler o SKILL.md
