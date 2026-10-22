/**
 * Conversa Apoiada — script da planilha "Conversa Apoiada — Entrevistas".
 *
 * Faz três coisas:
 *  - acao "convite": cria um código para uma família (só com o seu CODIGO de acesso);
 *  - acao "enviar": grava as respostas de um familiar, desde que o código da família exista;
 *  - acao "listar": devolve, a quem tem o link da família, o que os familiares já
 *    responderam, para que vejam e complementem. Os temas em TEMAS_PRIVADOS
 *    (bloco H, "Como é para você") nunca são devolvidos: só aparecem na planilha.
 *
 * Cada familiar que responde vira UMA linha na aba "Respostas".
 * Se a mesma pessoa enviar de novo (mesmo aparelho), a linha dela é atualizada.
 *
 * Instalação (uma vez):
 * 1. Na planilha: Extensões → Apps Script. Apague o conteúdo e cole este arquivo. Salve.
 * 2. Engrenagem (Configurações do projeto) → Propriedades do script →
 *    adicione a propriedade CODIGO com um código de acesso só seu.
 * 3. Implantar → Nova implantação → tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa. Implantar e autorizar.
 * 4. Copie o URL do app da Web (termina em /exec).
 *
 * Ao mudar o script depois: Implantar → Gerenciar implantações → editar (lápis)
 * → Versão: Nova versão → Implantar. Assim o URL continua o mesmo.
 *
 * Sem o código de uma família, nada é devolvido. Com ele, só as respostas daquela
 * família (sem os temas privados).
 */

var ABA_FAMILIAS = 'Famílias';
var ABA_RESPOSTAS = 'Respostas';
var CAB_FAMILIAS = ['codigo_familia', 'familia', 'criado_em'];
var TEMAS_PRIVADOS = ['H'];
var CAB_FIXO = ['id_resposta', 'codigo_familia', 'familia', 'enviado_em', 'respondente', 'relacao', 'papel', 'consentimento'];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    if (dados.acao === 'convite') return criarConvite(dados);
    if (dados.acao === 'enviar') return gravarResposta(dados);
    if (dados.acao === 'listar') return listarFamilia(dados);
    return resposta({ ok: false, erro: 'Ação desconhecida.' });
  } catch (err) {
    return resposta({ ok: false, erro: 'Erro no script: ' + err.message });
  }
}

function doGet() {
  return resposta({ ok: true, mensagem: 'Conversa Apoiada: script ativo.' });
}

function criarConvite(dados) {
  var codigo = PropertiesService.getScriptProperties().getProperty('CODIGO');
  if (!codigo) return resposta({ ok: false, erro: 'O código de acesso ainda não foi configurado no script.' });
  if (dados.codigo !== codigo) return resposta({ ok: false, erro: 'Código de acesso incorreto.' });
  var familia = String(dados.familia || '').trim();
  if (!familia) return resposta({ ok: false, erro: 'Informe um nome ou apelido para a família.' });

  var trava = LockService.getScriptLock();
  trava.waitLock(15000);
  try {
    var aba = obterAba(ABA_FAMILIAS, CAB_FAMILIAS);
    var token = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
    aba.appendRow([token, seguro(familia), new Date()]);
    return resposta({ ok: true, token: token });
  } finally {
    trava.releaseLock();
  }
}

function gravarResposta(dados) {
  if (!dados.token || !dados.id || !Array.isArray(dados.perguntas)) {
    return resposta({ ok: false, erro: 'Dados incompletos.' });
  }
  if (!dados.consentimento) return resposta({ ok: false, erro: 'É preciso concordar com o uso das respostas.' });

  var trava = LockService.getScriptLock();
  trava.waitLock(15000);
  try {
    var familia = buscarFamilia(dados.token);
    if (familia === null) return resposta({ ok: false, erro: 'Este link de convite não é válido. Peça um novo link a quem enviou.' });

    var cabecalho = CAB_FIXO.concat(dados.perguntas.map(function (p) { return p.id + ' — ' + p.texto; }));
    var aba = obterAba(ABA_RESPOSTAS, cabecalho);
    garantirCabecalho(aba, cabecalho);

    var r = dados.respondente || {};
    var respostas = dados.respostas || {};
    var linha = [
      dados.id,
      dados.token,
      familia,
      new Date(),
      r.nome || '',
      r.relacao || '',
      r.papel === 'principal' ? 'Acompanha o dia a dia' : 'Convive / complementa',
      'Sim'
    ].concat(dados.perguntas.map(function (p) { return respostas[p.id] || ''; }))
     .map(seguro);

    var numLinha = encontrarLinha(aba, dados.id);
    var atualizado = numLinha > 0;
    if (atualizado) {
      aba.getRange(numLinha, 1, 1, linha.length).setValues([linha]);
    } else {
      aba.appendRow(linha);
      numLinha = aba.getLastRow();
    }
    aba.getRange(numLinha, 1, 1, linha.length).setWrap(true).setVerticalAlignment('top');
    return resposta({ ok: true, atualizado: atualizado });
  } finally {
    trava.releaseLock();
  }
}

function listarFamilia(dados) {
  var familia = dados.token ? buscarFamilia(dados.token) : null;
  if (familia === null) return resposta({ ok: false, erro: 'Este link de convite não é válido.' });
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_RESPOSTAS);
  var lista = [];
  if (aba && aba.getLastRow() > 1) {
    var tudo = aba.getRange(1, 1, aba.getLastRow(), aba.getLastColumn()).getValues();
    var cab = tudo[0];
    for (var i = 1; i < tudo.length; i++) {
      var l = tudo[i];
      if (l[1] !== dados.token) continue;
      var respostas = {};
      for (var j = CAB_FIXO.length; j < cab.length; j++) {
        var qid = String(cab[j]).split(' — ')[0];
        if (TEMAS_PRIVADOS.indexOf(qid.charAt(0)) >= 0) continue;
        var v = l[j] === null || l[j] === undefined ? '' : String(l[j]).trim();
        if (v) respostas[qid] = v;
      }
      lista.push({
        id: l[0],
        nome: String(l[4] || ''),
        relacao: String(l[5] || ''),
        papel: String(l[6] || ''),
        enviado_em: l[3] instanceof Date ? l[3].toISOString() : String(l[3] || ''),
        respostas: respostas
      });
    }
  }
  return resposta({ ok: true, familia: familia, respostas: lista });
}

function buscarFamilia(token) {
  var aba = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA_FAMILIAS);
  if (!aba || aba.getLastRow() < 2) return null;
  var dados = aba.getRange(2, 1, aba.getLastRow() - 1, 2).getValues();
  for (var i = 0; i < dados.length; i++) {
    if (dados[i][0] === token) return dados[i][1];
  }
  return null;
}

function obterAba(nome, cabecalho) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(nome);
  if (!aba) {
    aba = planilha.insertSheet(nome);
    garantirCabecalho(aba, cabecalho);
    ['Página1', 'Sheet1', 'Entrevistas'].forEach(function (n) {
      var velha = planilha.getSheetByName(n);
      if (velha && velha.getLastRow() === 0 && planilha.getSheets().length > 1) planilha.deleteSheet(velha);
    });
  }
  return aba;
}

function garantirCabecalho(aba, cabecalho) {
  var atual = aba.getLastRow() > 0
    ? aba.getRange(1, 1, 1, Math.max(aba.getLastColumn(), 1)).getValues()[0]
    : [];
  if (atual.slice(0, cabecalho.length).join('\u0001') === cabecalho.join('\u0001')) return;
  aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho])
    .setFontWeight('bold').setWrap(true).setVerticalAlignment('top');
  aba.setFrozenRows(1);
  if (cabecalho.length > CAB_FIXO.length) {
    aba.setFrozenColumns(5);
    aba.setColumnWidths(CAB_FIXO.length + 1, cabecalho.length - CAB_FIXO.length, 280);
  }
}

function encontrarLinha(aba, id) {
  var ultima = aba.getLastRow();
  if (ultima < 2) return -1;
  var ids = aba.getRange(2, 1, ultima - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) return i + 2;
  }
  return -1;
}

// Evita que um texto começado por =, +, - ou @ seja lido como fórmula.
function seguro(valor) {
  if (typeof valor === 'string' && /^[=+\-@]/.test(valor)) return "'" + valor;
  return valor;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
