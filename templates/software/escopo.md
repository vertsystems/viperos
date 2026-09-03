# Escopo — o que construir, em que ordem, e o que fica de fora

Referência da skill `/escopo`. Como transformar um pedido em lista ordenada, como saber
que um item está pronto, e como dizer não sem quebrar a relação.

> Quanto custa cada item e quem paga o que for pedido depois estão em
> `templates/software/custo.md`. Aqui não se escreve uma linha de código: isso é
> `templates/backend/`.

---

## O pedido chega como solução, quase sempre

O dono não diz "meus pedidos se perdem entre o WhatsApp e o caderno". Ele diz "põe um
campo de observação na tela de pedido e um relatório por vendedor". A demanda chega
pronta, em forma de tela, e sem uma palavra sobre o problema.

Quem constrói exatamente o que foi pedido entrega, ouve "já ajuda, mas agora eu preciso
também de...", e recomeça. O cliente sabe muito bem o que quer: o problema resolvido. O
que ele não sabe é qual é a melhor solução, e essa parte é sua.

**A pergunta que abre tudo:** de quanto para quanto isso tem que mudar?

Escreva o resultado esperado em número antes de escrever a funcionalidade. Se o dono não
consegue dizer o número, o item ainda não está pronto para ser construído. Não é rigor
burocrático. É o que separa "quero um relatório de vendas" de "quero fechar o mês em
quinze minutos em vez de quatro horas".

**Regra:** só comece a construir depois de conseguir escrever o problema sem citar
nenhuma tela, nenhum campo e nenhum botão.

### Perguntas que trazem a conversa de volta ao problema

- Me conta qual é a dificuldade. Onde ela costuma acontecer?
- Quando foi a última vez? O que aconteceu naquele dia?
- Por que aquilo foi ruim? O que você deixou de fazer por causa disso?
- Como você resolve hoje, sem sistema nenhum? O que te incomoda nesse jeito?
- Se isso ficar resolvido, o que muda no seu dia?

Não menospreze a solução que ele trouxe. Anote como sugestão, agradeça, e volte ao
problema. Entender custa horas. Construir custa semanas.

**Quando esta seção não vale:** correção de defeito e mudança imposta por lei ou por
fornecedor. Ali a solução já está determinada e perguntar o porquê só atrasa.

---

## Quem paga não é quem usa

O dono da loja contrata. Quem passa oito horas na tela é a atendente. São duas pessoas
diferentes, com dois objetivos diferentes, e o sistema que atende só o primeiro é entregue
conforme o combinado e detestado no primeiro dia.

Levante os dois separadamente. O objetivo do dono (menos erro no fechamento, menos ligação
de cliente perguntando o status) e o problema de quem usa (digitar o mesmo endereço três
vezes por pedido). Se o contratante não conhece os próprios usuários, descobrir isso faz
parte da entrega, entra no prazo e entra no preço. Não se oferece "com pesquisa" e "sem
pesquisa" como duas opções de orçamento.

**Como descobrir sem virar projeto:** sente ao lado de três a cinco pessoas do público
real e peça que façam a tarefa principal sem ajuda. Anote o que travou, não o que elas
acharam. E olhe os dez minutos antes e os dez minutos depois do uso: se a pessoa busca um
dado em outro sistema para digitar no seu, falta uma integração; se ela copia o resultado
para uma planilha para montar um gráfico, esse gráfico deveria estar dentro do sistema.
Depois de seis a oito observações o padrão aparece sozinho.

**E uma consequência que muda a conversa toda:** "o usuário fez errado" é defeito de
interface, não falta de treino. Procure o que induziu ao erro.

---

## A fatia vertical

Entregue o sistema em fatias que atravessam tudo: tela, regra, banco e teste de uma
funcionalidade só, funcionando de ponta a ponta. Nunca "primeiro todo o banco, depois toda
a API, depois todas as telas". Camada pronta não serve para nada. Ninguém usa metade de
uma escada.

Cadastrar um pedido e ver o pedido na lista é fatia. O banco inteiro modelado é camada.

Na primeira entrega, coloque o básico de cada parte em vez de uma parte completa e as
outras vazias. Aprofunde depois, com o sistema já rodando na mão de alguém.

**Lance a versão menor inteira, não a versão grande pela metade.** Corte escopo, nunca o
acabamento do que entra. Um cadastro simples que funciona, valida, avisa o erro em
português e imprime vale mais que quatro módulos meio prontos.

Antes do primeiro ciclo, defina só a base mínima que evita decisão tardia capaz de
invalidar o que já foi construído: banco, hospedagem, como se publica. Nada além disso.
`templates/backend/stack.md` decide essas três, e abre pela pergunta certa na seção "O
critério que vem antes de todos".

---

## Uma lista só, ordenada, sem empate

Uma lista. Não uma de funcionalidades e outra de defeitos. Funcionalidade, correção,
melhoria e investigação disputam a mesma fila, porque no fim do mês disputam as mesmas
horas.

**Sem dois itens na mesma posição.** Se dois itens são prioridade máxima, nenhum é. A
ordenação é o produto do trabalho de escopo: uma lista com tudo marcado como urgente
devolve a decisão para quem constrói, que é justamente quem não pode tomá-la.

Detalhe só o que está perto de entrar. Item que ainda tem duas ou mais entregas pela
frente merece um nome e nada mais. Análise feita seis meses antes chega obsoleta, e o
trabalho de detalhá-la foi desperdício antes de virar código.

Cada item da lista carrega duas linhas coladas nele:

- **Motivação** — mais clientes, mais receita, menos chamado de suporte, menos erro no fechamento
- **Métrica** — como saberemos que conseguiu, e de qual tela ou consulta esse número sai

Se coletar a métrica exige código, esse código entra no mesmo item. Não vira "depois a
gente vê como mede", porque depois ninguém mede.

---

## Preparado e pronto, as duas listas curtas

São dois portões: um na entrada do item e outro na saída. Escritos, curtos, iguais para
todos os itens, e visíveis no repositório.

**Preparado** (o item pode entrar em desenvolvimento):

- [ ] O problema está escrito, e não a tela que alguém imaginou
- [ ] Os critérios de aceite estão acordados com quem pediu
- [ ] Cabe em menos de dois ou três dias de trabalho. Se não cabe, foi quebrado antes
- [ ] Não depende de credencial, aprovação ou acesso de terceiro que ainda não existe

**Pronto** (o item pode ser mostrado e publicado):

- [ ] Os critérios de aceite passam, inclusive o caminho de erro
- [ ] Tem teste, e a bateria roda inteira
- [ ] Está publicado no ar, não só na máquina de quem construiu
- [ ] O que mudou está anotado, incluindo o que não é código

"Está pronto, só falta testar" é a frase que denuncia a falta desse portão. Não aceite o
item cru "para adiantar". O que entra despreparado sai despreparado, e a diferença aparece
no dia da entrega.

---

## Critério de aceite: entrada e resultado, com número

Adjetivo não é critério. "Rápido", "intuitivo", "bonito" e "fácil de usar" não dá para
conferir olhando, e por isso não dá para dizer que o item terminou. Traduza cada um em
fato verificável, ou o item volta para quem pediu.

| O pedido | O que não serve | O critério que serve |
|---|---|---|
| "A busca tem que ser rápida" | rápida | Buscar "joão" entre 5.000 clientes devolve a lista em menos de 1 segundo |
| "O relatório tem que estar certo" | certo | O total de setembro bate com a soma das notas do mês, conferida linha a linha |
| "A tela de pedido tem que ser intuitiva" | intuitiva | Três atendentes que nunca viram o sistema lançam um pedido sem ajuda |
| "Não pode duplicar cliente" | não pode | Cadastrar o mesmo CPF duas vezes mostra o cadastro existente e não cria outro |

Escreva os exemplos como entrada e resultado esperado, com os dados de partida dentro do
próprio texto. Se quem lê não consegue reconstruir por que aquele resultado é o certo, o
critério está incompleto:

| Entrada | Resultado esperado |
|---|---|
| Pedido de R$ 100,00 com cupom de 10% válido até 30/09 | Total gravado: R$ 90,00 |
| O mesmo pedido com o cupom vencido em 02/09 | Recusa com a mensagem "cupom vencido em 02/09" e total de R$ 100,00 |
| Pedido sem cupom | Total gravado: R$ 100,00 |

**Toda funcionalidade nasce com pelo menos dois cenários:** um de sucesso e um de erro. O
de erro é o que quase ninguém escreve, e é onde mora a maior parte dos chamados de suporte
do primeiro mês.

---

## Prazo é teto, não estimativa

Ninguém sabe quanto tempo leva. Nem você, nem o desenvolvedor, nem o Claude. Estimativa em
horas vira promessa na cabeça de quem ouviu, e a cobrança chega no formato "você disse três
dias, por que não está pronto?".

Então inverta. **O teto é dado pelo dono, e a pergunta vira o que cabe dentro dele.**

- O dono diz até quando precisa estar no ar, e por quê. A data costuma ter motivo real: temporada, fiscalização, contrato, feira
- A lista ordenada é lida de cima para baixo até acabar o tempo disponível
- O que ficou abaixo da linha vira a lista do que NÃO entra, escrita e mostrada
- O teto não se negocia. A lista, sim

Quem corta é o dono, nunca quem constrói. Mostrar a lista e deixá-lo escolher é diferente
de escolher por ele e avisar depois.

Sobre capacidade: só dá para calcular quanto o time entrega por ciclo depois de três
ciclos entregues, tirando a média dos três últimos. No primeiro projeto isso não existe, e
inventar um número no lugar é estimativa fantasiada de conta. Prefira acurácia à precisão:
"em novembro" dito com honestidade vale mais que "dia 12 de novembro" dito com firmeza.

---

## Como dizer não

"Vou colocar no backlog" é a pior resposta possível. Ela não recusa e não aceita. Meses
depois, quem pediu descobre que estar na lista não garantia nada, e fica mais insatisfeito
do que se tivesse ouvido não na hora.

**O jeito que funciona:** mostre a lista, mostre a motivação dos itens que estão acima do
pedido dele, diga não, e feche assim: "você me lembra de conversarmos sobre isso mais para
frente?". A responsabilidade de lembrar volta para quem pediu. Se ele não lembrar, o
pedido não era importante. Se lembrar, reavalie de verdade, e diga não de novo se for o
caso.

Quando a urgência chega no meio de algo já começado, pergunte primeiro se ela é real ou se
espera a próxima entrega. Se for real, ela entra trocando por outro item de tamanho
parecido que ainda não foi começado, e a troca é registrada por escrito. Sem a troca, a
conta não fica igual: ela sai da qualidade, em silêncio, e volta em forma de retrabalho.

Se a troca virar rotina, o problema não é a urgência. É o ciclo.

---

## "Quero um dashboard"

Esse pedido é o que mais vira projeto sem fim. Cada entrega gera três pedidos novos, e
nunca existe critério para dizer que acabou. O conserto é uma tabela aprovada antes da
primeira linha de código: as medidas nas linhas, os recortes nas colunas, e um X onde
o cruzamento entra nesta fase.

| Medida | Por dia | Por cliente | Por produto | Por vendedor |
|---|---|---|---|---|
| Faturamento | X | X | X | |
| Quantidade vendida | X | | X | |
| Ticket médio | X | | | |
| Margem | | | | |

O que não tem X é fase seguinte, e isso está combinado antes de começar. Para cada medida
que entra, escreva três coisas: a granularidade, a fórmula e de onde o dado vem.

**Nem toda medida existe para todo recorte.** Se a medida está no cabeçalho do pedido
(frete, desconto do total) e o recorte está no item (produto), o cruzamento não existe.
Declare que não existe. Ratear por média entrega um número que não corresponde a documento
nenhum, e que vai ser contestado no primeiro fechamento.

**Antes de construir, meça o processo de hoje:** quanto tempo leva, quanto custa e com que
frequência erra. Anote. É esse número que, seis meses depois, prova que o sistema pagou o
que custou.

---

## Armadilhas

### "Só mais essa funcionalidade antes de lançar"

**Sintoma:** a data de lançamento anda sozinha para a frente e a lista de pendências não
encurta. As desculpas se repetem: não está bom o bastante, falta um detalhe, alguém pode
copiar.
**O que custa:** meses sem ninguém usando, e portanto meses sem aprender nada sobre o que
faltava de verdade. Cada funcionalidade a mais é código para manter e interação para
explicar, para sempre, inclusive quando ninguém a usa.
**Conserto:** fixe o teto de tempo, escolha o que cabe, publique. Antes de aceitar
qualquer item novo, escreva em uma linha o que o usuário e o dono ganham com ele. Se a
linha não sai, o item espera.

### Levantar tudo antes de construir qualquer coisa

**Sintoma:** meses de reunião e nenhuma tela funcionando. O cliente pede tudo que consegue
imaginar, porque sabe que não terá outra chance de intervir.
**O que custa:** o documento envelhece antes de virar código, e o dinheiro gasto no
levantamento não deixa nada rodando. Quem sabe que vai ver o resultado em duas semanas
pede menos.
**Conserto:** primeira fatia utilizável em dias, não em meses. Detalhe só o que entra na
próxima entrega e deixe o resto como título.

### "A gente coloca como opção na configuração"

**Sintoma:** cada pedido divergente vira uma chave a mais na tela de configurações. Meses
depois, o suporte passa o dia explicando configuração.
**O que custa:** combinações que ninguém testa, tela intimidadora, e uma decisão empurrada
para o usuário justamente porque ninguém quis tomá-la.
**Conserto:** trate opção de configuração como funcionalidade completa, com a mesma
pergunta de motivação e métrica. A maioria não passa nesse teste.

### Cada área pede a sua e todas entram

**Sintoma:** uma reunião de uma hora gera cinquenta ideias, o prazo estoura, e ninguém
consegue dizer em uma frase o que o sistema é.
**O que custa:** um produto sem centro, caro de construir e impossível de explicar para
quem vai usar. Excesso de funcionalidade cria um problema novo em vez de resolver o do
cliente.
**Conserto:** escreva a proposição de valor em uma frase, no topo do documento de escopo,
e use como filtro escrito para cada ideia nova. O que não serve à frase fica de fora, e a
recusa é registrada.

---

## O que não trazer para um time de uma a três pessoas

O material de gestão ágil foi escrito para times de cinco a nove pessoas com um cliente
corporativo do outro lado. Metade dele não sobrevive à escala de um negócio pequeno, e
tentar aplicá-lo é cerimônia sem contrapartida:

- **Papéis** — não existe "dono do produto" e "facilitador" quando são duas pessoas
- **Reunião diária** — quem senta na mesma sala já sabe o que o outro está fazendo
- **Retrospectiva formal** — vira uma pergunta ao fim da entrega: o que atrapalhou desta vez?
- **Velocidade e pontuação** — medir capacidade em pontos exige histórico que não existe
- **Quadro de tarefas com raias** — a lista ordenada num arquivo de texto resolve, e o `/tarefas` já dá o ritmo
- **Estimativa em grupo** — não há grupo

O que sobrevive são as quatro peças deste arquivo: fatia vertical, lista única ordenada
sem empate, definição de preparado e definição de pronto. Elas funcionam com uma pessoa
só.

E vale o aviso que o próprio material dá contra si mesmo: quadro na parede não faz ninguém
entregar. Para cada prática que você mantiver, escreva o resultado que ela produz e como
você sabe que produziu. A que não passar nesse teste, tire.

---

## Antes de fechar o escopo

- [ ] O problema está escrito em uma frase, sem citar tela, campo ou botão
- [ ] O resultado esperado tem número: de quanto para quanto
- [ ] Quem usa está identificado, e é diferente de quem paga
- [ ] A lista está ordenada, sem dois itens na mesma posição
- [ ] A lista do que NÃO entra existe, está escrita e é maior que uma linha
- [ ] Cada item do topo tem critério de aceite com entrada e resultado, sem adjetivo
- [ ] Cada item tem motivação e métrica, e a coleta da métrica está no mesmo item
- [ ] Preparado e pronto estão escritos e valem igual para todos os itens
- [ ] O teto de prazo é do dono, e o que não coube está visível para ele
- [ ] A tabela de custo passou em `node scripts/verificar.js tabela <arquivo.md>`
- [ ] Está escrito quem mantém isso depois, com nome

Escopo que ninguém consegue ler e dizer "isto entra, aquilo não" não é escopo. É uma
conversa que vai ser repetida.
