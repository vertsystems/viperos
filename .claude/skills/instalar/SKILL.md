---
name: instalar
description: >
  Instalação inicial do ViperOS: entrevista o dono do negócio sobre empresa, canais de contato, tom de
  voz, foco atual e identidade, preenche a memória e adapta o CLAUDE.md ao perfil. Use quando o usuário
  acabou de clonar o repositório, ou disser "instalar", "rodar o instalar", "primeiro setup",
  "configurar o sistema", "acabei de baixar", ou /instalar.
---

# /instalar — Instalação inicial do ViperOS

Primeiro comando depois de clonar. Não pode falhar e não pode soar burocrático. Trata como conversa de descoberta — uma pergunta por vez, escuta de verdade, sem enfileirar tudo.

**A pasta que ele clonou já é o workspace dele.** Nada a mover, nada a copiar: as skills já estão em `.claude/skills/`, os moldes em `templates/`. A instalação preenche a memória e adapta o `CLAUDE.md` ao negócio.

---

## Abertura — antes de qualquer coisa

Primeira coisa na tela, antes de rodar comando, conferir pasta ou perguntar
qualquer coisa. Imprimir **exatamente** este bloco, dentro de um bloco de código
pra fonte monoespaçada:

```
  BEM-VINDO AO

  ██╗   ██╗██╗██████╗ ███████╗██████╗      ██████╗ ███████╗
  ██║   ██║██║██╔══██╗██╔════╝██╔══██╗    ██╔═══██╗██╔════╝
  ██║   ██║██║██████╔╝█████╗  ██████╔╝    ██║   ██║███████╗
  ╚██╗ ██╔╝██║██╔═══╝ ██╔══╝  ██╔══██╗    ██║   ██║╚════██║
   ╚████╔╝ ██║██║     ███████╗██║  ██║    ╚██████╔╝███████║
    ╚═══╝  ╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝     ╚═════╝ ╚══════╝

  O sistema operacional do seu negócio — Desenv. por: Vert Systems

  Vou te fazer algumas perguntas sobre seu projeto ou negócio.
  Leva poucos minutos, e você terá um cérebro digital funcionando.
```

**Não mexer no desenho.** Cada linha tem largura calculada (66 colunas no total,
cabe em terminal de 80). Reindentar, "arrumar" espaço ou trocar caractere
desalinha o traçado das letras — e desalinho de um caractere só já estraga.

Depois de imprimir, seguir direto pra Fase 0 sem comentar o banner.

---

## Fase 0 — Preparar o terreno (rápido, sem perguntar nada)

### 1. Conferir onde está

Rodar `pwd` e `ls`. A pasta deve ter `.claude/skills/`, `templates/` e `CLAUDE.md`. Se não tiver, o usuário está na pasta errada — perguntar onde ele clonou.

Se `_memoria/` já existir preenchido, é reinstalação: perguntar se refaz do zero, complementa o que falta, ou se ele queria atualizar o sistema (`/atualizar-sistema`).

### 2. Criar o mínimo

- `_memoria/empresa.md`, `preferencias.md`, `estrategia.md` — copiar os moldes de `templates/memoria/`
- `.env` — copiar de `.env.example` (não pedir chave nenhuma agora)

**Não criar** `conteudo/`, `site/`, `propostas/`, `identidade/`, `dados/` nem qualquer outra. Elas nascem quando a primeira peça daquele tipo for feita.

### 3. Separar o repositório dele do repositório do ViperOS

O clone veio apontando pro repositório do produto. Renomear esse endereço, pra ele poder ter o repositório dele depois **e** continuar recebendo atualização:

```bash
git remote rename origin viperos 2>/dev/null
```

Se der erro (ele baixou o zip em vez de clonar), tudo bem — seguir. O `/atualizar-sistema` funciona nos dois casos.

---

## Fase 1 — Escolha do perfil

Perguntar qual perfil combina com o negócio:

1. **Empreendedor solo / criador de conteúdo** — uma pessoa, marca pessoal e negócio misturados
2. **Freelancer** — atende clientes, organiza por projeto/cliente
3. **Agência / consultoria** — equipe pequena entregando pra vários clientes
4. **Empresa** — empresa estabelecida com setores

A resposta define duas coisas:
- Qual template de `CLAUDE.md` aplicar (`templates/perfis/claude-md-<perfil>.md`)
- **Qual convenção de pastas** vale (ver `templates/estrutura.md`):
  - Empreendedor solo e Empresa → **por tipo de entrega** (`conteudo/`, `site/`, `propostas/`)
  - Freelancer e Agência → **por cliente** (`clientes/<Nome>/conteudo/`)

Explicar a escolha em uma linha, sem jargão:

> "Como você atende clientes, vou organizar por cliente: cada um ganha uma pasta com o trabalho dele dentro. Se preferir organizar por tipo de entrega, me fala."

---

## Fase 2 — Entrevista

Perguntas em ordem, esperando a resposta de cada uma. Resposta vaga: repetir uma vez pedindo concretude e seguir com o que vier.

**Sobre o negócio:**
1. "Como você chama o que você faz? (nome da empresa, ou seu nome se for marca pessoal)"
2. "O que sua empresa entrega, em uma frase do jeito que você falaria pro vizinho?"
3. "Quem te paga? (perfil de cliente real — uma ou duas frases, sem persona genérica)"
4. "Você toca sozinho ou tem equipe? Se tem, quantos e cada um fazendo o quê?"

**Sobre contato:**
5. "Me passa os canais do negócio, o que tiver: site, WhatsApp, telefone, e-mail comercial, @ do Instagram, endereço e a região que você atende. O que não existir, só fala 'não tenho'."

> Esses dados alimentam CTA de carrossel, extensão de chamada do Google Ads, assinatura de e-mail e rodapé de proposta. Sem eles, o sistema para no meio pra perguntar.

**Sobre voz:**
6. "Me cola um exemplo da tua escrita — uma legenda do Insta, um e-mail pra cliente, qualquer coisa real e recente. Assim eu calibro o jeito de escrever sem precisar adivinhar."
7. "O que te dá ranço quando alguém escreve assim? (ex: 'vamos juntos!', emoji em e-mail formal, 'caro cliente', 'alavancar', 'sinergia')"

**Sobre foco:**
8. "Qual o gargalo do teu negócio hoje? O que tá segurando ele de crescer?"
9. "Se eu pudesse tirar UMA coisa que você repete toda semana das tuas costas, qual seria?"

**Sobre identidade visual:**
10. "Tem identidade visual definida ou tá no zero? Se tem, me passa as cores principais e a fonte."
11. "Tem logo? Se sim, me manda o arquivo que eu guardo no lugar certo."

---

## Fase 3 — Preencher a memória

### `_memoria/empresa.md`
Respostas 1-4 e 5 (bloco "Contato e canais"). Campo que ele não tem: deixar vazio, não inventar.

### `_memoria/preferencias.md`
Respostas 6-7:
- **Tom de voz:** derivado do exemplo real da 6
- **O que evitar:** lista direta da 7
- **Exemplo de escrita real:** colar o texto da 6 literalmente — é a régua mais confiável do sistema

### `_memoria/estrategia.md`
Respostas 8-9: fase, gargalo, "pra tirar das costas" (candidata a virar skill via `/mapear-rotinas`), prioridade principal derivada do gargalo, contexto com prazo em data absoluta.

### Identidade visual (só se houver material)
Se ele passou cores/fontes/logo, **agora** criar `identidade/` e preencher o `design-guide.md` (molde em `templates/identidade/`). Logo vira `identidade/logo.<ext>`.

Se não tem nada, **não criar a pasta**. Avisar:

> "Você não tem identidade definida ainda, então nem criei a pasta. Quando quiser,
> é só falar 'monta minha identidade visual' — eu monto a paleta, a tipografia e os
> tokens com contraste validado. E se não souber por onde começar, eu proponho 3
> direções pra você escolher."

### `CLAUDE.md`
Pegar `templates/perfis/claude-md-<perfil>.md`, adaptar com as respostas, e **substituir o `CLAUDE.md` da raiz**. Precisa conter:

- Contexto do negócio (nome, o que faz, cliente, equipe)
- Tom de voz (resumo — o detalhe fica em `_memoria/preferencias.md`)
- **Seção "Onde salvar o que"** com a convenção escolhida na Fase 1
- **Regra de criação sob demanda:** "criar pasta só quando a primeira peça daquele tipo for feita"
- As regras de operação do sistema — copiar do `CLAUDE.md` original (contexto, aprender com correções, manter atualizado, criação de skills, segredos, qualidade da saída, execução). **Nunca jogar essas regras fora**

---

## Fase 4 — Resumo

```
Pronto. Instalado em: <caminho>

✓ Memória do negócio em _memoria/
✓ CLAUDE.md com o seu contexto e a convenção de pastas ([por tipo | por cliente])
✓ Marca: [identidade/ criada | ainda no zero]

As outras pastas nascem conforme você for usando: fizer um carrossel, nasce
conteudo/; fizer uma página, nasce site/.
```

---

## Fase 5 — Renomear a pasta

A pasta ainda se chama `viperos`. Ela é o negócio dele agora:

Gerar o slug do nome da empresa (minúsculas, sem acento, espaço vira hífen). Ex: "Padaria São João" → `padaria-sao-joao`.

> "Última coisa: a pasta ainda tá com o nome do sistema (`viperos`). Ela é o seu
> negócio agora, então vale renomear pra `<slug>`.
>
> Fecha o VS Code, renomeia no Finder (ou Explorer) e abre de novo — leva 10 segundos.
> Ou, se preferir deixar como está, funciona igual."

Isso é o único momento em que faz sentido fechar o editor, e é opcional — nada quebra se ele não renomear.

---

## Fase 6 — Mostrar que está funcionando

Não terminar com instrução. **Demonstrar**, na mesma conversa: rodar o `/abrir` e mostrar o resumo do negócio já carregado da memória, ou — se ele mencionou dor de conteúdo — dar 3 pautas concretas do nicho dele.

Depois:

> "Tá tudo de pé. E você não precisa decorar comando nenhum: fala o que quer em
> português — 'faz um carrossel sobre X', 'quanto eu cobro por isso', 'minha página
> não converte' — que eu sei o que fazer.
>
> Se quiser ver as opções, pergunta 'o que eu faço agora?'.
>
> Você mencionou que repete '<resposta da 9>' toda semana. Quando quiser tirar isso
> das costas, é só falar que eu transformo numa skill sua."

Mencionar também, em uma linha: guardar o trabalho no GitHub é só pedir; e quando sair versão nova do ViperOS, falar "atualiza o sistema".

---

## Regras

- **Não inventar dados.** Resposta vaga fica registrada como veio, ou como `[a confirmar]` visível
- **Dado de contato tem que ser confirmado antes de virar fato.** DDD, número de WhatsApp e e-mail vão pra dentro de CTA, anúncio e PDF — errar um dígito mata todo clique. Se houver qualquer dúvida (o DDD não bate com a cidade que ele disse, o número tem contagem estranha), gravar como `[a confirmar]` e abrir item no `tarefas.md`. Em teste real o DDD entrou como fato e se espalhou por 9 arquivos e um PDF
- **Não pedir chave de API nenhuma.** Setup de integração é assunto da skill que precisa dela
- **Não criar pasta vazia.** Só `_memoria/`, `.env` e (se houver marca) `identidade/`
- Ao substituir o `CLAUDE.md`, **preservar as regras de operação do sistema**
- Não escrever "este arquivo será preenchido pelo /instalar" nos arquivos finais
- 5-7 minutos no máximo. Se o usuário enrolar numa pergunta, registrar o que tem e seguir
- **Nunca pedir pro usuário fechar o editor**, exceto na Fase 5 (renomear a pasta), que é opcional
- Ao terminar, deixar claro que ele fala em português — sem barra, sem comando decorado
