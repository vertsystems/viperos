# Qualidade visual — o que fazer

Referência compartilhada das skills visuais. O par positivo do `anti-generico.md`: lá está o que evitar, aqui o que perseguir.

---

## Tipografia

### Tracking e leading variam com o tamanho

O erro mais comum e mais invisível: um único `letter-spacing` para todos os tamanhos. Letra se comporta diferente conforme cresce.

- **Título grande pede tracking negativo.** Quanto maior, mais as letras parecem afastadas. `-0.02em` a `-0.04em` em display
- **Texto pequeno em caixa alta pede tracking positivo.** Olho, rótulo e etiqueta: `0.1em` a `0.3em`
- **Corpo fica perto de zero**
- **Leading é inverso do tamanho.** Título grande: 0.98 a 1.1. Corpo: 1.5 a 1.6. Texto denso de tabela: 1.3

Esse contraste — título apertado, olho aberto — é o que faz a peça parecer desenhada por alguém.

### Hierarquia é conjunto, não só tamanho

Peso + tamanho + leading trabalham juntos. Aumentar só o tamanho gera hierarquia fraca; usar peso dá presença sem ocupar mais espaço.

Escala que funciona (razão 1.25, ancorada em 16px de corpo):
```
12 · 14 · 16 · 20 · 25 · 31 · 39 · 49 · 61
```
Para peça expressiva (carrossel, capa), razão 1.333 abre mais o contraste entre corpo e título.

Usar 4 pesos, não 2: 400 (corpo), 500 (destaque no corpo), 600 (subtítulo), 700-800 (título).

### Medidas de leitura

- Linha de texto corrido: **65 a 75 caracteres**. Acima disso o olho perde a linha ao voltar
- Corpo nunca abaixo de 16px em tela; 11-12pt em material impresso
- Número em tabela ou dado: ativar `font-variant-numeric: tabular-nums` para as colunas alinharem
- Evitar palavra órfã no título (`text-wrap: balance` resolve na maioria dos casos)

### Escolha de fonte

Fonte do Google Fonts, para o HTML funcionar em qualquer máquina sem instalação. Combinações que sustentam bem:

| Situação | Título | Corpo |
|---|---|---|
| Editorial, material longo, apostila | serifada (Fraunces, Instrument Serif, Bitter) | sans humanista (Inter, Source Sans) |
| Comercial, proposta, landing | sans com caráter (Outfit, Sora, Manrope) | mesma família, peso menor |
| Técnico, dado, tabela | sans neutra (IBM Plex Sans) | mesma + IBM Plex Mono nos números |
| Marca com personalidade forte | display (Syne, Bricolage Grotesque) | sans discreta |

Máximo duas famílias. Uma família só, bem usada em pesos diferentes, é resposta melhor que duas mal combinadas.

---

## Cor e superfície

- **Uma cor de destaque.** Todo o resto é neutro. Duas cores fortes brigando é o erro mais visível que existe
- **Saturação abaixo de 80%** no destaque. Cor saturada demais grita e cansa
- **Uma família de cinza** — todos com o mesmo matiz (todos quentes ou todos frios), nunca misturados
- **Fundo escuro é off-black com matiz** (`#0E1116`, `#121212`), nunca `#000`
- **Fundo claro é off-white** (`#FAFAF7`, `#F7F5F2`) em peça editorial; branco puro só quando a marca pede
- **Sombra tingida** com o matiz do fundo, não preta em opacidade baixa
- **Uma direção de luz.** Todas as sombras caem para o mesmo lado
- **Textura sutil** (grão, ruído leve, padrão discreto) tira o ar estéril do vetor puro — em dose que só se percebe se procurar

### Contraste (obrigatório, não opinião)

| O que | Mínimo |
|---|---|
| Texto normal sobre fundo | 4.5:1 |
| Texto grande (≥24px, ou ≥18.7px em negrito) | 3:1 |
| Borda de componente, ícone informativo | 3:1 |

Reprovou? Ajustar a luminosidade do token e recalcular. Nunca entregar par ilegível porque "ficou bonito".

---

## Layout

- **Largura máxima de contêiner** (1200-1440px em tela) para o conteúdo não esticar em monitor largo
- **Grade em vez de conta de porcentagem** para estrutura de colunas
- **Espaçamento em grade de 4px.** Sem valor solto tipo 13px ou 27px
- **Espaço entre blocos maior que espaço dentro do bloco.** Se estiver invertido, a leitura agrupa errado — e isso passa a sensação de bagunça mesmo com tudo alinhado
- **Padding de baixo ligeiramente maior** que o de cima, por compensação óptica
- **Assimetria proposital** em algum ponto: título à esquerda sobre conteúdo centralizado, imagem que sangra, coluna deslocada
- **Sobreposição leve** entre elementos cria profundidade que layout plano não tem
- **Altura variável** em cards quando o conteúdo varia — forçar altura igual gera espaço vazio esquisito
- **Raio de borda variado**: menor dentro, maior fora

### Ritmo

Peça com vários blocos (carrossel, landing, apostila) precisa de variação de ritmo. Alternar:
- fundo claro ↔ escuro ↔ cor de destaque (nunca dois iguais em sequência)
- bloco de texto ↔ bloco visual ↔ bloco de número
- denso ↔ respirado

---

## Acabamento que faz parecer profissional

O que separa peça "pronta" de peça "terminada":

- **Estado de interação** em tudo que é clicável: hover, foco visível (para teclado), ativo, desabilitado
- **Alt em imagem** — acessibilidade e SEO
- **Hierarquia de heading correta**: um `h1` só, sem pular níveis
- **Favicon** e imagem de compartilhamento (Open Graph 1200×630)
- **Imagem com `width` e `height` declarados** para a página não pular ao carregar
- **`font-display: swap`** para o texto aparecer antes da fonte carregar
- **Testado em 360px de largura** — não só no notebook
- **Testado impresso**, quando a peça pode ser impressa (proposta, material, apostila)

---

## Verificação final

Antes de entregar qualquer peça visual:

1. Contraste calculado, todos os pares aprovados
2. Legível em 360px de largura
3. Nenhum item do `anti-generico.md` presente sem justificativa
4. Nenhum placeholder sobrando
5. Tokens da marca usados (`identidade/tokens.css`), sem cor solta no meio do código
6. Se for impressa: testada em PDF, sem corte no meio de tabela ou título órfão no pé da página
