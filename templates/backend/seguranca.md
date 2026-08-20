# Segurança e acesso

Referência da skill `/backend`. As falhas que aparecem de verdade, login, senha e permissão.

> As dez categorias abaixo seguem a lista do OWASP Top 10, referência pública mantida pela
> própria OWASP: https://owasp.org/www-project-top-ten/ — vale conferir a versão vigente,
> ela muda de tempos em tempos.

---

## As falhas que mais aparecem

### 1. Controle de acesso quebrado

O usuário acessa o que não é dele. Quase sempre porque o sistema confia num identificador
que veio do navegador.

```typescript
// ✖ o id vem da requisição: troque o número e veja o pedido do vizinho
app.get('/api/pedidos/:id', async (req, res) => {
  res.json(await db.pedidos.findById(req.params.id));
});

// ✔ o dono vem do token; a consulta filtra por ele
app.get('/api/pedidos/:id', autenticar, async (req, res) => {
  const pedido = await db.pedidos.findOne({
    id: req.params.id,
    clienteId: req.usuario.id   // ← quem está pedindo, segundo o token
  });
  if (!pedido) return res.status(404).json({ erro: { codigo: 'NAO_ENCONTRADO' } });
  res.json(pedido);
});
```

Regra: **negar por padrão**, liberar o que é explicitamente permitido, e verificar
autorização **no servidor** — esconder o botão no front não é controle de acesso.

### 2. Falha de criptografia

- Senha com **Argon2id**. Nunca em texto puro, nunca com MD5 ou SHA sozinho
- HTTPS em tudo, sem exceção
- Token gerado com `crypto.randomBytes()` — `Math.random()` é previsível
- Dado sensível guardado cifrado, e a chave fora do código

### 3. Injeção

```typescript
// ✖ SQL injection
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

// ✔ consulta parametrizada
const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
```

Vale pro banco, pro shell (`exec` com texto do usuário) e pro HTML devolvido. **Nunca
concatenar entrada de usuário em comando de qualquer natureza.**

### 4. Desenho inseguro

A falha que nenhuma biblioteca conserta: fluxo que permite pedir desconto negativo, alterar
o preço no corpo da requisição, ou redefinir senha só com o e-mail. Pensar, no desenho:
"o que acontece se a pessoa mandar isso de propósito?".

**Preço, saldo e permissão vêm do servidor** — nunca do que o cliente enviou.

### 5. Configuração errada

- Trocar toda credencial padrão
- Desligar mensagem de erro detalhada em produção
- Cabeçalhos de segurança ligados (o `helmet` no Express faz o básico):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

- CORS restrito aos domínios que precisam. `*` em produção é convite

### 6. Dependência vulnerável

A porta mais usada e a mais fácil de fechar:

```bash
npm audit          # pip-audit, no Python
npm audit fix
```

Rodar antes de publicar e de tempos em tempos. Ativar atualização automática de segurança
(Dependabot, Renovate) no repositório.

### 7. Falha de autenticação

- Limite de tentativa no login (algo como 10 por 15 minutos, por IP e por conta)
- Segundo fator obrigatório pra quem é administrador
- Sessão com prazo: ociosa e absoluta
- Trocar o identificador de sessão depois do login

### 8. Falha de integridade

Verificar o que entra na esteira de publicação: arquivo de lock versionado, dependência de
origem conhecida, artefato conferido. Pacote comprometido entra por aqui.

### 9. Log e monitoramento insuficientes

Sem registro, o vazamento é descoberto pelo cliente. Registrar login (sucesso e falha),
negativa de permissão, mudança de papel e operação de dinheiro. **Nunca** registrar senha,
token, cartão ou dado pessoal de terceiro.

### 10. Requisição forjada pelo servidor (SSRF)

Se o sistema busca uma URL que o usuário forneceu (importar imagem por link, webhook), ele
pode ser usado pra alcançar a rede interna. Validar o destino contra uma lista permitida e
bloquear endereço interno.

---

## Validar a entrada

Validação no navegador é conveniência. Qualquer pessoa manda requisição direto.

```typescript
import { z } from 'zod';

const NovoCliente = z.object({
  email: z.string().email(),
  nome:  z.string().min(2).max(120),
  idade: z.number().int().min(18).max(120)
});

app.post('/api/v1/clientes', async (req, res) => {
  const resultado = NovoCliente.safeParse(req.body);
  if (!resultado.success) {
    return res.status(422).json({
      erro: {
        codigo: 'VALIDACAO',
        mensagem: 'Dados inválidos',
        detalhes: resultado.error.issues.map(i => ({
          campo: i.path.join('.'), mensagem: i.message
        }))
      }
    });
  }
  // daqui pra baixo, o dado tem forma garantida
});
```

**Lista do permitido, não lista do proibido.** Enumerar o que pode passar funciona; tentar
enumerar todo ataque possível, não.

E antes de gravar: aceitar só os campos previstos. Repassar o corpo inteiro pro banco
permite que alguém envie `"admin": true` junto com o cadastro.

---

## Limite de requisição

```typescript
import rateLimit from 'express-rate-limit';

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
```

Ponto de partida razoável: público 100/15min, autenticado 1000/15min, login 10/15min.
Ajustar com o uso real — limite apertado demais atrapalha cliente legítimo.

---

## Senha

**Argon2id** é a recomendação atual:

```typescript
import argon2 from 'argon2';

const hash = await argon2.hash(senha, { type: argon2.argon2id });
const confere = await argon2.verify(hash, senhaInformada);
```

Política que as diretrizes atuais do NIST recomendam (https://pages.nist.gov/800-63-3/):

- **Mínimo de 12 caracteres**, e aceitar frase longa
- **Sem regra de composição obrigatória** (aquele "uma maiúscula, um símbolo") — empurra pra `Senha@123`
- **Conferir contra base de senha vazada** (a API do Have I Been Pwned resolve)
- **Sem troca periódica forçada** — só em suspeita de comprometimento
- Aceitar espaço e qualquer caractere imprimível

---

## Login e sessão

### Sessão com cookie — o mais simples e seguro pra site próprio

```typescript
cookie: {
  httpOnly: true,     // JavaScript não lê — protege contra roubo por XSS
  secure: true,       // só por HTTPS
  sameSite: 'strict', // protege contra requisição forjada de outro site
  maxAge: 1000 * 60 * 60 * 8
}
```

Sessão no servidor (Redis ou banco) tem uma vantagem que o token não tem: dá pra
**revogar na hora**. Para site próprio, costuma ser a melhor escolha.

### JWT — quando o cliente é outro serviço ou app

- Curto: 15 minutos no token de acesso, com token de renovação separado
- Assinar com RS256 quando quem valida não é quem emite
- Validar **assinatura, emissor, destinatário e validade** — validar só a assinatura é meio caminho
- Não guardar dado sensível dentro: o conteúdo é legível por qualquer um, só não é falsificável
- **Não dá pra revogar antes de expirar.** Por isso curto, e por isso uma lista de revogados quando importa

### Autenticação delegada (OAuth 2.1)

Entrar com Google/Apple, ou integrar com serviço de terceiro. Na versão 2.1, o fluxo de
código com **PKCE é obrigatório para todos os clientes**, a URL de retorno precisa bater
exatamente, e o fluxo implícito saiu de cena. Referência: https://oauth.net/2.1/

**Recomendação prática:** para a maioria dos sistemas, usar um provedor pronto (Supabase
Auth, Auth0, Clerk, Keycloak) em vez de implementar. Autenticação é área onde errar sozinho
é fácil e caro.

---

## Permissão

Modelo que atende quase todo caso: **usuário → papel → permissão**.

```typescript
const PERMISSOES = {
  admin:      ['ler', 'escrever', 'apagar', 'gerenciar_usuarios'],
  operador:   ['ler', 'escrever'],
  visualizador: ['ler']
};

function exigir(permissao: string) {
  return (req, res, next) => {
    const permitidas = PERMISSOES[req.usuario.papel] ?? [];
    if (!permitidas.includes(permissao)) {
      return res.status(403).json({ erro: { codigo: 'SEM_PERMISSAO' } });
    }
    next();
  };
}

app.delete('/api/v1/clientes/:id', autenticar, exigir('apagar'), removerCliente);
```

- Negar por padrão
- Menor privilégio: cada papel com o mínimo que precisa
- Papel **e** propriedade: ter permissão de "ler pedido" não é permissão de ler o pedido dos outros. Filtrar por dono na consulta
- Registrar mudança de papel

---

## Segredo

- Só no `.env`, que fica no `.gitignore`. **Nunca** dentro do código, do markdown ou da mensagem de commit
- Segredo diferente por ambiente
- Chave que já foi pro git está comprometida — trocar, não apagar o commit e fingir que não houve
- Falhar no start se faltar variável obrigatória, em vez de quebrar em produção na primeira requisição

```typescript
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL não configurada');
```

---

## Antes de subir

- [ ] `npm audit` sem falha conhecida de severidade alta
- [ ] Toda consulta parametrizada
- [ ] Toda entrada validada no servidor, com lista do permitido
- [ ] Senha com Argon2id
- [ ] HTTPS obrigatório
- [ ] Cabeçalhos de segurança ligados
- [ ] CORS restrito
- [ ] Limite de requisição, mais apertado no login
- [ ] Permissão negada por padrão e verificada no servidor
- [ ] Erro sem detalhe interno na resposta
- [ ] Log de autenticação e de permissão negada, sem dado sensível
- [ ] Nenhum segredo fora do `.env`
