---
name: produto
description: >
  Monta a página onde a pessoa compara e decide: produto, planos, cardápio, catálogo ou tabela
  de preços, com seletor, preço, botão de compra antes da ficha técnica, parcelamento conforme
  o CDC e comparação que não confunde.
  Use quando o usuário disser "página do produto", "tabela de preços no site", "página de
  planos", "comparar os planos", "página do cardápio", "catálogo no site", "quero uma página
  tipo Apple", "onde o cliente escolhe", ou /produto.
---

# /produto — A página onde a pessoa escolhe

> **Convenção de pastas:** a saída vai em `site/<nome>/index.html`. Na convenção **por cliente**, `clientes/<Nome>/site/<nome>/index.html`. A pasta nasce agora, nunca antes.

O `/landing` faz a página de **uma** ação, para quem chegou de anúncio e precisa
decidir sim ou não. Falta a outra: a página de quem já quer comprar e precisa escolher
**qual**: qual plano, qual tamanho, qual prato, qual pacote.

São páginas com lógicas opostas. A landing conduz por um caminho só; esta abre opções e
tem de deixar a comparação fácil sem transformar a decisão em pesquisa.

## Dependências

- **Contexto de venda:** `_memoria/oferta.md` (o que se vende, garantia, preço) e `_memoria/publico.md` (objeção na palavra do cliente). Se não existirem, oferecer `/oferta` **uma vez** e seguir com o que tem
- **Sistema da marca:** `identidade/tokens.css` se existir; senão `identidade/design-guide.md`
- **Referências** (ler antes de gerar):
  - `templates/design/pagina-produto.md` — a ordem dos blocos, preço, comparação, prova social
  - `templates/design/briefing-visual.md` — leitura do briefing e os três ajustes
  - `templates/design/qualidade-visual.md` — tipografia, cor, layout
  - `templates/design/acessibilidade.md` — alvo, foco, formulário
  - `templates/design/anti-generico.md` — conferir antes de entregar
- **Saída:** `site/<nome>/index.html`

---

## Workflow

### Passo 1 — Conferir o endereço antes de escrever

**Obrigatório, e antes de qualquer outra coisa.** O `/landing` grava no mesmo lugar:
se a pasta já existir, escrever por cima apaga a página de um cliente em silêncio, e
isso só aparece dias depois.

```bash
ls site/ 2>/dev/null
```

- Pasta não existe → seguir
- Pasta existe com `index.html` → **parar e perguntar**: "Já existe `site/planos/` com
  uma página do dia 12/08. Crio em outro nome ou substituo essa?" Nunca decidir sozinho
- Nome sugerido pelo conteúdo: `planos`, `cardapio`, `produtos`, `precos` — nunca
  `index` solto na raiz de `site/`

### Passo 2 — Levantar o que a pessoa precisa para escolher

Uma pergunta só, com o que faltar:

> "Me passa as opções com nome, preço e a diferença entre elas — e me diz qual você
> mais quer vender."

O que precisa estar na mão antes de desenhar: as opções, o preço de cada uma, o que
muda de uma para a outra, a forma de pagamento (à vista, parcelado, mensal, anual), e
a objeção que mais aparece.

Sem preço não há página de decisão. Se o negócio não publica preço, dizer isso e
propor a alternativa honesta (faixa, "a partir de" com o de quê, ou orçamento) em vez
de montar uma página que esconde o que a pessoa foi buscar.

### Passo 3 — Montar na ordem que decide

A ordem do `templates/design/pagina-produto.md`, que é a inversão de maior efeito da
página inteira:

1. Seletor — o que muda
2. Preço, atualizado pela escolha, grudento na rolagem
3. **O botão de comprar**
4. Resumo em uma frase
5. Daí em diante: ficha, medidas, comparação longa, FAQ

**O botão é a quinta linha, antes de qualquer especificação.** Quem já decidiu compra;
quem não decidiu continua rolando: a ficha técnica não sumiu, só saiu da frente.

Depois: comparação (três planos, no máximo quatro, um recomendado com o motivo
escrito), prova social com a régua do template, FAQ com objeção real de
`_memoria/publico.md`, e contato que funciona.

### Passo 4 — Escrever a página

HTML único, **com os tokens inline**: a página é enviada sozinha por WhatsApp e não
pode depender de CSS externo. Imagem de produto com `width` e `height` declarados.
Movimento 3, seguindo `identidade/movimento.css` se existir.

Preço conforme o **art. 52 do CDC**: parcelado sempre com a soma total, no mesmo
tamanho de fonte; anual sempre com o valor cheio cobrado.

### Passo 5 — Conferir as contas (obrigatório)

Toda multiplicação e todo total da página passam pelo comando. Erro de conta numa
página de preço custa mais caro que erro de design:

```bash
node scripts/verificar.js html site/<nome>/index.html   # confere "12× R$ 97 = R$ 1.164"
node scripts/verificar.js alvo site/<nome>/index.html
node scripts/verificar.js contraste "<texto>" "<fundo>"
```

O check de HTML lê as multiplicações escritas na página e refaz cada conta.

Se a conta divergir, refazer a partir do valor unitário — **nunca ajustar o número para
bater**.

### Passo 6 — Entregar

```
✓ site/<nome>/index.html — [N] opções, botão antes da ficha, contas conferidas

Abre no navegador. Testa no celular também: a comparação de três colunas
vira uma coluna por vez, com o recomendado primeiro.
```

---

## Regras

- **Nunca sobrescrever pasta que já existe** sem perguntar. É a regra que mais importa aqui, porque o estrago é invisível
- **Botão antes da ficha técnica.** Se a página inteira precisa ser rolada para comprar, ela está montada ao contrário
- **Parcelado com soma total; anual com valor cheio.** Art. 52 do CDC, e é também o que sustenta a confiança
- **Toda conta rodada por comando** antes de entregar
- Três planos, quatro no máximo. Mesma ordem de atributos em todas as colunas, diferença primeiro
- Um recomendado, com o motivo escrito — não só um selo colorido
- **Régua da nota só acima de ~50 avaliações.** Abaixo disso, mostrar nota **e** contagem juntas. Negócio com 14 avaliações e nota 5,0 não tem nada a esconder
- Zero depoimento inventado, zero logo de quem não é cliente, zero número redondo sem origem
- Foto de produto real. Se não houver, layout tipográfico — nunca ilustração improvisada
- Tokens inline no HTML, sempre
- Se o pedido é uma página de **uma** ação para tráfego de anúncio, a skill é `/landing`
