---
name: imprensa
description: >
  Consegue mídia espontânea sem assessoria: encontra o jornalista certo, escreve a pauta, aproveita
  assunto do momento e monta o material de imprensa. Focado em mídia local, regional e do setor.
  Use quando o usuário disser "quero aparecer na imprensa", "release", "assessoria", "sair no jornal",
  "chamar atenção da mídia", "pauta pra jornalista", "entrevista", "podcast", ou /imprensa.
---

# /imprensa — Aparecer sem pagar mídia

Mídia espontânea é o tipo de visibilidade que não se compra e que gera confiança que anúncio nenhum gera. Para negócio local, é mais acessível do que parece: rádio da cidade, jornal regional, portal de bairro, revista do setor e podcast de nicho vivem procurando pauta.

> **Convenção de pastas:** caminhos na convenção **por tipo**. Se o workspace usa **por cliente**, prefixar com `clientes/<Nome>/`.

## Dependências

- **Contexto e contato:** `_memoria/empresa.md`
- **Posicionamento:** `identidade/marca.md` se existir (`/marca`)
- **Dado e fonte:** `pesquisa/` (`/pesquisa`) — pauta sem dado raramente sai
- **Prova:** `biblioteca.md`
- **Ferramentas:** WebSearch e WebFetch (achar jornalista e veículo, ver o que ele já escreveu)
- **Saída:** `imprensa/` — pautas, lista de contatos, material de imprensa

---

## Antes: vale a pena agora?

**Vale** quando: tem número ou fato que interessa a terceiros · fez algo primeiro na cidade ou no setor · tem dado que ninguém tem · há assunto do momento em que você é fonte legítima · vai abrir, expandir, contratar ou completar tempo relevante.

**Não vale ainda** quando: o objetivo é venda imediata (mídia gera confiança, não pedido) · não há nada de novo além de existir · a operação não aguenta o movimento que a matéria pode gerar.

Se não vale, dizer com clareza e sugerir o que gera resultado agora (`/seo`, `/anuncio-google`, `/carrossel`) — em vez de escrever release que ninguém publica.

---

## O que é notícia (e o que não é)

| É notícia | Não é notícia |
|---|---|
| Dado que ninguém tinha ("levantamos 400 avaliações do setor na cidade") | "Empresa completa 12 anos" |
| Primeiro na região a fazer algo | "Empresa lança novo site" |
| Reação qualificada a assunto do momento | "Empresa acredita em qualidade" |
| Número de mercado que afeta o leitor | Prêmio pago ou selo comprado |
| História humana com conflito e desfecho | Nota institucional sobre nada |
| Consequência local de decisão nacional | Aniversário, reforma, mudança de logo |

**A pergunta que resolve:** *por que o leitor desse veículo se importaria hoje?* Se a resposta é "porque é sobre a empresa", não é pauta.

---

## Workflow

### Passo 1 — Achar o ângulo

Testar o material do negócio contra os cinco tipos que funcionam pra PME:

1. **Dado local** — você tem números da sua operação que descrevem a cidade ou o setor. Fortíssimo e subestimado
2. **Especialista disponível** — quando um assunto estoura, você é quem sabe explicar. Requer velocidade
3. **História com conflito** — a origem difícil, a crise superada, a decisão contraintuitiva
4. **Primeiro / único** — verificável, não inventado
5. **Serviço ao leitor** — "como escolher X", "cuidado com Y na época Z". É o que veículo local mais publica

### Passo 2 — Achar o veículo e a pessoa

Do mais fácil ao mais difícil, na ordem de tentar:

| Alvo | Por que começar aí |
|---|---|
| **Portal e jornal de bairro/cidade** | precisam de pauta local toda semana; taxa de resposta alta |
| **Rádio local** | conteúdo diário e sede de entrevistado que fale claro |
| **Revista e portal do setor** | público exato; pauta técnica é bem-vinda |
| **Podcast de nicho** | pauta menos disputada, audiência qualificada |
| **Grande veículo regional** | difícil, mas possível com dado exclusivo |

Achar **a pessoa**, não a redação: buscar quem assinou matérias parecidas nos últimos meses. Ler as **5 últimas** matérias dela antes de escrever — isso define o ângulo e evita o erro mais comum, que é mandar pauta pra quem não cobre aquilo.

Montar `imprensa/contatos.md` com: nome, veículo, o que cobre, últimas pautas, contato, histórico de contato.

### Passo 3 — Escrever a pauta

**Não é release institucional.** É um e-mail curto que o jornalista consegue transformar em matéria sem precisar de mais nada.

```
Assunto: [tão específico que já parece a manchete]

[Nome], vi sua matéria sobre [assunto real, específico].

[1 frase: o fato ou dado, com número.]

[2-3 frases: por que isso importa pro leitor de vocês agora.]

Tenho disponível:
- [dado completo / planilha]
- [cliente disposto a dar depoimento com nome]
- [foto em alta]
- [posso gravar hoje, se precisar]

[Nome], [cargo] — [telefone direto]
```

**Barra de qualidade — todas precisam ser "sim" antes de enviar:**

- [ ] Essa pessoa cobre esse assunto? (conferiu as 5 últimas matérias dela?)
- [ ] Tem gancho de tempo — algo que acabou de acontecer ou vai acontecer?
- [ ] Ela conseguiria escrever a matéria só com esse e-mail? (dado, fonte, contato, foto)
- [ ] O assunto do e-mail é específico o suficiente pra prever a manchete?
- [ ] Está abaixo de 150 palavras?
- [ ] Não tem "revolucionário", "inovador", "referência no mercado", "líder"?
- [ ] O pedido está claro (entrevista? dado? nota?)

Se qualquer resposta for "não", **não enviar**.

### Passo 4 — Aproveitar assunto do momento

Quando estoura algo em que o negócio é fonte legítima:

1. Confirmar que ele **realmente** tem o que dizer (não opinar sobre o que não domina)
2. Agir em **horas**, não dias — a janela fecha rápido
3. Oferecer o que a redação precisa: dado local, efeito prático na cidade, disponibilidade imediata
4. Nunca pegar carona em tragédia, luto ou crise de terceiros pra vender

### Passo 5 — Material de imprensa

Uma página simples (`imprensa/material.md`, ou uma página em `site/` se ele quiser público):

- O que a empresa faz, em 1 linha e em 1 parágrafo
- Números verdadeiros (fundação, equipe, atendimentos, região)
- Quem fala pela empresa: nome, cargo, mini-bio, sobre o que pode falar
- Foto em alta: pessoas, fachada, produto, trabalho feito
- Logo em fundo claro e escuro
- Contato direto para imprensa, com telefone que alguém atende
- Matérias anteriores, se houver

### Passo 6 — Registrar e acompanhar

Registrar cada envio em `imprensa/contatos.md`. Follow-up **uma vez**, 3 a 5 dias depois, curto, com algo novo. Nunca duas cobranças.

Saiu a matéria? Guardar em `imprensa/clipping/`, agradecer o jornalista (sem pedir nada), e reaproveitar: `/reaproveitar` transforma a matéria em post, story e prova social na landing e na proposta.

---

## Regras

- **Nunca inventar dado, número ou "primeiro do Brasil".** Jornalista confere, e queimar a fonte é definitivo
- **Ler as últimas matérias da pessoa antes de escrever.** Sem isso, é spam
- Pauta abaixo de 150 palavras. Release de 3 páginas não é lido
- Nunca enviar em massa com o mesmo texto para vários jornalistas — cada um recebe o ângulo do veículo dele
- Exclusividade é moeda: se prometeu exclusiva, cumprir
- Nunca mandar assessoria de imprensa cobrar publicação. Follow-up é uma vez
- Não pagar por "matéria" disfarçada de jornalismo sem sinalizar publicidade — isso é problema legal e de reputação
- Falar só do que domina. Especialista opinando fora da área queima autoridade
- Nunca prometer, em entrevista, resultado ou dado que a empresa não pode comprovar
