# Dados — modelar, consultar, acelerar

Referência da skill `/backend`. Modelagem, índice, consulta lenta, cache e escala.

Consulta que responde e devolve número errado sem dar erro: `templates/backend/consultas.md`.

---

## Modelar antes de escrever código

Erro de modelagem é o mais caro do sistema, quando ele aparece, já tem dado dentro, e
consertar vira migração com risco.

### O básico que evita a maior parte da dor

- **Uma tabela por entidade real do negócio.** Cliente, pedido, item do pedido — nomes que o dono do negócio reconhece
- **Chave estrangeira declarada**, não convenção mental. O banco impede pedido órfão melhor que qualquer código
- **Dinheiro em inteiro de centavos ou `numeric`.** Nunca `float`/`double`: 0,1 + 0,2 não dá 0,3 em ponto flutuante, e a diferença aparece na soma do mês
- **Data com fuso** (`timestamptz`). Guardar em UTC e converter na exibição
- **`criado_em` e `atualizado_em` em tudo.** Dois campos que respondem metade das investigações futuras
- **Remoção lógica** (`removido_em`) no que o negócio depende. Recuperar vira um `UPDATE`, não um chamado com restauração de backup
- **Restrição no banco**: `NOT NULL`, `UNIQUE`, `CHECK`. Validação no código é a primeira linha; a do banco é a que sobra quando alguém roda um script na mão

### Normalizar ou duplicar

Comece normalizado: cada informação num lugar só. Duplicar dado por desempenho é uma
decisão consciente, tomada **depois** de medir, e que traz junto a obrigação de manter as
cópias em dia. Duplicar por preguiça de desenhar gera divergência silenciosa.

**Exceção legítima e comum:** valor histórico. O preço do produto no momento da venda é
copiado pro item do pedido de propósito: se o produto mudar de preço amanhã, o pedido
antigo não pode mudar junto.

### Nome de tabela e de coluna

**Nomeie pelo conceito, não pelo papel do primeiro caso de uso.** A tabela nasce
`vendedores` porque a primeira tela era a de vendas. Seis meses depois entra a folha, e as
mesmas pessoas existem em duas tabelas, ou alguém renomeia entidade em produção. O nome era
`funcionarios`, com o papel como coluna ou como ligação. Pergunte qual é o próximo módulo
previsível, e se ele traz os mesmos registros com outro nome.

**Nome por extenso, sem sigla.** `dt_vcto` e `tp_mv` obrigam a abrir o código pra saber o
que a coluna guarda. E o nome diz de quê, não a categoria: `data` vira `data_vencimento`.
Duas colunas `data` na mesma tabela: trocar uma pela outra não dá erro nenhum.

### Tirar as tabelas do que o dono falou

O modelo sai da descrição do negócio, não da tela:

1. Peça um parágrafo com as palavras dele sobre o que o sistema precisa fazer
2. **Substantivo é tabela candidata** (cliente, produto, venda, pagamento); **verbo é
   operação** (cadastrar, cancelar, calcular o total)
3. Acrescente o que o processo exige e o parágrafo não cita: endereço, forma de pagamento
4. Diga a frase em voz alta antes de criar subtipo. "Pedido é um cliente?" é falso. Ele
   **tem** um cliente, e isso é ligação, não herança
5. **Referência antes de movimento.** Cliente, produto e funcionário existem antes de pedido
   e de venda, porque quem carrega a chave estrangeira é o movimento. A ordem em que você
   modela é a ordem em que se carrega dado depois

### Decisões que todo modelo enfrenta

**Apagou o pai, o que acontece com os filhos?** Decida relacionamento por relacionamento,
antes de declarar a chave:

| Escolha | Quando | O que custa |
|---|---|---|
| Bloquear (padrão) | O filho tem valor próprio: pedido do cliente, lançamento da conta | Excluir vira marcar inativo, e a tela precisa tratar o erro |
| Cascatear | O filho não existe sem o pai: item do pedido, anexo do documento | Uma exclusão inocente varre tabelas em cadeia, e não tem volta |
| Anular | A ligação é opcional: funcionário que perde o gerente | Sobra coluna vazia que toda consulta precisa tratar |

Antes de cascatear, liste todas as tabelas que apontam pra essa chave. Na dúvida, bloquear.

**Texto grande sai da tabela que mais cresce.** Observação longa, histórico de atendimento e
conteúdo de anexo dentro de `pedidos` fragmentam justamente a tabela que a consulta mais
varre. Vão pra tabela própria, ligados por chave. Descritivo curto de mesma granularidade,
como o número da nota, fica.

**Árvore de profundidade desconhecida se resolve com uma coluna.** Categoria com
subcategoria, plano de contas, organograma, pasta dentro de pasta: `pai_id` apontando pra
própria tabela. Coluna por nível (`nivel1`, `nivel2`, `nivel3`) quebra no dia em que alguém
precisa do quarto. A exceção é nível fixo, contado nos dedos e nomeado pelo negócio.

**Ficha que duas pessoas abrem junto nasce com coluna de versão.** Acrescentar depois é
migração em tabela com dado dentro. O sintoma está em `templates/backend/consultas.md`.

**Data pura e instante são tipos diferentes.** Vencimento, aniversário e competência são data
pura. Guardados como instante, o fuso empurra o dia pra trás e o boleto vence um dia antes.
Recuse data impossível já na entrada, com `CHECK`: nascimento em 2090 entra calado e só
aparece no relatório. Pra agrupar por mês, agrupe pela data truncada, nunca por texto
formatado.

---

## Índice

Índice é a diferença entre o banco varrer a tabela inteira e ir direto na linha.

```sql
-- coluna usada em WHERE
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);

-- combinação usada junto, na ordem em que a consulta filtra
CREATE INDEX idx_pedidos_cliente_data ON pedidos(cliente_id, criado_em DESC);

-- índice parcial: só o que interessa, menor e mais rápido
CREATE INDEX idx_pedidos_abertos ON pedidos(criado_em) WHERE status = 'aberto';
```

**Onde indexar:** colunas que aparecem em `WHERE`, em `JOIN` e em `ORDER BY`.

**Onde não indexar:**
- Tabela pequena — o banco varre mais rápido do que consulta o índice
- Coluna que muda a toda hora — todo `UPDATE` paga a manutenção do índice
- Coluna com pouquíssimos valores distintos (um booleano) — a não ser em índice parcial

**Como saber se resolveu:** medir, não supor.

```sql
EXPLAIN ANALYZE SELECT * FROM pedidos WHERE cliente_id = 123 ORDER BY criado_em DESC LIMIT 10;
```

`Seq Scan` numa tabela grande = varredura completa, falta índice. `Index Scan` = está
usando. Rodar antes e depois e comparar o tempo real.

---

## Pool de conexão

Abrir conexão com o banco é caro. O pool mantém um punhado aberta e reaproveita.

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                      // teto de conexões
  idleTimeoutMillis: 30000,     // fecha as ociosas
  connectionTimeoutMillis: 2000 // falha rápido em vez de pendurar
});

// usar o pool direto devolve a conexão sozinho
const { rows } = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
```

**Cuidado com o teto:** o banco tem limite de conexões (hospedagem barata costuma ter
poucas). Instâncias da aplicação × `max` não pode passar do limite do banco, senão o
sistema derruba a si mesmo em pico.

---

## O problema N+1

O defeito de desempenho mais comum e o mais fácil de não perceber: em desenvolvimento,
com dez registros, é imperceptível.

```typescript
// ✖ uma consulta pros pedidos, mais uma pra CADA cliente
const pedidos = await Pedido.findAll();
for (const pedido of pedidos) {
  pedido.cliente = await Cliente.findById(pedido.clienteId);  // N consultas
}

// ✔ uma consulta só, com junção
const pedidos = await Pedido.findAll({ include: [{ model: Cliente }] });
```

**Como detectar:** ligar o log de SQL do ORM e contar as consultas de **uma única**
requisição. Se o número cresce com a quantidade de itens da lista, é N+1.

---

## Cache

Cache resolve leitura repetida de dado que muda pouco. Não resolve consulta mal escrita —
só esconde o problema atrás de mais uma peça pra manter.

**Antes de cachear:** a consulta está lenta mesmo (medida)? O dado muda pouco? Dá pra
aceitar informação alguns segundos desatualizada? Se a resposta a alguma for não, o
conserto é índice ou consulta, não cache.

### Buscar no cache, cair no banco

```typescript
async function buscarCliente(id: string) {
  const cacheado = await redis.get(`cliente:${id}`);
  if (cacheado) return JSON.parse(cacheado);

  const cliente = await db.clientes.findById(id);
  await redis.setex(`cliente:${id}`, 3600, JSON.stringify(cliente)); // expira em 1h
  return cliente;
}
```

### Invalidar na escrita

```typescript
async function atualizarCliente(id: string, dados: DadosCliente) {
  const cliente = await db.clientes.update(id, dados);
  await redis.del(`cliente:${id}`);
  await redis.del(`cliente:${id}:pedidos`);  // e o que derivava dele
  return cliente;
}
```

**Regras de cache:**
- Sempre com prazo de validade. Cache eterno é dado errado esperando a hora de aparecer
- Chave com padrão previsível (`recurso:id:atributo`), pra dar pra invalidar em grupo
- Invalidar na escrita, sem exceção. Cache desatualizado gera o pior tipo de bug: o intermitente
- Nunca cachear dado de um usuário numa chave que outro possa ler. Vazamento por cache é vazamento

---

## Quando o banco não dá mais conta

Na ordem: cada degrau só depois de esgotar o anterior:

1. **Índice e consulta.** É aqui que está o problema na esmagadora maioria das vezes
2. **Cache** do que é lido muito e muda pouco
3. **Máquina maior.** Sem graça, mas é a solução mais barata em horas de trabalho
4. **Réplica de leitura** — relatório e consulta pesada saem da réplica, escrita continua na principal. Atenção: a réplica tem atraso; ler logo após escrever pode não ver o dado novo
5. **Partição** por período (arquivar movimento de anos anteriores)
6. **Sharding** — dividir o dado entre bancos. Complexidade alta, junção entre shards deixa de existir. Praticamente nunca é a resposta certa pra sistema de pequeno negócio

---

## Migração de banco

- Roda **antes** do código novo, e precisa funcionar com o código velho ainda no ar
- Toda migração tem volta atrás escrita e testada
- Testar com dado de verdade (cópia anonimizada), não com tabela vazia
- Coluna nova em tabela grande: adicionar como opcional primeiro, preencher em lotes, exigir depois. `ALTER TABLE` que reescreve tabela grande trava o sistema
- Backup **antes**, e confirmado — não "o provedor faz backup", mas o arquivo existindo
- Renomear ou remover coluna: só depois que nenhum código em produção a usa. Em duas etapas, nunca em uma

---

## Checagem antes de entregar

```bash
EXPLAIN ANALYZE <a consulta principal>;   # está usando índice?
# log de SQL ligado: quantas consultas por requisição? (N+1)
# a listagem tem LIMIT?
# dinheiro está em inteiro ou numeric?
# migração testada com dado, e com a volta atrás?
```
