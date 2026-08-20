# Arquitetura e qualidade do código

Referência da skill `/backend`. Como dividir o sistema, o que fazer quando alguma parte
falha, e o que faz o código continuar legível daqui a um ano.

---

## Comece com um só

Um servidor, um banco, um deploy. É a arquitetura certa pra praticamente todo sistema de
pequeno negócio — e continua certa por muito mais tempo do que a internet sugere.

**O que o monolito dá de graça:** transação de verdade (ou tudo grava, ou nada), depuração
num lugar só, deploy único, custo de operação baixo.

**Dividir custa:** publicação coordenada, chamada de rede entre partes que antes eram uma
função, dado que fica temporariamente inconsistente, e depuração espalhada por vários logs.

**Quando dividir de fato compensa:** times diferentes que se atrapalham no mesmo código;
uma parte com necessidade de escala muito diferente do resto (processamento de vídeo ao
lado de um CRUD); uma parte que precisa de outra tecnologia.

Nenhum desses é "vamos crescer um dia".

### O pior dos mundos

**Monolito distribuído:** serviços separados que dependem uns dos outros pra qualquer
operação. Paga-se todo o custo da divisão sem nenhum benefício. Quase sempre é o resultado
de dividir cedo demais, por fronteira errada.

---

## Organizar o monolito por dentro

A divisão que importa é interna. Três camadas resolvem:

```
rotas/         recebe a requisição, valida a entrada, devolve a resposta
servicos/      a regra de negócio — o que o sistema faz
repositorios/  fala com o banco
```

Regras que mantêm isso vivo:

- A rota **não** faz SQL. O repositório **não** conhece HTTP
- A regra de negócio não sabe se veio de API, de fila ou de linha de comando — é isso que a torna testável
- Organizar por **assunto** (`pedidos/`, `clientes/`, `pagamentos/`), não por tipo de arquivo. Mexer numa funcionalidade deve tocar uma pasta, não sete

Se um dia for preciso dividir de verdade, esses assuntos já são a fronteira natural.

---

## Quando algo de fora falha

Todo serviço externo (gateway de pagamento, e-mail, WhatsApp, API de terceiro) vai falhar
uma hora. Sistema que assume o contrário trava junto.

### Prazo máximo

```typescript
const resposta = await fetch(url, { signal: AbortSignal.timeout(5000) });
```

Chamada sem prazo pendura a requisição, que pendura a conexão, que esgota o pool. É assim
que uma API lenta de terceiro derruba o sistema inteiro.

### Repetir com espera crescente

```typescript
async function comRetentativa<T>(fn: () => Promise<T>, tentativas = 3): Promise<T> {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await fn();
    } catch (erro) {
      if (i === tentativas - 1) throw erro;
      await new Promise(r => setTimeout(r, 2 ** i * 1000)); // 1s, 2s, 4s
    }
  }
  throw new Error('inalcançável');
}
```

**Só repetir o que é seguro repetir.** Repetir uma cobrança sem chave de idempotência cobra
duas vezes. Repetir leitura é seguro; repetir escrita exige idempotência.

### Parar de bater na porta fechada (circuit breaker)

Depois de N falhas seguidas, parar de chamar por um tempo e responder rápido com o plano B.
Evita que a lentidão de um serviço vire fila em todo o sistema. Bibliotecas prontas
resolvem (`opossum`, no Node).

### Degradar em vez de cair

Se a recomendação de produtos está fora, mostre os mais vendidos. Se o CEP não valida,
aceite e valide depois. Nem toda falha precisa virar erro na cara do usuário.

---

## Fila, quando entra

Tarefa que demora não pode acontecer dentro da requisição: gerar PDF, importar planilha,
enviar lote de e-mail, processar imagem.

```typescript
// a requisição só enfileira e responde
await filaEmail.add('boas-vindas', { clienteId: cliente.id });
res.status(201).json(cliente);

// o processamento acontece fora
filaEmail.process('boas-vindas', async (job) => {
  await enviarBoasVindas(job.data.clienteId);
});
```

Toda fila precisa de: número máximo de tentativas, destino pro que falhou definitivamente
(fila morta) e visibilidade — saber quantos itens estão parados. Fila que engole erro em
silêncio é pior que não ter fila.

**Tarefa precisa ser idempotente:** ela vai rodar duas vezes um dia. Se rodar duas vezes
mandar dois e-mails, tudo bem; se cobrar duas vezes, não.

---

## Guardar o histórico

Registrar o que aconteceu (`pedido_criado`, `pagamento_confirmado`, `pedido_cancelado`),
além do estado atual, dá auditoria completa e responde "como isso chegou nesse estado?".

Para a maior parte dos sistemas, uma **tabela de eventos ao lado do estado atual** entrega
quase todo o benefício sem nenhum dos custos. Reconstruir o estado sempre a partir dos
eventos (event sourcing puro) é uma decisão pesada, que exige motivo forte.

---

## Código que continua legível

### Nome que dispensa comentário

```typescript
// ✖
function calc(a: number, b: number) { return a * b * 0.0254; }

// ✔
const POLEGADA_EM_METROS = 0.0254;
function areaEmMetros(larguraPol: number, alturaPol: number) {
  return larguraPol * alturaPol * POLEGADA_EM_METROS;
}
```

### Função que faz uma coisa

Função de 200 linhas que valida, cobra, grava, envia e-mail e gera nota não tem como ser
testada em partes — e é sempre nela que o defeito mora.

```typescript
async function processarPedido(pedidoId: string) {
  const pedido    = await validarPedido(pedidoId);
  await reservarEstoque(pedido);
  const pagamento = await cobrar(pedido);
  await marcarComoPago(pedidoId);
  await enviarConfirmacao(pedido);
  await gerarNota(pedido, pagamento);
}
```

Cada linha vira um teste possível e um ponto de log.

### Sem número mágico

```typescript
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;
const IDADE_MINIMA = 18;
```

### Erro tratado de verdade

```typescript
// ✖ engole o erro e devolve null; o chamador não sabe se não achou ou se quebrou
try { return await db.buscarCliente(id); } catch (e) { console.log(e); return null; }

// ✔ registra com contexto e propaga
try {
  const cliente = await db.buscarCliente(id);
  if (!cliente) throw new ClienteNaoEncontrado(id);
  return cliente;
} catch (erro) {
  logger.error({ err: erro, clienteId: id }, 'Falha ao buscar cliente');
  throw erro;
}
```

`catch` que só imprime e segue transforma defeito em comportamento estranho — o pior tipo
de defeito, porque não deixa rastro.

### Não repetir a mesma regra

A mesma validação copiada em três rotas será corrigida em duas. Extrair.

Mas cuidado com o oposto: unificar código que *parece* igual e serve a propósitos
diferentes cria uma função com cinco parâmetros booleanos. Duplicação é mais barata que a
abstração errada.

### Injetar dependência, pra dar pra testar

```typescript
// ✖ o serviço cria o que usa: não dá pra testar sem banco e sem mandar e-mail
class ServicoPedido {
  private db = new PostgresCliente();
  private email = new ServicoEmailSMTP();
}

// ✔ recebe de fora: no teste, entram versões falsas
class ServicoPedido {
  constructor(private db: BancoPedidos, private email: ServicoEmail) {}
}
```

Não precisa de framework de injeção pra isso. Passar no construtor resolve.

### Comentário explica o porquê

O código já diz o que faz. O comentário serve pro que ele não consegue dizer:

```typescript
// A API do parceiro rejeita CPF com pontuação, apesar da documentação dizer o contrário.
// Confirmado com o suporte deles em 12/03/2026.
const cpfLimpo = cpf.replace(/\D/g, '');
```

---

## Checagem de arquitetura

- [ ] Dá pra rodar tudo na máquina local com um comando
- [ ] Regra de negócio testável sem subir servidor
- [ ] Nenhuma chamada externa sem prazo máximo
- [ ] Tarefa demorada fora da requisição
- [ ] Organização por assunto, não por tipo de arquivo
- [ ] Nenhum `catch` que engole erro em silêncio
- [ ] Um `README` que explica como rodar, como testar e como publicar
