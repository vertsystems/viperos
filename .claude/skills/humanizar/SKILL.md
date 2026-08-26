---
name: humanizar
description: >
  Reescreve texto que saiu com cara de máquina: mede os sinais por comando (ritmo, frases
  curtas, clichê, travessão), levanta o que só o usuário sabe e devolve o texto com voz,
  sem inventar fato. Também diz o que fazer quando a cara de IA está na peça visual.
  Use quando o usuário disser "tá com cara de IA", "parece ChatGPT", "parece robô",
  "humaniza esse texto", "deixa mais natural", "deixa com a minha voz", "isso não parece
  escrito por mim", "tá muito formal", "humanizer", ou /humanizar.
---

# /humanizar — Tirar a cara de máquina

> **Saída:** o texto reescrito no chat. Se veio de arquivo, o arquivo é editado no lugar. Nenhuma pasta nova.

Texto gerado tem dois problemas, e só um é de vocabulário. Tirar "mergulhe" e
"revolucionário" resolve a superfície. O que sobra é um texto correto, bem pontuado, e
que ainda soa como máquina: todas as frases do mesmo tamanho, a estrutura anunciando o
que vem, e nenhuma informação que alguém possa conferir.

Essa parte não se resolve cortando palavra. Se resolve devolvendo ao texto o que só o
dono do negócio sabe.

## Dependências

- **A voz:** `_memoria/preferencias.md`, principalmente o exemplo de escrita real dele. É a régua
- **O cliente:** `_memoria/publico.md` — a palavra que ele usa de verdade
- **Contexto:** `_memoria/empresa.md` — o material específico (caso, número, história) costuma estar aqui
- **Referências:**
  - `templates/copy/humanizacao.md` — os quatro sinais, as sete manobras, o que não se humaniza
  - `templates/copy/edicao.md` — a lista negra de clichê
- **Saída:** o texto reescrito, mais o antes/depois medido

---

## Workflow

### Passo 1 — Medir antes de opinar

```bash
node scripts/verificar.js texto <arquivo>
```

Se o texto veio colado no chat, salvar em arquivo temporário e medir do mesmo jeito. O
comando devolve variação do ritmo, proporção de frases curtas, clichês, travessão e
formato de lista.

Guardar esses números: eles são o antes, e é com eles que a entrega se prova no fim.

### Passo 2 — Descobrir o que falta de específico

O passo que decide o resultado. Texto genérico não fica específico por reescrita: fica
específico por informação nova, e a informação está com o usuário.

Uma pergunta só, montada em cima do que o texto promete:

> "Pra tirar o genérico, preciso de coisa que só você sabe. Nesse texto sobre atraso de
> entrega: qual foi o último caso real, quanto custou, e o que você mudou depois?"

Perguntar o que dá para conferir — número quebrado, dia, nome de fornecedor, o que deu
errado. Se ele não tiver nada à mão, seguir e marcar no texto:
`[preencher: qual foi o caso?]`. **Nunca preencher sozinho.**

### Passo 3 — Ler a voz dele

Abrir `preferencias.md` e ler o exemplo de escrita real antes de escrever qualquer
linha. O alvo não é "texto humano em geral" — é o jeito daquela pessoa. Se ela escreve
seco, o texto sai seco. Se ela usa "a gente", o texto usa "a gente".

Sem exemplo de escrita salvo, pedir um: "me manda um áudio ou um texto que você escreveu
sem ajuda — qualquer um serve, até mensagem de WhatsApp". Dois parágrafos bastam.

### Passo 4 — Reescrever com as sete manobras

Em ordem de impacto, do `templates/copy/humanizacao.md`:

1. **Cortar o aquecimento** — o primeiro parágrafo quase sempre é pigarro
2. **Uma frase curta de verdade** — de três, quatro palavras
3. **Genérico → verificável** — com o material do Passo 2, nunca inventado
4. **Assumir a posição** — fora o "pode ser interessante considerar"
5. **Palavra do cliente** no lugar do termo técnico
6. **Quebrar o paralelismo** — três frases com a mesma forma denunciam sozinhas
7. **Deixar a digital do autor** — a implicância, o caso, a comparação que só ele faz

Enquanto reescreve, conferir se o texto é do tipo que **não** se humaniza: contrato,
instrução de segurança, dosagem, ficha técnica e resposta automática ficam secos de
propósito. Nesses, avisar e parar.

### Passo 5 — Medir depois

Rodar o mesmo comando no texto reescrito. Se algum número não melhorou, o passe não
funcionou — voltar, não maquiar.

O que costuma faltar quando o número teima: frase curta de verdade (a régua é 15% e o
conserto leva um minuto) e informação específica (que não se resolve escrevendo, só
perguntando).

### Passo 6 — Entregar com o antes e depois

```markdown
## Texto humanizado
[versão final]

## O que mudou
- **Ritmo:** variação de 0,13 → 0,58 (a régua é 0,45)
- **Frases curtas:** 0% → 27%
- **7 clichês** fora: "no mundo de hoje", "não é apenas X, é Y", "em suma"…
- **3 genéricos viraram específicos:** "muitos clientes" → "onze dos catorze de junho"
- **1 marcação pendente:** [preencher: qual foi o caso do fornecedor?]
- Tom conferido contra o teu exemplo de escrita em preferencias.md
```

---

## Quando a cara de IA não está no texto

O pedido costuma vir junto com peça pronta. Encaminhar:

| O que parece de IA | Onde se resolve |
|---|---|
| A peça visual (cor, layout, três cards iguais, gradiente roxo-azul) | `/revisar-design`, com a lista do `templates/design/anti-generico.md` |
| A animação (tudo com a mesma curva, elemento voando) | `/movimento` |
| A tela de sistema (botão genérico, nenhum estado vazio) | `/interface` |
| A oferta e a promessa ("solução completa", garantia vaga) | `/oferta` |

---

## Regras

- **Nunca inventar detalhe para parecer específico.** Nome, valor, data e história vêm do usuário ou de `_memoria/`. Sem material, marcar `[preencher: …]` e devolver a pergunta. É aqui que essa skill vira mentira se for descuidada
- **Não errar de propósito.** Vírgula torta e "né" plantado não viram humano, viram desleixo
- **A voz é a dele, não a de um redator.** A régua é o exemplo de escrita em `preferencias.md`
- **Medir antes e depois, sempre.** Sem número, "ficou melhor" é opinião — e é justamente o que o sistema não aceita
- **Não resumir.** Se o texto encolheu muito, ou havia gordura (aí o trabalho é do `/revisar`) ou sumiu conteúdo
- **Não enfeitar.** Metáfora nova e frase de efeito são enfeite no lugar de conteúdo, do mesmo jeito que o clichê
- **Não prometer aprovação em detector de IA.** Eles erram nas duas direções, e ninguém controla o resultado. O que se entrega é texto que uma pessoa reconhece como escrito por alguém
- Texto legal, instrução de segurança e ficha técnica não se humanizam: previsibilidade neles é qualidade
- Se o texto é do próprio usuário e o problema é excesso, e não voz, a skill é `/revisar`
