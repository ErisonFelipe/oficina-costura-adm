import type { Romaneio } from '@prisma/client';

/**
 * Formata número no padrão brasileiro (1.336,00)
 */
function formatNumberBR(valor: number, decimais = 0): string {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });
}

/**
 * Formata valor em Real (R$ 668,00)
 */
function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata data no padrão brasileiro (23/09/2026)
 */
function formatDateBR(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

interface GradeItem {
  cor: string;
  tamanho?: string;
  quantidade: number;
}

interface Cobranca {
  valorUnitario: number;
  valorTotal: number;
  observacao?: string;
}

/**
 * Gera o HTML do romaneio com base nos dados do banco.
 * Esse HTML será transformado em PDF pelo Puppeteer.
 */
export function renderRomaneioHTML(romaneio: Romaneio): string {
  const grade = romaneio.grade as unknown as GradeItem[];
  const cobranca = romaneio.cobranca as unknown as Cobranca;

  const linhasGrade = grade
    .map(
      (item) => `
      <tr>
        <td class="cell">${item.cor}</td>
        <td class="cell">${item.tamanho || '—'}</td>
        <td class="cell cell-right">${formatNumberBR(item.quantidade)}</td>
      </tr>
    `
    )
    .join('');

  const totalGrade = grade.reduce((acc, item) => acc + item.quantidade, 0);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #2C2825;
      background: #fff;
      padding: 40px;
      font-size: 12px;
      line-height: 1.5;
    }

    /* ===== CABEÇALHO ===== */
    .header {
      text-align: center;
      border-bottom: 3px solid #C67B5C;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #C67B5C;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .header .subtitulo {
      font-size: 11px;
      color: #8A837D;
      letter-spacing: 2px;
      margin-top: 4px;
      text-transform: uppercase;
    }

    /* ===== NÚMERO DO ROMANEIO ===== */
    .numero {
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      color: #C67B5C;
      margin-bottom: 12px;
    }

    /* ===== SEÇÕES ===== */
    .section {
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #C67B5C;
      border-bottom: 1px solid #E8D5CB;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }

    /* ===== INFO DO CLIENTE ===== */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 24px;
    }

    .info-item {
      display: flex;
      gap: 6px;
    }

    .info-item .label {
      font-weight: 600;
      color: #6B6560;
      min-width: 80px;
    }

    .info-item .value {
      color: #2C2825;
    }

    /* ===== TABELAS ===== */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }

    .cell, th {
      padding: 6px 10px;
      border: 1px solid #E8E0D8;
      text-align: left;
      font-size: 11px;
    }

    th {
      background: #FDF8F5;
      font-weight: 700;
      color: #6B6560;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 10px;
    }

    .cell-right {
      text-align: right;
    }

    .row-total {
      background: #FDF8F5;
      font-weight: 700;
    }

    .row-total .cell {
      color: #2C2825;
    }

    /* ===== CONFERÊNCIA ===== */
    .conferencia-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 8px;
    }

    .conferencia-item {
      font-size: 11px;
    }

    .conferencia-item .label {
      font-weight: 600;
      color: #6B6560;
      display: block;
      margin-bottom: 4px;
    }

    /* ===== ASSINATURAS ===== */
    .assinaturas {
      margin-top: 48px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .assinatura {
      text-align: center;
    }

    .assinatura .linha {
      border-top: 1px solid #2C2825;
      margin-bottom: 6px;
    }

    .assinatura .nome {
      font-size: 10px;
      color: #6B6560;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* ===== OBSERVAÇÕES ===== */
    .observacoes {
      background: #FDF8F5;
      border-left: 3px solid #C67B5C;
      padding: 10px 14px;
      font-size: 11px;
      color: #2C2825;
      margin-top: 8px;
    }

    /* ===== RODAPÉ ===== */
    .footer {
      margin-top: 32px;
      padding-top: 10px;
      border-top: 1px solid #E8E0D8;
      text-align: center;
      font-size: 9px;
      color: #8A837D;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>

  <!-- CABEÇALHO -->
  <div class="header">
    <h1>Lunnexx</h1>
    <div class="subtitulo">Romaneio de Corte</div>
  </div>

  <!-- NÚMERO -->
  <div class="numero">Nº ${romaneio.numero}</div>

  <!-- INFO DO CLIENTE -->
  <div class="section">
    <div class="section-title">Informações Gerais</div>
    <div class="info-grid">
      <div class="info-item">
        <span class="label">Cliente:</span>
        <span class="value">${romaneio.cliente}</span>
      </div>
      <div class="info-item">
        <span class="label">Data:</span>
        <span class="value">${formatDateBR(romaneio.data)}</span>
      </div>
      <div class="info-item">
        <span class="label">Produto:</span>
        <span class="value">${romaneio.produto}</span>
      </div>
      ${romaneio.referencia ? `
      <div class="info-item">
        <span class="label">Referência:</span>
        <span class="value">${romaneio.referencia}</span>
      </div>
      ` : ''}
      ${romaneio.tipoTecido ? `
      <div class="info-item">
        <span class="label">Tecido:</span>
        <span class="value">${romaneio.tipoTecido}</span>
      </div>
      ` : ''}
    </div>
  </div>

  <!-- INFO DO CORTE -->
  <div class="section">
    <div class="section-title">Informações do Corte</div>
    <table>
      <tr>
        <th>Rolos</th>
        <th>Folhas</th>
        <th>Encaixados</th>
        <th>Peças</th>
        <th>Volumes</th>
      </tr>
      <tr>
        <td class="cell cell-right">${romaneio.quantidadeRolos ?? '—'}</td>
        <td class="cell cell-right">${romaneio.quantidadeFolhas ?? '—'}</td>
        <td class="cell cell-right">${romaneio.quantidadeEncaixados ?? '—'}</td>
        <td class="cell cell-right"><strong>${formatNumberBR(romaneio.quantidadePecas)}</strong></td>
        <td class="cell cell-right">${romaneio.quantidadeVolumes ?? '—'}</td>
      </tr>
    </table>
  </div>

  <!-- GRADE / DISTRIBUIÇÃO -->
  <div class="section">
    <div class="section-title">Grade / Distribuição</div>
    <table>
      <thead>
        <tr>
          <th>Cor</th>
          <th>Tamanho</th>
          <th style="text-align: right;">Quantidade</th>
        </tr>
      </thead>
      <tbody>
        ${linhasGrade}
        <tr class="row-total">
          <td class="cell" colspan="2">Total de peças</td>
          <td class="cell cell-right">${formatNumberBR(totalGrade)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- COBRANÇA -->
  <div class="section">
    <div class="section-title">Cobrança</div>
    <table>
      <thead>
        <tr>
          <th>Descrição</th>
          <th style="text-align: right;">Qtd</th>
          <th style="text-align: right;">Valor Unit.</th>
          <th style="text-align: right;">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="cell">Peças principais</td>
          <td class="cell cell-right">${formatNumberBR(romaneio.quantidadePecas)}</td>
          <td class="cell cell-right">${formatBRL(cobranca.valorUnitario)}</td>
          <td class="cell cell-right">${formatBRL(cobranca.valorTotal)}</td>
        </tr>
        <tr class="row-total">
          <td class="cell" colspan="3">TOTAL GERAL</td>
          <td class="cell cell-right">${formatBRL(cobranca.valorTotal)}</td>
        </tr>
      </tbody>
    </table>
    ${cobranca.observacao ? `
      <div class="observacoes">${cobranca.observacao}</div>
    ` : ''}
  </div>

  <!-- CONFERÊNCIA -->
  <div class="section">
    <div class="section-title">Conferência</div>
    <div class="conferencia-grid">
      <div class="conferencia-item">
        <span class="label">Cortador responsável:</span>
        <span>${romaneio.cortadorResponsavel || '—'}</span>
      </div>
      <div class="conferencia-item">
        <span class="label">Conferido por:</span>
        <span>${romaneio.conferidoPor || '—'}</span>
      </div>
    </div>
  </div>

  <!-- OBSERVAÇÕES -->
  ${romaneio.observacoes ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <div class="observacoes">${romaneio.observacoes}</div>
  </div>
  ` : ''}

  <!-- ASSINATURAS -->
  <div class="assinaturas">
    <div class="assinatura">
      <div class="linha"></div>
      <div class="nome">Assinatura do conferente</div>
    </div>
    <div class="assinatura">
      <div class="linha"></div>
      <div class="nome">Assinatura do cortador</div>
    </div>
  </div>

  <!-- RODAPÉ -->
  <div class="footer">
    Lunnexx — Romaneio gerado em ${formatDateBR(new Date())}
  </div>

</body>
</html>
  `.trim();
}
