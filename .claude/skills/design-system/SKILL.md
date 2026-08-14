---
name: design-system
description: >
  Converte a identidade da marca em sistema de design reutilizável: gera `identidade/tokens.css`
  (escala de cores, tipografia, espaçamento, radius, sombras) e `identidade/componentes.html`
  (style guide visual navegável), validando contraste WCAG. Se a marca ainda não existe, propõe
  3 direções pra escolher. Use quando o usuário pedir "design system", "tokens", "padronizar o
  visual", "criar identidade visual", "minha marca não tem padrão", "guia de estilo", ou /design-system.
---

# /design-system — Da marca ao sistema

O `identidade/design-guide.md` descreve a marca em prosa. Prosa se interpreta de formas diferentes a cada peça — é por isso que carrossel, proposta e site acabam parecendo marcas distintas. Essa skill transforma a descrição em valores fixos que as outras skills consomem sem improvisar.

## Dependências

- **Marca atual:** `identidade/design-guide.md`; posicionamento e voz em `identidade/marca.md` se existir (`/marca`)
- **Contexto:** `_memoria/empresa.md` (setor, público — muda o que é apropriado)
- **Referências de design** (ler antes de gerar):
  - `templates/design/briefing-visual.md` — leitura do briefing e os três ajustes
  - `templates/design/qualidade-visual.md` — tipografia, cor, layout
  - `templates/design/anti-generico.md` — conferir antes de entregar
- **Logo:** `identidade/logo.*` se existir
- **Saídas:** `identidade/tokens.css` e `identidade/componentes.html`

---

## Workflow

### Passo 1 — Descobrir o ponto de partida

Três cenários:

**A. Design-guide preenchido** → extrair cores, fontes e estilo declarados. Seguir pro Passo 2.

**B. Design-guide vazio, mas o usuário tem marca** (logo, site, material antigo) → pedir o que existir: "Me manda o logo, o link do site ou um print de qualquer material seu. Eu extraio a paleta e a tipografia de lá." Extrair as cores dominantes do arquivo e confirmar com o usuário antes de fixar.

**C. Não existe marca nenhuma** → propor 3 direções (Passo 1b).

### Passo 1b — Três direções (só no cenário C)

Antes de propor, ler o setor e o público em `_memoria/empresa.md`. Uma marca de advocacia e uma de food truck não aceitam a mesma direção.

Apresentar 3 opções, cada uma com: nome da direção, paleta (hex), par tipográfico, uma frase do que ela comunica e onde ela costuma ser usada. Cobrir territórios diferentes de propósito — não três variações do mesmo. Por exemplo: uma sóbria/institucional, uma quente/humana, uma alto-contraste/direta.

Perguntar qual e seguir. Se ele misturar ("a paleta da 2 com a fonte da 1"), aceitar — desde que o contraste valide no Passo 3.

### Passo 2 — Gerar as escalas em três camadas

Sistema que dura tem três camadas. Sem elas, trocar uma cor obriga a caçar hex em dez arquivos:

```
Camada 1 — bruta      →  o valor em si
Camada 2 — semântica  →  o que o valor significa
Camada 3 — componente →  onde o valor é usado
```

```css
/* 1. bruta: a escala, sem opinião de uso */
--azul-600: #2563EB;

/* 2. semântica: é isso que as skills usam */
--accent: var(--azul-600);

/* 3. componente: quando um elemento precisa de exceção */
--botao-fundo: var(--accent);
```

A regra que faz o sistema valer: **peça nenhuma usa a camada 1 direto.** Carrossel, proposta e página consomem só a camada semântica. Assim, trocar a cor da marca é editar uma linha.

**Cores.** Pra cada cor base (fundo, destaque, texto), gerar 9 degraus (`50` a `900`) mantendo o matiz e variando luminosidade — é o que permite hover, borda, fundo de card e texto secundário sem inventar cor na hora.

Tokens semânticos obrigatórios: `--bg`, `--bg-alt`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`, `--accent-hover`, `--accent-contrast`, `--success`, `--warning`, `--danger`.

**Tipografia.** Escala modular razão 1.25 (ou 1.333 se a marca é editorial/expressiva), ancorada em 16px: `--fs-xs` a `--fs-4xl`.

E aqui está o detalhe que a maioria dos sistemas erra: **tracking e leading não são um valor só — variam com o tamanho.**

```css
/* título grande: tracking negativo, leading apertado */
--tracking-display: -0.03em;   --lh-display: 1.02;
/* subtítulo */
--tracking-titulo:  -0.02em;   --lh-titulo:  1.15;
/* corpo: neutro e confortável */
--tracking-corpo:    0;        --lh-corpo:   1.55;
/* olho em caixa alta: tracking aberto */
--tracking-olho:     0.22em;   --lh-olho:    1.2;
```

Letra grande parece afastada e pede aproximação; letra pequena em caixa alta pede o contrário. Esse contraste — título apertado, olho aberto — é o que faz a peça parecer desenhada por alguém.

Definir 4 pesos, não 2: 400 corpo, 500 destaque no corpo, 600 subtítulo, 700-800 título.

**Espaçamento.** Grade de 4px: `--sp-1` (4px) até `--sp-16` (64px). Nada de valor arbitrário tipo 13px ou 27px.

**Resto.** `--radius-sm/md/lg/full` (variar: menor dentro, maior fora), `--shadow-sm/md/lg` tingida com o matiz do fundo — ou nenhuma, se a marca não usa sombra —, `--container` (largura máxima; 65-75ch pra texto corrido), breakpoints.

### Passo 3 — Validar contraste (obrigatório)

Calcular a razão de contraste de toda combinação texto/fundo que o sistema permite e conferir contra WCAG:
- Texto normal: mínimo **4.5:1**
- Texto grande (≥24px, ou ≥18.7px em bold): mínimo **3:1**
- Borda de componente e ícone informativo: mínimo **3:1**

Se alguma combinação reprovar, **ajustar a luminosidade do token** e recalcular — não entregar sistema com par ilegível. Relatar o que precisou mudar:

> "O destaque #FF5C35 sobre fundo claro dava 2.8:1 — abaixo do mínimo pra texto. Escurecí pra #D6421C (4.6:1) só no token de texto; o original continua valendo pra fundo de botão com texto branco (5.1:1)."

Registrar as razões calculadas em comentário dentro do próprio `tokens.css`.

### Passo 4 — Escrever `identidade/tokens.css`

Um arquivo, comentado, com os tokens em `:root`. Se a marca tem versão escura, incluir o bloco `prefers-color-scheme: dark` redefinindo **só** os tokens semânticos (nunca a escala inteira).

Cabeçalho do arquivo com: nome da marca, data de geração, fontes usadas (com o link do Google Fonts) e as razões de contraste validadas.

### Passo 5 — Escrever `identidade/componentes.html`

Página única que importa o `tokens.css` e mostra o sistema aplicado: paleta com os hex visíveis, escala tipográfica com os tamanhos reais, botões (padrão, secundário, hover), card, formulário, tabela, citação, tag/pill, e um exemplo de bloco de conteúdo real.

Serve como referência pro usuário e como teste: se algo fica feio ou ilegível aqui, o token está errado — e conserta antes de contaminar as peças.

### Passo 6 — Atualizar o design-guide e entregar

Sincronizar `identidade/design-guide.md` com o que foi decidido (a prosa continua sendo a explicação legível do sistema, não pode divergir dos tokens).

```
✓ identidade/tokens.css        — [N] tokens, contraste validado
✓ identidade/componentes.html  — abre no navegador pra ver o sistema aplicado
✓ identidade/design-guide.md   — sincronizado

Daqui pra frente, /carrossel, /proposta, /landing, /documento e
/apresentacao usam esses tokens em vez de reinterpretar a marca.

Se mudar de ideia sobre qualquer valor, edita o tokens.css — a mudança
vale pra todas as peças novas.
```

---

## Regras

- **Uma cor de destaque.** Duas cores fortes disputando é o erro mais comum e o mais visível. Se o usuário insistir em duas, uma vira secundária com uso restrito e isso fica escrito no arquivo
- **Nunca entregar par de cores que reprova no WCAG.** Ajustar e relatar, sem exceção
- **Três camadas sempre.** Peça consome token semântico, nunca o valor bruto
- **Tracking e leading por faixa de tamanho**, nunca um valor único pra tudo
- Saturação do destaque abaixo de 80%; fundo escuro é off-black com matiz, nunca `#000`
- Uma família de cinza só (toda quente ou toda fria)
- Máximo 2 famílias tipográficas (uma pra título, uma pra corpo). Uma só também é resposta boa
- Preferir Google Fonts — os HTMLs das outras skills precisam funcionar sem instalar fonte
- Grade de 4px em todo espaçamento. Sem número solto
- Não inventar identidade "porque ficaria bonito": no cenário C são 3 direções pra escolha, não uma imposição
- Não gerar token que ninguém vai usar. Sistema enxuto e completo vence sistema exaustivo
- Se o usuário já tem site em produção, extrair os valores reais de lá em vez de propor novos — o sistema documenta a marca que existe
