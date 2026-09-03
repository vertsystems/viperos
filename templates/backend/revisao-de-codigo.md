# Revisão de código — o catálogo de sintomas

Referência da skill `/revisar-codigo`. O `arquitetura.md` é prescritivo: diz como escrever.
Este arquivo é o contrário. Aqui estão os sinais de que alguma coisa já está errada num
sistema que existe e roda, cada um com o que custa e como se conserta. Serve para código que
você escreveu, para o que um freelancer entregou e para o que uma máquina gerou.

> **O que não está repetido aqui.** Nome que dispensa comentário, função que faz uma coisa,
> número mágico, erro tratado de verdade, duplicação e injeção de dependência já estão em
> `templates/backend/arquitetura.md`, na seção "Código que continua legível". Leia aquela
> seção antes desta lista. Este arquivo cobre o que ela não cobre.

---

## Duas regras antes de abrir o código

**Solução de projeto entra pelo problema, nunca pelo nome.** Você não vai encontrar aqui a
instrução de aplicar tal ou qual padrão famoso. Vai encontrar o sintoma e o conserto em
português. O freio vem do próprio material que sustenta este arquivo: se você não consegue
dizer em uma linha qual problema aquela estrutura resolve neste sistema, ela não entra. E se
já está lá, sai. Mesmo que volte depois, você terá aprendido mais sobre o problema.

**Achado sem custo não é achado.** Todo item desta lista termina numa consequência que o dono
sente: número errado no fechamento, chamado que se repete, hora de gente. O que só incomoda
quem lê o código vira nota de rodapé da revisão, nunca a primeira linha dela. Ordene o laudo
por custo, não por gravidade técnica.

---

## As sete palavras que faltam ao dono

Ele sente o problema e não tem nome para ele. Diz "tá cheio de gambiarra", "toda vez que
mexem quebra outra coisa", "esse sistema é ruim". Sete nomes transformam a reclamação em
diagnóstico, e cada um tem uma frase que o denuncia:

| Sinal | A frase que denuncia |
|---|---|
| Rigidez | "Era pra ser simples e mexeu em um monte de lugar" |
| Fragilidade | "Mexi no cadastro e quebrou o relatório" |
| Imobilidade | "Sai mais barato escrever de novo do que aproveitar o que tem" |
| Viscosidade | "Do jeito certo demora uma semana; a gambiarra sai hoje" |
| Complexidade desnecessária | "Tem um monte de coisa aqui que ninguém usa" |
| Repetição | "Consertei em três lugares e ainda faltou um" |
| Opacidade | "Ninguém entende esse arquivo, nem quem escreveu" |

Escreva no laudo qual dos sete apareceu e em qual arquivo. É o vocabulário que faz o dono
entender por que a próxima funcionalidade custa o que custa, e é a única parte da revisão que
ele vai repetir para outra pessoa.

---

## Os nove sintomas

### 1. A falha que não aparece

**Sintoma.** Nada trava. Nada chega ao log. A operação não aconteceu e ninguém foi avisado.
O caso que os livros contam é o de uma transferência: o dinheiro sai, a tela não atualiza
porque o erro foi engolido no meio do caminho, e a pessoa transfere de novo.

**Custo.** O estrago é maior justamente porque o sistema não travou. Dado errado gravado,
operação feita duas vezes, e uma investigação que começa dias depois sem nenhum rastro.

**Conserto.** Erro de programação nunca vira mensagem na tela do cliente, e nunca vira
silêncio. Separe as duas famílias e trate cada uma no lugar dela.

```typescript
// ✖ o retorno vazio some no meio do fluxo e a operação segue como se tivesse dado certo
const conta = await buscarConta(id);
if (!conta) return;

// ✔ erro de negócio vai pra tela; o resto vai pro log e a tela recebe um código
try {
  await transferir(origem, destino, valor);
} catch (erro) {
  if (erro instanceof ErroDeNegocio) return res.status(422).json({ mensagem: erro.message });
  logger.error({ err: erro, origem, destino }, 'Falha na transferência');
  return res.status(500).json({ mensagem: 'Não foi possível transferir', codigo: req.id });
}
```

E a mensagem de erro diz três coisas, não uma: o que falhou, o que apesar disso ficou salvo,
e qual é o próximo passo. "Erro inesperado" sozinho faz a pessoa repetir a ação.

### 2. A regra de negócio mora longe do dado

**Sintoma.** Condições como `pedido.cliente.fatura.dataPagamento != null` espalhadas por
telas, rotas e relatórios. Para achar todas, você precisa de busca e substituição no projeto
inteiro.

**Custo.** Um critério novo (cliente bloqueado, limite estourado, contrato vencido) obriga a
caçar todas as ocorrências, e sempre sobra uma. O sistema passa a aprovar num lugar o que
recusa no outro, e o dono descobre pelo cliente.

**Conserto.** Peça a decisão ao objeto que tem o dado, em vez de puxar o dado para decidir do
lado de fora. A pergunta vira um método com nome do negócio, e a manutenção vira um lugar só.

```typescript
// ✖ quem chama precisa conhecer o interior do cliente
if (cliente.fatura && cliente.fatura.dataPagamento === null) { /* bloqueia */ }

// ✔ um ponto de manutenção, com o nome que o dono usa
if (!cliente.podeComprar()) { /* bloqueia */ }
```

A necessidade de busca e substituição para mudar uma regra é diagnóstico, não solução. Quando
ela aparecer, pare a alteração, centralize a regra e só então continue.

### 3. O objeto que só guarda campos e a função que faz tudo por ele

**Sintoma.** Uma função grande que coordena tudo e um bando de objetos que só carregam
atributos. Trechos como `conta.setSaldo(conta.getSaldo() + valor)` aparecem em vários
arquivos. A classe de serviço cresce a cada funcionalidade e ninguém mais a abre inteira.

**Custo.** É a fragilidade da tabela acima na forma mais cara. Qualquer mudança na estrutura
do dado obriga a mexer em todos os módulos que a conheciam, e o objeto pode ficar num estado
inválido no meio da execução sem que nada impeça.

**Conserto.** Mova para dentro da entidade a regra que protege o dado dela, e apague os
acessos que ficaram sem uso. Um objeto que não consegue entrar em estado inválido não precisa
ser vigiado de fora. Coordenação entre várias entidades, transação e gravação continuam
fora: isso não é responsabilidade da entidade.

**A ressalva honesta.** Com muitas entidades e muito relacionamento, ou quando quem vai
manter tem pouca experiência, a separação entre entidade e serviço é mais fácil de ler. A
decisão é essa, escrita e assumida. O que não vale é chegar nela por descuido.

### 4. Dinheiro em ponto flutuante

**Sintoma.** A soma da tela não bate com a da calculadora, por alguns centavos. Numa venda
isolada passa despercebido. No fechamento do mês, com muitas parcelas, a diferença aparece.

**Custo.** Centavos viram milhares em base grande, e o dono perde a confiança no sistema
inteiro por causa de um número. Daí em diante ele confere tudo na planilha.

**Conserto.** A regra de modelagem está em `templates/backend/dados.md`, seção "O básico que
evita a maior parte da dor". O que interessa aqui é achar o defeito no que já existe:

```bash
# colunas de dinheiro declaradas em ponto flutuante
grep -rniE '(float|double|real)' --include='*.sql' --include='*.prisma' . | grep -iE 'valor|preco|total|saldo'

# a mesma pergunta no banco que está no ar
psql "$DATABASE_URL" -c "SELECT table_name, column_name, data_type FROM information_schema.columns
  WHERE data_type IN ('real','double precision') ORDER BY 1;"
```

Se achou, a conversão vira migração com risco e entra no orçamento como tal: troca de tipo,
reprocessamento do histórico e conferência dos totais pelos dois caminhos.

### 5. Texto no lugar de data e de lista fechada

**Sintoma.** A coluna aceita qualquer coisa, então tem de tudo. Data como `10/03/2026` em
umas linhas e `2026-03-10` em outras. Situação do pedido gravada como `pago`, `Pago` e
`PAGO`. Filtro por período não fecha e relatório por situação perde linhas.

**Custo.** Toda conta com data vira conversão frágil, e a validação some do banco para virar
código espalhado. Uma letra maiúscula a mais tira o registro do relatório sem avisar.

**Conserto.** Data em tipo de data. Lista fechada de opções em tipo próprio do banco, com
restrição. Conjunto de campos que anda junto (endereço, por exemplo) vira tabela própria, não
uma frase. Antes de mexer, meça o estrago:

```sql
SELECT situacao, count(*) FROM pedidos GROUP BY situacao ORDER BY 2 DESC;   -- quantas grafias?
SELECT count(*) FROM pedidos WHERE data_texto !~ '^\d{4}-\d{2}-\d{2}$';     -- fora do padrão
```

Texto livre continua sendo texto: observação, descrição, nome de pessoa. A regra vale para o
campo que entra em conta, em filtro ou em agrupamento.

### 6. Campos com o mesmo prefixo

**Sintoma.** `nomeCliente`, `cpfCliente`, `emailCliente` dentro de `Pedido`. Ou
`nomeVendedor` e `comissaoVendedor` dentro de `Venda`. O prefixo se repete em três, quatro,
cinco campos.

**Custo.** Esse prefixo é o nome da classe que está faltando. Enquanto ela não existe, o
comportamento que pertence a ela fica copiado em cada tela que precisa dele, e um dado novo
do cliente obriga a corrigir toda chamada que passava os campos soltos.

**Conserto.** Extraia a entidade que o prefixo nomeia e passe o objeto no lugar da lista de
campos. É o sinal mais fácil de detectar de uma revisão inteira, porque não depende de
julgamento: o prefixo está lá ou não está.

**Quando não vale.** Prefixo que distingue dois papéis do mesmo tipo já modelado
(`dataInicial` e `dataFinal`) não é sinal de nada.

### 7. Verificação de vazio espalhada como proteção

**Sintoma.** O mesmo `if (x == null)` repetido em vários pontos, cada um se protegendo por
conta própria. Ninguém garante que o próximo ponto também trata.

**Custo.** O código de proteção cresce mais rápido que o de negócio, e a leitura fica pior a
cada correção. Pior: um ponto não tratado quebra em produção, e a reação típica é adicionar
mais uma verificação, o que aumenta o problema em vez de resolver.

**Conserto.** Devolva um objeto neutro no lugar do vazio, com os valores esperados para o
caso "não tem nada". O conserto vale para a aplicação inteira de uma vez, não só para o ponto
que quebrou hoje.

```typescript
// ✖ cada chamador se defende sozinho
const desconto = cliente.plano ? cliente.plano.desconto : 0;

// ✔ quem não tem plano recebe um plano sem desconto, e some o if
class SemPlano implements Plano { desconto = 0; nome = 'Sem plano'; }
```

**A contrapartida, que é real.** O tratamento do caso vazio deixa de estar visível na leitura.
Quem lê precisa saber que existe um objeto neutro. Vale quando a verificação já está em três
ou mais lugares; não vale para o primeiro.

### 8. O método devolve a lista de dentro do objeto

**Sintoma.** Um trecho qualquer do sistema esvazia, reordena ou acrescenta item numa coleção
do modelo sem chamar nenhum método de escrita dele. O objeto muda e ninguém pediu.

**Custo.** O defeito aparece longe da causa. Você investiga a classe que guarda o dado, e ela
está correta: quem alterou foi outra parte do sistema, através da referência que ela mesma
entregou. É das investigações mais caras que existem.

**Conserto.** Devolva uma cópia na saída e faça uma cópia na entrada. A coleção interna nunca
sai da classe, e o objeto mutável que chega pelo construtor é copiado antes de ser guardado.

```typescript
// ✖ quem recebe altera o interior do pedido
itens() { return this._itens; }

// ✔ cópia nova a cada leitura
itens() { return [...this._itens]; }
```

Congelar o objeto não resolve sozinho: o congelamento impede a nova atribuição na
propriedade, não a alteração do que está dentro dela.

### 9. O objeto abre a conexão e deixa o fechamento para quem o usa

**Sintoma.** Nada quebra na hora de compilar e nada quebra nos testes. Um dia o banco começa
a recusar conexão nova, e o sistema derruba a si mesmo em horário de pico.

**Custo.** Sistema fora do ar no pior momento, com a causa em um arquivo que ninguém suspeita,
porque ele funciona. E a mesma classe costuma ganhar métodos que são só combinações de outros
(`salvarPedidoEBaixarEstoque`), sinal de que a transação também está no lugar errado.

**Conserto.** Quem abre o recurso caro é quem fecha, e isso acontece num ponto só. A classe
que fala com o banco recebe a conexão pronta e não expõe método de fechar. A transação sobe
para quem coordena o caso de uso.

```typescript
// ✖ a classe decide sozinha onde a conexão nasce e morre
class RepositorioPedidos {
  async salvar(p) { const c = await novaConexao(); /* ... */ }
}

// ✔ recebe pronta; quem coordena decide onde começa e termina
class RepositorioPedidos {
  constructor(private conexao: Conexao) {}
}
```

Nunca conte com o coletor de lixo nem com finalizador para liberar conexão, arquivo ou
processo. O momento da coleta não é seu, e pode nunca chegar.

---

## O bloco de contenção

Quando quem escreve o código é uma máquina, o defeito mais comum deixa de ser código de
menos. Passa a ser camada demais. Esta seção existe para tirar, não para acrescentar.

**O teste de remoção.** Para cada abstração, interface, camada e arquivo de configuração,
responda em uma linha: qual problema concreto isto resolve aqui? Sem resposta, remova. Vale
para o que você acabou de gerar e para o que veio pronto.

**Toda solução tem um custo; nomeie antes de adotar.** Escreva o que a estrutura piora, não
só o que ela melhora. Se você não consegue nomear o custo, ainda não entendeu a decisão.

**Não quebre responsabilidade cedo demais.** Divida uma classe em duas quando ela já doeu,
não quando a teoria mandou. Quatro métodos de uma linha não precisam de quatro classes.

**Camada de indireção não reduz acoplamento.** Ela cria um terceiro para sincronizar. Sem a
camada do meio, mudar a regra pode obrigar a mudar a tela: duas peças. Com ela, mudar a regra
muda o objeto do meio, que muda a tela: três. Acoplamento se reduz definindo um contrato que
não deixa vazar detalhe, não empilhando intermediário.

**Se não merece teste, merece existir?** Antes de decidir pular o teste de uma camada, faça a
pergunta invertida. O que não vale uma verificação automatizada provavelmente não vale o
custo de estar ali.

**Interface com uma implementação só é custo sem retorno.** Ponto de extensão para variação
que ainda não existe é complexidade desnecessária, que é um dos sete sinais. A regra irmã,
sobre duplicação ser mais barata que a abstração errada, está em `arquitetura.md`.

**Calibre pelo nível de quem vai manter.** Solução sofisticada num ambiente sem ninguém que a
entenda trava a correção urgente e queima a confiança em qualquer prática nova. A melhor
arquitetura é a que quem fica consegue manter.

---

## Refatorar sem derrubar

Refatorar é mudar a estrutura sem mudar o comportamento. Quem garante que o comportamento não
mudou é a bateria de testes, e é por isso que ela roda entre cada passo, não no fim.

1. Rode a bateria inteira e veja tudo verde. Esse é o ponto de referência
2. Extraia um método, com nome do que ele faz. Rode
3. Mova um método para a classe que tem o dado. Rode
4. Crie a classe nova vazia. Rode
5. Mova um comportamento por vez para ela. Rode a cada movimento
6. Só no fim, apague o que ficou sem uso. Rode

**Nunca demolir e reconstruir.** Ao destruir a solução que existe, você perde por dias a
única referência que confirma que nada mudou. Passo pequeno com teste verde é lento de
descrever e rápido de fazer.

**Sistema herdado sem teste nenhum** inverte a ordem: escreva primeiro o teste no nível mais
alto que der, mesmo feio, mesmo pela rota inteira, só para segurar o comportamento atual.
Refatore por baixo. Jogue o andaime fora quando ele não servir mais.

**Refatorar é uma conta, não um gosto.** Antes de mexer em código que funciona, escreva os
dois números: o que custa manter do jeito que está e o que custa arrumar. Só mexa quando o
segundo for menor. O critério de consertar contra refazer, com os dois lados somados em horas
de gente, está em `templates/software/manutencao.md`, seção "Consertar ou refazer".

---

## O que não está aqui

- **Erro de consulta que não dá erro** (junção esquecida, nulo em conta, agregação, corte
  antes da ordenação): `templates/backend/consultas.md`
- **O ciclo de gravar, editar, apagar e listar** (duplicação por F5, formulário que volta
  vazio, lista sem teto, campo gravável a mais): `templates/backend/cadastro.md`
- **Voltar atrás no código, etiqueta de publicação e segredo já comitado**:
  `templates/backend/versoes.md`
- **O que fazer com o sistema depois que ele existe**, passagem de bastão e a regra do melhor
  que ontem: `templates/software/manutencao.md`
- **Método de investigação de defeito em produção**: `templates/backend/debug.md`

**E o que não entra neste arquivo por decisão.** Nenhuma solução aparece pelo nome próprio do
catálogo de padrões. O dono não precisa aprender vocabulário para entender o diagnóstico, e
quem recomenda uma estrutura pelo nome costuma estar pulando a pergunta de qual problema ela
resolve. Também ficam de fora as receitas amarradas à pilha corporativa de onde vem boa parte
do material sobre projeto de código: componente distribuído, dependência configurada em
arquivo de marcação e tela montada por servidor não são o terreno de negócio pequeno. O
sintoma é o mesmo em qualquer linguagem. O exemplo aqui está em TypeScript porque é o que o
resto de `templates/backend/` usa.

---

## Antes de fechar a revisão

- [ ] Cada achado tem sintoma observável, custo em dinheiro ou em hora, e conserto
- [ ] A lista está ordenada por custo, não por gravidade técnica
- [ ] Os sete sinais foram procurados, e os encontrados estão nomeados no laudo
- [ ] Toda abstração passou pelo teste de remoção
- [ ] Nenhuma recomendação é "aplique o padrão X"
- [ ] O que for refatorar tem bateria verde antes do primeiro passo
- [ ] O que ficou de fora está escrito, com o motivo
