# Consultas que erram sem dar erro

Referência da skill `/backend`. Os defeitos de consulta que não quebram nada: o sistema
responde, a tela abre, o número sai errado. Cada um com sintoma, custo, conserto e a consulta
que o denuncia.

---

## Por que estes são os piores

Defeito que estoura na tela se conserta no mesmo dia. Alguém tira foto e manda pra você. Os
deste arquivo não fazem nada disso: a consulta roda, o relatório imprime, o total aparece
bonito e está errado. Aparecem no fechamento do mês, quando o dono soma na calculadora e não
bate com a tela. Daí em diante o problema deixa de ser técnico. Ele volta pra planilha e
confere tudo na mão, que era o trabalho que o sistema ia tirar dele.

**Nenhum destes se descobre lendo o código.** Cada um tem uma consulta que o denuncia, e é
ela que decide.

---

## "O número não bate": a ordem de conferência

Rode esta lista sobre a consulta que produziu o número errado, antes de investigar qualquer
outra coisa:

1. Contei as tabelas e as ligações? N tabelas pedem N-1 condições de junção
2. Tem `AND` e `OR` juntos sem parênteses?
3. Alguma coluna da conta ou da comparação aceita nulo?
4. Estou testando ausência com `=` em vez de `IS NULL`?
5. Tem agregação com uma coluna comum sobrando no agrupamento?
6. O filtro é de linha (`WHERE`) e está em `HAVING`, ou o contrário?
7. O corte de N linhas está sendo aplicado antes da ordenação?
8. Alguma data ou número está sendo convertido sem máscara explícita?
9. A junção deveria ser `LEFT` e está `INNER`, escondendo quem não tem par?

O item 9 é o mais silencioso. Relatório de vendas por vendedor com `INNER JOIN` não mostra
quem não vendeu nada: cada linha está certa, a lista é que está incompleta, e é dela que sai
a decisão de quem fica.

---

## SQL

### 1. A junção que faltou

Sintoma: muito mais linhas que o esperado, valores se repetindo em bloco, e o total num
múltiplo exato do real. Nenhum erro aparece. O que custa: faturamento inflado, comissão paga
em cima dele, imposto sobre venda que não existiu. Conserto: conte as tabelas do `FROM` e
exija N-1 ligações. Escreva sempre `JOIN ... ON`, que transforma a ligação esquecida em erro
de sintaxe. Cruzamento de propósito se escreve `CROSS JOIN`.

```sql
-- o total da origem contra o total do relatório: têm que bater
SELECT sum(valor) FROM pedidos WHERE criado_em >= '2026-08-01';
SELECT sum(p.valor) FROM pedidos p
  JOIN itens i ON i.pedido_id = p.id
 WHERE p.criado_em >= '2026-08-01';   -- maior? cada pedido soma uma vez por item
```

A variante que engana mais tem a ligação no lugar: há dois caminhos entre as pontas, porque o
pedido tem itens e tem pagamentos. O total sai N vezes maior, sendo N o número de caminhos.
Liste as linhas cruas antes de agregar, e o conserto é uma coleção por consulta ou
`count(DISTINCT p.id)`.

### 2. `AND` e `OR` na mesma condição, sem parênteses

Sintoma: o filtro traz linhas demais ou de menos, plausível o bastante para ninguém
desconfiar, com uma das condições parecendo não ter sido aplicada. O que custa: `AND` tem
precedência sobre `OR`, então `cargo = 'vendedor' or cargo = 'gerente' and salario > 5000`
aplica o salário só ao segundo cargo, e a lista volta com todo vendedor da empresa. Conserto:
parênteses em toda alternativa, mesmo quando a precedência já daria certo.

```sql
-- rode as duas e compare; se a contagem difere, a sem parênteses é a errada
SELECT count(*) FROM funcionarios WHERE cargo='vendedor' OR cargo='gerente' AND salario>5000;
SELECT count(*) FROM funcionarios WHERE (cargo='vendedor' OR cargo='gerente') AND salario>5000;
```

### 3. Conta com coluna que aceita nulo

Sintoma: o `UPDATE` responde "4 linhas atualizadas" e algumas continuam iguais; o `SUM` vem
menor que a soma da calculadora; a linha some do filtro. O que custa: nulo não é zero e não é
falso. Toda conta que encosta nele vira nulo, e a linha some do resultado sem aviso.
Conserto: `COALESCE(coluna, 0)` em toda coluna anulável que entre em conta ou comparação, e
`IS NULL` para testar ausência. Quando ausência significa zero de verdade, o lugar certo é
`DEFAULT 0 NOT NULL` na coluna.

```sql
SELECT count(*) FILTER (WHERE comissao IS NULL) AS sem_comissao, count(*) AS linhas
  FROM funcionarios;
SELECT sum(salario + comissao) AS com_nulo, sum(salario + COALESCE(comissao, 0)) AS certo
  FROM funcionarios;
```

### 4. A contagem que ignora o vazio

Sintoma: a média sai mais alta que o esperado, e a contagem de uma coluna não bate com a
contagem de linhas. O que custa: `COUNT`, `AVG` e `SUM` pulam nulos por definição, então a
média de comissão sai calculada só entre quem tem comissão. É a média de uma amostra que
ninguém escolheu. Conserto: `COUNT(*)` conta linhas, `COUNT(coluna)` conta quem tem o dado.
São dois números diferentes de propósito, e o relatório precisa dizer qual está mostrando.

```sql
SELECT count(*) AS linhas, count(comissao) AS preenchidas,
       avg(comissao) AS media_de_quem_tem, sum(comissao)/count(*) AS media_de_todos
  FROM funcionarios;
```

### 5. O valor padrão que nunca entra

Sintoma: a coluna com `DEFAULT` (data de cadastro, situação inicial, zero) grava nula, e só
nos registros vindos de um caminho do sistema. O que custa: metade da base com data e metade
sem. Nenhum relatório por período fecha, e não há conserto retroativo. Conserto: `DEFAULT` só
entra quando a coluna é omitida do `INSERT`. Se a camada de acesso monta o comando com todas
as colunas, ela manda `NULL` explícito e o padrão nunca é acionado. Ou omita a coluna, ou
repita o padrão no código.

```sql
SELECT count(*) FILTER (WHERE criado_em IS NULL) AS sem_data, count(*) AS total FROM pedidos;
-- com o log de SQL ligado: a coluna aparece na lista do INSERT? então o DEFAULT está fora
```

### 6. O corte antes da ordenação

Sintoma: o "top 10" vem ordenado, mas não são os 10 maiores. São 10 quaisquer, ordenados
entre si. O que custa: o dono decide o que comprar olhando os mais vendidos, e a lista não é
a dos mais vendidos. Nada na tela indica isso, porque o resultado sai ordenado e parece
certo. Conserto: ordene antes de cortar. Onde o banco cortar primeiro, ordene dentro de uma
subconsulta e limite por fora.

```sql
-- o maior valor da tabela tem que aparecer no seu "top 10"
SELECT max(valor) FROM vendas;
SELECT valor FROM vendas ORDER BY valor DESC LIMIT 10;
```

### 7. Função em cima da coluna filtrada

Sintoma: a consulta era instantânea e passa a demorar conforme a tabela cresce, com o plano
mostrando varredura completa mesmo com índice criado. O que custa: o índice guarda o valor da
coluna, não o resultado da função aplicada nela. Em 200 linhas ninguém nota. Em 200 mil, a
tela trava. Conserto: deixe a coluna crua de um lado e transforme o outro, com faixa de datas
no lugar de extrair o ano. Se a função for inevitável, o índice vai sobre a expressão, e como
criar está em `templates/backend/dados.md`.

```sql
EXPLAIN ANALYZE SELECT * FROM vendas WHERE extract(year FROM vendida_em) = 2026;
EXPLAIN ANALYZE SELECT * FROM vendas
 WHERE vendida_em >= '2026-01-01' AND vendida_em < '2027-01-01';
-- Seq Scan na primeira e Index Scan na segunda confirma o diagnóstico
```

### 8. Data que depende de quem está lendo

Sintoma: funciona na máquina de quem desenvolveu e falha em produção com "mês inválido". Ou
pior: não falha, e 03/04 vira abril num lugar e março no outro. O que custa: um mês inteiro
de vendas cai na data errada, e a diferença só aparece quando alguém compara com o extrato.
Conserto: máscara explícita em toda conversão, sem depender do idioma do servidor. Guarde
data em tipo de data e valor em tipo numérico. Converter e formatar são coisas diferentes, e
guardar "R$ 1.250,00" como texto é o fim de qualquer soma.

```sql
-- se nenhuma data tem dia acima de 12, alguém trocou dia por mês na importação
SELECT count(*) FILTER (WHERE extract(day FROM vendida_em) > 12) AS acima_de_12,
       count(*) AS total FROM vendas;
```

### 9. Restrição sem nome

Sintoma: o erro que chega ao usuário diz `check constraint (SYS_C0011019) violated`. O que
custa: ninguém sabe qual regra foi violada nem em qual campo, o usuário abandona o cadastro e
liga pra você. Conserto: nomeie toda restrição na criação, com padrão previsível, e traduza o
nome para uma mensagem de negócio na camada que exibe. Nomear não custa nada.

```sql
-- liste e confira: todo nome fora do seu padrão foi o banco que batizou
SELECT conrelid::regclass AS tabela, conname, contype
  FROM pg_constraint WHERE connamespace = 'public'::regnamespace ORDER BY 1, 2;
```

---

## ORM

As armadilhas abaixo são da biblioteca de acesso a dados (Prisma, Drizzle, Eloquent, Django
ORM, Entity Framework). Mudam de nome entre uma e outra. Não mudam de comportamento.

### 10. O relacionamento que passou a vir sempre

Sintoma: apareceu um erro de dado acessado fora da conexão, alguém marcou o relacionamento
como sempre-carregado, o erro sumiu. Semanas depois o sistema está lento e estoura memória em
telas que nem usam aquele relacionamento. O que custa: mapeamento vale para o sistema
inteiro, então você consertou uma tela e piorou todas, inclusive a lista suspensa que só
precisava do nome. Conserto: volte para carregamento sob demanda e resolva na consulta da
tela que precisa, com junção explícita. Carregar junto é decisão por consulta, nunca por
modelo. Diagnóstico: ligue o log de SQL e abra uma tela que **não** usa o relacionamento. Se
a junção aparece assim mesmo, ela está no mapeamento.

### 11. Duas listas na mesma consulta

Sintoma: em algumas bibliotecas, erro de múltiplas coleções. Nas outras, algo pior: linhas
repetidas e contagens infladas, sem erro nenhum. O que custa: é o produto cartesiano do item
1 disfarçado de código de aplicação, e a contagem inflada vai direto para o relatório do mês.
Conserto: uma coleção por consulta. Quando a duplicação for o problema, use conjunto no lugar
de lista, ou `DISTINCT` dentro da agregação. Diagnóstico: o tamanho da lista que o ORM
devolveu contra o `count(*)` do mesmo filtro no banco.

### 12. Cascata de exclusão copiada de exemplo da internet

Sintoma: registros somem da base sem nenhum comando de exclusão no código, e excluir um
cadastro aparentemente isolado apaga linhas de três tabelas. O que custa: depois da
confirmação não tem volta, e a recuperação é restaurar backup e perder o que entrou desde
então. Conserto: decida ação por ação. Propagar gravação onde o filho nasce junto do pai,
propagar exclusão só quando o filho não existe sem o pai. Na dúvida, bloqueie a exclusão e
marque o registro como inativo.

```sql
-- o que acontece com os filhos quando o pai for apagado
SELECT conrelid::regclass AS tabela_filha, confrelid::regclass AS tabela_pai,
       conname, confdeltype    -- a=nada, r=bloqueia, c=cascata, n=anula
  FROM pg_constraint WHERE contype = 'f' ORDER BY 2, 1;
```

### 13. Situação gravada por posição

Sintoma: alguém reordena a lista de status no código, a publicação sobe sem erro, e pedidos
trocam de situação sozinhos. Usuários trocam de perfil. O que custa: o banco guardou 0, 1 e
2, e o significado desses números mora numa linha de código que qualquer pessoa reordena sem
perceber que está mexendo em dado gravado. Conserto: grave o texto, e crie índice na coluna
se a busca precisar de desempenho. Base já numérica migra os dados junto com o código.

```sql
SELECT status, count(*) FROM pedidos GROUP BY status ORDER BY 2 DESC;
-- voltou 0, 1, 2? está gravado por posição
```

### 14. Operação em lote que passa por cima das regras

Sintoma: o código lê um campo logo depois do `UPDATE` em massa e recebe o valor antigo; o
delete em massa estoura chave estrangeira; a coluna de versão não muda. O que custa: comando
em lote vai direto ao banco, sem disparar cascata, sem incrementar versão e sem atualizar o
que já está em memória. Depois dele, o que está carregado mente. Conserto: rode em transação
própria, desfaça antes os relacionamentos, some 1 na versão dentro do comando e não leia nada
da memória depois.

```sql
-- todo comando em massa nasce como consulta
SELECT count(*) FROM pedidos WHERE status = 'rascunho' AND criado_em < '2026-01-01';
-- confira a contagem e só então troque por DELETE, com o WHERE intacto
```

### 15. O último a salvar apaga o trabalho do primeiro

Sintoma: duas pessoas abrem a mesma ficha, as duas salvam, e a alteração da primeira some.
Sem erro, sem registro. O que custa: cada tela grava o registro inteiro com os valores que
carregou, então quem salva por último desfaz o trabalho do outro, e depois ninguém sabe o que
se perdeu. Conserto: coluna de versão em toda entidade que duas pessoas podem abrir junto,
com a gravação falhando quando a versão em mãos for antiga. A tela trata o conflito em
português e recarrega sem o usuário perder o que digitou.

```sql
-- 1. a entidade tem coluna de versão?
SELECT column_name FROM information_schema.columns
 WHERE table_name = 'clientes' AND column_name IN ('versao', 'version', 'lock_version');
-- 2. abra o mesmo registro em duas janelas, altere campos diferentes, salve nas duas
--    as duas gravaram sem reclamar? não existe proteção nenhuma
```

---

## A regra que evita metade destes

**Todo comando que altera ou apaga nasce como consulta.** Escreva o `SELECT` com o filtro
completo, confira a contagem, e só então troque o verbo mantendo o `WHERE` intacto. Em
produção, dentro de transação, conferindo as linhas afetadas antes de confirmar. O que
importa num comando destrutivo é o filtro, não o verbo.

E o teste que fecha o assunto: **pergunte a mesma coisa por dois caminhos diferentes.** O
total do relatório contra a soma da origem. A contagem da tela contra o `count(*)` no banco.
Um número sozinho não se confere. Dois números que deveriam ser iguais se conferem em um
segundo.

---

## Antes de entregar uma consulta que produz número

- [ ] Contei as tabelas: N tabelas, N-1 ligações
- [ ] `AND` e `OR` misturados estão entre parênteses
- [ ] Toda coluna anulável da conta passa por `COALESCE`
- [ ] O relatório diz se conta linhas ou conta preenchidos
- [ ] A ordenação vem antes do corte, e a conversão de data tem máscara explícita
- [ ] Nenhuma função em cima de coluna filtrada, ou índice sobre a expressão
- [ ] Rodei `EXPLAIN ANALYZE` e o plano usa índice
- [ ] O total bate com a mesma pergunta feita por outro caminho
- [ ] Testei com volume parecido com o de produção, não com dez registros

---

## O que não está aqui

- **N+1, índice, cache e consulta lenta** — `templates/backend/dados.md`, seções "Índice",
  "O problema N+1" e "Cache"
- **Método de investigação e os cinco problemas mais comuns em produção** —
  `templates/backend/debug.md`
- **Injeção e permissão na consulta** — `templates/backend/seguranca.md`

Uma linha de segurança que vale repetir aqui: concatenar valor da tela dentro da consulta do
ORM não é protegido pelo ORM. Quem conhece a sintaxe injeta condição nela igual. Parâmetro
nomeado em toda condição, sem exceção.
