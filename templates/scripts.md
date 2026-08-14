# scripts/ — utilitários (pasta do workspace)

Scripts Node.js e Python que as skills chamam quando precisam fazer coisas fora do alcance da IA pura (gerar imagem, postar em rede social, renderizar HTML em PNG).

A pasta vem **vazia** — cada skill que precisa de script tem instrução de como criar (e geralmente é um único setup por integração que você vai ativar).

## Scripts comuns

Conforme você for ativando skills, isso aqui vai sendo populado. Lista do que cada skill espera encontrar:

| Skill | Script esperado | O que faz |
|---|---|---|
| `/carrossel` (com foto IA) | **já vem pronto** em `scripts/gerar-imagem.js` | Gera foto por IA. Só precisa de `GEMINI_API_KEY` ou `OPENAI_API_KEY` no `.env` |
| `/carrossel` (render PNG) | `render.js` (gerado pela skill, fica na pasta do conteúdo) | Playwright tira screenshot 1080x1350 de cada slide |
| `/anuncio-google` | (nenhum — gera CSV direto) | — |
| `/relatorio-ads` | (lê CSV exportado das plataformas) | — |
| `/proposta` | (nenhum — gera HTML direto) | — |
| `/publicar-tema` | (nenhum — entrega os arquivos pra você postar) | — |
| `/aprovar-post` *(avançado)* | `postar-instagram.js`, `postar-facebook.js` | Publicação automática via Meta Graph API — só quem optar por isso |

## Pré-requisitos comuns

**Node.js 20+** instalado na máquina.

**Chaves de API** no `.env` da raiz (copie de `.env.example`):

```bash
# Foto por IA no /carrossel — basta UMA das duas (guia: templates/imagem-ia.md)
GEMINI_API_KEY=...                  # cota gratuita, sem cartão
OPENAI_API_KEY=sk-...               # pago por imagem

# Só pra quem ativar a publicação automática (/aprovar-post):
META_PAGE_ACCESS_TOKEN=...
META_PAGE_ID=...
META_IG_USER_ID=...
SITE_URL=https://seudominio.com.br
```

O fluxo padrão de conteúdo não precisa de chave nenhuma: as skills geram os PNGs e a legenda, e você publica onde quiser.

## O que já vem pronto

`scripts/gerar-imagem.js` — gera foto por IA com **OpenAI ou Gemini** (detecta pela chave que existir). Roda da **raiz do workspace**, acha o `.env` sozinho, sem instalar nada:

```bash
node scripts/gerar-imagem.js "PROMPT EM INGLÊS" "conteudo/pasta/foto.png"
```

Opções: `--provedor openai|gemini` · `--formato retrato|quadrado|paisagem` · `--modelo <nome>` · `--qualidade high|medium|low`

É o **único** script que o sistema entrega pronto. Os outros da tabela acima são criados sob demanda pela skill que precisar deles.

**Outro gerador** (Midjourney, Leonardo, Firefly, o que você já paga): não há integração, e não vale montar. Gere a imagem lá e passe o arquivo — o `/carrossel` aceita foto pronta do mesmo jeito.

O `.env` é ignorado pelo git. Nenhuma chave sai daqui.

**Playwright** (pra renderizar HTML em PNG) — instalado **uma vez só, aqui nessa pasta**:

```bash
cd scripts
npm install playwright
npx playwright install chromium
```

Cada pasta de conteúdo reaproveita essa instalação apontando o `NODE_PATH` pra cá:

```bash
NODE_PATH="../../../scripts/node_modules" node render.js
```

Isso evita um `node_modules` de centenas de MB por carrossel criado. O `node_modules/` é ignorado pelo git.

## Como o ViperOS lida com isso

Quando você roda uma skill que precisa de script ausente, o Claude vai:

1. Detectar que falta o script
2. Te perguntar se quer configurar agora
3. Te guiar no setup das chaves de API (Meta, OpenAI, etc.)
4. Criar o script já configurado
5. Rodar a skill

Você não precisa decorar nada. Roda a skill, segue o fluxo.
