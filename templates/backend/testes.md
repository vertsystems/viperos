# Testes — o que não testar, e o que a bateria diz do código

Referência das skills `/backend` e `/testar`. A ordem de prioridade quando o tempo é curto, os
três tipos de teste, os exemplos de unidade, de integração e de migração e a lista do que não
pode existir numa bateria estão em `entrega.md`, na seção "Testar o que quebra caro". Este
arquivo começa onde aquele para: o critério para **não** escrever um teste, o que a bateria
denuncia sobre o código, a configuração que impede a bateria de mentir, e os poucos casos
rodam contra o sistema publicado a cada subida.

---

## Quem paga a bateria é o dono

Teste é hora de trabalho. Num negócio de 1 a 10 pessoas, essa hora sai do mesmo bolso que paga
a funcionalidade, e quem decide se ela vale a pena é o dono. Por isso "isso merece teste?" não
é preguiça de quem escreve o código. É pergunta de orçamento, e ela tem resposta. Bateria e
suíte, daqui em diante, são a mesma coisa: o conjunto de testes que roda de uma vez só.

Bateria inflada e bateria ausente terminam no mesmo lugar: ninguém roda. Uma porque não
existe. A outra porque demora, quebra sozinha e treinou todo mundo a ignorar o vermelho. O
corte que separa as duas não é por preguiça, é por natureza do código.

| O que é | Testar? | Por quê |
|---|---|---|
| Regra com dinheiro, prazo, desconto ou permissão | Sim, todos os ramos | É o que o dono perde quando erra |
| Consulta e gravação no banco | Sim, contra banco de teste de verdade | O defeito mora no SQL, e ele não avisa |
| Serviço externo (pagamento, nota, mensagem) | Sim, contra o ambiente de teste do fornecedor | Contrato de terceiro muda sem avisar você |
| Fluxo que o cliente percorre todo dia | Um caso, pelo navegador | Só ele pega a junta entre tela e servidor |
| Leitor e gravador de campo, construtor, repasse de uma linha | Não | Isso testa a linguagem, não o seu código |
| Cola de framework: rota que só chama o serviço, registro de dependência, arquivo de configuração | Não | O defeito ali é de integração, e sai no teste de fumaça |
| Rota sem nenhuma regra dentro | Não em unidade | Precisa de meia dúzia de dublês, quebra a cada mexida e não pega o defeito real |
| Formatação e aparência de tela | Não, até quebrar uma vez | Depois disso, o caso específico vira teste |

Se a rota tem regra de negócio dentro e por isso pede teste de unidade, o problema não é o
teste. É a regra estar no lugar errado.

**A decisão de não testar é decisão, e decisão se escreve.** Configure a medição de cobertura
para ignorar exatamente o que você excluiu, e deixe na pasta de testes uma linha por item
excluído, com o motivo. Sem isso, daqui a três meses ninguém sabe se aquele trecho está
descoberto de propósito ou por esquecimento.

O `entrega.md` já diz que cobertura alta não é o objetivo. Falta o outro lado: para que o
número serve. Ele acha o trecho por onde nenhum teste passou. Nada além disso. E tem um ponto
cego perigoso: tudo que você declara na configuração do framework conta como coberto sem nunca
ter sido exercitado. Campo obrigatório, unicidade, exclusão em cascata e
permissão pedem teste próprio: o framework garante o mecanismo, não que você declarou a coisa
certa. O que precisa existir também como restrição no banco está em `cadastro.md`, na seção
"Validar duas vezes, por dois motivos diferentes".

---

## Um teste por classe de equivalência, não por valor

Somar 1+1, 1+2 e 2+2 é o mesmo teste escrito três vezes. Escreva um teste para cada conjunto
de entradas que o código trata do mesmo jeito, e um a mais para cada fronteira. Entrada nova
que percorre o mesmo caminho do código já está coberta. Ramo novo, limite exato, vazio, nulo e
ordem trocada não estão.

Teste repetido não aumenta a segurança e multiplica o custo de toda mudança futura. Uma
alteração de assinatura que levaria trinta segundos vira meia hora de conserto de teste.

**Os extremos concentram o defeito.** Toda função que recebe faixa, contagem ou índice merece
esta lista, e ela cabe em minutos:

- Zero elementos, e um elemento só
- Dois elementos na ordem certa, e os mesmos dois na ordem trocada
- O primeiro item da faixa, e o último
- Um além do último, e o índice máximo mais 1
- O item procurado que não existe na coleção

Duas exceções ao corte por classe de equivalência. O valor concreto que já causou defeito em
produção vira teste próprio e fica para sempre, mesmo parecendo redundante. E o teste que
sobrou da fase em que você ainda estava descobrindo o algoritmo se apaga, junto com o teste de
funcionalidade que deixou de existir. Bateria desatualizada não ajuda ninguém.

---

## A asserção que explica a falha sozinha

A bateria fica vermelha numa sexta às 19h. O que decide se o conserto leva dois minutos ou
duas horas é a mensagem que aparece na tela, não o código do teste.

- **Nome do teste** é comportamento mais cenário: "devolve frete zero quando o subtotal passa
  do limite". Nome com o valor concreto dentro convida a criar o teste irmão redundante, e
  nome com número de sequência não diz nada quando quebra
- **Valor esperado antes do valor calculado**, na suíte inteira. Invertido, a mensagem diz
  "esperava 0, veio 1" quando era o contrário, e o diagnóstico começa errado
- **Lista se confere pelo conteúdo**, nunca só pela quantidade. Contar dois itens não prova
  que são os dois certos, nem que estão na ordem certa
- **A verificação olha o efeito, não o aviso.** O registro apareceu na listagem, o saldo mudou,
  o e-mail entrou na fila. Mensagem verde na tela é HTML
- **Um comportamento por teste.** Quando ele quebrar, você precisa saber qual regra caiu sem
  abrir o corpo do método. A exceção é o método que devolve objeto novo: aí o teste confere o
  conteúdo inteiro dele

---

## Prove que o teste sabe falhar

**Sintoma.** O teste nasceu verde e ninguém estranhou. Ele continuaria verde se a regra fosse
apagada do código.

**O que custa.** O pior tipo de teste que existe. Ele some da lista de problemas, ocupa uma
linha no relatório de cobertura e cria a sensação de que aquele fluxo está protegido. O defeito
chega ao cliente por um caminho marcado como coberto.

**Conserto.** Antes de dar qualquer teste por pronto, inverta a asserção ou quebre a regra de
propósito, e rode. Não ficou vermelho? Ele não testa nada.

```bash
npm test -- -t "devolve frete zero"    # roda só esse, com a regra quebrada de propósito
```

A mesma regra vale para a suíte inteira. Se rodar o sistema na mão produz erro e a bateria
continua verde, conserte a bateria antes de tocar no código.

---

## Dublê: forje o colaborador, nunca o sujeito

Dublê é o objeto de mentira que ocupa o lugar de uma dependência durante o teste. Ele resolve
um problema real e cobra um preço: cada dublê amarra o teste ao jeito como o código faz a
coisa, e não ao resultado. Quanto mais dublê, mais frágil fica a bateria.

| Dependência | No teste |
|---|---|
| Relógio, data de hoje, gerador de identificador | Dublê, congelado numa data no passado |
| Serviço externo pago (pagamento, nota, e-mail, SMS) | Dublê, com a resposta real gravada uma vez |
| Banco, na peça cuja única função é falar com o banco | O banco de verdade, dedicado a teste |
| Entidade, cálculo, formatação, objeto de valor | O objeto real, instanciado direto |
| A peça que está sendo testada | Nunca |

A última linha é a que mais se erra. Se a bateria só faz afirmação sobre dublê e nenhum teste
afirma nada sobre um objeto real do negócio, ela virou teste do próprio dublê.

**Grave a resposta verdadeira do fornecedor uma vez e guarde o arquivo.** JSON de mentira
digitado à mão testa a sua imaginação sobre a API, não a API. Antes de commitar a resposta
gravada, troque token, chave e senha por marcadores.

**Nunca duble a conexão para testar a consulta.** A única coisa que aquela peça faz é conversar
com o banco: isolá-la do banco remove justamente a parte que pode falhar, e o teste passa a
provar nada. Campo esquecido no `INSERT`, filtro errado e atualização que mexe na coluna errada
só aparecem contra banco de verdade. Os defeitos que essa camada esconde estão catalogados em
`consultas.md`, quinze defeitos que rodam, respondem e entregam o número errado.

---

## O que o teste está dizendo sobre o código

Escrever teste é a primeira vez que alguém usa o código pela porta da frente. Quando isso fica
difícil, o problema quase nunca é do teste. É do código. Cada item abaixo é revisão de projeto
disfarçada de bateria, e todos aparecem antes do defeito chegar ao cliente.

### 1. Dublês demais num teste só

Sintoma: o preparo monta cinco objetos de mentira para chamar um comportamento. O que custa:
qualquer melhoria no código de produção quebra o teste sem que nada tenha parado de funcionar.
Trinta segundos implementando, meia hora consertando teste. Conserto: a peça tem acoplamento
alto, e provavelmente só coordena as outras. Ache o contrato comum entre as dependências e
dependa dele, em vez de cada colaborador concreto.

### 2. Dublê montado no preparo que só metade dos testes usa

Sintoma: no mesmo arquivo, um grupo de testes usa três dublês e o outro grupo usa os outros
dois. O que custa: a peça carrega dependência que só interessa a parte do trabalho dela, e
quem for mexer precisa entender as duas metades para mudar uma. Conserto: separe a peça em
duas. É o mesmo sintoma que aparece no código de produção como classe que faz coisa demais.

### 3. A bateria da mesma peça não para de crescer

Sintoma: cada cargo novo, plano novo ou forma de pagamento nova obriga a escrever mais dois
testes no mesmo arquivo, e os nomes viram "calcula para X", "calcula se Y", "calcula como Z".
O que custa: comportamento novo entra alterando o que já funcionava, e um dia alguém esquece
de mexer num dos lugares. O cálculo antigo passa a sair errado sem nenhum teste vermelho.
Conserto: esse "para X" no nome é falta de abstração. Extraia cada regra para a sua própria
unidade e faça o tipo apontar para a regra dele, de forma que criar um tipo novo obrigue a
escolher uma regra em vez de depender da memória de alguém.

### 4. Todas as asserções são sobre o objeto vizinho

Sintoma: o teste da peça A não verifica nada em A. Tudo que ele afirma é sobre o estado de B.
O que custa: a regra está fora de quem é dono do dado, então ela vai ser copiada no dia em que
aparecer o segundo caminho, seja outro meio de pagamento ou outro canal de venda. Daí em
diante, toda correção precisa ser feita duas vezes. Conserto: mova o comportamento para dentro
de B e leve os testes junto. A exceção é o orquestrador legítimo, que só distribui trabalho:
ali verificar o efeito em terceiros é o certo.

### 5. Vontade de testar o que é privado

Sintoma: você procura um jeito de alcançar por dentro um método escondido, ou pensa em
torná-lo público só para o teste. O que custa: congelar um detalhe interno em teste e deixar o
problema de coesão intacto. Conserto: a vontade é o sintoma. Ali dentro há uma peça inteira
com nome próprio esperando para sair, e o certo é extrair o comportamento e testá-lo de
frente. Não promova a público um método solto.

### 6. Cenário enorme para chamar um comportamento

Sintoma: quinze linhas de preparo para uma chamada e uma verificação. O que custa: a peça lida
com objetos demais, e o teste fica ilegível para quem voltar nele daqui a um ano, que costuma
ser o próprio dono do negócio ou ninguém. Conserto: centralize a montagem em construtores de
dados de teste, um por entidade. O dado de que a verificação depende continua visível dentro
do teste: preparo compartilhado que esconde o cenário é pior que a repetição.

### 7. O nome do teste emenda ações com "e"

Sintoma: "deve finalizar a venda salvando, enviando o e-mail e baixando o estoque". O que
custa: quando esse teste ficar vermelho, ninguém sabe qual das três coisas parou. Conserto:
trate o "e" como aviso de responsabilidade demais. Quebre em passos independentes e escreva um
teste por comportamento, enquanto isso ainda custa uma linha.

---

## Configuração da bateria

O `entrega.md` lista o que não pode existir numa bateria. Aqui está a configuração que impede
esses testes de nascerem, feita uma vez no começo e válida pelo resto da vida do projeto. Cada
item impede uma classe de teste que mente.

- **Ordem aleatória, com a semente registrada.** Teste que só passa na ordem em que foi escrito
  depende do que o anterior deixou no banco. A semente é o que permite reproduzir a falha
- **Relógio congelado numa data do passado, e restaurado no fim.** Quem congela, descongela:
  estado global que vaza de um teste para outro produz falha em arquivo que ninguém tocou
- **Rede bloqueada, com erro explícito ao tentar.** Suíte que chama a internet falha no avião,
  no hotel e no dia em que o fornecedor cai. Nenhuma dessas falhas é do seu sistema
- **Dado único por execução**, gerado na hora, ou uma rotina que apaga o que criou. Sem uma das
  duas, a suíte passa na primeira vez e falha na segunda com "já existe"
- **Limpeza que não pode ser só desfazer a transação.** Restrição adiada só dispara na
  confirmação: com a transação desfeita, o teste fica verde e a gravação falha em produção.
  Onde isso importa, confirme a transação no teste e limpe as tabelas depois
- **Credencial por variável de ambiente**, nunca escrita em arquivo versionado. Nem no ambiente
  de teste descartável, porque o que protege é o hábito

```bash
npm test && npm test        # passa duas vezes seguidas, sem limpar nada na mão?
time npm test               # quanto tempo alguém espera por isso
grep -rnE "\b(it|test|describe)\.(skip|todo)|\bxit\(" tests/   # o que está desligado
```

Tempo de feedback é requisito da suíte, não consequência dela. Demora vira defeito a corrigir:
paralelize, corte o que está testado duas vezes, empurre a verificação para a camada mais
barata que consegue prová-la. Se ninguém espera o resultado, a bateria já morreu e ninguém
avisou.

**Teste que às vezes passa e às vezes falha sem ninguém ter mexido no sistema sai da suíte no
mesmo dia**, com uma frase dizendo por que saiu e o que falta para voltar. Deixar piscando é
pior do que não ter: ensina o time a reexecutar até ficar verde e a olhar o vermelho como
ruído.

---

## A suíte de fumaça

Fumaça é a imagem do aparelho recém-ligado: se sair fumaça, desliga tudo. Cinco a dez casos
sobre os caminhos de dinheiro, e nada além disso: entrar, cadastrar, pedir, pagar, emitir. Eles rodam contra o ambiente publicado, logo depois de cada subida, e respondem
a única pergunta que interessa naquele minuto: subiu de verdade?

Para sistema de negócio pequeno, é o teste com melhor retorno por hora escrita. Ele pega a
classe de defeito que nenhum teste da sua máquina pega: variável de ambiente faltando,
migração que não rodou, rota que mudou de endereço, chave do fornecedor vencida, arquivo
estático que não subiu. Todos passam pela esteira verde e só aparecem depois de publicado.

```typescript
// testes/fumaca/pedido.spec.ts
// login e pedidos são objetos de página: os seletores moram lá dentro, não aqui
test('@fumaca cria pedido e ele aparece na listagem', async ({ page }) => {
  const email = `teste+${Date.now()}@exemplo.com`;   // dado único por execução

  await login.entrar(process.env.USUARIO_TESTE!, process.env.SENHA_TESTE!);
  await pedidos.criar({ cliente: email, valor: '120,00' });

  await page.goto('/pedidos');                       // relativa, sobre a URL base
  await expect(page.getByRole('row', { name: email })).toBeVisible();
});
```

```typescript
// playwright.config.ts
use: { baseURL: process.env.URL_BASE ?? 'http://localhost:3000' }
```

```bash
URL_BASE=https://app.exemplo.com npx playwright test --grep @fumaca
```

- **Nenhum seletor de elemento dentro do arquivo de teste.** Id, classe e caminho moram num
  objeto por tela, e o teste chama nomes de negócio: entrar, criar pedido, emitir recibo.
  Quando o front trocar um id, o conserto é num arquivo só
- **Espera por condição, nunca por relógio.** Tempo fixo erra dos dois lados: curto demais
  pisca, longo demais desperdiça toda execução, para sempre
- **A mesma suíte roda em qualquer ambiente sem editar código.** URL relativa sobre uma base
  configurável, credencial por variável de ambiente, e o alvo escolhido na linha de comando
- **Contra produção, só o que não escreve nada.** O que cria registro roda no ambiente de
  teste, senão a massa do teste vira dado do cliente
- **Nenhuma regra de negócio aqui.** Regra que já tem teste embaixo não se repete pelo
  navegador: dobra o tempo da suíte e não encontra defeito novo
- **Uma suíte que só percorre os menus** e confere que cada tela abre é o teste mais barato de
  escrever, e pega o erro mais constrangedor de todos: o link que ficou para trás depois de uma
  mudança de rota

O que esses casos exercitam é o ciclo do cadastro, com as sete ações e as armadilhas de cada
uma em `cadastro.md`. A esteira, as estratégias de publicação e a migração junto com o deploy
estão em `entrega.md`.

---

## Antes de dar a bateria por pronta

- [ ] Cada teste já falhou uma vez, pelo motivo certo
- [ ] Um comportamento por teste, com nome que diz comportamento e cenário
- [ ] Nenhum teste repete uma classe de equivalência que outro já cobre
- [ ] Os extremos entraram: vazio, um, dois na ordem trocada, primeiro, último, além do último
- [ ] Lista e objeto novo conferidos pelo conteúdo, não só pelo tamanho
- [ ] O dado de que a verificação depende está visível dentro do teste
- [ ] Nenhuma asserção da peça olha só para o objeto vizinho
- [ ] Nenhum dublê no banco onde o assunto é a consulta
- [ ] Ordem aleatória ligada, relógio congelado e restaurado, rede bloqueada
- [ ] A suíte passa duas vezes seguidas sem limpeza manual entre elas
- [ ] Nenhum teste piscando na suíte, e o que saiu tem o motivo escrito
- [ ] O que ficou sem teste está escrito, com o porquê, e excluído da medição de cobertura
- [ ] A suíte de fumaça está ligada ao gatilho de publicação
- [ ] Existe um comando único que roda tudo, e ele está escrito na pasta de testes

---

## O que não está aqui

- **Ordem de prioridade, os três tipos e os exemplos de unidade, integração e migração** —
  `templates/backend/entrega.md`, seção "Testar o que quebra caro"
- **O teste do defeito recém-consertado e o método de investigação** —
  `templates/backend/debug.md`
- **Os defeitos de consulta que a bateria precisa cobrir** — `templates/backend/consultas.md`
- **O ciclo do cadastro e a validação que também vira restrição no banco** —
  `templates/backend/cadastro.md`

Nada aqui depende de uma ferramenta de teste específica. Escreva na que o projeto já usa, na
pasta que ele já tem, com o nome de arquivo que ele já adota. Impor a convenção de fora é a
forma mais rápida de produzir uma bateria que ninguém roda.
