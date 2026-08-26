# Página de produto — onde a pessoa compara e decide

Referência do `/produto`. É outra página, não a landing. A landing tem **uma** ação e
serve tráfego de anúncio. Esta serve quem já quer comprar e precisa **escolher**: qual
plano, qual tamanho, qual prato, qual pacote.

---

## A ordem que decide a página

Medida no comparador da apple.com (leitura de `overview.built.css` e da estrutura da
página em ago/2026). A inversão de maior efeito e menor custo que existe numa página de
produto:

| # | Bloco |
|---|---|
| 1 | **Seletor** — o que muda (modelo, plano, tamanho) |
| 2 | **Preço**, atualizado na hora pela escolha, e grudento na rolagem |
| 3 | **O botão de comprar** |
| 4 | **Resumo em uma frase** — o que a pessoa leva |
| 5 | Do 5º item em diante: capacidade, medidas, ficha técnica, comparação longa |

**O botão é a quinta linha da página, antes de qualquer especificação.** Quase toda
página de pequeno negócio faz o oposto: descreve tudo e coloca o botão no fim. Quem já
decidiu tem de rolar a página inteira para comprar, e uma parte desiste no caminho.

Quem ainda não decidiu continua rolando. A ficha técnica não sumiu. Só saiu da frente de
quem não precisa dela.

---

## Preço, do jeito que a lei exige

O **art. 52 do Código de Defesa do Consumidor** obriga informar, em venda a prazo:
montante dos juros, acréscimos, número e periodicidade das prestações e a **soma total
a pagar**. Não é detalhe jurídico: é o que separa preço honesto de pegadinha:

```
R$ 97/mês  ·  12× de R$ 97 = R$ 1.164 no total
R$ 970/ano  (equivale a R$ 80,83/mês — cobrado uma vez, R$ 970)
```

Regras que valem sempre:

- Parcelado aparece **junto** com a soma total, no mesmo tamanho de fonte
- Plano anual mostra o valor cheio cobrado, não só o "por mês equivalente"
- "A partir de R$ X" exige dizer **a partir do quê** e onde ver o resto
- Frete, taxa de adesão e o que renova em outro preço aparecem antes do botão
- Toda multiplicação escrita na página é conferida por comando:
  `node scripts/verificar.js tabela <arquivo.md>` — `12× R$ 97 = R$ 1.164` errado
  numa página de preço custa mais que um erro de design

---

## O bloco de número grande

O padrão visual que faz a página parecer de marca grande, e que é quase de graça:

```css
.numero-grande { font-size: 80px; line-height: 1; letter-spacing: -0.015em; font-weight: 600; }
.numero-legenda { font-size: 21px; line-height: 1.4; max-width: 22ch; }
@media (max-width: 640px) { .numero-grande { font-size: 48px; } }
```

- Um número por bloco. Três números grandes lado a lado viram enfeite
- A legenda em 22 caracteres de largura — a linha curta é o que dá o ar editorial
- O número precisa ter origem: "12 anos", "3.400 pedidos entregues". Número redondo sem
  fonte é o item do `anti-generico.md` que mais custa credibilidade

> Tracking negativo em display: `-0.015em` aqui, não `-0.03em`. A régua de `-0.02` a
> `-0.04em` do `qualidade-visual.md` é calibrada para a SF Pro, que ajusta o desenho da
> letra conforme o tamanho. Inter, Outfit e Manrope não têm esse eixo — nelas, tracking
> muito negativo em 80px cola as letras.

---

## Barra de compra persistente

Só quando a página passa de **duas telas de rolagem**. Abaixo disso, o botão do topo
ainda está por perto e a barra só rouba espaço no celular.

Quando existir: altura discreta, o preço atual, o nome do que está selecionado e o
botão. E `scroll-padding-top` ajustado, senão ela cobre o elemento focado pelo teclado
(critério 2.4.11, ver `acessibilidade.md`).

---

## Comparar planos sem confundir

- **Três planos, quatro no máximo.** Cinco fazem a pessoa adiar a decisão
- Um marcado como recomendado — e o motivo escrito ("para quem já vende todo dia"), não
  só um selo colorido
- **A mesma ordem de atributos em todas as colunas.** Ordem diferente obriga a reler
- A diferença primeiro, o que é igual depois. Repetir cinco itens iguais em três
  colunas esconde o que decide
- Nada de `✓`/`✗` sem legenda: "ilimitado" e "até 3" dizem mais que dois símbolos
- No celular: uma coluna por vez, com o recomendado primeiro — nunca tabela de três
  colunas espremida

---

## Prova social com régua

Avaliação alta demais desperta desconfiança: o Spiegel Research Center (Northwestern)
mediu que a probabilidade de compra sobe com a nota até uma faixa em torno de 4,2–4,7 e
**cai** acima disso. Mas a régua tem um limite que é fácil esquecer:

**Ela só vale acima de ~50 avaliações.** Uma clínica com 14 avaliações e nota 5,0 não
deve esconder nada: abaixo desse volume, exibir **nota e contagem juntas** ("5,0 · 14
avaliações") é mais honesto e mais eficaz que qualquer ajuste.

E o que vale em qualquer volume: depoimento com nome e contexto reais, avaliação
negativa respondida à vista (ver `/responder-avaliacoes`), zero depoimento inventado.

---

## Antes de entregar

1. O botão aparece antes de qualquer especificação
2. Toda conta da página conferida por comando
3. Parcelamento com soma total; anual com valor cheio
4. Foto de produto real, com `width`/`height` declarados (CLS — ver `desempenho.md`)
5. FAQ respondendo objeção de verdade, tirada de `_memoria/publico.md`
6. Contato que funciona: WhatsApp com número, link testado
7. Conferido contra `anti-generico.md` e `acessibilidade.md`
