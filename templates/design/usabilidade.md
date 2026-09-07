# Usabilidade — a tela que não gera chamado

Referência das skills `/interface`, `/backend` e `/revisar-design`. O comportamento da tela:
o que ela pede, o que ela responde, o que ela impede e para onde ela manda a pessoa depois.

> **O que não está aqui.** O padrão visual está em `templates/design/interface.md`: altura de
> controle, camada de estado, densidade, os quatro estados de conteúdo e tabela. O laudo de acessibilidade e velocidade está em
> `acessibilidade.md`, com `label`, foco de teclado, contraste e alvo de toque. O lado
> servidor do formulário, a validação em duas camadas e o mapa de mensagens de erro estão em
> `templates/backend/cadastro.md`. Aqui é só a decisão de interação, e ela vem antes do CSS.

---

## A regra que organiza todas as outras

**Erro de quem usa é defeito da tela.**

Quando chega a reclamação "o usuário fez errado", a investigação não é sobre a pessoa. É
sobre o que induziu ao erro: dois botões parecidos lado a lado, um rótulo que não diz a
consequência, um campo que aceitou o que não deveria, uma etapa sem retorno visível.

Treinar a pessoa mantém o defeito no ar. E paga suporte para sempre. Consertar a tela resolve
uma vez, para todo mundo que vier depois. Em negócio pequeno essa diferença é o mês inteiro
de quem atende.

Daí sai a fila de trabalho: **o que gera mais chamado é o que se conserta primeiro**, e o
resto espera.

---

## Uma ação primária por tela

Em cada tela existe uma coisa que a pessoa veio fazer. Essa ação recebe o botão cheio, o
peso visual e a posição de destaque. Todas as outras são rebaixadas para contorno, texto ou
menu.

Quando tudo tem o mesmo peso, nada tem peso. A pessoa gasta segundos decidindo o que era para
ser óbvio. Numa tela inicial com seis destaques do mesmo tamanho, a métrica de clique se
espalha e nenhuma das seis funciona.

**A regra de negociação:** se o cliente pedir mais um destaque, um outro sai do mesmo peso. O
número de ações primárias na tela é um, sempre. Isso vale inclusive para a página inicial do
site, onde a pressão para destacar tudo é maior.

Ação destrutiva nunca é primária, e nunca fica colada na principal. Apagar ao lado de enviar,
com a mesma aparência, cobra o preço uma vez por semana.

---

## Todo clique responde na hora

Nenhuma ação pode ficar sem retorno visível. Botão que dispara processo troca de estado no
mesmo instante: vira "Gerando boleto...", fica desabilitado, e só volta quando o servidor
responde.

Sem isso, a pessoa clica de novo. E de novo. O resultado aparece no banco: pedido duplicado,
cadastro duplicado, cobrança duplicada, e alguém desfazendo tudo na mão no dia seguinte.

| Duração da espera | O que a tela mostra |
|---|---|
| Até meio segundo | nada, a resposta chega antes de a pessoa perceber |
| Meio a três segundos | o botão em estado ocupado, desabilitado |
| Acima de três segundos | progresso real, e o que já está pronto liberado para uso |
| Processo longo (importação, relatório pesado) | libera a pessoa para fazer outra coisa e avisa no fim |

Prender alguém numa tela de carregamento gasta o recurso mais caro que ela tem sem entregar
nada em troca. Se dá para mostrar metade do resultado enquanto a outra metade carrega,
mostre.

O bloqueio do lado do servidor continua obrigatório: botão desabilitado não impede requisição
repetida. A trava contra duplicidade está em `templates/backend/cadastro.md`.

---

## Impedir o erro é melhor que explicar o erro

Antes de escrever a mensagem, pergunte se dá para tornar aquele erro impossível:

| Em vez de | Faça |
|---|---|
| avisar que a data é inválida depois de enviar | oferecer calendário e bloquear o dia que não existe |
| reprovar o formulário porque falta um campo | manter o botão desabilitado até a condição ser atendida, dizendo o que falta |
| aceitar o pedido e avisar que não há estoque | não deixar escolher a quantidade que não existe |
| explicar que o cupom não vale para esse produto | não exibir o cupom nesse produto |
| avisar que o arquivo é grande demais | dizer o limite ao lado do botão, antes da escolha |

O sistema já conhece a regra antes do envio. Deixar a pessoa errar para depois explicar gasta
o tempo dela à toa, e cria mais uma chance de desistência. O erro evitado não vira chamado.

Quando o erro for inevitável, a mensagem diz a causa **e** o conserto, junto do campo. O mapa
de mensagens está no `cadastro.md`.

---

## Peça só o que a tarefa de agora exige

Para cada campo, uma pergunta: sem esse dado, a ação de agora acontece? Se acontece, o campo
sai do formulário e vira pedido posterior, dentro do contexto em que ele passa a fazer falta.

O hábito contrário é forte, porque o formulário é onde a empresa junta tudo que gostaria de
saber sobre o cliente. Cada campo a mais é uma pessoa a menos terminando, e os campos extras
costumam voltar preenchidos com dado falso, o que é pior que não perguntar.

Três acompanhamentos disso:

- **Revele em doses.** Mostre o mínimo para começar e vá abrindo conforme a pessoa avança. Um
  campo convidando a comentar; os dados de cadastro só depois que ela decidiu comentar
- **Explique por que pede.** Ao lado de todo campo que não é obviamente necessário, uma linha
  dizendo para que aquilo será usado e o que a pessoa ganha em troca. Sem o motivo, o campo
  parece intromissão
- **Deixe o sistema fazer o trabalho pesado.** Antes de criar um campo, pergunte se o sistema
  já pode saber a resposta: dado do cadastro anterior, item mais usado, endereço do CEP,
  valor mais provável, o que está na área de transferência. Ofereça pronto para confirmar

Cada dado que o sistema deduz é um campo a menos e um erro de digitação a menos.

---

## Não exija cadastro antes da tarefa

Deixe a pessoa concluir a compra, o agendamento ou o pedido como convidada, pedindo só o
e-mail ou o telefone. O convite para criar senha vem depois, com um benefício claro: 
acompanhar o pedido, repetir a compra em um clique, guardar o histórico.

O cadastro antes da tarefa é interesse da empresa. A pessoa percebe. Ela veio terminar uma
coisa, e a tela pediu um compromisso antes de entregar qualquer valor.

Em sistema interno o equivalente é a tela de configuração obrigatória antes do primeiro uso.
Mesma regra: deixe usar com o padrão, e peça a configuração quando ela passar a fazer
diferença.

---

## Fale a língua de quem usa

O rótulo da tela é o nome que o cliente usa, não o nome da coluna do banco. Se ele diz
"geladeira", a categoria se chama Geladeiras, mesmo que o cadastro interno diga
"Refrigeradores". Rótulo errado esconde a informação de quem está justamente procurando por
ela.

Duas trocas que valem em qualquer sistema:

- data absoluta vira data relativa quando o que importa é o quão recente: "há 3 horas" em vez de "04/03/2026 14:33". O carimbo completo fica no detalhe, para quem precisa dele
- a chamada principal diz o que a pessoa vai conseguir fazer, não o que o sistema faz. "Encontre um lugar para ficar" em vez de "a maior plataforma de aluguéis"

O rótulo do botão diz a consequência do clique, e o teste é pedir para alguém ler em voz alta
e dizer o que espera que aconteça. "Enviar", "OK" e "Confirmar" reprovam. "Agendar visita",
"Gerar boleto" e "Excluir 3 pedidos" passam.

---

## Nenhuma tela é rua sem saída

Toda tela sugere o próximo passo, inclusive as que parecem terminais: sucesso, erro, lista
vazia, busca sem resultado, fim de fluxo.

| Tela | A saída que ela precisa oferecer |
|---|---|
| Pedido concluído | acompanhar o pedido, ou fazer outro |
| Busca sem resultado | o que mudar no filtro, e um caminho alternativo |
| Lista vazia de primeira vez | uma frase do que aparece ali e o botão que cria o primeiro |
| Erro | o que houve em português, e a ação que resolve |
| Fim de um cadastro longo | a próxima tarefa provável, não a tela inicial |

Lista vazia de primeira vez e busca sem resultado **não são o mesmo estado**: uma convida a
criar, a outra sugere mudar o filtro. Tratar as duas com o mesmo texto é o deslize mais
comum, e está detalhado em `interface.md`, seção "Os quatro estados de toda tela".

---

## Ação escondida precisa ser descobrível, e ter volta

Esconder ação secundária dá hierarquia à principal, e isso é bom. O preço é que gesto,
arrastar, deslizar e atalho não têm botão para ninguém ver.

Duas exigências para toda ação sem botão visível:

1. A regra é comunicada antes, durante ou logo depois da primeira vez que acontece
2. Existe uma forma fácil de desfazer

Sem as duas, o resultado é a pergunta "por que o sistema apagou o que eu tinha escrito?", e
ela chega por telefone.

---

## Simplificar uma tela que já está cheia

Quatro movimentos, nesta ordem. Serve para revisar tela existente sem redesenhar nada:

1. **Remover** — o que pode sair sem impedir a tarefa? Conteúdo, link, campo, rótulo repetido, ícone decorativo
2. **Organizar** — o que fica está agrupado em blocos que fazem sentido para quem usa, e não para quem programou?
3. **Esconder** — o que pode sair da vista e continuar acessível por navegação, um clique adiante?
4. **Mover** — o que pode ser feito em outro momento, em outra tela, ou por outro canal?

Remover vem primeiro de propósito. Esconder é o atalho preferido de todo mundo, e ele mantém a
complexidade inteira, só que em outro lugar. Nada foi simplificado.

---

## Ver três pessoas usando

Sente ao lado de três a cinco pessoas do público real, peça que façam a tarefa principal
falando em voz alta, e não ajude. Anote onde travaram, não o que acharam.

Opinião em conversa é palpite educado. Travamento observado é fato. E o benefício maior nem é
o relatório: é a exposição de quem construiu ao usuário real, que muda as decisões seguintes
sozinha.

Uma pessoa observada já vale infinitamente mais que nenhuma. Se o orçamento não paga cinco,
faça uma.

As horas de conversa com usuário entram embutidas no preço e no cronograma, nunca como item
opcional. Item opcional é o primeiro a cair quando o prazo aperta, e é justamente o que
evitaria o retrabalho que vem depois.

Um mês após o lançamento, a fonte mais barata de problema real é quem atende: vendedor,
recepção, telefone. Cruze o que essa pessoa relata com os termos digitados na busca do
sistema. Busca sem resultado é a lista do que falta, escrita pelos próprios usuários.

---

## Armadilhas

### A ação principal depende de uma escolha que ninguém sinalizou

**Sintoma:** a pessoa clica no botão maior da tela e recebe um aviso pedindo para selecionar
o tamanho, a cor ou a unidade, que estavam longe do botão.
**O que custa:** o clique mais importante da tela vira erro, e parte das pessoas desiste ali.
**Conserto:** o que é pré-requisito fica junto da ação, ou o botão espera desabilitado
dizendo o que falta escolher.

### Cadastro que reúne tudo que a empresa gostaria de saber

**Sintoma:** formulário longo, abandono no meio, e campos preenchidos com dado inventado.
**O que custa:** menos gente concluindo, e uma base de dados que ninguém pode usar para
decidir nada, porque metade dela é falsa.
**Conserto:** corte para o que a tarefa de agora exige. O resto vira pedido posterior, no
momento em que fizer sentido para quem responde.

### Copiar o padrão de um site grande sem entender o problema dele

**Sintoma:** uma interação que funciona muito bem em outro produto deixa o fluxo pior aqui, e
ninguém consegue explicar por quê.
**O que custa:** um mês de trabalho para piorar, mais a dificuldade de voltar atrás depois de
já ter defendido a escolha.
**Conserto:** antes de copiar, escreva qual problema aquele padrão resolve na origem e se
esse problema existe aqui. Escala, frequência de uso e familiaridade do público mudam tudo.

### Tela de carregamento na entrada, esperando que a pessoa espere

**Sintoma:** abandono alto antes de qualquer interação, com a métrica mostrando visita que
não gerou nem um clique.
**O que custa:** o visitante que veio de anúncio pago vai embora antes de ver o produto.
**Conserto:** trate tempo de carregamento como requisito desde o primeiro dia, ao lado de
escopo e prazo. A lista do que cortar está em `templates/design/desempenho.md`.

---

## As quatro perguntas, tela a tela

O critério de aceite de qualquer tela entregue. Se alguma resposta é não, a tela volta:

- [ ] A pessoa sabe **onde está** e em que passo do fluxo se encontra?
- [ ] A pessoa sabe **o que fazer**, e a ação principal está nítida?
- [ ] O texto do botão diz **o que vai acontecer** depois do clique?
- [ ] Se esta é uma tela final, ela sugere **para onde ir** em vez de virar rua sem saída?

E as cinco que valem para o conjunto:

- [ ] Cada campo do formulário sobreviveu à pergunta "sem isto a ação de agora acontece?"
- [ ] Todo clique tem retorno visível, e o botão que dispara processo fica ocupado
- [ ] Os erros mais comuns foram tornados impossíveis, não só explicados
- [ ] O que o sistema já sabe está preenchido, não perguntado
- [ ] Existe desfazer para o que apaga, e a ação destrutiva não está colada na principal

---

## O que não trazer

O material de origem é de uma época em que a discussão era outra, e parte dele envelheceu:

- **A cascata de protótipos** (desenho estático, depois layout, depois clicável, depois o código) — em negócio pequeno, rascunho à mão e o HTML real resolvem, e o intermediário é aprovado três vezes sem ninguém testar nada
- **Ferramenta de prototipagem, de mapa de calor e de gravação de sessão** citadas pelo nome. As de 2016 não existem mais, e nenhuma delas é pré-requisito das regras acima
- **Persona com foto, nome e biografia** — o que decide é a frase de proposição de valor e a lista do que fica de fora, escritas no `templates/software/escopo.md`
- **Os números de mercado** (percentual de abandono por segundo de espera, ganho de venda ao trocar um botão) — são de 2006 a 2016, medidos em produto que não é o seu. As réguas de velocidade que valem estão em `acessibilidade.md`, e o número que decide sai da medição da sua própria tela
