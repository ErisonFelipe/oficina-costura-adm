import puppeteer from 'puppeteer';

/**
 * Converte HTML em PDF usando Puppeteer (Chrome headless).
 * Otimizado para gerar PDFs A4 com margens adequadas.
 */
export async function htmlToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();

    // Carrega o HTML (usa 'load' por compatibilidade com Puppeteer 25)
    await page.setContent(html, {
      waitUntil: 'load',
    });

    // Gera o PDF
    const pdfUint8Array = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
      preferCSSPageSize: false,
    });

    // Puppeteer 25 retorna Uint8Array; converte para Buffer
    return Buffer.from(pdfUint8Array);
  } finally {
    await browser.close();
  }
}
