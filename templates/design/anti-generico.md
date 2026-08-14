# Anti-genérico — o que denuncia peça feita por IA

Referência compartilhada. Toda skill visual confere esta lista **antes de entregar**. O `/revisar-design` usa como checklist de auditoria.

Por que importa: o cliente não sabe explicar por que uma peça "parece de robô", mas sente. E percepção de valor cai junto. Cada item abaixo é um sinal concreto que entrega o jogo.

---

## Proibido por padrão

Só usar se o briefing pedir explicitamente — e aí é decisão declarada, não inércia.

### Rótulos e microtextos

- **Rótulo de versão como enfeite** — `V2.0`, `BETA`, `ACESSO ANTECIPADO`, `EDIÇÃO 001` no topo da peça. Só quando a peça é *sobre* lançamento
- **Numeração de seção como olho** — `01 / SOBRE`, `002 · SERVIÇOS`, `03 — COMO FUNCIONA`. O olho nomeia o assunto em linguagem normal; não enumera
- **Paginação decorativa** em imagem ou card (`01 / 4`). Se a pessoa consegue contar, o rótulo é ruído
- **Meta-linha de marca** tipo `Empresa · No. 01 · A linha premium`
- **Intervalo de datas como olho** (`PORTFÓLIO, 2018 – 2026`). Diz só o que a seção é

### Separadores e pontuação

- **Ponto-médio (`·`) como separador universal.** Máximo 1 por linha, e só em faixa de metadados. Nunca `serviço · prazo · preço · região · contato`
- **Bolinha colorida decorativa** antes de item de menu, de lista ou de badge. Só quando comunica estado real (aberto/fechado, disponível)
- **Travessão (`—`) usado como elemento gráfico** ou espalhado em título, olho e legenda. Um por peça já é muito
- **Título quebrado com `<br>` e a última palavra em itálico** — o "toque de design" mais batido que existe
- **Texto rotacionado 90°** na lateral. Clichê de portfólio de agência
- **Linha de grade ou mira desenhada só para "parecer design"** — linha só existe se organiza conteúdo real

### Cor e superfície

- **Gradiente roxo-azul.** É a assinatura mais reconhecível de geração automática
- **Preto puro (`#000`) como fundo.** Usar off-black (`#0E1116`, `#121212`) ou escuro com matiz
- **Branco puro (`#FFF`) em peça editorial.** Off-white respira melhor
- **Mais de uma cor de destaque.** Escolher uma. Consistência vence variedade
- **Cor de destaque com saturação acima de 80%** — grita em vez de destacar
- **Cinza quente e cinza frio misturados.** Escolher uma família e manter
- **Sombra preta em opacidade baixa em tudo.** Sombra tingida com o matiz do fundo parece intencional; preta parece default
- **Seção escura solta no meio de uma peça clara** (ou o inverso). Parece erro de copiar e colar. Se precisa de contraste, usar um tom mais escuro da mesma paleta

### Layout

- **Tudo centralizado e simétrico.** Quebrar com alinhamento à esquerda, margem deslocada, proporção variada
- **Três cards iguais lado a lado** como seção de benefícios. É o layout mais genérico que existe. Alternativas: zigue-zague de 2 colunas, grade assimétrica, lista com hierarquia
- **Raio de borda idêntico em tudo.** Variar: menor nos elementos internos, maior nos contêineres
- **Padding vertical exatamente igual em cima e embaixo.** Opticamente, o de baixo quase sempre pede um pouco mais
- **Nenhuma sobreposição, tudo lado a lado e plano.** Faltou profundidade
- **Falta de respiro.** Em peça de marketing, quando na dúvida, dobrar o espaçamento

### Tipografia

- **Só peso 400 e 700.** Introduzir 500 e 600 dá hierarquia sutil
- **Letter-spacing igual em todos os tamanhos.** Título grande pede tracking negativo; texto pequeno em caixa alta pede positivo
- **Caixa alta em todo subtítulo.** Alternar com caixa baixa, itálico ou small-caps
- **Palavra órfã** sozinha na última linha do título
- **Linha de texto com mais de 75 caracteres** em texto corrido

### Conteúdo

- **Depoimento inventado**, logo de cliente que não é cliente, número redondo sem origem
- **Foto de banco de imagem com pessoas sorrindo em escritório** representando a equipe real
- **"Lorem ipsum"** sobrevivendo até a entrega
- **Ícone genérico** repetido em cada item, sem relação com o conteúdo
- **Texto sobre foto sem sobreposição suficiente** — bonito na tela grande, ilegível no celular
- **Ilustração, mascote ou personagem desenhado na hora** (em SVG ou CSS) pra preencher espaço vazio. Sai com cara de clip-art e destoa de peça sóbria. Se falta imagem, a resposta é layout tipográfico — não desenho improvisado
- **Carinha, boneco ou objeto antropomorfizado** representando marca, produto ou "a IA". Em negócio sério isso custa credibilidade

---

## O que a IA costuma esquecer

Não é "cara de IA", é peça incompleta — e o efeito na confiança é igual:

- **Link de política de privacidade** e termos, quando há coleta de dado (LGPD)
- **Caminho de volta.** Página ou fluxo sem saída
- **Validação de formulário** (e-mail, campo obrigatório, formato de telefone)
- **Estado vazio, de carregamento e de erro** — o que aparece quando não há resultado?
- **Aviso de cookie**, quando aplicável
- **Contato que funciona.** Link de WhatsApp sem número, `mailto` vazio, telefone que ninguém atende
- **Versão impressa.** Proposta e material que ficam ilegíveis no papel

---

## Ordem de conserto

Quando há muito a arrumar, essa ordem dá o máximo de ganho visível com o mínimo de risco:

1. **Trocar a fonte** — maior ganho instantâneo, risco quase zero
2. **Limpar a paleta** — tirar cor sobrando, baixar saturação, unificar família de cinza
3. **Estado de interação** (hover, foco, ativo) — faz a peça parecer viva e cuidada
4. **Layout e espaçamento** — grade, largura máxima, padding consistente
5. **Trocar componente clichê** — sair dos três cards, do herói centralizado
6. **Estados que faltam** (vazio, erro, carregando) — é o que faz parecer terminado
7. **Polir escala tipográfica e microespaçamento** — o acabamento premium

---

## Em redesign: o que nunca muda em silêncio

Ao mexer em algo que já está no ar, **nunca** alterar sem autorização explícita:

- Endereço das páginas (URL)
- Rótulo dos itens de menu
- Nome e ordem dos campos de formulário — quebra integração e preenchimento automático
- Logo e assinatura da marca
- Texto legal, de consentimento e de política

Mudar qualquer um desses sem avisar gera problema que aparece dias depois, longe da peça, e ninguém liga uma coisa à outra.
