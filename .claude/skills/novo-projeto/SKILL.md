---
name: novo-projeto
description: >
  Cria uma pasta de projeto nova com `CLAUDE.md` dedicado, depois de uma entrevista curta sobre
  o projeto (cliente, objetivo, entregas previstas). Use quando o usuário disser "novo projeto",
  "novo cliente", "/novo-projeto", "começar projeto pra X" ou pedir pra estruturar um trabalho novo.
---

# /novo-projeto — Pasta de projeto novo com contexto dedicado

Quando o usuário começa um projeto novo (cliente, iniciativa, produto), cria uma pasta com `CLAUDE.md` próprio que herda contexto da raiz e adiciona o que é específico do projeto.

## Workflow

### Passo 1 — Entrevista (4 perguntas)

1. "Qual o nome do projeto ou cliente?"
2. "É um cliente novo, projeto interno ou iniciativa pessoal?"
3. "Qual o objetivo principal? (uma frase)"
4. "Que tipo de entrega vai ter? (ex: ads, site, conteúdo, automação, proposta — pode ser mais de uma)"

### Passo 2 — Decidir local

Ler a seção "Onde salvar o que" do `CLAUDE.md` do workspace antes de decidir. Baseado na resposta 2:

- **Cliente novo:** `clientes/<Nome>/` — é a convenção dos perfis freelancer e agência. Nos perfis por tipo (empreendedor solo, empresa), confirmar com o usuário se ele quer começar a usar `clientes/` agora
- **Projeto interno:** `projetos/<nome>/`
- **Iniciativa pessoal:** perguntar onde o usuário prefere

Criar sempre na **raiz do workspace**, nunca dentro das pastas do sistema (`.claude/`, `templates/`, `scripts/`). Se a pasta-mãe (`clientes/`, `projetos/`) ainda não existir, ela nasce agora.

### Passo 3 — Estrutura básica

Criar a pasta com:

- `CLAUDE.md` do projeto (instruções herdadas + específicas)
- `briefing.md` (com o que foi coletado na entrevista)
- Subpastas conforme as entregas mencionadas (ex: se mencionou "ads e conteúdo", criar `ads/` e `conteudo/`)

### Passo 4 — Conteúdo do `CLAUDE.md` do projeto

Template:

```markdown
# [Nome do projeto]

> Projeto criado em [data]. Pasta dedicada — instruções aqui sobrescrevem as da raiz quando relevantes.

## Sobre

[Objetivo da resposta 3]

## Tipo

[Cliente novo / Projeto interno / Iniciativa pessoal]

## Entregas previstas

- [entrega 1 da resposta 4]
- [entrega 2 da resposta 4]
- ...

## Onde salvar o que

- Briefings e contexto: nessa pasta na raiz
- Entregas: cada subpasta criada (ads/, conteudo/, site/, etc.)

## Contexto que herda da raiz

Esse projeto herda automaticamente o tom de voz, marca e contexto do negócio definidos em `_memoria/` e `identidade/` da raiz. Não duplicar essas informações aqui.

## Específico desse projeto

[Vazio — preencher com regras que valem só pra esse projeto, conforme for descobrindo]

> Se esse projeto é de um **cliente** com marca própria, o visual das
> peças segue a marca do cliente, não a da raiz. Registrar aqui as cores
> e fontes dele (ou criar `identidade/design-guide.md` dentro da pasta
> do projeto).
```

### Passo 5 — Resumo

Responder pro usuário:

```
Pasta criada: [caminho]
✓ CLAUDE.md do projeto
✓ briefing.md
✓ Subpastas: [lista]

Quando for trabalhar nesse projeto, abre o terminal já dentro da pasta — assim eu carrego o CLAUDE.md específico junto com o da raiz.
```

Se for cliente novo, oferecer o próximo passo concreto:
> "Quer que eu já monte a proposta (`/proposta`) ou o briefing de SEO (`/seo`) pra ele?"

## Regras

- Nome de pasta: usar o nome como o usuário falou, sem normalizar agressivamente (manter acentos, espaços viram hífen, mas o nome reconhecível)
- Não criar subpastas que não foram pedidas ("pra organizar melhor"). Só o que foi mencionado nas entregas
- Se o cliente/projeto já existe (pasta com mesmo nome), avisar e perguntar se é pra adicionar dentro ou criar com sufixo
- Registrar o cliente/projeto novo em `_memoria/empresa.md` (perguntando antes, conforme a regra de contexto do `CLAUDE.md`)
