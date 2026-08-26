---
name: acessivel
description: >
  Audita uma página em duas frentes num laudo só: consegue usar (WCAG 2.2 AA — foco, alvo,
  teclado, formulário, contraste) e consegue esperar (LCP, INP, CLS). Devolve as correções
  priorizadas, com número, e aplica se o usuário pedir.
  Use quando o usuário disser "meu site é acessível?", "minha mãe não consegue usar",
  "meu site tá lento", "a página pula quando carrega", "no celular trava", "demora pra abrir",
  "o cliente reclamou que não consegue clicar", "passa no PageSpeed?", ou /acessivel.
---

# /acessivel — Consegue usar, e consegue esperar

> **Convenção de pastas:** o laudo sai no chat. Se o usuário quiser guardar, `revisoes/acessibilidade-<alvo>-<AAAA-MM-DD>.md`. Na convenção **por cliente**, `clientes/<Nome>/revisoes/`.

As duas coisas se auditam juntas por um motivo prático: elas mexem no mesmo arquivo e,
separadas, se desfazem. Uma auditoria de velocidade tira a animação por causa do INP; a
de acessibilidade, rodada depois, escreve um bloco `prefers-reduced-motion` para
animação que já não existe. Duas rodadas, dois laudos e um resultado incoerente.

Num laudo só, o conflito aparece e se resolve na hora.

## Dependências

- **A peça:** HTML local, pasta do site ou URL no ar
- **Contexto:** `_memoria/empresa.md` — público idoso, saúde ou baixa visão sobe a régua
- **Referências** (ler antes de auditar):
  - `templates/design/acessibilidade.md` — WCAG 2.2, os 9 critérios novos, foco, alvo, formulário
  - `templates/design/desempenho.md` — as três métricas, causas de CLS, o que atrasa o LCP
  - `templates/design/movimento.md` — quando o conserto de desempenho encosta na animação
- **Saída:** laudo priorizado no chat; arquivo só se o usuário pedir

---

## Workflow

### Passo 1 — Ver a peça de verdade

- **HTML local:** ler o código **e** renderizar em 1440px e 390px
- **URL:** buscar e renderizar igual
- Nunca auditar só pelo código: foco escondido atrás de cabeçalho fixo e conteúdo que
  pula só aparecem na tela

Declarar em uma linha o que está sendo auditado e com que régua:

> "Auditando a página de planos em WCAG 2.2 AA, mais os Core Web Vitals. Como ela ainda
> não está no ar, o desempenho é medida de laboratório, não de campo."

### Passo 2 — Consegue usar (WCAG 2.2 AA)

Na ordem que mais acha problema:

1. **Teclado.** `Tab` do começo ao fim: chega em tudo? o foco aparece? fica escondido atrás do cabeçalho fixo (critério 2.4.11)? dá para sair do modal? A ordem da tabulação bate com a ordem visual?
2. **Alvo.** `node scripts/verificar.js alvo <arquivo.html>` — e conferir as cinco exceções do 2.5.8 antes de reprovar um link inline
3. **Contraste.** `node scripts/verificar.js contraste "<cor>" "<fundo>"` em texto, borda de campo, ícone informativo e no próprio anel de foco
4. **Formulário.** `<label for>` real, erro em texto ligado por `aria-describedby`, colar permitido na senha, `autocomplete` no dado pessoal, formulário que não se apaga no erro
5. **Estrutura.** um `<h1>`, sem pular nível, `lang="pt-BR"`, `alt` que descreve função, imagem decorativa com `alt=""`
6. **Zoom 200%** e **360px de largura** — texto cortado e rolagem horizontal aparecem aqui

### Passo 3 — Consegue esperar (Core Web Vitals)

1. **Qual é o elemento do LCP?** Achar antes de otimizar qualquer coisa. Conferir se ele tem `loading="lazy"` (o erro mais comum) e se falta `fetchpriority="high"`
2. **CLS:** imagem sem `width`/`height`, fonte que troca, conteúdo injetado acima da dobra, embed sem `aspect-ratio`
3. **INP:** trabalho pesado no clique, biblioteca grande para pouca coisa, animação que segura a resposta
4. **Peso:** `node scripts/verificar.js peso <pasta>`
5. **Dado de campo, quando o site está no ar:** PageSpeed Insights, celular e desktop separados, percentil 75. Se for laboratório, dizer que é — e nunca apresentar número de laboratório como se fosse de usuário real

### Passo 4 — Resolver os conflitos antes de escrever o laudo

É o passo que só existe porque as duas auditorias são uma. Três casos, com desempate
definido:

| Conflito | Quem ganha |
|---|---|
| animação decorativa vs INP acima de 200ms | **INP.** A animação sai ou é adiada |
| animação que comunica (esqueleto, confirmação) vs peso | **A animação fica** — tirar transfere o custo para a confiança |
| corte de animação vs bloco `prefers-reduced-motion` | **O bloco fica sempre.** É CSS puro, não custa nada, e é requisito |

Nunca recomendar tirar a animação **e** manter regra de redução para ela. Se ela saiu, a
regra sai junto.

### Passo 5 — Laudo único, priorizado

Três faixas, no máximo 10 itens no total. Cada item com o **critério ou a métrica**, o
**número** e o **conserto** ao lado:

- **Reprova** — falha de nível AA, ou métrica na faixa ruim. Ex: *"Foco some atrás do cabeçalho ao tabular (2.4.11). Conserto: `scroll-padding-top: 88px` no `html`."*
- **Incomoda** — passa na régua, mas atrapalha de verdade
- **Polimento** — vale quando sobrar tempo

Se houver mais de 10, dizer que cortou e quantos ficaram de fora. Auditoria que sempre
lista 30 problemas ninguém executa.

### Passo 6 — Oferecer o conserto

> "Quer que eu aplique o que está em 'Reprova'?"

Se sim, aplicar e mostrar o antes/depois — com o número novo, não com "melhorou".
Se a página está no ar, valem as regras de redesign do `anti-generico.md`: URL, rótulo
de menu, campo de formulário, logo e texto legal **não** mudam em silêncio.

---

## Regras

- **Sempre com número.** "Contraste baixo" não ajuda; "2,8:1, precisa de 4,5:1" ajuda. "Lento" não ajuda; "LCP 4,1s no celular" ajuda
- **Campo e laboratório não se misturam.** Dizer qual é a fonte do número, sempre
- **AA é o alvo.** AAA só quando o usuário pedir — alguns critérios AAA são incompatíveis com peça de marketing
- **Achar o elemento do LCP antes de otimizar.** Sem isso, otimização é palpite caro
- **Um problema grande vale mais que dez micro-ajustes.** A maioria das páginas de pequeno negócio tem um só
- Ferramenta automática pega cerca de um terço dos critérios: o resto é teclado e leitura, e é onde estão os que fazem a pessoa desistir
- Não reprovar link inline por tamanho de alvo sem conferir as cinco exceções do 2.5.8
- Não recomendar remover o bloco `prefers-reduced-motion` por desempenho — ele é CSS puro
- Não migrar tecnologia, não trocar biblioteca, não reescrever a página. Correção pequena e revisável vence reescrita
- Se a peça está boa, dizer que está — e mostrar os números que sustentam isso
