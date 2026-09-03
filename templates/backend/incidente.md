# Quando cai: os primeiros trinta minutos

Referência da skill `/backend`. O sistema parou num domingo à noite e quem recebe a mensagem
no WhatsApp é o dono do negócio. O que fazer, em que ordem, e o que dizer enquanto isso.

A instrumentação está em `templates/backend/entrega.md`, seção "Monitorar": log estruturado,
rastreamento de erro, tempo de resposta em p95, `/health`. Aqui é a outra metade. O que se faz
com a informação quando ela chega.

---

## A regra que organiza tudo

**Estancar antes de investigar.** A causa não vai a lugar nenhum. O prejuízo vai correndo.

Voltar à versão anterior é conserto, e conserto legítimo: ninguém ganha prêmio por descobrir
a causa com o site fora do ar. Investigar com o sistema no chão é luxo, e quem paga por esse
luxo é o cliente que está tentando comprar agora. Volte à versão anterior primeiro. Entenda
depois, com o telefone quieto e sem relógio nenhum correndo contra você.

A exceção é a queda que a volta não estanca: migração que já rodou, dado gravado errado,
cobrança duplicada. Nesses casos, voltar o código não resolve e pode piorar. Banco em
`templates/backend/dados.md`, seção "Migração de banco"; desfazer código e publicação em
`templates/backend/versoes.md`, seção "Desfazer".

---

## Os primeiros trinta minutos

### 0 a 3 — confirmar que caiu mesmo

Abra a URL que o cliente usa, não a raiz do servidor. Faça isso de fora da sua rede, pelo
celular, com o wifi desligado, porque boa parte dos "está fora do ar" é o wifi de quem
reclamou ou o DNS da máquina dele.

```bash
curl -s -o /dev/null -w "%{http_code} em %{time_total}s\n" https://seusistema.com.br/pedidos
echo | openssl s_client -servername seusistema.com.br -connect seusistema.com.br:443 2>/dev/null \
  | openssl x509 -noout -enddate        # certificado vencido derruba o site inteiro
df -h /                                 # disco cheio derruba banco e log junto
```

### 3 a 8 — medir o alcance

Escreva o alcance em uma frase antes de encostar em qualquer coisa. "Todo mundo, desde 21h10,
em qualquer página" é uma situação. "Só o cliente X, só na tela de nota fiscal" é outra, e a
diferença entre as duas é uma noite de sono. A segunda pode esperar amanhã.

- **Quantos:** todo mundo, uma parte da base, ou uma pessoa?
- **Onde:** o sistema inteiro, uma tela, uma ação?
- **Desde quando:** o horário do primeiro erro no log responde, e ele costuma bater com uma publicação

### 8 a 15 — estancar

Estanque com o que for mais rápido. Voltar à versão que funcionava resolve a maioria das
noites, e desligar uma chave de funcionalidade resolve mais rápido ainda, porque dispensa
publicação. Se o pedaço quebrado é secundário, o relatório, o envio de e-mail, desligue só ele
e siga com o resto no ar.

```bash
git describe --tags               # qual versão está no ar
git log --oneline -5              # o que entrou hoje
```

Conserto na unha direto no servidor é permitido aqui, e essa é a única hora em que é. O
commit que reproduz o conserto entra no mesmo dia.

### 15 a 20 — avisar

A primeira mensagem sai antes de você saber a causa. Parece cedo demais. Não é: quem espera
sem notícia inventa a própria explicação, e a explicação que a pessoa inventa sozinha é
sempre pior que a verdade.

### 20 a 30 — aí sim, investigar

Comece pela pergunta que responde na maioria das vezes: **o que mudou?** Publicação,
migração, variável de ambiente trocada, certificado vencido, cartão recusado na hospedagem,
disco tomado por log. O método e os cinco defeitos mais comuns estão em
`templates/backend/debug.md`.

---

## O protocolo pra falar com quem está esperando

Quatro passos, sempre os quatro, em qualquer canal:

1. **O que aconteceu**, na língua do negócio. Não "o pool de conexões esgotou", e sim "o site
   parou de aceitar pedidos às 21h10"
2. **O que já se sabe**, incluindo o que ainda não se sabe
3. **O que está sendo feito** agora, nesse minuto
4. **Quando vem a próxima notícia**, com hora escrita

```
21h24 — O site parou de aceitar pedidos às 21h10. Ninguém consegue fechar compra;
quem já comprou está com o pedido salvo. Voltei à versão de sexta e estou testando
agora. Te aviso de novo às 21h45, com ou sem novidade.
```

Repita no prazo prometido mesmo sem novidade. "Ainda não voltou, próxima notícia às 22h30" é
notícia, e é ela que impede a terceira ligação. Silêncio custa caro.

Diga "não sei ainda" quando for o caso. Vale mais que uma causa inventada, que você vai ter
de desdizer daqui a pouco. E assuma o problema sem discutir de quem é a culpa: quem está
esperando quer o sistema no ar, e a conversa sobre responsabilidade cabe melhor na terça.

---

## O aviso que chega antes do cliente

### O monitor roda fora da máquina monitorada

O que está caído não avisa que caiu. Monitor instalado no mesmo servidor que ele vigia morre
junto: você fica sem sistema e sem aviso na mesma hora. Verificação de rede, a URL responde e
a porta aceita conexão, roda de fora, num serviço de terceiro. Verificação que só existe
dentro, disco e memória, inverte o sentido: a máquina manda o resultado pra fora de tempos em
tempos, e o silêncio dela também é alerta.

### Uma verificação por coisa que pode quebrar

Uma única checagem de "está no ar" avisa que existe problema e não diz onde. Metade do tempo
da crise vai embora procurando. Verificação separada por assunto entrega o diagnóstico pela
combinação do que ficou vermelho.

| Verificação | O que ela pega |
|---|---|
| Uma URL real de uso responde 200 | página de erro, aplicação parada, deploy pela metade |
| Certificado com validade acima de 15 dias | o vencimento que derruba o site sem ninguém mexer em nada |
| Uma consulta de verdade no banco (`SELECT 1` numa tabela real) | banco fora, disco cheio, senha trocada, limite de conexão |
| Espaço livre em disco acima de um limite | log crescendo, backup acumulado, banco sem onde gravar |

Log em produção é a causa mais comum de disco cheio, e disco cheio derruba o banco de um
jeito que parece defeito de código.

### Cada alerta tem dono, canal e ação escritos

Em negócio de 1 a 10 pessoas ninguém fica olhando painel. Alerta que chega em "todo mundo"
não chega em ninguém, porque cada um supõe que o outro está resolvendo. Escreva no
repositório, uma linha por alerta: **quem recebe**, **por qual canal**, **o que essa pessoa
faz quando chega**.

E teste o envio derrubando um serviço de propósito. Alerta configurado e nunca disparado
costuma não funcionar justo no dia em que precisa dele. Leva cinco minutos, uma vez só.

---

## Chamado que se repete é defeito de produto

O custo de operar um sistema pequeno é trabalho humano, e ele chega em forma de mensagem no
sábado. Quando a mesma dúvida aparece pela terceira vez, ela deixou de ser atendimento: virou
defeito. Uma tela que engana, um erro que não diz o que fazer, um campo que aceita o que não
deveria. Anote chamado repetido junto dos defeitos, não junto das conversas. O conserto é no
software.

---

## Armadilhas

### Alerta que pisca em toda publicação

**Sintoma:** todo deploy dispara aviso de queda, e a equipe aprendeu a fechar sem ler.
**Custo:** o alerta da queda de verdade chega no meio dos falsos e recebe o mesmo tratamento.
**Conserto:** pausar a verificação no início do script de publicação e retomar no fim, pelo
mesmo script. Alerta que sempre pisca deixa de ser lido, e aí o monitoramento inteiro virou
enfeite pago.

### O conserto da madrugada que ninguém comitou

**Sintoma:** o defeito volta na publicação seguinte, idêntico. **Custo:** a segunda queda
custa o dobro, porque desta vez ninguém acredita no diagnóstico anterior e a investigação
recomeça do zero. **Conserto:** commit no mesmo dia, com a mensagem dizendo o que aconteceu.
Toda mudança em produção começa por um commit. Inclusive a que nasceu no desespero.

### O status "resolvido" sem confirmação de quem usa

**Sintoma:** você reiniciou o serviço, a página abriu na sua máquina e o assunto foi dado
como encerrado. **Custo:** o cliente descobre sozinho que ainda não dá pra fechar pedido, e a
mensagem seguinte dele já vem sem paciência. **Conserto:** feche o incidente pelo lado de quem
usa, refazendo a ação que falhou, de fora da sua rede. Serviço que subiu e serviço que atende
são coisas diferentes.

---

## Post-mortem sem culpado

No dia seguinte, meia hora, com quem participou. Duas perguntas guiam tudo: por que
aconteceu, e por que ninguém avisou antes do cliente.

- **Linha do tempo:** quando começou, quando alguém percebeu, quem avisou, quando voltou
- **Causa:** o que quebrou, e o que permitiu que aquilo quebrasse
- **O que muda:** uma ou duas coisas concretas, com responsável e data. Lista de dez vira lista de zero
- **Onde fica registrado:** entrada em `DECISOES.md` quando a causa foi estrutural

Procurar culpado destrói o post-mortem. As pessoas passam a contar meia verdade sobre as
circunstâncias, e é nas circunstâncias que mora a causa. Se alguém errou feio, a conversa é
em particular, depois, e é outra conversa.

Anote frequência e duração, não só o percentual de tempo no ar. Quarenta e três quedas de um
minuto e uma queda de quarenta e três minutos cabem no mesmo alvo mensal, e quem usa o
sistema sente as duas de um jeito bem diferente.

```bash
# quanto tempo de queda cabe no mês, por alvo de disponibilidade
node -e 'for (const a of [99.9,99.5,99]) console.log(a+"% = "+((30*24*60)*(100-a)/100).toFixed(1)+" min/mês")'
```

---

## O que não trazer pra cá

Nagios, Puppet, Vagrant, Jenkins numa máquina sua, Prometheus e Grafana próprios, Kubernetes.
Todos resolvem problema real. Nenhum resolve o seu hoje: cada um vira um segundo sistema pra
manter no ar, e um segundo sistema pede monitoramento próprio. Um serviço pronto de
verificação com camada gratuita, rodando as quatro checagens da tabela, cobre negócio pequeno
por muito mais tempo do que parece.

---

## Checklist

- [ ] Uma URL real de uso verificada de fora, não a raiz do servidor
- [ ] Validade do certificado vigiada, com folga de dias
- [ ] Consulta de verdade no banco dentro da verificação
- [ ] Espaço em disco com limite definido
- [ ] Dono, canal e ação escritos pra cada alerta, e envio testado uma vez de propósito
- [ ] Volta atrás cronometrada fora do incidente (`templates/backend/versoes.md`)
- [ ] Verificação pausada durante a publicação, pelo próprio script
- [ ] Último post-mortem escrito em arquivo, não guardado na cabeça
