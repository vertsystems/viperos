# Estrutura do workspace

Referência única de onde cada coisa é salva. O `/instalar` escolhe uma das duas convenções conforme o perfil e registra a escolha no `CLAUDE.md` do workspace. Toda skill consulta esse arquivo (ou o `CLAUDE.md`) antes de criar pasta.

## Princípio

**Nada é criado antes de ser necessário.** O workspace começa com o `CLAUDE.md`, a `_memoria/` e as pastas do sistema. Cada pasta de trabalho nasce na primeira vez que uma skill precisa dela.

As pastas do sistema (`.claude/skills/`, `templates/`, `scripts/`) convivem na mesma raiz. O `/atualizar-sistema` substitui só elas quando sai versão nova — o trabalho nunca é tocado.

---

## Convenção A — por tipo de entrega

Aplicada aos perfis **empreendedor solo** e **empresa**: um negócio só, várias frentes.

```
MeuNegocio/
├── CLAUDE.md              contexto e regras (criado pelo /instalar)
├── _memoria/              empresa, preferencias, estrategia, publico, oferta
├── .claude/skills/        as skills instaladas
│
├── identidade/            marca — design-guide, tokens.css, marca.md, logo
├── conteudo/              pautas.md, calendario-<AAAA-MM>.md, indice.md
│   └── <tipo>-<tema>-<AAAA-MM-DD>/    peças do /carrossel e /publicar-tema
├── pesquisa/              dossiês do /pesquisa
├── site/                  páginas do /landing
├── materiais/             e-books e apostilas do /documento
├── apresentacoes/         decks do /apresentacao
├── propostas/             propostas do /proposta
├── oferta/                desenho da oferta e estudo de preço (/oferta, /preco)
├── vendas/                roteiros de conversa de venda (/vender)
├── imprensa/              pautas, contatos e clipping (/imprensa)
├── seo/                   os 8 arquivos do /seo
├── campanhas/             CSVs do /anuncio-google + relatorios/ do /relatorio-ads
├── analises/              saídas do /analisar-dados
├── emails/                rascunhos longos do /email-profissional
├── revisoes/              fechamentos do /revisao-semanal
├── dados/                 drop zone: arquivo que você joga aqui pra ser lido
├── scripts/               utilitários e o Playwright (ver templates/scripts.md)
├── biblioteca.md          índice de ativos reutilizáveis
├── tarefas.md             pipeline
│
```

> As pastas `design/` e `copy/` são as **bibliotecas de referência**: conhecimento
> que várias skills consultam, mantido num lugar só. Editar lá muda o
> comportamento de todas as skills que dependem daquilo — é o jeito de calibrar
> o sistema inteiro sem tocar em 38 arquivos.

## Convenção B — por cliente

Aplicada aos perfis **freelancer** e **agência**: o trabalho é organizado por quem paga.

```MinhaAgencia/
├── CLAUDE.md
├── _memoria/
├── .claude/skills/
│
├── identidade/            marca PRÓPRIA (da agência)
├── clientes/
│   └── <Nome>/
│       ├── briefing.md
│       ├── identidade/    marca DO CLIENTE — tem precedência nas peças dele
│       ├── conteudo/
│       ├── pesquisa/
│       ├── site/
│       ├── seo/
│       ├── campanhas/
│       ├── materiais/
│       ├── apresentacoes/
│       └── propostas/
│
├── propostas/             prospects que ainda não são clientes
├── conteudo/              conteúdo próprio da agência
├── analises/
├── emails/
├── revisoes/
├── dados/
├── biblioteca.md
├── tarefas.md
│
```

**Regra de decisão no perfil B:** trabalho de cliente vai em `clientes/<Nome>/`; trabalho da própria casa vai na raiz. Em dúvida, perguntar de quem é a peça.

---

## Como as skills usam isso

Toda skill que gera arquivo segue este padrão:

1. Ler a convenção ativa no `CLAUDE.md` do workspace (seção "Onde salvar o que")
2. Montar o caminho conforme a convenção
3. Criar a pasta **só nesse momento**, se ainda não existir
4. Nunca criar pasta "de antemão pra organizar melhor"

Quando a peça é de cliente e a convenção é B, o caminho recebe o prefixo `clientes/<Nome>/`. O resto do caminho é idêntico nas duas convenções — é isso que mantém as skills simples.

## Versionamento

O `.gitignore` que vem no repositório ignora `.env`, `node_modules/` e a drop zone `dados/`. O resto — inclusive as skills e os templates — versiona junto com o trabalho.

O `/salvar` cria o repositório **dele** (o endereço do ViperOS fica guardado como `viperos`, e é de lá que o `/atualizar-sistema` busca versão nova).
