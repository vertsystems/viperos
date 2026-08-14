---
name: marca
description: >
  Define o lado verbal e estratégico da marca: posicionamento, a história em que o cliente é o herói,
  voz, vocabulário e o que nunca se diz. Gera `identidade/marca.md` e calibra `_memoria/preferencias.md`.
  Use quando o usuário disser "posicionamento", "minha marca", "o que me diferencia", "como me
  apresentar", "tom de voz", "manifesto", "slogan", "bio", "não sei me descrever", "pareço igual aos
  outros", ou /marca. Pro lado visual (cores, tipografia, tokens), veja /design-system.
---

# /marca — O que você é, e como você fala

Duas perguntas que todo negócio pequeno responde mal: **por que alguém deveria te escolher** e **como você soa**. Sem isso, cada peça sai com uma voz diferente e o posicionamento vira "qualidade e bom atendimento" — que é o que todo concorrente também diz.

Essa skill cuida do verbal e do estratégico. O visual é do `/design-system`.

> **Convenção de pastas:** caminhos na convenção **por tipo**. Se o workspace usa **por cliente** e a marca é de um cliente, prefixar com `clientes/<Nome>/`.

## Dependências

- **Contexto:** `_memoria/empresa.md`
- **Cliente real:** `_memoria/publico.md` (`/publico`) — posicionamento se constrói contra a dor dele, não no vácuo
- **Oferta:** `_memoria/oferta.md` (`/oferta`)
- **Saídas:** `identidade/marca.md` + atualização de `_memoria/preferencias.md` (voz) e do resumo de posicionamento em `_memoria/empresa.md`

---

## Parte 1 — Posicionamento

### Levantar (5 perguntas)

1. "Quem são seus 3 concorrentes mais diretos, e o que eles prometem?"
2. "O que você faz que eles não fazem, ou fazem pior?" — quero fato, não adjetivo
3. "Por que seus melhores clientes te escolheram? (o que eles falaram)"
4. "Que tipo de cliente você **não** quer? Por quê?"
5. "Se você tivesse que ser conhecido por **uma** coisa, qual seria?"

Se `_memoria/publico.md` existir, ler antes — a resposta 3 provavelmente já está lá, na palavra do cliente.

### Montar a frase de posicionamento

```
Para <cliente específico>
que <situação ou dor concreta>,
<nome> é <categoria>
que <benefício principal, específico>.
Diferente de <alternativa real>,
a gente <diferença verificável>.
```

Três testes. Reprovou em um, refazer:

| Teste | Como aplicar |
|---|---|
| **Do concorrente** | Se o concorrente pudesse assinar essa frase, ela não é posicionamento — é descrição de categoria |
| **Do contrário** | Se o oposto for absurdo ("somos ruins e caros"), a frase não afirma nada. Posicionamento tem um lado |
| **Do cliente** | O cliente reconhece a dor descrita na primeira linha? Se ele não se vê ali, errou o alvo |

**Quase todo posicionamento fraco** é fraco por dizer "qualidade", "atendimento" ou "compromisso". Nenhum dos três é diferencial: é o mínimo. Diferencial é o que dá pra verificar — prazo, processo, especialidade, garantia, escala, origem, restrição deliberada.

**O que você deixa de ser também posiciona.** "Não atendemos obra pequena" ou "só trabalhamos com um cliente por segmento" comunica mais que qualquer adjetivo.

---

## Parte 2 — A história (o cliente é o herói)

O erro que quase toda empresa comete: se colocar como herói da história ("nossa trajetória de 30 anos"). Quem tem que ser herói é o **cliente**. Você é o guia que mostra o caminho.

Preencher os sete pontos:

| # | Peça | Pergunta | Erro comum |
|---|---|---|---|
| 1 | **O herói** | O que o cliente quer? | Confundir com o que a empresa quer vender |
| 2 | **O problema** | O que trava? Em três camadas: o problema prático, o incômodo que ele causa, e por que é injusto | Pular direto pra solução |
| 3 | **O guia** | Por que confiar em você? Duas coisas: **empatia** (você entende a dor) e **autoridade** (você já resolveu isso) | Só falar de autoridade e soar arrogante |
| 4 | **O plano** | Quais os 3 passos pra trabalhar com você? | Não ter plano nenhum — cliente confuso não age |
| 5 | **A chamada** | Qual a ação, dita de forma direta? | Ser passivo ("entre em contato") |
| 6 | **O que se evita** | O que acontece se ele não resolver? | Exagerar e virar chantagem — dose de tempero, não o prato |
| 7 | **O sucesso** | Como fica a vida dele depois? | Ficar abstrato ("mais tranquilidade") em vez de concreto |

Desse preenchimento saem, de graça: a frase da bio, o texto do "sobre", o roteiro do hero da landing, a abertura da proposta e o gancho de vários conteúdos.

**A camada 3 do problema (por que é injusto) é a que gera conexão.** "Você paga por um serviço e fica no escuro sobre o andamento" cria mais identificação que qualquer descrição técnica.

---

## Parte 3 — Voz

### Duas dimensões

Marcar onde a marca fica em cada eixo, com exemplo do que muda:

```
Formal          ●———————— Informal
Sério  ————●———————— Divertido
Técnico ——————●—————— Simples
Reservado ———●——————— Provocativo
Institucional ————————●— Pessoal
```

### O que a voz precisa ter por escrito

- **3 qualidades** da voz, cada uma com "isso significa" e "isso NÃO significa"
  - Ex: *Direta* — significa ir ao ponto na primeira linha; **não** significa ser seca ou grossa
- **Vocabulário:** palavras que a marca usa · palavras que a marca nunca usa
- **Como muda por canal:** WhatsApp, Instagram, e-mail formal, proposta, resposta a review
- **Antes e depois:** 3 pares de frase real reescrita na voz da marca — é a parte mais útil do documento
- **O que nunca se diz:** frase, promessa e assunto proibidos

O `_memoria/preferencias.md` recebe o resumo dessa voz, e é ele que as skills leem ao escrever. O `identidade/marca.md` guarda a versão completa com exemplos.

---

## Entrega

`identidade/marca.md`:

```markdown
# Marca — <nome>
*Definida em <AAAA-MM-DD>*

## Posicionamento
[a frase] + por que passa nos três testes

## O que a gente não é
[o que deliberadamente não fazemos ou não atendemos]

## A história
1. Herói · 2. Problema (3 camadas) · 3. Guia · 4. Plano (3 passos)
5. Chamada · 6. O que se evita · 7. Sucesso

## Frases prontas que saem daqui
- Bio de 1 linha:
- Bio de 3 linhas:
- Abertura de proposta:
- Hero de página:

## Voz
Dimensões · 3 qualidades (é / não é) · vocabulário · por canal · antes e depois

## O que nunca dizemos
```

Depois:

> "Marca definida. Isso muda o que sai de tudo — `/carrossel`, `/landing`,
> `/proposta`, `/email-profissional` e `/responder-avaliacoes` passam a escrever
> com essa voz.
>
> Falta o lado visual? `/design-system` monta paleta, tipografia e tokens
> com contraste validado."

---

## Regras

- **Posicionamento que o concorrente poderia assinar não é posicionamento.** Refazer até passar nos três testes
- **Nunca aceitar "qualidade", "bom atendimento" ou "compromisso" como diferencial.** Cavar até achar o fato verificável embaixo
- Não inventar história, origem, fundação ou propósito. Se o negócio nasceu porque o dono precisava de dinheiro, isso é uma história melhor que qualquer missão inventada
- O cliente é o herói. Se o texto ficar falando da empresa, reescrever
- Voz se define a partir de escrita **real** do usuário (o exemplo em `_memoria/preferencias.md`), não de adjetivos aspiracionais
- "O que nunca dizemos" é seção obrigatória — é o que mais protege a marca no dia a dia
- Não prometer resultado que a operação não sustenta. Marca é promessa; promessa não cumprida cobra juros
- Em negócio regulado, conferir o que o conselho de classe permite comunicar antes de fechar a promessa
