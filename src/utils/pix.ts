import QRCode from 'qrcode';

// ===== CONFIGURAÇÕES DA EMPRESA =====
export const PIX_CONFIG = {
  // Chave PIX no formato E.164 (telefone brasileiro)
  chave: '+5511984492079',
  // Exibido no PDF
  chaveFormatada: '11 98449-2079',
  cnpj: '62.461.200/0001-07',
  nomeFantasia: 'Lunexx',
};

/**
 * Gera o QR Code do PIX como string SVG.
 * Ideal para embutir direto no HTML (não requer requisição HTTP).
 *
 * @param size - Tamanho em pixels (padrão: 120)
 * @returns String SVG pronta para inserir no HTML
 */
export async function gerarQRCodePix(size: number = 120): Promise<string> {
  return QRCode.toString(PIX_CONFIG.chave, {
    type: 'svg',
    width: size,
    margin: 1,
    color: {
      dark: '#2C2825',   // cor do QR Code
      light: '#FFFFFF',  // cor de fundo
    },
    errorCorrectionLevel: 'M', // nível de correção (M = médio, bom para impressão)
  });
}

/**
 * Gera o QR Code do PIX como Data URL (base64).
 * Alternativa ao SVG — útil se o cliente do PDF preferir imagem.
 */
export async function gerarQRCodePixDataURL(size: number = 120): Promise<string> {
  return QRCode.toDataURL(PIX_CONFIG.chave, {
    width: size,
    margin: 1,
    color: {
      dark: '#2C2825',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });
}

/**
 * Formata o CNPJ para exibição: 62.461.200/0001-07
 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return cnpj;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
