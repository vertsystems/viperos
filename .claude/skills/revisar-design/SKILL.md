---
name: revisar-design
description: >
  Audita a qualidade visual de uma peça (HTML, screenshot, PDF ou URL): contraste WCAG com número,
  hierarquia tipográfica, alinhamento, aderência aos tokens da marca, legibilidade no celular e os
  sinais que denunciam peça gerada por IA. Devolve correções priorizadas. Use quando o usuário pedir
  "revisa o design", "tá bom visualmente?", "o que melhorar nesse layout", "audita essa página",
  "ficou com cara de IA", "parece template", ou /revisar-design.
---

# /revisar-design — Auditoria visual

Olhar crítico sobre peça pronta. Não redesenha: aponta o que está errado, com o motivo e o conserto.

## Dependências

- **Sistema da marca:** `identidade/tokens.css` se existir; senão `identidade/design-guide.md`
- **Referências de design** (ler antes de auditar):
  - `templates/design/anti-generico.md` — a lista completa de sinais de peça genérica
  - `templates/design/qualidade-visual.md` — tipografia, cor, layout e acabamento
- **A peça:** HTML, PNG/print, PDF ou URL

---

## Workflow

### Passo 1 — Ver a peça de verdade

- **HTML local:** renderizar em dois tamanhos (1440px e 390px) e olhar as duas imagens. Ler o código também — muita coisa se explica lá
- **URL:** buscar e renderizar igual
- **Print/PDF:** ler a imagem direto
- **Material que vai ser impresso:** olhar o PDF paginado, não a versão de tela

Nunca auditar só pelo código. Layout quebra na renderização, não no CSS.

### Passo 2 — Rodar os sete checks

**1. Contraste (número, não impressão)**
Calcular a razão de cada par texto/fundo. Reprovado: <4.5:1 em texto normal, <3:1 em texto grande, borda ou ícone informativo. Reportar com o valor: "corpo cinza #999 sobre branco = 2.8:1, reprova".

**2. Tipografia**
- Quantos níveis de tamanho existem, e a diferença entre eles é perceptível? (título 42px e subtítulo 38px não são dois níveis)
- Tracking varia com o tamanho, ou é um valor só para tudo? (título grande pede negativo, olho em caixa alta pede positivo)
- Leading acompanha o tamanho? (título apertado, corpo em 1.5-1.6)
- Só peso 400 e 700, ou existe 500 e 600 dando hierarquia sutil?
- Linha de leitura passa de 75 caracteres? Palavra órfã em título?

**3. Cor e superfície**
- Mais de uma cor de destaque disputando?
- Saturação acima de 80% no destaque?
- Cinza quente e frio misturados?
- Preto puro como fundo, branco puro em peça editorial?
- Sombra preta genérica em vez de tingida? Direção de luz inconsistente?

**4. Alinhamento e ritmo**
- Os elementos compartilham eixos?
- Espaçamento segue grade de 4/8, ou tem valor solto (13px, 27px)?
- Espaço entre blocos é maior que dentro do bloco? (se estiver invertido, a leitura agrupa errado)
- Em peça com vários blocos: tem variação de ritmo, ou é tudo igual?

**5. Aderência à marca**
Comparar com os tokens: cor fora da paleta? fonte que não é do sistema? raio diferente do padrão? Listar cada desvio com o valor encontrado e o token correto.

**6. Legibilidade no celular**
Corpo abaixo de 16px, texto sobre foto sem sobreposição suficiente, alvo de toque menor que 44px, e — em peça para Instagram — texto perto da borda que a prévia corta.

**7. Cara de peça genérica**
Percorrer o `anti-generico.md`. Os que mais aparecem: gradiente roxo-azul, três cards iguais, tudo centralizado, olho numerado (`001 · SERVIÇOS`), ponto-médio como separador universal, bolinha colorida decorativa, travessão como enfeite, título quebrado com `<br>` em itálico, sombra em tudo, raio idêntico em tudo.

Cada um derruba a percepção de valor — apontar sem meias palavras.

**Bônus, quando a peça é uma página web:** as Web Interface Guidelines públicas da Vercel são uma boa lista complementar de checagem de interface. Se houver acesso à internet e a peça for interface de verdade (não carrossel nem PDF), vale buscar e conferir. Nunca depender disso: os sete checks acima rodam sozinhos.

### Passo 3 — Devolver priorizado

```
## Quebra (conserta antes de usar)
1. Contraste do corpo: #999 sobre #FFF = 2.8:1 (mínimo 4.5:1)
   → usar var(--text-muted) = #595959 (7.1:1)
2. Botão de CTA com 32px de altura no celular — alvo de toque mínimo é 44px

## Incomoda (a pessoa sente que algo está errado, sem saber o quê)
3. Título 42px e subtítulo 38px: hierarquia indistinguível → subtítulo pra 24px
4. Espaçamento de 13px, 27px e 35px na mesma seção → usar a grade (12/24/32)
5. Três cards iguais na seção de serviços — o layout mais genérico que existe
   → zigue-zague de 2 colunas, ou lista com hierarquia

## Detalhe (polimento)
6. Tracking igual em todos os tamanhos → -0.03em no título, +0.2em no olho
7. Sombra preta em 6 elementos — tingir com o matiz do fundo e manter só nos cards
```

No máximo 10 itens. Se houver mais, cortar os detalhes e dizer que cortou.

Quando fizer sentido, seguir a **ordem de conserto** do `anti-generico.md` — fonte primeiro, paleta depois, layout na sequência. É o que dá mais ganho visível com menos risco.

### Passo 4 — Oferecer o conserto

> "Quer que eu aplique as correções de 'Quebra' e 'Incomoda'?"

Se sim, editar a peça e mostrar o antes/depois renderizado.

**Se a peça já está no ar** (site publicado, página de cliente), antes de mexer conferir a regra de redesign do `anti-generico.md`: **nunca alterar em silêncio** endereço de página, rótulo de menu, campo de formulário, logo ou texto legal. Essas mudanças precisam de autorização explícita, porque o problema que elas causam aparece dias depois e ninguém liga uma coisa à outra.

---

## Regras

- **Sempre com número.** "Contraste baixo" não ajuda; "2.8:1, precisa de 4.5:1" ajuda
- **Sempre com o conserto ao lado.** Diagnóstico sem solução é crítica vazia
- Priorizar por impacto no usuário final, não pela ordem em que os problemas aparecem no arquivo
- Não redesenhar por gosto pessoal. Se a peça está coerente com a marca e legível, dizer que está boa — auditoria que sempre acha 10 problemas perde credibilidade
- Não confundir escolha estética com erro. Fundo escuro não é problema; fundo escuro com texto cinza-escuro é
- Não migrar tecnologia nem trocar biblioteca. Trabalhar com o que a peça já usa
- Mudança pequena e revisável vence reescrita grande
- Se a peça não tem sistema de referência (sem tokens, sem design-guide), avisar que o check 5 foi pulado e sugerir `/design-system`
