# Custo de um sistema

Referência da skill `/escopo`. A conta que o dono precisa enxergar antes de aprovar a
construção, quem paga o que ele pedir depois da entrega, e a pergunta que decide o
orçamento inteiro.

> **A fronteira desta pasta.** `templates/backend/` é o código: como se modela o banco,
> como se publica, como se investiga um defeito. `templates/software/` é o que o dono
> decide e paga: validação, escopo, custo, manutenção, evolução. Como escrever código não
> entra aqui.

---

## Orçamento fechado exige escopo fechado

Preço não é opinião firme sobre um número. É consequência do que já está escrito.
Enquanto ninguém listou quais telas existem, o que cada uma faz e o que fica de fora,
qualquer valor dito em voz alta é chute com cara de compromisso. E o chute erra sempre
para o mesmo lado.

A faixa de erro encolhe conforme o escopo fecha, não conforme o tempo passa. Pensar mais
sobre um pedido vago não estreita nada.

Daí saem três formas honestas de fechar valor, e nenhuma delas começa com "eu estimo":

- **Escopo fechado, preço fechado** — vale só depois que a lista do que entra e a lista
  do que NÃO entra estão escritas e aceitas pelos dois lados. Mudança depois disso é
  pedido novo, com preço novo
- **Teto de gasto, escopo aberto** — o dono diz quanto está disposto a gastar, e a
  pergunta vira o que cabe dentro disso. Quem corta é ele, nunca o fornecedor
- **Ciclo recorrente** — tantas horas por mês, repriorizadas a cada ciclo. É o formato
  certo para cliente pequeno que ainda vai descobrir o que quer, e ele vai querer mudar

Um projeto de software só termina quando o programa é apagado dos computadores. Contrato
que finge o contrário transforma toda mudança em briga.

**Regra dura:** aceitar escopo novo sem mexer em prazo nem em preço não deixa a conta
igual. Ela sai da qualidade. Sai em silêncio, e volta meses depois em forma de retrabalho.
Se nada se mover, diga em voz alta o que vai ser cortado e deixe o dono escolher.

---

## As duas colunas

Todo sistema tem dois tipos de custo. Misturar os dois faz o dono aprovar um projeto que
ele não consegue sustentar. O que se paga uma vez sai do caixa hoje. O que se paga todo
mês sai do caixa para sempre, inclusive no mês em que ninguém abrir o sistema.

### O que se paga uma vez

| Item | Valor | De onde sai o número |
|---|---|---|
| Construção da primeira versão | [a confirmar] | horas combinadas × valor da hora, no contrato |
| Migração do que hoje está em planilha | [a confirmar] | quantas planilhas, quantas linhas, quantos formatos diferentes |
| Treinamento de quem vai usar | [a confirmar] | quantas pessoas × horas de treino |
| Registro do domínio, se ainda não existe | [a confirmar] | página do registrador, na hora de registrar |

### O que se paga todo mês

| Item | Quanto | Onde conferir |
|---|---|---|
| Domínio | valor anual dividido por 12 | fatura do registrador |
| Hospedagem da aplicação | [a confirmar] | aba de faturamento do provedor |
| Banco de dados gerenciado, quando fica separado | [a confirmar] | mesma fatura, linha própria |
| Certificado do cadeado (HTTPS) | costuma ser zero | hospedagem gerenciada já inclui; servidor cru, não |
| E-mail transacional (confirmação, recuperação de senha) | [a confirmar] | painel do serviço de envio |
| Gateway de pagamento | percentual por transação mais tarifa fixa | contrato do gateway, não a página de vendas dele |
| Backup guardado fora do provedor | [a confirmar] | fatura do armazenamento |
| Conta de desenvolvedor de loja de aplicativo | valor anual dividido por 12 | cobrada mesmo quando o app é gratuito |
| Horas de manutenção | horas por mês × valor da hora | combinado por escrito, antes de precisar |

Duas dessas linhas escapam de quase todo orçamento. A conta de desenvolvedor de loja é
cobrada por ano mesmo que o aplicativo seja gratuito e ninguém baixe. E o backup: o
provedor guarda a cópia dentro dele mesmo. Não serve no dia em que o problema é ele.

### O exemplo fechado

Os valores abaixo são inventados, e servem só para mostrar a conta fechando. Troque cada
linha pelo número da sua fatura antes de mostrar isso para alguém.

| Item | Todo mês (R$) |
|---|---|
| Domínio (R$ 60 por ano, dividido por 12) | 5 |
| Hospedagem da aplicação | 60 |
| Banco de dados gerenciado | 45 |
| E-mail transacional | 15 |
| Backup fora do provedor | 10 |
| Conta de desenvolvedor da loja (R$ 300 por ano, dividido por 12) | 25 |
| **Total** | **160** |

Doze meses disso são 12× R$ 160 = R$ 1.920. Esse é o número que o dono precisa ver antes
de assinar, e não depois.

```bash
node scripts/verificar.js tabela templates/software/custo.md
```

O comando soma a coluna, compara com a linha de total e confere a multiplicação escrita na
prosa. Rode em toda tabela de custo que sair daqui, inclusive na que vai dentro de uma
proposta. Soma errada custa a venda inteira.

### Quando a conta mensal começa a subir

Máquina maior é a resposta mais cara e a mais fácil de aprovar, porque cobra por hora,
para sempre. Em sistema que lê muito mais do que escreve, cache reduz a máquina que você
paga. E antes do cache, quase sempre, o problema é uma consulta sem índice, cujo conserto
não acrescenta um centavo por mês. A ordem dos degraus está em
`templates/backend/dados.md`, na seção "Quando o banco não dá mais conta". Aqui interessa
a consequência: subir a máquina antes de medir é aumentar a linha mensal para sempre por
causa de um defeito de meia hora.

---

## O custo que não aparece na fatura

Em negócio pequeno, a conta do servidor costuma ser a menor linha do orçamento. O que
custa é gente. Custo de operação é trabalho humano: alguém respondendo a mesma dúvida pela
quinta vez, alguém corrigindo na mão o registro que entrou errado, alguém exportando
planilha porque falta uma coluna no relatório. Isso não vem em fatura nenhuma.

Todo chamado que se repete é defeito de produto, não atendimento. Se três pessoas
perguntam no mesmo dia onde se troca a senha, o conserto é a tela. Pôr mais gente para
atender esse chamado é pagar juros num problema que tem quitação.

**O que fazer com isso:** anote assunto por assunto os chamados de um mês e ordene por
quantidade. O assunto do topo é o próximo item a construir, e é o único item da fila cujo
retorno dá para calcular: número de chamados × minutos por chamado × custo do minuto.

Produto que exige atendimento constante morre de custo antes de morrer de mercado.

---

## O que o cliente pede depois da entrega

Todo retorno depois de uma entrega cai numa de quatro caixas. Classifique antes de
responder. É o que impede que cada conversa vire discussão sobre "isso já não estava
incluso?".

| O que chegou | O que é | Quem paga |
|---|---|---|
| Problema | Não faz o que foi combinado | Por conta da casa, sem acrescentar prazo |
| Melhoria | Faz o combinado, e ele quer melhor | Acrescenta prazo, acordado antes de entrar |
| Alteração | Faz o combinado, e ele quer diferente | Acrescenta prazo, acordado antes de entrar |
| Funcionalidade nova | Não estava combinado | Acrescenta prazo, acordado antes de entrar |

Só a primeira caixa é sua. As outras três precisam ser acordadas antes de entrar na fila,
nunca depois de prontas.

Os dois extremos quebram a relação por lados opostos. Chamar tudo de problema é trabalhar
de graça e nunca fechar escopo. Chamar tudo de escopo novo ensina o cliente a desconfiar
de cada entrega. A separação escrita sustenta os dois lados.

**A exceção honesta:** quando a melhoria é trivial e mantém o cliente satisfeito, fazer
sai mais barato do que discutir. Faça. E registre por escrito que foi cortesia, com data,
senão vira precedente e a terceira cortesia já chega cobrada como obrigação.

### Registre por escrito o que foi combinado por voz

Cliente pequeno pede por telefone, por WhatsApp, no corredor. Nenhuma dessas conversas tem
ata. Depois de cada uma, mande uma mensagem escrita com o que ficou combinado e com o que
isso empurrou para depois. Custa dois minutos. Sem esse registro, a discussão vira "você
disse que faria" e ninguém prova nada. O escopo cresce sem nota, e quem paga a diferença é
sempre o mesmo.

---

## Preço não se calcula somando custo

Somar o que você gasta e acrescentar uma margem é a conta mais fácil de fazer e a que mais
deixa dinheiro na mesa. Software custa caro para produzir e barato para reproduzir:
atender o décimo cliente não custa dez vezes o primeiro. Preço se define pelo valor
percebido. O custo entra como piso: se o preço não cobre a operação, não há preço.

Isso vale para quem vende. Para quem compra, a mesma tabela vira teste de sanidade: um
sistema que custa por mês mais do que economiza por mês não deveria existir. Some as horas
que a rotina manual consome hoje, multiplique pelo custo dessas horas e compare com a
linha do total mensal.

Preço do serviço que **você** vende é assunto da skill `/preco`. Aqui a conta serve para
decidir se vale construir.

---

## Armadilhas

### A fatura que ninguém abriu

**Sintoma:** aparece no cartão uma linha de poucos reais por recurso, todo mês, e ninguém
sabe dizer o que é. Ou o painel de custos mostra gasto constante num serviço que ninguém
usa há semanas.
**O que custa:** o valor unitário é baixo o bastante para ninguém reclamar e alto o
bastante para pagar um ano inteiro de nada, multiplicado por cada cliente que você atende.
**Conserto:** ligue o alarme de gasto e crie um orçamento com aviso por e-mail antes de
criar o primeiro recurso pago, e force um teste para provar que o aviso chega. Quem cria
recurso para experimentar escreve o passo de desligar junto com o de criar. E roda esse
passo no fim da sessão. Custo é métrica com alarme, igual a memória cheia.

### "A gente paga, paga, e nada"

**Sintoma:** o cliente diz isso mesmo com módulos entregues no prazo. Você lista o que já
foi feito, e ele responde que aquilo era complemento e não fazia falta.
**O que custa:** o dinheiro já saiu, e o que pararia o negócio se sumisse continua em
planilha. A confiança some antes do orçamento acabar.
**Conserto:** a ordem de entrega é a do cliente, não a de quem constrói. Pergunte qual
parte, se parasse amanhã, pararia o negócio. Essa é a próxima, mesmo que metade do que já
foi feito fique parada esperando.

### A funcionalidade pequena

**Sintoma:** o pedido vem embrulhado em "é uma coisinha rápida". Meses depois, a tela
precisa de explicação, e o suporte passa o dia explicando configuração.
**O que custa:** nenhuma funcionalidade é pequena o bastante para não trazer mais código
para manter e mais interação para entender. A complexidade fica para sempre, inclusive
quando ninguém usa aquilo.
**Conserto:** trate "é rápido" como sinal de alerta, não como argumento. Antes de aceitar,
escreva numa linha o que o usuário e o dono ganham. Se a linha não sai, o item espera.

### O aplicativo que ninguém pediu

**Sintoma:** o dono quer o ícone na tela do celular, e a lista de recursos do aparelho que
o sistema precisa chamar está vazia.
**O que custa:** conta de desenvolvedor por ano em cada loja, material de publicação,
revisão que pode recusar sem canal de negociação, e uma atualização que só chega quando o
usuário atualiza. Some a chave que assina o aplicativo. Se ela se perder, não há conserto:
só republicar como outro app e perder quem já instalou.
**Conserto:** escreva a lista de recursos nativos antes de prometer qualquer coisa. Lista
vazia significa site. Se a loja entrar mesmo, ponha as contas anuais na coluna mensal do
orçamento e defina, por escrito, onde a chave de assinatura mora e quem tem acesso a ela.

---

## A pergunta que decide o orçamento inteiro

**Quem mantém isso daqui a um ano, e quanto custa a hora dessa pessoa?**

Responda por escrito, com nome, antes de aprovar qualquer coisa. As respostas possíveis
são poucas, e cada uma muda o número:

- **Você mesmo** — o custo é o seu tempo, e ele tem preço: some as horas que você deixaria
  de faturar. Escolha o que você consegue tocar, não o que é mais elegante
- **Quem construiu, num contrato de manutenção** — o custo fica previsível e o risco é a
  dependência. Exija que repositório, contas e segredos estejam em nome do dono desde o
  primeiro dia
- **Ninguém** — é a resposta mais comum e a mais cara. Sistema sem dono não para de
  custar: para de melhorar, e segue cobrando até o dia em que quebra e o conserto sai mais
  caro que a construção inteira

Essa pergunta manda na hospedagem, no banco e na decisão entre site e aplicativo.
`templates/backend/stack.md` abre por ela, na seção "O critério que vem antes de todos".
Aqui ela tem outro papel: virar linha do orçamento.

Quem contrata software sabe tocar o negócio dele e sabe comprar software pronto. Ser dono
de um software é outra coisa. Ninguém nasce sabendo priorizar, medir e dizer não ao
próprio pedido. Ensinar isso faz parte da entrega.

---

## Antes de mandar o número para o dono

- [ ] As duas colunas estão separadas, e a mensal aparece multiplicada por doze
- [ ] Cada linha tem origem: fatura, contrato ou painel. Nenhuma tem "mais ou menos"
- [ ] A lista do que NÃO entra está escrita, e é maior que uma linha
- [ ] As horas de manutenção estão no orçamento, não numa conversa futura
- [ ] Está escrito quem mantém depois, com nome
- [ ] O alarme de gasto foi ligado antes do primeiro recurso pago
- [ ] `node scripts/verificar.js tabela <arquivo.md>` passou e a soma bate

Número que ninguém consegue rastrear até uma fatura não é orçamento. É esperança com
formatação de tabela.
