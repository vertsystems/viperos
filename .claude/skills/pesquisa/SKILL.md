---
name: pesquisa
description: >
  Monta um dossiê de pesquisa real sobre um tema, com números datados e fonte, citações literais de
  como o público fala, consenso vs controvérsia e o que ninguém está dizendo. É o insumo que faz
  conteúdo, proposta e anúncio saírem sólidos em vez de genéricos. Use quando o usuário pedir
  "pesquisa sobre X", "levanta dados de", "o que se sabe sobre", "quero embasar", "buscar
  referências", "estudar esse tema", ou /pesquisa.


---

# /pesquisa — Dossiê de tema

> **Convenção de pastas:** os caminhos desta skill seguem a convenção **por tipo** (perfis empreendedor solo e empresa). Se o `CLAUDE.md` do workspace usa a convenção **por cliente** (freelancer e agência) e a peça é de um cliente, prefixar com `clientes/<Nome>/`. A pasta nasce só na hora de salvar.

O que separa conteúdo sólido de conteúdo genérico não é escrita: é ter algo verdadeiro e específico pra dizer. Essa skill vai buscar esse algo antes de qualquer peça ser escrita.

## Dependências

- **Contexto:** `_memoria/empresa.md` (o ângulo interessa ao negócio dele, não ao mundo)
- **Ferramentas:** WebSearch e WebFetch
- **Saída:** `pesquisa/<tema-slug>.md`

---

## Workflow

### Passo 1 — Definir as perguntas antes de buscar

Pesquisa sem pergunta vira coletânea de link. Escrever 4-6 perguntas específicas que o dossiê precisa responder, e mostrar pro usuário:

> "Vou atrás disso:
> 1. Qual o tamanho real desse mercado no Brasil e quando foi medido?
> 2. Quanto custa hoje em média — e por que varia?
> 3. O que o público reclama quando reclama disso?
> 4. Que erro técnico mais aparece?
> Quer trocar ou adicionar alguma?"

### Passo 2 — Buscar em frentes diferentes

Uma frente só devolve uma versão do mundo. Cobrir, quando aplicável:

| Frente | O que procurar | Por que importa |
|---|---|---|
| **Dado oficial / setorial** | Órgão público, associação do setor, censo, relatório anual | É o número que ninguém contesta |
| **Técnico** | Norma, artigo, documentação, manual de fabricante | Dá autoridade e evita erro grosseiro |
| **Voz do público** | Fórum, Reddit, comentário, avaliação, grupo | **A fonte mais subestimada** — é onde aparece a linguagem real e a dor real |
| **Concorrência** | Sites e conteúdo de quem já fala do tema | Mostra o que já está saturado |
| **Notícia recente** | Últimos 12 meses | Detecta mudança de regra, preço, tendência |

Ao buscar a voz do público, **copiar frases literais** (com a fonte). Uma frase real de cliente vale mais que três parágrafos de análise — é o material bruto do hook, da legenda e da objeção na proposta.

### Passo 3 — Confrontar o que achou

Antes de escrever o dossiê:

- **Datar tudo.** Número sem data é inútil. "Mercado de R$ 4,2 bi" — de quando? Se não achar a data, marcar como não datado
- **Cruzar.** Duas fontes independentes dizendo o mesmo = consenso. Uma fonte só = indício, e isso fica escrito
- **Anotar as divergências** em vez de escolher a que agrada. Divergência é conteúdo: "as estimativas variam de X a Y porque medem coisas diferentes"
- **Separar dado de opinião.** Post de blog de concorrente não é fonte de número

### Passo 4 — Escrever o dossiê

`pesquisa/<tema-slug>.md`:

```markdown
# Pesquisa — <tema>
*Levantado em <YYYY-MM-DD>*

## Resposta curta
[3-5 linhas: se o usuário só ler isso, o que ele precisa saber]

## Números
| Dado | Valor | Data | Fonte | Confiança |
|---|---|---|---|---|
| ... | ... | 2025 | <órgão + link> | alta / indício |

## Como o público fala
> "citação literal" — <onde foi encontrada>

[3-6 citações. Preservar a linguagem exata, com erro e tudo.]

## Consenso
[O que várias fontes confirmam]

## Divergência
[Onde as fontes brigam, e por quê]

## O que ninguém está dizendo
[Ângulo, dado ou pergunta que a concorrência ignora. É aqui que nasce conteúdo diferente.]

## Buracos
[O que eu procurei e não achei — pra ninguém achar que a ausência é conclusão]

## Fontes
[Lista com link e data de acesso]
```

### Passo 5 — Ligar no que vem depois

> "Dossiê pronto. Ele serve de base pra:
> `/angulos` (tratamentos diferentes desse tema) · `/carrossel` ou
> `/publicar-tema` (conteúdo) · `/proposta` (argumento com dado) ·
> `/anuncio-google` (copy com número real).
>
> Quer seguir pra algum?"

---

## Regras

- **Zero invenção.** Número sem fonte não entra no dossiê. Se não achou, vai pra seção "Buracos"
- **Data em tudo.** Dado de 2019 apresentado como atual é erro grave
- Citação do público é **literal**, não parafraseada — o valor está na palavra que a pessoa escolheu
- Não inflar: 5 dados sólidos valem mais que 20 duvidosos
- Marcar explicitamente o que é estimativa e como foi estimado
- Se o tema for regulado (saúde, jurídico, financeiro, alimentação), sinalizar que afirmação técnica precisa de revisão profissional antes de publicar
- Reaproveitar dossiê existente: antes de pesquisar, conferir se já tem arquivo desse tema em `pesquisa/`. Se tiver e for recente, atualizar em vez de recomeçar
