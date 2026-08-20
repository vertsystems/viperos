# Testar, publicar e monitorar

Referência da skill `/backend`. O que testar quando o tempo é curto, como subir sem medo e
como saber que está no ar funcionando.

---

## Testar o que quebra caro

Cobertura alta não é o objetivo — sistema com cobertura alta e nenhum teste no fluxo de
pagamento está descoberto onde importa. A pergunta certa é: **o que, se quebrar, dói?**

### Ordem de prioridade quando o tempo é curto

1. **Dinheiro e dado crítico** — cobrança, cadastro, permissão. Esses merecem teste mesmo que nada mais tenha
2. **Migração de banco** — com dado dentro, e testando a volta atrás
3. **Endpoints principais** — resposta certa com entrada certa, erro certo com entrada errada
4. **O defeito recém-consertado** — todo conserto ganha um teste, senão ele volta

### Os três tipos, e a proporção

| Tipo | O que cobre | Proporção |
|---|---|---|
| **Unidade** | Uma função isolada. Rápido, roda aos milhares | A maioria |
| **Integração** | A rota de ponta a ponta com banco de teste de verdade | Uma parte relevante |
| **Ponta a ponta** | O fluxo pelo navegador | Poucos, só o caminho crítico |

A proporção usual (muitos de unidade, alguns de integração, poucos de ponta a ponta) existe
por causa do custo: teste de ponta a ponta é lento, frágil e caro de manter. Mas em API, o
teste de integração costuma ser o que dá mais segurança por hora investida — ele pega o
que o teste de unidade com tudo simulado não pega.

### Teste de unidade

```typescript
describe('calcularFrete', () => {
  it('cobra frete grátis acima de R$ 200', () => {
    expect(calcularFrete({ subtotal: 25000, cep: '01001000' })).toBe(0);
  });

  it('rejeita CEP inválido', () => {
    expect(() => calcularFrete({ subtotal: 5000, cep: '123' }))
      .toThrow('CEP inválido');
  });
});
```

Nome do teste descreve o comportamento, não a função. `deve cobrar frete grátis acima de
R$ 200` diz o que quebrou quando falha; `testa calcularFrete 2` não diz nada.

### Teste de integração

```typescript
describe('POST /api/v1/clientes', () => {
  beforeEach(async () => { await limparBanco(); });

  it('cria o cliente e devolve 201', async () => {
    const resp = await request(app)
      .post('/api/v1/clientes')
      .send({ email: 'ana@exemplo.com', nome: 'Ana' })
      .expect(201);

    expect(resp.body.id).toBeDefined();
    const salvo = await db.clientes.findOne({ email: 'ana@exemplo.com' });
    expect(salvo).toBeDefined();     // conferir que gravou mesmo
  });

  it('recusa e-mail inválido com 422', async () => {
    await request(app)
      .post('/api/v1/clientes')
      .send({ email: 'nao-e-email', nome: 'Ana' })
      .expect(422);
  });
});
```

Banco de teste de verdade, limpo entre os testes. Simular o banco esconde exatamente o tipo
de erro que se quer pegar (restrição violada, tipo errado, migração faltando).

### Teste de migração

```typescript
it('migra sem perder dado', async () => {
  await db.query(`INSERT INTO clientes (id, email) VALUES (1, 'ana@exemplo.com')`);
  await rodarMigracao('006-adiciona-telefone.sql');

  const { rows } = await db.query('SELECT * FROM clientes WHERE id = 1');
  expect(rows[0].email).toBe('ana@exemplo.com');
});

it('desfaz a migração', async () => {
  await rodarMigracao('006-adiciona-telefone.sql');
  await desfazerMigracao('006-adiciona-telefone.sql');
  // conferir que o schema voltou
});
```

### O que não pode existir

Teste que depende de ordem de execução, de relógio (`sleep`), de internet ou de dado que
sobrou do teste anterior falha sozinho — e treina todo mundo a ignorar o vermelho. Melhor
apagar do que conviver.

### Segurança na esteira

```bash
npm audit             # dependência com falha conhecida
npx semgrep --config auto src/   # padrão inseguro no código
```

---

## Empacotar

### Docker em dois estágios

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./

RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app                      # não rodar como root

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

Dois estágios porque a imagem final não precisa das ferramentas de build: fica menor, sobe
mais rápido e tem menos superfície de ataque.

### Docker Compose pro dia a dia

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://postgres:senha@db:5432/app
    depends_on: [db]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: senha
      POSTGRES_DB: app
    volumes: ["dados-postgres:/var/lib/postgresql/data"]

volumes:
  dados-postgres:
```

Um `docker compose up` e o projeto inteiro roda. É o que faz alguém novo conseguir começar
no primeiro dia.

### Kubernetes

Orquestra muitos containers em muitas máquinas. **Traz um time de operação junto** — não é
o caminho de sistema de pequeno negócio. Uma máquina com Docker Compose, ou uma
hospedagem gerenciada (Railway, Render, Fly.io, App Platform), atende muito mais tempo do
que parece, por uma fração do custo de atenção.

---

## Esteira de publicação

```yaml
name: CI

on:
  push: { branches: [main] }
  pull_request:

jobs:
  testar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm audit --audit-level=high
```

O mínimo que já vale: **em todo push, roda teste e lint**. Publicar só com a esteira verde.

---

## Publicar

### Antes da primeira vez

- [ ] Variável de ambiente separada por ambiente — desenvolvimento **nunca** aponta pro banco de produção
- [ ] **Backup automático testado**: restaurado uma vez de verdade, com o tempo anotado. Backup nunca restaurado é esperança, não backup
- [ ] `/health` respondendo se o banco está de pé
- [ ] Volta atrás conhecida: qual comando, quanto tempo leva
- [ ] Log indo pra algum lugar que dá pra procurar

### Estratégias

| Estratégia | Como funciona | Custo |
|---|---|---|
| **Substituição** | Derruba e sobe a versão nova | Tem indisponibilidade. Aceitável em sistema interno |
| **Azul-verde** | Dois ambientes; o tráfego troca de um pro outro | Sem indisponibilidade, volta instantânea. Paga infraestrutura em dobro |
| **Canário** | Fatia pequena do tráfego na versão nova, aumentando aos poucos | Detecta problema cedo. Exige monitoramento pra valer a pena |

**Chave de funcionalidade** (ligar/desligar por configuração) separa publicar de liberar: o
código sobe desligado e liga quando você quiser — e desliga sem novo deploy quando dá
problema. É o mecanismo mais barato que existe pra reduzir risco de publicação.

### Migração junto com deploy

Roda **antes** do código novo, e precisa funcionar com o código velho ainda no ar. Coluna
nova: opcional primeiro, preenchida em lote, obrigatória depois. Remoção de coluna: só
quando nenhum código em produção a usa mais. Em duas etapas, sempre.

---

## Monitorar

### O mínimo que resolve

1. **Log estruturado (JSON)** com contexto — quem, o quê, quanto demorou
2. **Rastreamento de erro** (Sentry serve, e tem plano gratuito) com stack trace e a requisição que causou
3. **Um alerta que chega em você** quando a taxa de erro sobe. E-mail já serve

Sem isso, quem descobre o problema é o cliente.

```typescript
import pino from 'pino';
const logger = pino();

logger.info({ pedidoId, clienteId, duracaoMs: 142 }, 'Pedido criado');
logger.error({ err, pedidoId }, 'Falha ao cobrar');
```

**Nunca registrar** senha, token, cartão, CPF de terceiro ou corpo inteiro de requisição em
produção.

### O que observar

- Tempo de resposta em p95 e p99 — a média esconde o cliente que esperou 8 segundos
- Taxa de erro
- Consulta lenta (o Postgres tem `log_min_duration_statement`)
- Uso do pool de conexão
- Espaço em disco do banco

Ferramentas maiores (Prometheus + Grafana, OpenTelemetry, APM pago) entram quando o
sistema cresce e a pergunta "onde está lento?" deixa de ter resposta óbvia. Antes disso,
são manutenção sem retorno.

### Verificação de saúde

```typescript
app.get('/health', async (_req, res) => {
  const banco = await db.query('SELECT 1').then(() => true).catch(() => false);
  res.status(banco ? 200 : 503).json({ banco, tempoNoAr: process.uptime() });
});
```
