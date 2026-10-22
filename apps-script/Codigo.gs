/**
 * Conversa Apoiada — recebe as respostas do roteiro (roteiro.html)
 * e grava na aba "Entrevistas" desta planilha.
 *
 * Instalação (uma vez):
 * 1. Na planilha: Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 * 2. Engrenagem (Configurações do projeto) → Propriedades do script →
 *    adicione a propriedade CODIGO com um código de acesso só seu.
 * 3. Implantar → Nova implantação → tipo "App da Web".
 *    Executar como: Eu. Quem pode acessar: Qualquer pessoa. Implantar e autorizar.
 * 4. Copie o URL do app da Web (termina em /exec) e cole na página do roteiro,
 *    junto com o código de acesso.
 *
 * O script só ACRESCENTA ou ATUALIZA entrevistas. Ele nunca devolve dados
 * da planilha, então quem tiver o URL não consegue ler as respostas.
 */

var NOME_ABA = 'Entrevistas';
var COLUNAS_FIXAS = ['id', 'enviado_em', 'familia', 'quem_respondeu', 'data_conversa'];

function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);

    var codigo = PropertiesService.getScriptProperties().getProperty('CODIGO');
    if (!codigo) return resposta({ ok: false, erro: 'O código de acesso ainda não foi configurado no script.' });
    if (dados.codigo !== codigo) return resposta({ ok: false, erro: 'Código de acesso incorreto.' });
    if (!dados.id || !Array.isArray(dados.perguntas)) return resposta({ ok: false, erro: 'Dados incompletos.' });

    var trava = LockService.getScriptLock();
    trava.waitLock(15000);
    try {
      var aba = obterAba();
      var cabecalho = COLUNAS_FIXAS.concat(dados.perguntas.map(function (p, i) {
        return (i + 1) + '. ' + p.texto;
      }));
      garantirCabecalho(aba, cabecalho);

      var meta = dados.meta || {};
      var respostas = dados.respostas || {};
      var linha = [
        dados.id,
        new Date(),
        meta.nome || '',
        meta.quem || '',
        meta.data || ''
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
  } catch (err) {
    return resposta({ ok: false, erro: 'Erro no script: ' + err.message });
  }
}

function doGet() {
  return resposta({ ok: true, mensagem: 'Conversa Apoiada: script ativo.' });
}

function obterAba() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(NOME_ABA);
  if (!aba) {
    aba = planilha.insertSheet(NOME_ABA, 0);
    var padrao = planilha.getSheetByName('Página1') || planilha.getSheetByName('Sheet1');
    if (padrao && padrao.getLastRow() === 0 && planilha.getSheets().length > 1) planilha.deleteSheet(padrao);
  }
  return aba;
}

function garantirCabecalho(aba, cabecalho) {
  var atual = aba.getLastRow() > 0
    ? aba.getRange(1, 1, 1, Math.max(aba.getLastColumn(), 1)).getValues()[0]
    : [];
  if (atual.join('\u0001') === cabecalho.join('\u0001')) return;
  aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho])
    .setFontWeight('bold').setWrap(true).setVerticalAlignment('top');
  aba.setFrozenRows(1);
  aba.setFrozenColumns(3);
  aba.setColumnWidths(COLUNAS_FIXAS.length + 1, cabecalho.length - COLUNAS_FIXAS.length, 280);
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
