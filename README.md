# ViperOS

> O sistema operacional do seu negócio dentro do Claude Code.

Sua empresa ganha uma memória própria, uma identidade visual aplicada em tudo
que ela gerar, e 40 skills prontas pra fazer marketing, conteúdo, SEO, ads,
oferta, preço, venda, material e operação rodarem com você dirigindo.

**Você não precisa decorar comando nenhum.** Fala o que quer em português — "faz
um carrossel sobre X", "quanto eu devo cobrar por isso", "minha página não
converte" — e o sistema sabe o que fazer.

Bora.

---

## Ligando o sistema

Dois caminhos. Escolhe o que combina contigo.

### Pelo Claude (mais rápido)

Abre o Claude Code em qualquer pasta e cola:

```
Clona o https://github.com/vertsystems/viperos.git na pasta atual,
entra nela e roda o /instalar.
```

Ele clona, entra na pasta nova e dispara a entrevista de setup. Você só
responde.

### Pelo terminal (mais previsível)

```
git clone https://github.com/vertsystems/viperos.git
cd viperos
code .
```

Na janela do VS Code que abrir: terminal integrado → `claude` → `/instalar`.

---

Quando o `/instalar` terminar, renomeia a pasta pro nome do teu negócio (fecha o
VS Code, renomeia no Finder/Explorer, abre de novo). Ela não fica como "viperos"
— é o teu negócio agora, e tudo que você produzir mora aqui.

O `/instalar` roda uma vez só. Te entrevista sobre o negócio, monta a memória e
configura o sistema. Depois disso, é só falar o que você quer.

---

## O sistema

**Perdido?** Pergunta "o que eu faço agora?" — ele olha o estado do teu
workspace e te diz o próximo passo.

**Núcleo** — o jeito de operar o dia a dia
Carrega o contexto antes de cada sessão · faz commit + push no GitHub · varre o
projeto e atualiza a memória · cria pasta isolada pra cada cliente · mantém o
pipeline do que tá em jogo · fecha a semana e alimenta a próxima · transforma o
que você repete em skill própria · traz a versão nova do ViperOS sem tocar no
teu trabalho.

**Vender** — o que decide o faturamento
Desenha o que você vende, com bônus, garantia e motivo pra ser agora · te ajuda
a chegar no preço, montar faixas e responder "tá caro" · descobre quem compra e
a dor na palavra dele · prepara a conversa que fecha · diz por que a página não
converte · monta a proposta comercial em HTML.

**Marca** — o rosto do negócio, aplicado em tudo
Transforma sua identidade em tokens (paleta, tipografia, espaçamento) com
contraste validado — e se você ainda não tem marca, propõe 3 direções · define
posicionamento, história e voz · audita qualquer peça: contraste com número,
hierarquia, mobile e cara de template genérico.

**Antes de criar** — o que faz conteúdo sair sólido em vez de genérico
Monta o banco de pautas com origem rastreável · levanta dossiê com números
datados, fonte e citações literais de como o público fala · pega um tema e
devolve 10 tratamentos diferentes, cada um com gancho escrito · distribui tudo
no mês com mix de funil e formato.

**Criar** — as peças
Carrosséis 1080×1350 com a marca aplicada · artigo de blog + carrossel + 3
legendas amarradas · página de conversão em HTML · e-book, apostila ou guia em
PDF com qualidade editorial · deck pra reunião e pitch · e transforma o que você
já tem (live, artigo, PDF) em 5 peças novas.

**Qualidade** — o filtro antes de sair
Corta gordura, mata clichê de IA, confere o tom contra o seu jeito de escrever e
marca toda afirmação sem fonte.

**Distribuição e retorno**
Fluxo de SEO em 8 passos (demanda, concorrência, GMB, on-page, conteúdo, ads,
monitoramento, GEO) · campanha de Google Ads em CSV pronto pro Editor ·
relatório semanal de mídia paga com alertas · respostas humanas pras reviews do
Google · pauta pra imprensa local e do setor.

**Apoio**
Cataloga seus ativos reutilizáveis (depoimento, foto, dado, case) · lê
CSV/XLSX/PDF e devolve resumo executivo · rascunha e-mail a partir de contexto
livre.

O sistema **produz e entrega os arquivos** — imagens numeradas, legenda pronta
pra copiar e um `como-postar.md` com o passo a passo. Quando e onde publicar é
decisão sua.

<details>
<summary><strong>Avançado (opcional)</strong></summary>

**Foto por IA:** você conecta a sua conta — Gemini (tem cota gratuita, não pede
cartão) ou OpenAI. Passo a passo em `templates/imagem-ia.md`. Sem isso, as peças
saem com tipografia, que funciona bem.

**Publicação automática:** dá pra publicar direto no site + Instagram + Facebook
via API da Meta. Exige token e site com deploy automático. Só vale em volume
alto — pra uso normal, entregar os arquivos e programar na mão é mais rápido.

</details>

---

## A tese

IA não é uma ferramenta que sua empresa usa. É o sistema operacional em que ela
roda.

A diferença não é velocidade. É capacidade nova — uma pessoa com IA constrói o
que antes exigia time inteiro. Cada processo crítico que hoje roda em open loop
(decide → executa → não mede → repete cego) vira closed loop dentro do ViperOS
(decide → executa → captura → realimenta → ajusta sozinho).

O sistema não substitui você. Vira parte da sua empresa.

---

## Como o ViperOS pensa

`_memoria/` é o cérebro. Tudo que importa do seu negócio mora aqui — quem é a
empresa, como ela fala, o que tá em foco, quem compra e o que você vende. O
Claude lê isso antes de cada resposta. Quanto melhor a memória, melhor o sistema.

`identidade/` é o rosto. Design-guide, logo e os tokens que travam a marca em
valores fixos. Todo carrossel, slide, proposta e página respeita isso.

`pesquisa/` e `biblioteca.md` são a matéria-prima: dados com fonte, citações do
público, depoimentos, cases. É de onde sai conteúdo específico em vez de
conteúdo plausível.

`conteudo/`, `site/`, `materiais/`, `propostas/` e as demais são o resultado. O
sistema produz, versiona no GitHub, fica tudo seu.

**Nenhuma pasta é criada antes de ser usada.** Fez o primeiro carrossel, nasce
`conteudo/`. Fez a primeira página, nasce `site/`.

**O ciclo de conteúdo:** acha o que dizer → traz com o que embasar → escolhe
como dizer → decide quando → produz → filtra → você publica → mede e realimenta
a próxima rodada.

**O ciclo de venda:** descobre a dor real → define o que te diferencia →
desenha o que você vende → chega no valor → apresenta → conduz a conversa →
diz o que travou → volta pra oferta com informação nova.

---

## Atualizar

Saiu versão nova? Fala "atualiza o ViperOS". Ele baixa o que mudou e sincroniza
as skills **sem tocar no seu trabalho** — memória, marca, conteúdo e propostas
ficam intactos, e as skills que você criou por conta própria também.

---

## Licença

MIT — livre. Use no seu negócio, modifique, use com seus clientes. Detalhes no
arquivo `LICENSE`.

---

## Quando precisar

ViperOS é um produto **Vert Systems**.

**Bruno Santana**
WhatsApp: [13 99728-7738](https://wa.me/5513997287738)
E-mail: bruno.bsarts@gmail.com
