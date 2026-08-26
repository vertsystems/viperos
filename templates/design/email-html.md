# E-mail em HTML — o que sobrevive à caixa de entrada

Referência do `/email`. E-mail não é página: o HTML roda dentro de dezenas de
programas, alguns com motor de renderização de 20 anos atrás, e chega com a imagem
desligada. Quase tudo que funciona num site quebra aqui.

O `/email-profissional` escreve o **texto** de um e-mail avulso. Este arquivo é sobre
**desenhar** o e-mail que vai para uma lista.

---

## O esqueleto

- **Tabela, não `div`.** `flex` e `grid` não existem no Outlook para Windows, que
  renderiza com o motor do Word
- **600px de largura máxima.** É o que cabe no painel de leitura sem rolagem horizontal
- **CSS inline, no atributo `style` de cada elemento.** O Gmail descarta boa parte do
  que está em `<style>`, e não lê arquivo externo
- **Uma coluna.** Duas colunas empilham mal no celular sem `@media`, que nem todo
  cliente respeita
- `role="presentation"` nas tabelas de layout, para o leitor de tela não anunciar
  "tabela de 4 colunas" antes de cada frase

```html
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
       style="background:#f4f4f4;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
           style="width:600px;max-width:100%;background:#ffffff;">
      <tr><td style="padding:32px;font:16px/1.5 Arial,Helvetica,sans-serif;color:#1a1a1a;">
        ...
      </td></tr>
    </table>
  </td></tr>
</table>
```

---

## Imagem chega desligada

Vários clientes bloqueiam imagem até a pessoa autorizar. **O e-mail precisa fazer
sentido sem nenhuma imagem.**

- Nada de e-mail que é uma imagem só. Além de ilegível com a imagem bloqueada, é o
  padrão que mais cai em spam
- `alt` em toda imagem, com estilo junto (`style="font:16px Arial;color:#1a1a1a"`) — o
  texto alternativo aparece no lugar dela e herda esse estilo
- `width` e `height` declarados em atributo, não só em CSS
- Logo em PNG com fundo sólido. SVG não é suportado no Gmail
- Preço, prazo e botão **em texto**, nunca dentro da imagem

---

## Botão que funciona no Outlook

O `<a>` com `padding` some no Word. O padrão que aguenta é o botão em tabela:

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" bgcolor="#1a56db" style="border-radius:6px;">
    <a href="https://..." target="_blank"
       style="display:inline-block;padding:14px 28px;font:600 16px Arial,sans-serif;
              color:#ffffff;text-decoration:none;min-height:44px;line-height:20px;">
      Ver a proposta
    </a>
  </td></tr>
</table>
```

`bgcolor` no `<td>` **e** cor no CSS: quem ignora um lê o outro.

---

## Modo escuro

Alguns clientes invertem as cores por conta própria, e o resultado é logo preto em
fundo preto. Não existe jeito de controlar isso por inteiro. O que dá pra fazer é reduzir o dano:

```html
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
```

- Fundo branco puro e texto quase preto invertem melhor do que tons intermediários
- Logo com contorno claro ou fundo próprio sobrevive aos dois modos
- Nunca depender de fundo transparente: PNG transparente sobre inversão some
- Testar de verdade no app do Gmail e no Outlook em modo escuro. É o único jeito

---

## Preheader

A linha que aparece na lista, depois do assunto. Sem ela, o cliente mostra "Ver no
navegador" ou o começo do rodapé, e a taxa de abertura cai por um detalhe de 40
caracteres:

```html
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Três dias para retirar seu pedido — depois disso volta pro estoque.
</div>
<div style="display:none;max-height:0;overflow:hidden;">&#8203;&#8203;&#8203;&#8203;</div>
```

O segundo bloco (espaços de largura zero) impede que o cliente complete a prévia com o
texto seguinte.

---

## Exigência de quem entrega: Gmail e Yahoo

Desde **fevereiro de 2024**, quem envia em volume (a régua do Gmail é **5.000 mensagens
por dia** para o mesmo domínio) precisa cumprir, ou a mensagem vai para spam ou é
recusada:

1. **Autenticação do domínio:** SPF **e** DKIM configurados, e DMARC publicado (ainda
   que em `p=none`)
2. **Cancelamento em um clique:** cabeçalho `List-Unsubscribe` **e**
   `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058), e o pedido tem de
   ser processado em até 2 dias
3. **Taxa de spam abaixo de 0,3%**, acompanhada no Google Postmaster Tools
4. Link de descadastro visível **também no corpo**, não só no cabeçalho

Os cabeçalhos são configurados na ferramenta de envio (Brevo, Mailchimp, Resend), não
no HTML. O que o HTML precisa carregar é o link visível, o endereço físico do remetente
e o motivo do recebimento: as três linhas do rodapé.

> Abaixo desse volume nada disso é exigido, mas tudo continua valendo como higiene: um
> disparo de 300 e-mails sem SPF cai em spam do mesmo jeito.

---

## Antes de enviar

1. **Peso abaixo de 102 KB** de HTML — acima disso o Gmail corta a mensagem no meio e
   esconde o rodapé (com o link de descadastro) atrás de "Ver mensagem inteira"
2. Nenhum CSS externo, nenhum `<script>`, nenhum `<form>` — são removidos ou marcam spam
3. Todo link com URL absoluta (`https://...`) e destino testado
4. Texto em 16px, corpo com contraste ≥4.5:1, botão com alvo ≥44px
5. Versão em texto puro junto (a ferramenta gera, mas confira: ela costuma sair vazia)
6. Enviar um teste para si mesmo e abrir no **celular** antes de disparar para a lista
7. `node scripts/verificar.js html <arquivo.html>` — pega placeholder esquecido e link
   vazio, que aqui é irreversível: e-mail enviado não se corrige
