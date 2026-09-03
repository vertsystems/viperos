# Desenhar a API

Referência da skill `/backend`. Endereço, status, erro, paginação, versão e documentação.

---

## O contrato antes do código

Passo obrigatório, e o primeiro. Antes de gerar código, escreva num arquivo a resposta exata que
cada rota devolve: nome de campo de verdade, valor de exemplo, e o erro também. Quem vai consumir
lê e aprova. Só então o servidor é escrito para produzir aquilo. Quatro partes:

- **A URL** de cada recurso
- **A chave pública** que identifica o recurso na URL
- **O formato de entrada e o de saída**: nome, tipo, obrigatoriedade e formato de cada campo
- **O status de cada caminho**, o que dá certo e cada jeito de dar errado

Contrato tirado do código chega tarde: a resposta muda numa alteração qualquer, e quem descobre é
o cliente que parou de funcionar. Escrito antes, a tela nasce antes do servidor.

## REST — o padrão que resolve quase tudo

### Endereço é substantivo, verbo é o método

```
GET    /api/v1/clientes           lista
GET    /api/v1/clientes/123       um
POST   /api/v1/clientes           cria
PATCH  /api/v1/clientes/123       altera parte
PUT    /api/v1/clientes/123       substitui inteiro
DELETE /api/v1/clientes/123       remove

GET    /api/v1/clientes/123/pedidos   os pedidos daquele cliente
```

Evitar:

```
GET  /api/v1/getCliente?id=123    verbo na URL, método sem significado
POST /api/v1/criarCliente         idem
GET  /api/v1/cliente-pedidos      relação obscura
```

Plural sempre, minúsculas, hífen quando precisar de duas palavras.

### Status HTTP com significado

O status é a primeira informação que qualquer cliente lê. Devolver 200 com `{"erro": ...}`
dentro quebra todo tratamento automático.

| Código | Significa |
|---|---|
| `200` | Deu certo (GET, PATCH, PUT) |
| `201` | Criou (POST) — devolver o recurso e o cabeçalho `Location` |
| `204` | Deu certo e não há o que devolver (DELETE) |
| `400` | A requisição está malformada |
| `401` | Não sei quem você é (falta ou expirou credencial) |
| `403` | Sei quem você é, e você não pode isso |
| `404` | Não existe |
| `409` | Conflito (e-mail já cadastrado, versão desatualizada) |
| `422` | Entendi a requisição, mas o conteúdo é inválido |
| `429` | Excedeu o limite de requisições |
| `500` | Erro nosso |
| `503` | Fora do ar temporariamente |

A diferença entre **401 e 403** é a que mais se erra. 401 é identidade. 403 é permissão.

### Formato de erro igual em toda a API

```json
{
  "erro": {
    "codigo": "VALIDACAO",
    "mensagem": "Dados inválidos",
    "detalhes": [
      { "campo": "email", "mensagem": "Formato de e-mail inválido" },
      { "campo": "idade", "mensagem": "Deve estar entre 18 e 120" }
    ],
    "momento": "2026-08-20T12:00:00Z"
  }
}
```

- **Código estável** pra ser tratado por programa; **mensagem** pra ser lida por gente
- **Apontar o campo** que falhou — sem isso, o formulário do outro lado não consegue marcar o erro
- **Nunca vazar detalhe interno** (nome de tabela, stack trace, caminho de arquivo) na resposta. Isso vai pro log

### Paginação — sempre, com teto

Listagem sem limite é incidente marcado. Ele acontece no dia em que a tabela crescer.

```
GET /api/v1/clientes?pagina=2&limite=50
```

```json
{
  "dados": [ ... ],
  "paginacao": { "pagina": 2, "limite": 50, "total": 1234, "paginas": 25 }
}
```

- Limite padrão (50) e limite máximo (200) aplicados no servidor, ignorando o que vier maior
- Lista que cresce rápido e é lida em tempo real pede paginação por cursor, não por número de página: com página, item novo no topo desloca tudo e o usuário vê registro repetido

### Filtro e ordenação

```
GET /api/v1/pedidos?status=aberto&ordenar=-criado_em&limite=20
```

Aceitar **só campos de uma lista permitida** para filtro e ordenação. Repassar o que veio
direto pro SQL ou pro ORM é injeção com outro nome.

### Versão desde o primeiro dia

`/api/v1/` na URL. Custa nada agora, e evita quebrar o app de alguém depois. Mudança que
quebra compatibilidade vira `/v2/`, com a `/v1/` viva por um período combinado.

O que **não** quebra compatibilidade: adicionar campo na resposta, adicionar parâmetro
opcional. O que quebra: remover ou renomear campo, mudar tipo, tornar obrigatório o que
era opcional, mudar significado de status.

### Idempotência no que cobra

Requisição de pagamento que o cliente reenvia por causa de internet ruim não pode cobrar
duas vezes. O padrão: o cliente manda um cabeçalho `Idempotency-Key` único; o servidor
guarda a resposta da primeira vez e devolve a mesma para a chave repetida.

### A chave pública não é a chave do banco

O identificador que aparece na URL é contrato. O `id` da tabela é infraestrutura. Se coincidirem,
que seja decisão escrita: trocar de banco não pode ser sentido por quem consome.

### Conflito de cadastro devolve para onde ir

Cadastro duplicado é o defeito mais comum de base de cliente, e tem dois desfechos ruins: nasce a
segunda ficha do mesmo CPF, ou a violação de chave única do banco vaza como 500 com o nome da
tabela dentro. Conferir antes de gravar, e apontar quem já ocupa a chave:

```http
HTTP/1.1 409 Conflict
Location: /api/v1/clientes/123
```

Com o endereço na resposta, a tela abre a ficha existente. Sem ele, o atendente cadastra de novo
com um ponto a mais no CPF.

### DELETE é remoção lógica

`DELETE /api/v1/clientes/123` significa "sai do GET", não "apaga a linha". No banco, marcar
`removido_em` e guardar o registro (`templates/backend/dados.md`, seção "O básico que evita a
maior parte da dor"). O dono apaga o cliente errado numa terça, e desfazer é um `UPDATE`. O preço
é disciplina: toda consulta filtra o removido, e esquecer um filtro faz o registro apagado
reaparecer numa listagem. Apagar de verdade, só quando a lei exigir.

---

## Documentação

Uma API sem documentação é uma API que só o autor usa.

- **OpenAPI/Swagger** é o padrão. FastAPI e NestJS geram a partir do próprio código — quando gerada do código, ela não fica desatualizada
- O mínimo aceitável, quando não há geração automática: um `API.md` com cada endpoint, um exemplo de requisição e um de resposta, incluindo o erro
- Documentar o formato de erro **uma vez**, já que ele é igual em todos os endpoints

---

## GraphQL — quando compensa

**Compensa quando:** clientes muito diferentes (app, web, parceiro) precisam de recortes
diferentes do mesmo dado, e a quantidade de endpoints específicos está explodindo.

**O que ele traz de problema junto:**
- **N+1 por natureza** — cada campo relacionado vira consulta. Precisa de `DataLoader` pra agrupar
- **Cache HTTP deixa de funcionar** — tudo é POST na mesma URL
- **Consulta cara** — sem limite de profundidade e de complexidade, um cliente derruba o servidor com uma consulta aninhada
- Tratamento de erro e autorização ficam por campo, não por rota

Em sistema de pequeno negócio, REST bem feito quase sempre é a resposta melhor.

## gRPC — quando compensa

Comunicação entre serviços internos, com contrato forte (Protocol Buffers), código gerado
dos dois lados e streaming bidirecional. Não funciona direto no navegador (precisa de
gRPC-Web) e a depuração é menos óbvia, não se lê a requisição com `curl`.

**Compensa quando:** existem vários serviços internos conversando em volume. Se existe um
serviço só, não há caso.

---

## A API que o sistema consome

Metade da integração não é a API que você publica. É a do gateway de pagamento, do WhatsApp, da
nota fiscal, do ERP. É aí que o sistema pequeno mais quebra: o outro lado muda sem avisar.

**Uma classe por fornecedor.** A chamada ao terceiro fica num arquivo só, com um modelo de
resposta escrito nas palavras do seu negócio. O JSON dele é traduzido na entrada e não passa dali.
Quando `status_transacao` virar `transaction_status`, muda uma linha, não trinta.

**Toda retentativa tem teto.** Cliente que reenvia enquanto receber erro transforma a falha de dez
segundos do fornecedor em queda geral da sua. Prazo, espera crescente e plano B estão em
`templates/backend/arquitetura.md`, seção "Quando algo de fora falha".

**Webhook, três regras nessa ordem.** Conferir a assinatura do corpo com o segredo combinado antes
de ler qualquer campo, senão o endereço vira um botão público de confirmar pagamento. Guardar o
corpo cru e descartar evento cujo id já veio antes. Responder na hora e processar em fila:
processar dentro da resposta estoura o prazo do fornecedor, e a cobrança entra duas vezes.

**Arquivo de troca nomeia o campo.** CSV posicional quebra calado: o parceiro tira uma coluna do
meio e a cidade passa a guardar o estado, sem erro nenhum. Quando o outro lado exige CSV, a
conferência do cabeçalho a cada carga está em `templates/backend/importacao.md`.

---

## Antes de entregar a API

- [ ] Todo endpoint valida a entrada no servidor
- [ ] Toda listagem tem limite aplicado no servidor
- [ ] Formato de erro igual em todos os endpoints, sem vazar detalhe interno
- [ ] 401 e 403 usados com o significado certo
- [ ] Versão na URL
- [ ] Limite de requisição no que é público, e mais apertado no login
- [ ] CORS restrito aos domínios que precisam — nunca `*` em produção
- [ ] Documentação existente e conferida contra o código
- [ ] Registro de quem fez o quê no que é sensível (dinheiro, permissão, dado pessoal)
- [ ] Contrato escrito e aprovado antes do código, e a resposta real conferida contra ele
- [ ] Criação com chave já ocupada responde 409 com o `Location` do registro existente
- [ ] Webhook confere assinatura, descarta evento repetido e processa fora da resposta
