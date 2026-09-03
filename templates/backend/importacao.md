# Importação — planilha, XML, exportação de sistema antigo

Referência da skill `/backend`. Como escrever a rotina que traz dado de fora para dentro do
banco sem duplicar linha, sem perder linha e sem inventar número.

---

## Por onde o dado sujo entra

Quase todo sistema de negócio pequeno importa alguma coisa: a planilha que o dono mantém há
seis anos, o XML da nota fiscal, o extrato do marketplace, a exportação do sistema que está
sendo substituído. É por essa porta que o dado errado entra. E é depois dela que o total do
relatório para de bater com o total que o dono conhece de cabeça.

Três coisas são certas antes de a rotina existir. O arquivo vai ser reenviado. O botão vai
ser clicado duas vezes. Ninguém limpa a base antes. A rotina precisa ser segura por
construção, não pela disciplina de quem clica. E, ao orçar, a limpeza do dado é a parte longa:
base recebida pronta é raridade.

---

## A regra central: rodar duas vezes não muda nada

Toda carga é incremental. Só entra o que ainda não está lá, e reprocessar o mesmo arquivo
insere zero linhas, atualiza zero linhas e não move nenhum total.

Isso depende de uma **chave de negócio** declarada: o que identifica a linha no mundo real,
nunca o `id` que o banco gera sozinho. Número da nota com série e CNPJ do emissor. Código do
pedido no marketplace. CPF do cliente. Sem chave de negócio não existe como perguntar se a
linha já entrou, e a rotina vira aposta.

```sql
-- a chave de negócio vira restrição no banco, não convenção mental
ALTER TABLE vendas ADD CONSTRAINT uq_vendas_pedido
  UNIQUE (marketplace, codigo_pedido);

-- e a inserção passa a ser "insere se ainda não existe"
INSERT INTO vendas (marketplace, codigo_pedido, valor_centavos, vendida_em, origem, carregada_em)
VALUES ($1, $2, $3, $4, $5, now())
ON CONFLICT (marketplace, codigo_pedido) DO NOTHING;
```

`DO NOTHING` quando o arquivo repete sempre a mesma informação. `DO UPDATE` quando a origem
corrige o que já mandou, como um pedido que muda de "pago" para "cancelado". A escolha é do
negócio e precisa estar escrita, porque as duas montam históricos diferentes.

### A prova

Sem medida, "é idempotente" é opinião. Rode a carga uma vez, com o arquivo de verdade. Então:

```bash
FOTO='select count(*), coalesce(sum(valor_centavos),0) from vendas'

psql "$DATABASE_URL" -At -c "$FOTO" > antes.txt   # estado, por tabela que a carga toca
node importar.js entrada/vendas-2026-09.csv       # a segunda execução, MESMO arquivo
psql "$DATABASE_URL" -At -c "$FOTO" > depois.txt

diff antes.txt depois.txt && echo "IDEMPOTENTE: a segunda rodada não mudou nada"
```

`diff` vazio é o teste passando. Uma linha de diferença significa que a rotina duplica, e no
dia em que alguém reenviar o arquivo o faturamento do mês aparece dobrado.

Repita com um recorte maior que contém o que já foi carregado: o arquivo do ano inteiro por
cima dos meses já importados. Contagem e soma têm que subir exatamente o tamanho da parte
nova, nem uma linha além.

---

## Área de trabalho antes da tabela real

O arquivo não entra direto na tabela que o sistema usa. Ele entra numa tabela de trabalho,
descartável, com as colunas em texto, e toda a sujeira acontece lá: conversão, deduplicação,
validação. Para o destino vai só o que já está pronto para entrar.

```sql
TRUNCATE importacao_vendas;   -- limpa a área de trabalho no início de CADA execução
```

- Colunas em texto na área de trabalho. A conversão para data, número e centavos acontece na
  passagem para o destino, e o que não converter vira linha recusada com motivo, em vez de um
  erro que aborta a carga inteira
- Limpar na entrada, não na saída: rotina que caiu no meio deixa lixo para trás, e limpar no
  começo faz cada execução ser independente da anterior
- Carga grande não cabe numa transação só. Milhares de linhas seguradas de uma vez travam a
  tabela para o resto do sistema, então a unidade é o lote, com registro do que já entrou
- Desligou restrição para a carga passar, religa no mesmo roteiro. Religar valida o que
  entrou, e aí o erro aparece na hora certa em vez de semanas depois

O critério é esse: se o dado passou na validação da área de trabalho, ele entra no destino sem
problema. O que estiver torto morre antes, num lugar onde dá para olhar.

---

## Referência antes de movimento

Carregue primeiro o que não depende de ninguém para existir: cliente, produto, vendedor,
categoria. Depois o movimento: venda, pedido, atendimento. A ordem sai de graça da modelagem,
porque a tabela de movimento carrega as chaves estrangeiras e a linha só existe se a
referência já estiver lá.

Essa ordem é obrigatória. Escrevê-la num lugar só é a razão de existir a rotina
orquestradora, mais abaixo.

---

## Armadilhas

### A referência não foi encontrada e o movimento ficou de fora

**Sintoma:** o total do relatório fica menor que o total do sistema de origem, e a diferença
muda a cada carga.

**Custo:** o faturamento da empresa aparece errado numa tela que o dono usa para decidir, e
ninguém consegue explicar de onde vem a diferença.

**Conserto:** cadastre um registro genérico em cada tabela de referência e aponte para ele o
movimento cuja referência falhou. O movimento entra, o total fecha, e o erro de carga passa a
ser contável.

```sql
INSERT INTO vendedores (id, nome) VALUES (999999, 'Não identificado')
ON CONFLICT (id) DO NOTHING;

-- e a conta que fecha a carga: quantos caíram no genérico? o esperado é zero
SELECT count(*) FROM vendas WHERE vendedor_id = 999999;
```

Nunca descarte a venda por causa da chave estrangeira. Descartar troca um erro visível por um
número errado.

### O valor genérico escolhido entre os que podem acontecer de verdade

**Sintoma:** um dia específico ou um cliente específico aparece com volume fora de qualquer
curva, e a explicação não existe.

**Custo:** 01/01/2020 como data padrão soma o lixo da carga junto com as vendas reais daquele
dia. Ninguém separa os dois depois.

**Conserto:** escolha valor impossível na realidade do negócio. Data 01/01/1900, código
999999, CNPJ 00.000.000/0000-00. Assim o balde do genérico é sempre distinguível do dado real,
e dá para medir quanto caiu dentro dele.

### O arquivo exportado tratado como se fosse só dados

**Sintoma:** a importação quebra com erro de conversão ou de colunas, quase sempre na última
linha.

**Custo:** a carga da madrugada morre no meio, metade dos dados entra e alguém descobre pelo
relatório de segunda.

**Conserto:** todo export de ferramenta traz cabeçalho e costuma trazer rodapé: linha em
branco, total, contador de registros. Pule o cabeçalho de propósito e descarte o rodapé antes
de processar. Confira a codificação, porque ISO-8859-1 lido como UTF-8 estraga todo acento do
cadastro. E valide o cabeçalho contra a lista de colunas esperada a cada carga, parando quando
não bater: quando a origem troca a ordem das colunas, nada quebra, a cidade passa a guardar o
CEP e ninguém percebe. Posição não é identidade de campo. Onde a escolha do formato for sua,
prefira o que nomeia o campo (JSON, XML); CSV só quando o outro lado exige.

### Data e número lidos no formato da máquina

**Sintoma:** funciona na máquina de quem escreveu e falha no servidor. Ou pior: não falha, e
03/04 vira abril num lugar e março no outro.

**Custo:** venda lançada no mês errado. O defeito aparece no fechamento, quando a confiança no
sistema já foi embora.

**Conserto:** converta com máscara explícita e nunca dependa da configuração da sessão.
Vírgula decimal e dd/mm/aaaa são o padrão daqui contra o padrão da maioria dos bancos. Guarde
no tipo nativo e formate só na exibição.

---

## O que toda carga registra

**Log por passo, no sucesso e na falha.** Carga agendada que falha às 6h só aparece quando
alguém reclama do número, dias depois. O log é o que responde "rodou?" sem abrir o banco.

```sql
CREATE TABLE carga_log (
  id           bigserial PRIMARY KEY,
  executada_em timestamptz NOT NULL DEFAULT now(),
  rotina       text        NOT NULL,
  passo        text        NOT NULL,
  arquivo      text,
  linhas_lidas int         NOT NULL DEFAULT 0,
  linhas_novas int         NOT NULL DEFAULT 0,
  recusadas    int         NOT NULL DEFAULT 0,
  sucesso      boolean     NOT NULL,
  mensagem     text
);
```

**Origem e data da carga em cada linha.** Duas colunas que respondem a discussão mais cara que
existe, a de que o número está errado: dado um registro, você acha o arquivo e o dia que o
geraram.

```sql
ALTER TABLE vendas
  ADD COLUMN origem       text        NOT NULL,  -- 'marketplace-x/vendas-2026-09.csv'
  ADD COLUMN carregada_em timestamptz NOT NULL DEFAULT now();
```

**Arquivo movido para o histórico com a data no nome.** Fecha o ciclo com a coluna de origem e
impede o reprocessamento por engano na próxima execução.

```bash
mv entrada/vendas.csv historico/vendas-2026-09-03.csv
```

**Um único ponto de entrada agendado.** Uma rotina orquestradora chama todas as cargas na
ordem certa, e só ela vai para o agendador. Carga nova entra dentro da orquestradora. Segundo
agendamento só quando a periodicidade for mesmo diferente, como diária contra mensal.

Para o formato do log da aplicação, `templates/backend/debug.md`, seção "Log que serve pra
investigar".

---

## Inspeção da base recebida

Antes do primeiro uso, olhe o arquivo. Nenhum dos erros abaixo aparece num `SELECT` comum.

```bash
wc -l entrada/clientes.csv      # quantas linhas vieram (o cabeçalho conta uma)
head -1 entrada/clientes.csv    # o cabeçalho, na ordem em que veio
tail -3 entrada/clientes.csv    # o rodapé: linha em branco, total, contador
file entrada/clientes.csv       # a codificação, antes de qualquer acento virar lixo
```

Com o arquivo já na área de trabalho:

```sql
-- vazios, coluna por coluna
SELECT count(*) FILTER (WHERE nome   = '') AS nome_vazio,
       count(*) FILTER (WHERE cpf    = '') AS cpf_vazio,
       count(*) FILTER (WHERE cidade = '') AS cidade_vazia
FROM importacao_clientes;

-- duplicados pela chave de negócio, não pelo id
SELECT cpf, count(*) FROM importacao_clientes
GROUP BY cpf HAVING count(*) > 1;

-- valores distintos de coluna categórica
SELECT sexo, count(*) FROM importacao_clientes GROUP BY sexo ORDER BY 2 DESC;

-- data impossível e valor fora de faixa
SELECT min(data_venda), max(data_venda), min(valor), max(valor) FROM importacao_vendas;
```

O agrupamento por coluna categórica é o que revela `F`, `M`, `1`, `2` e `masc` convivendo na
mesma base. São cinco categorias no relatório e uma só na cabeça do dono. Anote as regras de
padronização que você aplicou, porque a próxima carga precisa repetir as mesmas.

---

## O que não trazer

Nada de data warehouse, cubo, modelagem dimensional, Hadoop ou ferramenta de ETL de
fornecedor. A escala aqui é um banco só, uma tabela de trabalho, uma orquestradora e um
agendamento. Esses degraus entram no dia em que um número medido pedir, nunca por precaução.
O degrau seguinte, quando a soma do histórico começar a pesar na tela do dia a dia, é copiar
para um esquema separado de leitura. Continua sendo a rotina descrita aqui.

Para tipo de coluna, dinheiro em centavos e data com fuso, `templates/backend/dados.md`, seção
"Modelar antes de escrever código".

---

## Antes de considerar a carga pronta

```bash
# a segunda execução do mesmo arquivo insere zero linhas?
# o arquivo do período maior, por cima, duplicou alguma coisa?
# a contagem e a soma no destino batem com a origem?
# quantos registros caíram no genérico? (o esperado é zero)
# o log tem um registro por passo, todos com sucesso?
# o arquivo saiu da pasta de entrada e apareceu no histórico com a data?
# a orquestradora é o único agendamento?
```
