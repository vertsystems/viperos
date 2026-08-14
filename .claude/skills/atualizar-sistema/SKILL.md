---
name: atualizar-sistema
description: >
  Atualiza o ViperOS pra versão nova sem tocar no trabalho do usuário — traz skills, templates e
  scripts novos, preservando memória, marca, conteúdo e as skills que ele criou. Use quando o usuário
  disser "atualiza o ViperOS", "atualiza o sistema", "saiu versão nova", "tem atualização",
  "sincronizar skills", ou /atualizar-sistema. Não confundir com /atualizar, que cuida da memória do negócio.
---

# /atualizar-sistema — Trazer a versão nova

Diferença que importa:

- **`/atualizar`** → atualiza a memória do **seu negócio** (clientes, foco, estrutura)
- **`/atualizar-sistema`** → atualiza o **ViperOS** (skills, templates, correções)

O que é do sistema e pode ser substituído: `.claude/skills/` (só as que vieram do produto), `templates/`, `scripts/`, `.env.example`, `LICENSE`, `README.md`.

O que é do usuário e **nunca** se toca: `_memoria/`, `identidade/`, `CLAUDE.md`, `.env`, e toda pasta de trabalho (`conteudo/`, `site/`, `propostas/`, `clientes/`, `materiais/`…).

---

## Workflow

### Passo 1 — Ver o que mudou, antes de mexer

**Se o repositório do ViperOS está configurado** (o `/instalar` deixa como `viperos`):

```bash
git fetch viperos main
git log --oneline HEAD..viperos/main
```

Se não houver nada novo: "Você já está na versão mais recente" e parar.

Se houver, mostrar o resumo do que mudou (mensagens de commit, em linguagem normal) e perguntar se aplica.

**Se não houver git** (ele baixou o zip), seguir pelo Passo 4.

### Passo 2 — Trazer só as pastas do sistema

Essa é a parte que protege o trabalho dele. Em vez de `git pull` (que mistura tudo e gera conflito no `CLAUDE.md` e na memória), trazer **só** o que é do produto:

```bash
git checkout viperos/main -- .claude/skills templates scripts .env.example LICENSE README.md
```

Nada fora dessa lista é tocado. Memória, marca e trabalho ficam exatamente como estavam.

### Passo 3 — Cuidar das skills personalizadas

Skill que o usuário criou (pelo `/mapear-rotinas` ou na mão) **não vem do produto e não pode ser perdida**. O comando acima não apaga arquivo que só existe local — mas conferir mesmo assim:

Antes de aplicar, listar o que existe em `.claude/skills/` e comparar com o que vem do repositório. Skill que só existe local é personalizada: avisar que foi preservada, e nunca sobrescrever.

Se uma skill do produto foi **editada pelo usuário**, o `checkout` vai substituir a versão dele. Detectar antes (`git status .claude/skills`) e, se houver modificação local, mostrar o que muda e perguntar: manter a dele, ou aceitar a nova?

### Passo 4 — Sem git: baixar e sincronizar

Se ele não clonou (baixou o zip), fazer o mesmo por download, numa pasta temporária:

```bash
curl -L https://github.com/vertsystems/viperos/archive/refs/heads/main.tar.gz -o /tmp/viperos.tgz
mkdir -p /tmp/viperos-novo && tar -xzf /tmp/viperos.tgz -C /tmp/viperos-novo --strip-components=1
```

Depois copiar **só** `.claude/skills/`, `templates/`, `scripts/`, `.env.example`, `LICENSE` e `README.md` de `/tmp/viperos-novo/` pra cá. Limpar a pasta temporária no fim.

Aproveitar pra sugerir: "Da próxima vez fica mais fácil se você clonar em vez de baixar o zip — aí a atualização é automática."

### Passo 5 — Relatar

```
✓ Sistema atualizado

Skills novas (2):        oferta, imprensa
Skills atualizadas (4):  carrossel, seo, proposta, landing
Preservadas (1):         relatorio-cliente (sua, não mexi)

Seu trabalho não foi tocado: memória, marca, conteúdo e propostas
estão exatamente como estavam.
```

Se entrou skill nova, **demonstrar** em vez de mandar reiniciar: explicar em uma linha o que ela faz e oferecer usar na hora.

Se a skill nova não aparecer na lista do `/` nessa sessão, ela funciona igual — é um arquivo markdown, basta o usuário pedir em português. Não transformar isso em instrução técnica.

---

## Regras

- **Nunca `git pull` nem `git merge`.** Traz o trabalho do usuário pro meio do conflito. Sempre `checkout` das pastas do sistema
- **Nunca tocar em `_memoria/`, `identidade/`, `CLAUDE.md`, `.env` ou pasta de trabalho.** Nenhuma dessas vem do produto
- **Skill personalizada é intocável.** Se não veio do repositório, nem olhar
- Skill do produto que o usuário editou: perguntar antes de substituir, mostrando o que muda
- Mostrar o que vem **antes** de aplicar. Atualização silenciosa em sistema que o cliente usa pra trabalhar é péssima ideia
- Nunca `git reset --hard`, `clean -fd` ou `checkout --force` no diretório de trabalho
- Se o usuário nunca rodou `/instalar` aqui, mandar rodar o `/instalar` em vez dessa skill
