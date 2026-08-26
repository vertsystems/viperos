# Movimento — duração, curva e limite

Referência compartilhada. Lida por `/movimento`, e consultada por `/landing`,
`/interface`, `/produto` e `/revisar-design` quando a peça tem transição.

Existe porque o `briefing-visual.md` gradua movimento de 1 a 10 e o
`qualidade-visual.md` exige estado de interação em tudo que é clicável — sem que
nenhum dos dois diga **quanto tempo** nem **com que curva**. "A animação tá estranha"
não se responde com adjetivo.

---

## Duas durações e três curvas resolvem uma peça inteira

```css
/* duração */
--dur-rapida: 200ms;   /* aparecer, sumir, mudar de cor, hover */
--dur-media:  350ms;   /* deslocar, abrir, expandir, trocar de tela */

/* curva — Material 3, _md-sys-motion.scss */
--ease-fica:  cubic-bezier(0.2, 0, 0, 1);        /* começa e termina na tela */
--ease-entra: cubic-bezier(0.05, 0.7, 0.1, 1);   /* vem de fora: freia no fim */
--ease-sai:   cubic-bezier(0.3, 0, 0.8, 0.15);   /* vai embora: acelera e some */
```

Nada além disso na maioria das peças. Se o arquivo tem sete durações diferentes, elas
não foram escolhidas — foram digitadas.

> **A curva da Apple.** `cubic-bezier(0.4, 0, 0.6, 1)` é a dominante do CSS do
> cabeçalho global da apple.com (78 ocorrências em `overview.built.css`, leitura de
> ago/2026). É simétrica e discreta — boa para peça de marketing com movimento baixo.
> Serve como alternativa à `--ease-fica` quando a marca pede sobriedade; não substitui
> o par entra/sai.

---

## Curva tem direção — é aqui que "o menu fecha travado" nasce

Usar a mesma curva nos dois sentidos é o erro mais comum e o mais fácil de consertar.
Quem entra precisa **frear** no fim (chega e assenta). Quem sai precisa **acelerar**
(vai embora e some).

| Movimento | Curva | Por quê |
|---|---|---|
| começa e termina visível (cor, tamanho, posição interna) | `--ease-fica` | os dois extremos importam |
| entra na tela (menu abrindo, modal, toast) | `--ease-entra` | o fim é o que a pessoa lê |
| sai da tela (menu fechando, dispensar) | `--ease-sai` | o começo é o que a pessoa lê |

## Saída é sempre mais curta que a entrada

Entrada informa; saída só confirma. Prender a pessoa esperando o que ela já mandou
embora é o que ela sente como "travado":

| Transição | Entra | Sai |
|---|---|---|
| container, gaveta, modal (transform) | 300ms | **250ms** |
| fade puro (opacidade) | 150ms | **75ms** |
| hover / cor | 200ms | 200ms |

---

## Escala: dois números

```css
--escala-hover:  1.04;   /* token real do web player do Spotify */
--escala-active: 0.97;
```

- `1.04` no hover de card, capa e miniatura. Acima de `1.08` a peça vizinha parece
  empurrada e o layout "respira" errado
- `0.97` no `:active` — é o que dá sensação de botão físico, e é quase de graça
- **Nunca `scale(0)`.** O elemento nasce do nada e o olho lê como falha de renderização.
  O mínimo é `0.92` com opacidade junto

---

## O que animar

Só duas propriedades são baratas: `transform` e `opacity`. Elas rodam fora do fluxo de
layout — o resto obriga o navegador a recalcular a página inteira a cada quadro.

| Em vez de | Use |
|---|---|
| `width`, `height` | `transform: scale()` |
| `top`, `left`, `margin` | `transform: translate()` |
| `box-shadow` animada | camada `::after` com sombra fixa e `opacity` |
| `background-position` | `transform` num pseudo-elemento |

**`transition: all` é proibido.** Ele anima o que você não pediu — inclusive
propriedade que entra depois, por outra regra — e é o equivalente em movimento do
gradiente roxo-azul: assinatura de quem não escolheu. Listar as propriedades:

```css
transition: transform var(--dur-media) var(--ease-fica),
            opacity   var(--dur-rapida) var(--ease-fica);
```

---

## Respeitar quem pediu para parar

Obrigatório em toda peça com movimento. Não é acessibilidade opcional: para parte das
pessoas, movimento em tela causa enjoo real (vestibular), e o sistema operacional já
tem a chave ligada.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

O bloco desliga o movimento **sem** desligar o resultado: o menu ainda abre, o toast
ainda aparece — só não viaja. Se ao remover a animação o elemento some de vez, a
animação estava carregando estado, e isso é bug.

Animação que sinaliza carregamento (esqueleto, barra de progresso) pode continuar, em
versão discreta — ela informa, não decora.

---

## Aparecer conforme rola

O pedido mais comum. Duas regras que evitam os dois defeitos clássicos:

- **Uma vez só.** Reanimar a cada rolagem transforma a página num carrossel involuntário
- **Nunca esconder conteúdo por CSS esperando JavaScript.** Se o script falhar (e ele
  falha: rede, bloqueador, erro anterior), o texto some para sempre. O padrão seguro é
  o inverso — a classe que **liga** a animação é adicionada por script:

```css
.rola-entra { opacity: 1; }                    /* estado padrão: visível */
.js .rola-entra { opacity: 0; transform: translateY(12px); }
.js .rola-entra.visivel { opacity: 1; transform: none;
  transition: opacity 350ms var(--ease-entra), transform 350ms var(--ease-entra); }
```

Deslocamento de entrada entre 8px e 16px. Acima de 24px vira "elemento voando", que é
o movimento que mais envelhece peça.

---

## O limite que o desempenho impõe

Movimento e velocidade brigam, e a briga tem vencedor definido: **INP ≤ 200ms manda**
(ver `desempenho.md`). Animação disparada por clique que segura a resposta acima disso
é defeito de desempenho, não escolha estética. Ordem: responder ao clique primeiro,
animar depois.

Antes de entregar: `movimento 0` em peça estática (carrossel, proposta impressa) é a
resposta certa — não é falta de capricho. E toda peça com movimento tem o bloco
`prefers-reduced-motion`.
