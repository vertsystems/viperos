#!/usr/bin/env node
/**
 * ViperOS — verificar.js
 * Confere o que não pode ser estimado: contagem, soma, data, contraste, peso.
 *
 * Existe porque erro de número não se pega lendo. Toda skill que produz número
 * roda a verificação aqui antes de entregar.
 *
 * Uso:
 *   node scripts/verificar.js csv <arquivo.csv> [--ads]
 *   node scripts/verificar.js datas <arquivo.md>
 *   node scripts/verificar.js tabela <arquivo.md>
 *   node scripts/verificar.js contraste "#0E1116" "#F7F5F1"
 *   node scripts/verificar.js html <arquivo.html>
 *   node scripts/verificar.js peso <pasta-ou-arquivo>
 *   node scripts/verificar.js tudo <pasta>
 *   node scripts/verificar.js sistema [pasta]
 *
 * Sai com código 1 se achar problema — dá pra encadear com &&.
 * Node 18+. Sem dependência.
 */

const fs = require("fs");
const path = require("path");

let problemas = 0;
const erro = (m) => { console.log(`  ✖ ${m}`); problemas++; };
const ok = (m) => console.log(`  ✓ ${m}`);
const info = (m) => console.log(`  · ${m}`);

// ─────────────────────────── CSV ───────────────────────────
// Detecta: campo com vírgula não escapada (linha com nº de colunas diferente),
// e limites do Google Ads (headline 30, description 90, path 15).

function parseCSVLine(linha) {
  const campos = [];
  let atual = "", dentroAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === '"') {
      if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
      else dentroAspas = !dentroAspas;
    } else if (c === "," && !dentroAspas) { campos.push(atual); atual = ""; }
    else atual += c;
  }
  campos.push(atual);
  return campos;
}

const LIMITES_ADS = [
  { re: /^headline/i, max: 30, nome: "Headline" },
  { re: /^description/i, max: 90, nome: "Description" },
  { re: /^path/i, max: 15, nome: "Path" },
];

function verCSV(arquivo, ads) {
  console.log(`\nCSV: ${arquivo}`);
  const linhas = fs.readFileSync(arquivo, "utf8").split(/\r?\n/).filter((l) => l.trim());
  if (!linhas.length) return erro("arquivo vazio");

  const cab = parseCSVLine(linhas[0]);
  info(`${cab.length} colunas, ${linhas.length - 1} linhas de dados`);

  // 1. contagem de campos
  let desalinhadas = 0;
  linhas.forEach((l, i) => {
    if (i === 0) return;
    const n = parseCSVLine(l).length;
    if (n !== cab.length) {
      desalinhadas++;
      erro(`linha ${i + 1}: ${n} campos, esperado ${cab.length} — quase sempre é vírgula dentro de campo sem aspas`);
      const suspeitos = parseCSVLine(l).filter((c) => c.includes(",") === false && c.trim().startsWith(" "));
      if (suspeitos.length) info(`    provável: "${suspeitos[0].trim().slice(0, 40)}"`);
    }
  });
  if (!desalinhadas) ok("todas as linhas com o mesmo número de campos");

  // 2. limites (Google Ads)
  if (ads) {
    let estouros = 0;
    const idx = cab.map((c, i) => ({ i, c: c.trim(), lim: LIMITES_ADS.find((L) => L.re.test(c.trim())) })).filter((x) => x.lim);
    linhas.forEach((l, li) => {
      if (li === 0) return;
      const campos = parseCSVLine(l);
      idx.forEach(({ i, c, lim }) => {
        const v = (campos[i] || "").trim();
        if (v.length > lim.max) {
          estouros++;
          erro(`linha ${li + 1}, ${c}: ${v.length} caracteres (máx ${lim.max}) → "${v}"`);
        }
      });
    });
    if (!estouros && idx.length) ok(`todos os campos dentro do limite (${idx.length} colunas checadas)`);
    if (!idx.length) info("nenhuma coluna Headline/Description/Path encontrada — pulei o limite");
  }
}

// ─────────────────────────── DATAS ───────────────────────────
// Detecta: "seg 01/09" quando 01/09 é terça.

const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_LONGO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function normaliza(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function verDatas(arquivo) {
  console.log(`\nDATAS: ${arquivo}`);
  const texto = fs.readFileSync(arquivo, "utf8");
  const linhas = texto.split("\n");

  // ano de referência: prioriza o do título/nome do arquivo (calendario-2026-09),
  // depois "de/em AAAA" no cabeçalho, e só então o primeiro 20xx solto.
  // Pegar qualquer 20xx do texto erra em arquivo que cita "fundada em 2019".
  const doNome = path.basename(arquivo).match(/\b(20\d{2})\b/);
  const doTitulo = (texto.split("\n").slice(0, 8).join(" ")).match(/\b(20\d{2})\b/);
  const solto = texto.match(/\b(20\d{2})\b/);
  const ano = parseInt((doNome && doNome[1]) || (doTitulo && doTitulo[1]) || (solto && solto[1]) || new Date().getFullYear());
  info(`ano de referência: ${ano}${doNome ? " (do nome do arquivo)" : doTitulo ? " (do cabeçalho)" : ""}`);

  let checadas = 0, erradas = 0;
  const DIA = "dom|seg|ter|qua|qui|sex|s[áa]b|domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado";
  const DATA = "(\\d{1,2})[\\/\\-](\\d{1,2})(?:[\\/\\-](\\d{2,4}))?";
  // duas ordens: "seg 01/09"  e  "| 01/09 | seg |" (tabela)
  const padroes = [
    { re: new RegExp(`\\b(${DIA})\\b[^\\d\\n]{0,12}${DATA}`, "gi"), ordem: "dia-data" },
    { re: new RegExp(`${DATA}[^\\dA-Za-z\\n]{0,6}\\b(${DIA})\\b`, "gi"), ordem: "data-dia" },
  ];

  linhas.forEach((linha, i) => {
    const jaVistas = new Set();
    for (const { re, ordem } of padroes) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(linha))) {
        const diaTxt = ordem === "dia-data" ? m[1] : m[4];
        const [d, mes, anoTxt] = ordem === "dia-data" ? [m[2], m[3], m[4]] : [m[1], m[2], m[3]];
        const a = anoTxt && anoTxt.length >= 2 && +anoTxt > 12 ? (anoTxt.length === 2 ? 2000 + +anoTxt : +anoTxt) : ano;
        const dt = new Date(a, +mes - 1, +d);
        const chave = `${d}/${mes}`;
        if (dt.getDate() !== +d || dt.getMonth() !== +mes - 1) {
          if (!jaVistas.has(chave)) {
            jaVistas.add(chave);
            checadas++;
            erradas++;
            erro(`linha ${i + 1}: "${d}/${mes}/${a}" não existe no calendário`);
          }
          continue;
        }
        if (jaVistas.has(chave)) continue;
        jaVistas.add(chave);
        checadas++;
        const real = dt.getDay();
        if (normaliza(diaTxt).slice(0, 3) !== normaliza(DIAS[real]).slice(0, 3)) {
          erradas++;
          erro(`linha ${i + 1}: "${d}/${mes}" está marcado como ${diaTxt} — mas ${d}/${mes}/${a} é ${DIAS_LONGO[real]}`);
        }
      }
    }
  });

  if (!checadas) info("nenhum par dia-da-semana + data encontrado");
  else if (!erradas) ok(`${checadas} datas conferidas, todos os dias da semana corretos`);
}

// ─────────────────────────── TABELA ───────────────────────────
// Detecta: soma das linhas que não bate com o total declarado no texto.

function numerosDe(s) {
  // "R$ 16.900" → 16900 · "62,5%" → 62.5 · "1.487" → 1487
  const limpo = s.replace(/R\$\s*/g, "").trim();
  const m = limpo.match(/-?[\d.,]+/);
  if (!m) return null;
  let n = m[0];
  if (n.includes(",") && n.includes(".")) n = n.replace(/\./g, "").replace(",", ".");
  else if (n.includes(",")) n = n.replace(",", ".");
  else if ((n.match(/\./g) || []).length >= 1 && /\.\d{3}(\D|$)/.test(n + " ")) n = n.replace(/\./g, "");
  const v = parseFloat(n);
  return isNaN(v) ? null : v;
}

/** Divide a linha da tabela preservando célula vazia do meio (só apara as bordas). */
function celulas(linha) {
  const c = linha.split("|").map((s) => s.trim());
  if (c.length && c[0] === "") c.shift();
  if (c.length && c[c.length - 1] === "") c.pop();
  return c;
}

const RE_TOTAL = /^\**\s*(total|totais|soma|somat[óo]rio|subtotal|investimento total|valor total|geral)\b/i;

function verTabela(arquivo) {
  console.log(`\nTABELA: ${arquivo}`);
  const linhas = fs.readFileSync(arquivo, "utf8").split("\n");
  let tabelas = 0;

  for (let i = 0; i < linhas.length; i++) {
    if (!/^\s*\|/.test(linhas[i]) || !/^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] || "")) continue;
    const cab = celulas(linhas[i]);
    let corpo = [];
    let j = i + 2;
    while (j < linhas.length && /^\s*\|/.test(linhas[j])) {
      corpo.push(celulas(linhas[j]));
      j++;
    }
    if (corpo.length < 2) { i = j; continue; }
    tabelas++;

    // linha de total DENTRO da tabela: tirar do corpo e usar como valor declarado
    let linhaTotal = null;
    if (corpo.length && RE_TOTAL.test(corpo[corpo.length - 1][0] || "")) {
      linhaTotal = corpo.pop();
    }

    // tabela de métricas heterogêneas (uma métrica por linha) não soma
    const tituloPrimeira = (cab[0] || "").toLowerCase();
    // "Item" NÃO entra: é o cabeçalho padrão de orçamento, que soma.
    // Heterogênea é a tabela em que cada linha é uma métrica diferente
    // (fechamentos, receita, ticket) — somar isso não significa nada.
    const heterogenea = /^(m[ée]trica|indicador|kpi)s?$/.test(tituloPrimeira);
    if (heterogenea) {
      info(`tabela de métricas ("${cab[0]}") — linhas não são somáveis entre si, pulei a soma`);
      i = j;
      continue;
    }

    // texto ao redor da tabela: o total costuma estar num resumo antes ou depois
    const volta = linhas.slice(Math.max(0, i - 25), i).join("\n");
    const depois = linhas.slice(j, j + 15).join("\n");
    const contexto = volta + "\n" + depois;

    cab.forEach((titulo, c) => {
      const vals = corpo.map((r) => numerosDe(r[c] || "")).filter((v) => v !== null);
      if (vals.length < 2 || vals.length < corpo.length - 1) return;
      if (/%|taxa|média|media|preço unit|cpc|cpa/i.test(titulo)) return; // não somam
      const soma = vals.reduce((a, b) => a + b, 0);
      info(`coluna "${titulo}" soma ${soma.toLocaleString("pt-BR")} (${vals.length} linhas)`);

      const igual = (a, b) => Math.abs(a - b) <= Math.max(1, Math.abs(b) * 0.005);

      // 1) linha de total dentro da própria tabela — a comparação mais confiável
      if (linhaTotal) {
        const dec = numerosDe(linhaTotal[c] || "");
        if (dec !== null) {
          if (!igual(dec, soma)) {
            erro(`coluna "${titulo}": os itens somam ${soma.toLocaleString("pt-BR")}, mas a linha "${linhaTotal[0]}" declara ${dec.toLocaleString("pt-BR")}`);
          } else ok(`coluna "${titulo}": itens batem com a linha de total`);
          return; // total na tabela tem precedência sobre o texto ao redor
        }
      }

      // 2) total declarado no texto ao redor
      const candidatos = [
        ...contexto.matchAll(/\*\*([^*]{1,25})\*\*/g),
        ...contexto.matchAll(/(?:total|somando|somam|no total|receita total)[^\n]{0,40}/gi),
      ].map((m) => ({ txt: m[0], val: numerosDe(m[1] || m[0]) })).filter((x) => x.val !== null);

      for (const cand of candidatos) {
        // só compara com número da mesma ordem de grandeza (evita casar 50% com 6)
        const prox = Math.abs(cand.val - soma) <= Math.max(soma * 0.35, 3);
        if (prox && !igual(cand.val, soma)) {
          erro(`coluna "${titulo}": as linhas somam ${soma.toLocaleString("pt-BR")}, mas o texto declara ${cand.val.toLocaleString("pt-BR")} — "${cand.txt.trim().slice(0, 60)}"`);
          break;
        }
      }
    });
    i = j;
  }
  if (!tabelas) info("nenhuma tabela markdown encontrada");
  verMultiplicacoes(fs.readFileSync(arquivo, "utf8"));
}

// ─────────────────────────── MULTIPLICAÇÃO ───────────────────────────
// "12× R$ 74 = R$ 890" passava em branco: o verTabela só soma coluna, e conta
// escrita em prosa (página de preço, proposta, plano anual) nunca era conferida.
// Numa página de preço, essa é a conta que o cliente refaz na calculadora.

const RE_MULT = /(\d{1,3})\s*[x×]\s*(?:de\s+)?(?:R\$\s*)?([\d][\d.,]*)\s*(?:=|·|—|-)?\s*(?:R\$\s*)?(?:no total|total(?:iza)?(?:ndo)?)?\s*(?:=|:)?\s*R\$\s*([\d][\d.,]*)/gi;

function verMultiplicacoes(texto) {
  let achou = 0;
  for (const m of texto.matchAll(RE_MULT)) {
    const n = parseInt(m[1], 10);
    const unit = numerosDe(m[2]);
    const total = numerosDe(m[3]);
    if (!n || unit === null || total === null) continue;
    // "1× R$ 90 = R$ 90" e parcela maior que o total são outra coisa (desconto, entrada)
    if (n < 2 || total < unit) continue;
    achou++;
    const esperado = n * unit;
    // tolerância de 1%: parcela arredondada em centavos é normal, erro de conta não
    if (Math.abs(esperado - total) > Math.max(0.5, esperado * 0.01)) {
      erro(`"${m[0].trim()}" não fecha: ${n} × ${unit.toLocaleString("pt-BR")} = ${esperado.toLocaleString("pt-BR")}, não ${total.toLocaleString("pt-BR")}`);
    }
  }
  if (achou) ok(`${achou} multiplicação(ões) do tipo "N× R$ X = R$ Y" conferida(s)`);
}

// ─────────────────────────── CONTRASTE ───────────────────────────

function lum(hex) {
  const h = String(hex ?? "").replace("#", "").trim();
  // Sem isso, "vermelho" ou "rgb(255,0,0)" viram NaN e o check REPROVA em silêncio —
  // a skill "conserta" uma cor que estava boa. Melhor falhar dizendo o que houve.
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(h)) {
    throw new Error(`cor inválida: "${hex}" — use hexadecimal (#RGB, #RRGGBB ou #RRGGBBAA). Nome de cor e rgb() não são aceitos.`);
  }
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.substr(i, 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function razao(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function verContraste(c1, c2) {
  console.log(`\nCONTRASTE: ${c1} sobre ${c2}`);
  const r = razao(c1, c2);
  const v = r.toFixed(2);
  console.log(`  razão: ${v}:1`);
  if (r >= 4.5) ok(`passa em texto normal (4.5:1) e grande (3:1)`);
  else if (r >= 3) { erro(`reprova em texto normal (precisa 4.5:1) — só serve pra texto grande`); }
  else erro(`reprova em tudo (precisa 3:1 no mínimo)`);
  return r;
}

// ─────────────────────────── HTML ───────────────────────────
// Detecta: peça que depende de CSS externo local, e var() sem fallback.

function verHTML(arquivo) {
  console.log(`\nHTML: ${arquivo}`);
  const t = fs.readFileSync(arquivo, "utf8");

  const links = [...t.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const externosLocais = links.filter((h) => !/^https?:/.test(h) && /\.css$/i.test(h));
  if (externosLocais.length) {
    erro(`depende de CSS local externo: ${externosLocais.join(", ")}`);
    info("    se o arquivo for enviado sozinho (WhatsApp, e-mail, Drive), chega sem estilo");
  } else ok("não depende de CSS local externo");

  // Não basta existir um :root — cada token usado precisa estar DEFINIDO no arquivo
  // (ou ter fallback). Um inline parcial deixa tokens órfãos e a peça quebra em silêncio.
  const definidos = new Set([...t.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1].toLowerCase()));
  const vars = [...t.matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,[^)]*)?\)/gi)];
  const orfaos = vars.filter((m) => !m[2] && !definidos.has(m[1].toLowerCase()));

  if (vars.length && orfaos.length) {
    const nomes = [...new Set(orfaos.map((m) => m[1]))];
    erro(`${orfaos.length} uso(s) de var() apontando pra token que o arquivo não define, e sem fallback`);
    info(`    ${nomes.slice(0, 8).join(", ")}${nomes.length > 8 ? ` (+${nomes.length - 8})` : ""}`);
    info("    fora da pasta viram vazio — cor some, fundo some, botão fica invisível");
  } else if (vars.length) {
    ok(`${vars.length} var() — todos definidos no arquivo ou com fallback (${definidos.size} tokens declarados)`);
  }

  const page = t.match(/@page\s*\{[^}]*\}/i);
  if (page) {
    const size = page[0].match(/size:\s*([^;}]+)/i);
    if (size && /\d+(px|mm|cm|in)\s+\d+(px|mm|cm|in)\s+(landscape|portrait)/i.test(size[1])) {
      erro(`@page inválido: "size: ${size[1].trim()}" — medida explícita + orientação é descartado pelo navegador`);
      info("    duas medidas já definem a orientação: size: 1920px 1080px");
    } else ok(`@page válido: ${size ? size[1].trim() : "sem size"}`);
  }

  // 100vh só é problema DENTRO do @media print — na regra de tela é correto
  if (page) {
    // extrai o bloco @media print contando chaves — regex com lookahead falha
    // quando existe qualquer CSS depois do bloco de impressão
    const extraiBloco = (txt, iniRe) => {
      const m = txt.match(iniRe);
      if (!m) return null;
      let i = txt.indexOf("{", m.index);
      if (i === -1) return null;
      let nivel = 0;
      for (let k = i; k < txt.length; k++) {
        if (txt[k] === "{") nivel++;
        else if (txt[k] === "}") { nivel--; if (!nivel) return txt.slice(i + 1, k); }
      }
      return null;
    };
    const bloco = extraiBloco(t, /@media[^{]*\bprint\b[^{]*/i);
    const dentro = bloco ? /height:\s*100vh/i.test(bloco) : false;
    const temPrint = bloco !== null;
    if (dentro) erro("100vh dentro do @media print — o vh não corresponde à página impressa, usar a medida fixa (ex: height:1080px)");
    else if (!temPrint && /height:\s*100vh/i.test(t)) erro("100vh e @page sem bloco @media print que sobrescreva a altura — o slide vai sair cortado no PDF");
    else if (temPrint) ok("altura da impressão não depende de vh");
  }

  const placeholders = t.match(/\[(SEU|NOME|VALOR|PRAZO|CLIENTE|EMPRESA|A DEFINIR|a confirmar)[^\]]*\]|lorem ipsum/gi);
  if (placeholders) erro(`placeholder esquecido: ${[...new Set(placeholders)].slice(0, 5).join(", ")}`);

  const hrefsVazios = [...t.matchAll(/href=["'](#|mailto:\s*|tel:\s*|https?:\/\/wa\.me\/?)["']/gi)];
  if (hrefsVazios.length) erro(`${hrefsVazios.length} link vazio ou incompleto (href="#", mailto: sem endereço, wa.me sem número)`);

  // página de preço erra a conta em prosa, não em tabela: "12× R$ 97 = R$ 1.164"
  verMultiplicacoes(t.replace(/<[^>]+>/g, " "));
}

// ─────────────────────────── ALVO ───────────────────────────
// Tamanho de alvo clicável (WCAG 2.5.8 pede 24×24px; o piso do ViperOS é 34px,
// 44px no toque — ver templates/design/interface.md).
//
// A lógica é INVERTIDA de propósito. A versão ingênua — "medir o que declara e
// reprovar o pequeno" — aprova o pior caso: botão com `padding: 4px 8px` e nenhum
// min-height passa, porque não há altura para medir. Só o navegador sabe o tamanho
// final, e este script não é navegador. Então o que se exige é a DECLARAÇÃO:
// quem não declara min-height reprova, em vez de ser premiado pela omissão.

const PISO_ALVO = 34;   // piso do ViperOS no desktop
const MIN_WCAG = 24;    // mínimo do critério 2.5.8

function medidaPx(v) {
  const m = String(v).trim().match(/^([\d.]+)\s*(px|rem|em)?$/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  return (m[2] || "px").toLowerCase() === "px" ? n : n * 16;
}

/** Maior altura declarada num bloco de declarações CSS. Padding NÃO conta. */
function alturaDe(decls) {
  let maior = null;
  for (const m of decls.matchAll(/(?:^|[;{\s])(min-height|min-block-size|height)\s*:\s*([^;}]+)/gi)) {
    const v = medidaPx(m[2]);
    if (v !== null) maior = maior === null ? v : Math.max(maior, v);
  }
  return maior;
}

/** Pares seletor/declarações de todo <style> do arquivo. Blocos @media são achatados. */
function regrasDe(html) {
  const regras = [];
  for (const st of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = st[1].replace(/\/\*[\s\S]*?\*\//g, "");
    for (const r of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const sel of r[1].split(",").map((s) => s.trim()).filter(Boolean)) {
        if (sel.startsWith("@")) continue;
        regras.push({ sel, decls: r[2] });
      }
    }
  }
  return regras;
}

function atributosDe(bruto) {
  const attrs = {};
  for (const m of bruto.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)) attrs[m[1].toLowerCase()] = m[2];
  for (const m of bruto.matchAll(/(?:^|\s)([\w-]+)(?=\s|$)/g)) if (!(m[1].toLowerCase() in attrs)) attrs[m[1].toLowerCase()] = "";
  return attrs;
}

/** O seletor alcança este elemento? Compara só o último simples — basta para o caso real. */
function seletorCasa(sel, el) {
  let s = (sel.split(/\s+|>|\+|~/).filter(Boolean).pop() || "").replace(/::?[a-z-]+(\([^)]*\))?/gi, "");
  if (!s || s === "*") return s === "*";
  const tag = (s.match(/^[a-z][a-z0-9]*/i) || [])[0];
  if (tag && tag.toLowerCase() !== el.tag) return false;
  for (const m of s.matchAll(/\.([\w-]+)/g)) if (!el.classes.includes(m[1])) return false;
  for (const m of s.matchAll(/#([\w-]+)/g)) if (m[1] !== el.attrs.id) return false;
  for (const m of s.matchAll(/\[([\w-]+)(?:[~|^$*]?=["']?([^\]"']*)["']?)?\]/g)) {
    const val = el.attrs[m[1].toLowerCase()];
    if (val === undefined) return false;
    if (m[2] && val !== m[2]) return false;
  }
  return true;
}

const TIPOS_INPUT_ALVO = new Set(["button", "submit", "reset", "checkbox", "radio", "file", "image"]);

function verAlvo(arquivo) {
  console.log(`\nALVO: ${arquivo}`);
  const html = fs.readFileSync(arquivo, "utf8");
  const regras = regrasDe(html);

  const semDeclaracao = new Map();  // assinatura → quantidade
  const pequenos = new Map();       // mensagem → quantidade (agrupa: 30 botões iguais são um problema, não 30)
  let inline = 0, conferidos = 0, aprovados = 0;

  for (const m of html.matchAll(/<(a|button|input|select|summary|textarea)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const attrs = atributosDe(m[2]);
    if (tag === "a" && attrs.href === undefined) continue;                       // âncora não é alvo
    if (tag === "input" && !TIPOS_INPUT_ALVO.has((attrs.type || "text").toLowerCase())) continue;
    if (attrs.hidden !== undefined || /display:\s*none/i.test(attrs.style || "")) continue;

    const classes = (attrs.class || "").split(/\s+/).filter(Boolean);
    const el = { tag, attrs, classes };

    // exceção "inline" do 2.5.8: link sem classe dentro de texto corrido
    if (tag === "a" && !classes.length) {
      const antes = html.slice(0, m.index);
      const bloco = (antes.match(/<(p|li|td|h[1-6]|figcaption|blockquote)\b[^>]*>(?![\s\S]*<\/\1>)/i) || [])[1];
      if (bloco) { inline++; continue; }
    }

    conferidos++;
    let altura = alturaDe(attrs.style || "");
    for (const r of regras) if (seletorCasa(r.sel, el)) {
      const a = alturaDe(r.decls);
      if (a !== null) altura = altura === null ? a : Math.max(altura, a);
    }

    const assinatura = `<${tag}${classes.length ? "." + classes.join(".") : ""}>`;
    if (altura === null) semDeclaracao.set(assinatura, (semDeclaracao.get(assinatura) || 0) + 1);
    else if (altura < PISO_ALVO) {
      const msg = altura < MIN_WCAG
        ? `${assinatura} declara ${altura}px — reprova no critério 2.5.8 (${MIN_WCAG}px)`
        : `${assinatura} declara ${altura}px — passa na WCAG, mas abaixo do piso do ViperOS (${PISO_ALVO}px)`;
      pequenos.set(msg, (pequenos.get(msg) || 0) + 1);
    }
    else aprovados++;
  }

  if (!conferidos && !inline) return info("nenhum elemento clicável encontrado");

  for (const [ass, n] of semDeclaracao)
    erro(`${ass}${n > 1 ? ` (${n}×)` : ""} sem min-height declarado — padding não garante alvo, e o tamanho final só existe no navegador`);
  for (const [msg, n] of pequenos) erro(n > 1 ? msg.replace(" declara", ` (${n}×) declara`) : msg);

  if (!semDeclaracao.size && !pequenos.size) ok(`${aprovados} elemento(s) clicável(is) com alvo declarado ≥${PISO_ALVO}px`);
  if (inline) info(`${inline} link(s) inline em texto corrido — exceção do 2.5.8, não conferidos`);

  const toque = /@media[^{]*(pointer:\s*coarse|hover:\s*none|max-width)[^{]*\{[\s\S]*?(min-height|min-block-size)\s*:\s*(4[4-9]|[5-9]\d)px/i.test(html);
  if (conferidos && !toque) info("nenhuma regra sobe o alvo para 44px no toque — no celular o piso é 44px");
}

// ─────────────────────────── PESO ───────────────────────────

function verPeso(alvo) {
  console.log(`\nPESO: ${alvo}`);
  const arqs = [];
  const anda = (p) => {
    const st = fs.statSync(p);
    if (st.isDirectory()) fs.readdirSync(p).forEach((f) => anda(path.join(p, f)));
    else if (/\.(png|jpe?g|pdf)$/i.test(p)) arqs.push({ p, mb: st.size / 1048576 });
  };
  anda(alvo);
  if (!arqs.length) return info("nenhuma imagem ou PDF");
  const pesados = arqs.filter((a) => a.mb > 2);
  arqs.sort((a, b) => b.mb - a.mb).slice(0, 3).forEach((a) => info(`${path.basename(a.p)}: ${a.mb.toFixed(1)} MB`));
  if (pesados.length) {
    pesados.forEach((a) => erro(`${path.basename(a.p)}: ${a.mb.toFixed(1)} MB — acima de 2 MB (limite da API da Meta é 8 MB; o Instagram recomprime pra 1080 de largura de qualquer forma)`));
    info("    quase sempre é deviceScaleFactor: 2 no render.js — usar 1");
  } else ok(`${arqs.length} arquivos, nenhum acima de 2 MB`);
}

// ─────────────────────────── TUDO ───────────────────────────

function verTudo(pasta) {
  const anda = (p, prof = 0) => {
    if (prof > 4) return;
    for (const f of fs.readdirSync(p)) {
      if (f.startsWith(".") || f === "node_modules") continue;
      const full = path.join(p, f);
      const st = fs.statSync(full);
      if (st.isDirectory()) anda(full, prof + 1);
      else if (/\.csv$/i.test(f)) verCSV(full, /ads|anuncio|google/i.test(f));
      else if (/\.html$/i.test(f)) { verHTML(full); verAlvo(full); }
      else if (/\.md$/i.test(f)) { verDatas(full); verTabela(full); }
    }
  };
  anda(pasta);
  verPeso(pasta);
}

// ─────────────────────────── SISTEMA ───────────────────────────
// Confere o próprio ViperOS, não o trabalho: skill que não carrega, referência
// a skill ou arquivo que não existe, script prometido e ausente, contagem
// desatualizada. É o check que se roda antes de publicar versão nova.
//
// Existe porque três SKILL.md ficaram meses com BOM UTF-8 antes do `---` (o
// frontmatter não é lido, e a skill nunca é encontrada) e uma skill mandava
// rodar dois scripts que nunca estiveram no repositório.

// Barras que aparecem no texto e NÃO são skill do ViperOS. Cada uma com o
// motivo — a lista é curta de propósito: crescer aqui é esconder problema.
const NAO_SAO_SKILLS = new Set([
  "health",                                       // endpoint HTTP, citado no /backend
  "prazo", "endereco", "pagamento",               // atalhos de resposta rápida do WhatsApp Business
  "schwartz-copy", "ogilvy-copy", "yt-transcript",// skills de terceiros: catalogadas, não instaladas
  "nome-da-skill", "comando", "skill", "nome",    // exemplo genérico em texto
]);

function mdsDe(raiz) {
  const achados = [];
  const anda = (p) => {
    for (const f of fs.readdirSync(p)) {
      if (f === ".git" || f === "node_modules") continue;
      const full = path.join(p, f);
      if (fs.statSync(full).isDirectory()) anda(full);
      else if (/\.md$/i.test(f)) achados.push(full);
    }
  };
  anda(raiz);
  return achados;
}

function verSistema(raiz = ".") {
  console.log(`\nSISTEMA: ${path.resolve(raiz)}`);

  const dirSkills = path.join(raiz, ".claude", "skills");
  if (!fs.existsSync(dirSkills)) {
    return erro(".claude/skills/ não existe — isso não parece um workspace ViperOS");
  }

  // ── 1. cada skill carrega? ────────────────────────────────────
  const pastas = fs
    .readdirSync(dirSkills)
    .filter((f) => fs.statSync(path.join(dirSkills, f)).isDirectory());
  const skills = new Set(pastas);
  let skillsOk = 0;

  for (const nome of pastas) {
    const arq = path.join(dirSkills, nome, "SKILL.md");
    if (!fs.existsSync(arq)) { erro(`${nome}/ não tem SKILL.md`); continue; }

    const bruto = fs.readFileSync(arq);
    if (bruto[0] === 0xef && bruto[1] === 0xbb && bruto[2] === 0xbf) {
      erro(`${nome}: BOM UTF-8 antes do '---' — o frontmatter não é lido e a skill nunca é encontrada`);
    }

    const t = bruto.toString("utf8").replace(/^﻿/, "");
    const m = t.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) { erro(`${nome}: frontmatter ausente ou malformado`); continue; }

    const fm = m[1];
    const declarado = (fm.match(/^name:[ \t]*(.+)$/m) || [])[1];
    if (!declarado) erro(`${nome}: frontmatter sem 'name:'`);
    else if (declarado.trim() !== nome) erro(`${nome}: 'name: ${declarado.trim()}' não bate com o nome da pasta`);

    if (!/^description:/m.test(fm)) {
      erro(`${nome}: frontmatter sem 'description:'`);
    } else if (!/use quando/i.test(fm)) {
      erro(`${nome}: description sem gatilho ("Use quando o usuário disser…") — sem isso a skill não é acionada pelo que o usuário fala`);
    } else skillsOk++;
  }
  if (skillsOk === pastas.length) ok(`${pastas.length} skills carregam (frontmatter, nome e gatilho conferidos)`);

  // ── 2. referências quebradas em todo .md ──────────────────────
  const mds = mdsDe(raiz);
  const faltaSkill = new Map();
  const faltaPath = new Map();
  const faltaScript = new Map();
  const comBOM = [];

  for (const arq of mds) {
    const bruto = fs.readFileSync(arq);
    if (bruto[0] === 0xef && bruto[1] === 0xbb && bruto[2] === 0xbf) comBOM.push(arq);
    const t = bruto.toString("utf8");
    const rel = path.relative(raiz, arq);
    const opcional = rel.startsWith(path.join("templates", "opcional"));

    for (const m of t.matchAll(/`\/([a-z][a-z0-9-]{2,})`/g)) {
      const n = m[1];
      if (skills.has(n) || NAO_SAO_SKILLS.has(n)) continue;
      if (!faltaSkill.has(n)) faltaSkill.set(n, new Set());
      faltaSkill.get(n).add(rel);
    }

    for (const m of t.matchAll(/`((?:templates|scripts)\/[A-Za-z0-9._/-]+\.(?:md|js|css|json))`/g)) {
      if (fs.existsSync(path.join(raiz, m[1])) || opcional) continue;
      if (!faltaPath.has(m[1])) faltaPath.set(m[1], new Set());
      faltaPath.get(m[1]).add(rel);
    }

    for (const m of t.matchAll(/node[^\n`]*?(scripts\/[A-Za-z0-9._-]+\.js)/g)) {
      if (fs.existsSync(path.join(raiz, m[1])) || opcional) continue;
      if (!faltaScript.has(m[1])) faltaScript.set(m[1], new Set());
      faltaScript.get(m[1]).add(rel);
    }
  }

  comBOM.forEach((a) => erro(`BOM UTF-8 no início de ${path.relative(raiz, a)}`));
  for (const [n, onde] of faltaSkill)
    erro(`\`/${n}\` citado mas não existe em .claude/skills/ — em: ${[...onde].join(", ")}`);
  for (const [p, onde] of faltaPath)
    erro(`\`${p}\` citado mas não existe — em: ${[...onde].join(", ")}`);
  for (const [p, onde] of faltaScript)
    erro(`skill manda rodar \`${p}\`, que não existe — quebra no meio do fluxo, em: ${[...onde].join(", ")}`);

  if (!comBOM.length && !faltaSkill.size && !faltaPath.size && !faltaScript.size)
    ok(`${mds.length} arquivos .md sem referência quebrada`);

  // ── 3. contagem de skills escrita nos textos ──────────────────
  const total = pastas.length;
  let contagensRuins = 0;
  for (const arq of mds) {
    if (path.relative(raiz, arq).startsWith(path.join("templates", "opcional"))) continue;
    const t = fs.readFileSync(arq, "utf8");
    for (const m of t.matchAll(/(\d+)\s+skills\b/g)) {
      // "mais de 5 skills por sessão" e "de 3 a 5 skills" não falam do total
      const antes = t.slice(Math.max(0, m.index - 24), m.index);
      if (/(mais de|até|menos de|\d+\s+a)\s*$/i.test(antes)) continue;
      if (Number(m[1]) !== total) {
        erro(`${path.relative(raiz, arq)}: diz "${m[1]} skills", mas são ${total}`);
        contagensRuins++;
      }
    }
  }
  if (!contagensRuins) ok(`contagem de skills confere (${total}) em todo texto que a cita`);

  // ── 4. skill que ninguém cataloga ─────────────────────────────
  const catalogo = path.join(raiz, "templates", "skills", "catalogo.md");
  if (fs.existsSync(catalogo)) {
    const t = fs.readFileSync(catalogo, "utf8");
    const citadas = new Set([...t.matchAll(/`\/([a-z][a-z0-9-]{2,})`/g)].map((m) => m[1]));
    const fora = pastas.filter((n) => !citadas.has(n));
    if (fora.length) erro(`skill fora da tabela do catálogo (o usuário nunca descobre): ${fora.join(", ")}`);
    else ok("toda skill aparece no catálogo");
  }
}

// ─────────────────────────── main ───────────────────────────

const [cmd, ...args] = process.argv.slice(2);
const AJUDA = `ViperOS — verificar.js

  csv <arquivo> [--ads]     campos desalinhados e limites do Google Ads
  datas <arquivo.md>        dia da semana declarado vs data real
  tabela <arquivo.md>       soma das colunas vs total declarado, e "N× R$ X = R$ Y"
  contraste <cor1> <cor2>   razão WCAG
  html <arquivo.html>       CSS externo, var() sem fallback, @page, placeholder, link vazio
  alvo <arquivo.html>       tamanho de alvo clicável declarado (WCAG 2.5.8 + piso do ViperOS)
  peso <pasta|arquivo>      imagem acima de 2 MB
  tudo <pasta>              roda o que couber em cada arquivo
  sistema [pasta]           integridade do próprio ViperOS: skill que não carrega,
                            referência quebrada, script ausente, contagem errada`;

try {
  if (!cmd || cmd === "-h" || cmd === "--help") { console.log(AJUDA); process.exit(0); }
  if (cmd === "csv") verCSV(args[0], args.includes("--ads"));
  else if (cmd === "datas") verDatas(args[0]);
  else if (cmd === "tabela") verTabela(args[0]);
  else if (cmd === "contraste") verContraste(args[0], args[1]);
  else if (cmd === "html") verHTML(args[0]);
  else if (cmd === "alvo") verAlvo(args[0]);
  else if (cmd === "peso") verPeso(args[0]);
  else if (cmd === "tudo") verTudo(args[0] || ".");
  else if (cmd === "sistema") verSistema(args[0] || ".");
  else { console.log(`Comando desconhecido: ${cmd}\n\n${AJUDA}`); process.exit(1); }
} catch (e) {
  console.error(`\n✖ ${e.message}`);
  process.exit(1);
}

console.log(problemas ? `\n${problemas} problema(s) encontrado(s).` : "\nTudo certo.");
process.exit(problemas ? 1 : 0);
