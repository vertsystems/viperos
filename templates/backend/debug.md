# Investigar defeito

Referência da skill `/backend`. O método, o que registrar, e os cinco problemas que
respondem pela maior parte dos chamados.

---

## O método

1. **Ler a mensagem de erro inteira.** Não a primeira linha: a inteira, incluindo a causa
   encadeada. Ela quase sempre diz onde é
2. **Reproduzir.** Depurar sem reproduzir é adivinhar. Se só acontece em produção, o
   próximo passo é descobrir o que difere — dado, volume, configuração, concorrência
3. **Isolar.** Cortar o problema no meio: a falha está antes ou depois desse ponto? Repetir
   até sobrar o trecho que falha
4. **Conferir a suposição.** "Isso deveria funcionar" não é diagnóstico. Imprimir o valor
   e olhar. Metade dos defeitos é uma suposição errada sobre o que uma variável contém
5. **Consertar uma coisa por vez.** Mudar cinco coisas e ver funcionar não é conserto — é
   coincidência não investigada, e ela volta
6. **Escrever o teste** que pega esse defeito. Sem isso, ele reaparece
7. **Anotar** em `DECISOES.md` quando a causa foi estrutural

---

## Log que serve pra investigar

### Estruturado, com contexto

```typescript
import pino from 'pino';
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

logger.info({ clienteId, acao: 'login' }, 'Cliente entrou');

try {
  await cobrar(pedido);
} catch (err) {
  logger.error({ err, pedidoId: pedido.id, valor: pedido.total }, 'Falha ao cobrar');
}
```

Log em JSON com campo dá pra filtrar (`pedidoId=123`). Log em texto corrido só dá pra ler
com os olhos — e ninguém lê dez mil linhas.

### Identificador de requisição

Gerar um id no começo de cada requisição e carregá-lo em todo log dela. É o que permite
pegar um erro do cliente e reconstruir exatamente o que aconteceu naquela requisição.

### Níveis

| Nível | Pra quê |
|---|---|
| `debug` | Detalhe de desenvolvimento (SQL, acerto de cache). Desligado em produção |
| `info` | Evento normal do negócio (pedido criado, login) |
| `warn` | Algo estranho que não quebrou (repetição bem-sucedida, uso de recurso obsoleto) |
| `error` | Quebrou. Precisa de alguém olhando |

### O que nunca vai pro log

Senha, token, cartão, CPF de terceiro, corpo inteiro de requisição em produção. Log vaza:
vai pra terceiro, fica em disco, aparece em captura de tela.

---

## Os cinco problemas mais comuns

### 1. Consulta lenta

```sql
EXPLAIN ANALYZE SELECT * FROM pedidos
WHERE cliente_id = 123 ORDER BY criado_em DESC LIMIT 10;
```

`Seq Scan` numa tabela grande = varredura completa. Criar o índice que a consulta pede e
rodar de novo, comparando o tempo real.

Ligar o registro de consulta lenta no Postgres para descobrir quais são, em vez de chutar:

```sql
ALTER DATABASE app SET log_min_duration_statement = 500;  -- registra o que passa de 500ms
```

### 2. N+1

Sintoma: a página está aceitável com dez registros e insuportável com quinhentos.

Ligar o log de SQL do ORM e contar as consultas de **uma** requisição. Se o número cresce
com o tamanho da lista, é N+1. Conserto: carregar o relacionado junto (`include`, `join`,
`DataLoader`).

### 3. Pool de conexão esgotado

Sintoma: as requisições penduram, e o banco mostra conexões no máximo.

```typescript
// ✖ pega a conexão e nunca devolve quando dá erro no meio
const client = await pool.connect();
const r = await client.query('SELECT ...');
return r.rows[0];

// ✔ devolve sempre
const client = await pool.connect();
try {
  const r = await client.query('SELECT ...');
  return r.rows[0];
} finally {
  client.release();
}

// ✔ melhor: usar o pool direto, que devolve sozinho
const { rows } = await pool.query('SELECT ...');
```

Outra causa frequente: chamada externa sem prazo máximo dentro de uma transação. A
transação fica aberta esperando um serviço lento e segura a conexão.

### 4. Memória crescendo até cair

Sintomas: memória sobe sem voltar, fica lento, e o processo morre.

```typescript
// ✖ cache global sem limite: cresce pra sempre
const cache = new Map();

// ✔ com teto e validade
import { LRUCache } from 'lru-cache';
const cache = new LRUCache({ max: 1000, ttl: 1000 * 60 * 60 });
```

Outra causa clássica: ouvinte de evento registrado e nunca removido — ele mantém viva a
referência ao objeto inteiro.

Para confirmar: tirar duas fotos da memória (heap snapshot) com intervalo e comparar o que
cresceu.

### 5. Condição de corrida

Sintoma: acontece "às vezes", nunca na sua máquina, e some quando você adiciona um log.

```typescript
// ✖ dois pedidos simultâneos leem o mesmo saldo e gravam por cima
const saldo = await lerSaldo(contaId);
await gravarSaldo(contaId, saldo - valor);

// ✔ deixar o banco resolver, com trava de linha
await db.transaction(async (trx) => {
  const conta = await trx('contas').where({ id: contaId }).forUpdate().first();
  if (conta.saldo < valor) throw new SaldoInsuficiente();
  await trx('contas').where({ id: contaId }).update({ saldo: conta.saldo - valor });
});

// ✔ ou operação atômica, quando cabe
await redis.incr('contador');
```

Regra: **ler-modificar-gravar em duas etapas é corrida esperando acontecer.** Ou é uma
operação atômica, ou está dentro de transação com trava.

---

## Ferramentas por linguagem

```bash
# Node.js — depurador com o Chrome
node --inspect-brk dist/main.js       # abrir chrome://inspect

# Node.js — onde o tempo é gasto
npx clinic doctor -- node dist/main.js

# Python
python -m pdb script.py               # ou: breakpoint() no código
python -m cProfile -s cumtime script.py

# Go
dlv debug ./cmd/api

# HTTP — ver a requisição inteira
curl -v -X POST http://localhost:3000/api/v1/clientes \
  -H 'Content-Type: application/json' -d '{"email":"a@b.com"}'

# Quanto tempo o endpoint leva
curl -s -o /dev/null -w "%{time_total}s\n" http://localhost:3000/api/v1/pedidos
```

`console.log` bem colocado continua sendo uma ferramenta legítima. O que não vale é
adivinhar sem olhar valor nenhum.

---

## Quando o problema é só em produção

- **O que mudou?** Publicação recente, migração, mudança de configuração, atualização de
  dependência. Comece por aí — a resposta está aí na maioria das vezes
- **Dado.** Produção tem caso que desenvolvimento não tem: campo nulo antigo, acento,
  registro de 2019 com formato diferente
- **Volume e concorrência.** Corrida e esgotamento de pool só aparecem com gente usando ao
  mesmo tempo
- **Configuração.** Variável de ambiente faltando, fuso diferente, limite de memória menor

Comparar com a linha de base: estava assim ontem? Sem histórico de métrica, não dá pra
responder — e essa é a maior razão pra ter monitoramento antes de precisar.

---

## Depois do conserto

- [ ] Teste que reproduz o defeito, e que falhava antes
- [ ] Verificado em produção, não só localmente
- [ ] Causa anotada, se foi estrutural
- [ ] Se o mesmo defeito já apareceu antes de outra forma, o conserto foi na causa e não no sintoma
