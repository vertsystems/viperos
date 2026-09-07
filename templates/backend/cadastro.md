# Cadastro — gravar, editar, apagar, listar

Referência da skill `/backend`. O ciclo completo de um cadastro do lado do servidor:
receber o formulário, validar, gravar, listar, editar, apagar. É a maior parte do que se
constrói para um negócio de 1 a 10 pessoas, e é onde estão os defeitos que o dono percebe
antes de qualquer outra coisa.

Aqui só entra comportamento de servidor. Rótulo, placeholder, altura de campo, estado de
tela e contraste ficam em `templates/design/interface.md`, e a decisão de quais campos
existem, o que o sistema deduz sozinho e o que a tela impede antes do envio fica em
`templates/design/usabilidade.md`. Senha, sessão, permissão por
papel e as dez falhas mais comuns ficam em `seguranca.md`. Erro de consulta que não gera
erro nenhum fica em `consultas.md`. Índice, dinheiro em centavos e remoção lógica ficam em
`dados.md`.

---

## O cadastro é um recurso, não um punhado de telas

Antes de escrever a primeira linha, escreva o substantivo do negócio: cliente, pedido,
produto, recebimento. Cada substantivo vira um recurso com um conjunto fechado de ações,
sempre as mesmas.

| Ação | Método e endereço | Resposta em caso de sucesso |
|---|---|---|
| listar | `GET /clientes` | a lista, com teto e ordenação |
| formulário de novo | `GET /clientes/novo` | o formulário, com registro em branco |
| criar | `POST /clientes` | `303` para a listagem ou para o registro criado |
| ver | `GET /clientes/:id` | o registro |
| formulário de edição | `GET /clientes/:id/editar` | o formulário, com o registro carregado |
| atualizar | `POST /clientes/:id` | `303` para o registro |
| apagar | `POST /clientes/:id/remover` | `303` para a listagem |

Escreva as sete, mesmo as que ficam vazias no começo. Recurso com três ações declaradas e
quatro implícitas é o que produz a tela que ninguém protegeu.

**Nenhuma ação que altera dado responde a `GET`.** Essa é a regra que sustenta metade das
armadilhas abaixo.

Quando quem chama é outro sistema e não um navegador, o formato do erro e os códigos de
resposta estão em `api.md`. O ciclo é o mesmo; muda só o que volta no corpo.

---

## As oito armadilhas do ciclo

### 1. A gravação responde direto ao POST

**Sintoma.** A pessoa cadastra, aperta F5, e o último registro aparece duplicado na lista.
Aperta de novo e triplica.

**Custo.** O dono liga dizendo que o cliente está três vezes no sistema. Quem conserta
apaga na mão, direto no banco, e apagar na mão é como se apaga o registro errado.

**Conserto.** Toda gravação, edição e exclusão termina com redirecionamento e encerra ali.
A listagem sempre vem de um `GET`.

```typescript
// ✖ o POST responde a página: recarregar reenvia o formulário
app.post('/clientes', async (req, res) => {
  await db.clientes.create(dados);
  res.render('clientes/lista', { clientes: await db.clientes.all() });
});

// ✔ grava, redireciona, e a listagem é outra requisição
app.post('/clientes', async (req, res) => {
  const cliente = await db.clientes.create(dados);
  res.redirect(303, `/clientes/${cliente.id}`);
});
```

O `303` existe exatamente para isso: diz ao navegador que o próximo passo é um `GET`.
É uma linha de código.

### 2. O campo obrigatório é o gatilho da gravação

**Sintoma.** Quem esquece o campo obrigatório volta para um formulário em branco, sem
mensagem nenhuma, e perde tudo o que já tinha digitado nos outros campos.

**Custo.** A pessoa desiste do cadastro. Ninguém abre chamado disso, então o defeito mora
no sistema por anos.

**Conserto.** São duas perguntas diferentes e cada uma pede seu próprio teste. Uma decide
se o formulário foi enviado. A outra decide se os dados prestam.

```typescript
// ✖ um teste só: quem não mandou o nome sai do fluxo inteiro
if (req.body.nome) { await gravar(req.body); }

// ✔ dois testes, e o erro nasce do segundo
const erros = validar(req.body);
if (erros.length === 0) {
  await gravar(req.body);
  return res.redirect(303, '/clientes');
}
return res.status(422).render('clientes/form', { cliente: req.body, erros });
```

### 3. O formulário reprovado volta vazio

**Sintoma.** Um campo reprova e a tela volta limpa, com os outros nove campos apagados.

**Custo.** Cadastro longo, digitado no celular, perdido por causa de um CEP. O dono chama
isso de "o sistema comeu".

**Conserto.** No caminho de erro, redesenhe a mesma tela com o que chegou na requisição, e
com a mensagem ao lado do campo que falhou. Redirecionar é só no caminho de sucesso.
Erro não redireciona. Campo de senha é a única exceção: volta sempre vazio.

### 4. O formulário de edição vira o de cadastro sem registro em branco

**Sintoma.** A tela de cadastro enche de aviso de variável indefinida, ou mostra a palavra
`undefined` dentro dos campos.

**Custo.** O atalho de plantão é criar um segundo formulário. A partir daí todo campo novo
precisa ser adicionado nos dois lugares, e um dos dois vai ficar para trás na primeira
pressa.

**Conserto.** Um formulário só, alimentado por um registro em branco com todas as chaves
preenchidas com valor vazio. A diferença entre criar e editar cabe num id oculto.

```typescript
const CLIENTE_EM_BRANCO = { id: null, nome: '', email: '', telefone: '', nascimento: '' };

app.get('/clientes/novo', (req, res) =>
  res.render('clientes/form', { cliente: CLIENTE_EM_BRANCO, erros: [] }));
```

### 5. A ação destrutiva está atrás de um link comum

**Sintoma.** Registros somem sem ninguém ter clicado em nada.

**Custo.** Restauração de backup, que é a operação mais cara e mais arriscada do sistema.

**Conserto.** Link é leitura, e o navegador trata leitura como coisa que ele pode fazer
sozinho: pré-carregar, indexar, repetir. Exclusão vai por requisição de escrita, com
confirmação, com o id em campo oculto e com registro de quem apagou.

```html
<!-- ✖ o pré-carregador do navegador abre isso sem ninguém pedir -->
<a href="/clientes/42/remover">Remover</a>

<!-- ✔ escrita, com o id indo junto -->
<form method="post" action="/clientes/42/remover">
  <input type="hidden" name="id" value="42">
  <button type="submit">Remover</button>
</form>
```

Antes de gerar o `DELETE`, pergunte se o registro participa de algum histórico. Cliente com
venda, produto com pedido e conta com movimento não se apagam: viram inativos e somem das
listagens. A coluna `removido_em` está em `dados.md`.

E confira que a tela de confirmação manda o id de verdade. Formulário que exibe os dados
mas não envia nada chega ao servidor com tudo nulo, a tela volta como se tivesse dado
certo, e o registro continua lá.

### 6. O upload é validado pela extensão do nome

**Sintoma.** Um executável renomeado para `.pdf` passa na validação e vai parar numa pasta
que o servidor entrega para qualquer um.

**Custo.** Você hospedou o arquivo do atacante no domínio do seu cliente.

**Conserto.** Quatro regras, todas no servidor:

- **Tipo real**: confira o conteúdo do arquivo, não o nome. `file --mime-type <arquivo>` é o mesmo teste que a biblioteca faz
- **Nome gerado por você**: nunca o nome que veio do navegador, que pode conter caminho, acento e barra
- **Fora da pasta servida**: o arquivo vai para o storage ou para um diretório que o servidor não publica direto, e a entrega passa por uma rota que confere quem está pedindo
- **Teto de tamanho**: declarado, e recusado com mensagem, não com erro de servidor

O nome do arquivo mente. O conteúdo, não.

O binário fica no disco ou no storage; no banco vai só o caminho, o tipo e o tamanho. E
quando o registro é apagado, o arquivo também. Dois lugares para limpar é o preço de não
transformar o banco em servidor de arquivo.

### 7. A listagem não tem teto

**Sintoma.** A tela abre num piscar com quarenta registros e trava com quarenta mil. O
defeito nasce no dia da entrega e só aparece no segundo ano.

**Custo.** Quando aparece, aparece na hora errada: fechamento de mês, com o dono na tela.

**Conserto.** Toda listagem nasce com `ORDER BY` e teto, desde o primeiro dia, mesmo a
tabela que "nunca vai passar de cem linhas". Contagem se faz no banco, nunca carregando as
linhas para contar na memória.

```sql
-- quantas linhas essa tela carregaria hoje?
SELECT count(*) FROM clientes;
```

Rode isso contra o banco de produção antes de entregar. Se o número já é maior que a tela
aguenta, a listagem sai paginada; se é pequeno, o teto fica lá do mesmo jeito. A paginação
com teto padrão e teto máximo está em `api.md`, e os erros de consulta que produzem lista
errada sem dar erro estão em `consultas.md`.

### 8. Grava o pacote inteiro que veio do formulário

**Sintoma.** Um usuário aparece como administrador, ou com a mensalidade marcada como
paga, sem que exista esse campo em tela nenhuma. Nada no log parece errado.

**Custo.** Não dá para saber quando começou nem quantos registros mudaram, porque o
sistema fez o que foi mandado.

**Conserto.** Declare a lista dos campos que aquele formulário tem direito de gravar. Fora
dela fica tudo que decide poder: papel, permissão, situação de pagamento, dono, token de
confirmação e o próprio id.

```typescript
const GRAVAVEIS = ['nome', 'email', 'telefone'] as const;

const so = (permitidos: readonly string[], corpo: Record<string, unknown>) =>
  Object.fromEntries(permitidos.filter(c => c in corpo).map(c => [c, corpo[c]]));

await db.clientes.update(id, so(GRAVAVEIS, req.body));
```

A lista mora ao lado da gravação, não da validação: quem mexe no formulário amanhã precisa
tropeçar nela. Confie nela, não no que chegou. O resto do controle de acesso, incluindo
filtrar por dono na consulta, está em `seguranca.md`.

---

## Validar duas vezes, por dois motivos diferentes

A validação no código existe para dar mensagem boa ao usuário. Ela não garante nada.
Quem garante é o banco.

- **Unicidade** que importa vira índice único. Duas requisições simultâneas passam pelas
  duas validações e gravam os dois registros; o índice recusa o segundo
- **Obrigatoriedade** que importa vira `NOT NULL`. Script rodado na mão não passa pelo seu código
- **Formato não prova existência.** `99/99/9999` passa em qualquer expressão regular de
  data e não é data nenhuma. Depois de conferir o formato, confira o significado: essa data
  existe, esse mês tem esse dia, esse valor cabe no intervalo
- **Data tem dois tradutores, sempre os mesmos dois.** Um converte o que a pessoa digitou
  para o formato do banco, outro faz o caminho de volta. Sem eles centralizados, cada tela
  inventa a sua e uma delas troca dia por mês sem dar erro nenhum

O esquema de validação e o formato de resposta `422` estão em `seguranca.md`.

---

## A mensagem de erro

Toda mensagem nomeia o campo e diz o que fazer. "Dados inválidos" é proibido, porque
obriga o usuário a abrir chamado só para descobrir onde errou.

| O que o servidor viu | O que o usuário lê |
|---|---|
| `duplicate key value violates unique constraint "clientes_email_key"` | Já existe um cliente com esse e-mail. |
| `null value in column "telefone" violates not-null constraint` | Informe o telefone com DDD. |
| `invalid input syntax for type date` | A data de nascimento precisa estar no formato dia/mês/ano. |

Duas colunas, dois destinos. A da esquerda vai para o log, junto do identificador da
requisição, e é ela que responde a investigação semanas depois, quando ninguém mais lembra
o que foi feito naquela tarde. A da direita vai para a tela. Mensagem técnica exibida ao
usuário é vazamento de informação com cara de transparência, e o dono não tem o que fazer
com ela.

Mapeie os casos de erro antes de escrever a validação. É mais rápido do que descobrir um a
um em produção.

---

## O que o dono muda sem pedir a ninguém

**Sintoma.** Mudar um percentual de comissão vira publicação de versão.

**Custo.** O dono espera dias por um número, e a partir daí passa a evitar mudanças que o
negócio pedia.

**Conserto.** Todo valor que o dono do negócio pode querer mudar sai do código: alíquota,
prazo, limite, faixa de desconto, texto padrão de e-mail, endereço que recebe aviso. Vai
para uma tabela de parâmetros com tela própria, ou para um arquivo de configuração que ele
mesmo edita.

O teste é uma pergunta só: se esse número mudar, quem muda? Se a resposta for o
programador, o número está no lugar errado.

---

## O documento que sai do cadastro

Recibo, orçamento, pedido, comprovante e relatório fazem parte do ciclo do cadastro, e são
o que o negócio manda para o cliente dele. **Não instale biblioteca de PDF por causa
disso.** O navegador já exporta pelo próprio fluxo de impressão, e uma dependência a menos
é uma coisa a menos para manter atualizada.

A rota devolve a mesma tela do registro, e o bloco de estilos de impressão vai no mesmo
arquivo CSS, porque ele é curto:

```css
@media print {
  nav, .filtros, .acoes, .coluna-editar { display: none; }
  a[href]::after { content: " (" attr(href) ")"; }
  a[href^="#"]::after, a[href^="javascript"]::after { content: ""; }
  table { width: 100%; }
  .registro { break-inside: avoid; }
}
```

Some com menu, filtro, botão e coluna de ação. Ninguém clica em papel. O espaço
economizado é o que faz o documento caber na página. Onde a cor carrega significado, o
texto tem que carregar junto: `+ Receita` e `- Despesa`, `Pago` e `Pendente`. Impresso em
preto e branco, verde e vermelho são a mesma coisa.

Confira gerando o arquivo do mesmo jeito que o cliente vai gerar:

```bash
curl -s http://localhost:3000/pedidos/1/recibo > recibo.html
node scripts/verificar.js html recibo.html    # CSS externo, @page, link vazio
chrome --headless --print-to-pdf=recibo.pdf --no-pdf-header-footer recibo.html
```

---

## Antes de dar o cadastro por pronto

```bash
# o POST responde redirecionamento, e não a página?
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" \
  -X POST -d 'nome=Teste' http://localhost:3000/clientes

# alguma ação que altera dado responde a GET?
grep -rnE "app\.get\(.*(remover|apagar|excluir|delete|salvar)" src/

# a listagem tem teto?
grep -rnE "findMany|SELECT .* FROM" src/ | grep -viE "limit|take"
```

- [ ] As sete ações existem e foram testadas pela tela, não só pela URL
- [ ] Sucesso redireciona com `303`; erro de validação redesenha com o que a pessoa digitou
- [ ] Um formulário só para criar e editar, alimentado por registro em branco
- [ ] Lista de campos graváveis declarada, sem nenhum campo que decide poder
- [ ] Exclusão por escrita, com confirmação, com o id no corpo e com quem apagou registrado
- [ ] Foi decidido se apaga ou inativa, e a decisão está anotada
- [ ] Upload conferido pelo conteúdo, com nome gerado e guardado fora da pasta pública
- [ ] Listagem com ordenação e teto, e a contagem feita no banco
- [ ] Unicidade e obrigatoriedade que importam existem também como restrição no banco
- [ ] Toda mensagem de erro nomeia o campo e a ação corretiva
- [ ] Id inexistente devolve página de não encontrado, não tela em branco nem pilha de erro
- [ ] Toda tela que vira documento tem seu bloco de impressão, conferido em PDF
