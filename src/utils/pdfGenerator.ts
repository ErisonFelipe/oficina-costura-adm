import puppeteer, { type Browser } from 'puppeteer';

// ===== CONFIGURAÇÕES =====
const PDF_TIMEOUT_MS = 30_000; // 30 segundos por geração
const MAX_CONCURRENT_PDFS = 1; // apenas 1 PDF gerado por vez

// ===== SINGLETON DO BROWSER =====
// Reutiliza o mesmo Chromium entre requisições (economiza ~500ms por PDF)
let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  // Se já existe uma instância conectada, reutiliza
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  // Se está sendo inicializando, aguarda a mesma promise
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  // Cria nova instância
  browserLaunchPromise = puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=IsolateOrigins,site-per-process',
      '--font-render-hinting=none',
      '--js-flags=--max-old-space-size=256',
    ],
    protocolTimeout: PDF_TIMEOUT_MS,
  }).then((browser) => {
    browserInstance = browser;
    browserLaunchPromise = null;

    // Reconectar se o Chromium cair sozinho
    browser.on('disconnected', () => {
      console.warn('⚠️ Chromium desconectado — será reiniciado na próxima geração');
      browserInstance = null;
    });

    return browser;
  });

  return browserLaunchPromise;
}

// ===== MUTEX (FILA DE CONCORRÊNCIA) =====
// Garante que apenas N PDFs são gerados ao mesmo tempo
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }
    return new Promise((resolve) => {
      this.queue.push(() => {
        this.permits--;
        resolve();
      });
    });
  }

  release(): void {
    this.permits++;
    const next = this.queue.shift();
    if (next) next();
  }
}

const pdfSemaphore = new Semaphore(MAX_CONCURRENT_PDFS);

// ===== GERADOR DE PDF =====
export async function htmlToPDF(html: string): Promise<Buffer> {
  // Aguarda a vez na fila
  await pdfSemaphore.acquire();

  const startTime = Date.now();
  let page = null;

  try {
    const browser = await getBrowser();

    page = await browser.newPage();

    // Otimizações: bloquear recursos desnecessários
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // Bloqueia imagens, fontes e mídia externos (não usamos no template)
      if (['media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // Limita recursos
    await page.setViewport({ width: 1280, height: 720 });

    // Timeout por geração (se demorar mais que X, cancela)
    page.setDefaultTimeout(PDF_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(PDF_TIMEOUT_MS);

    // Carrega o HTML com timeout
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: PDF_TIMEOUT_MS,
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

    const elapsed = Date.now() - startTime;
    console.log(`📄 PDF gerado em ${elapsed}ms (${pdfUint8Array.length} bytes)`);

    return Buffer.from(pdfUint8Array);
  } catch (err) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Erro ao gerar PDF após ${elapsed}ms:`, err);
    throw err;
  } finally {
    // SEMPRE fecha a página (mesmo em erro)
    if (page) {
      try {
        await page.close();
      } catch {
        // página já fechada ou browser caiu — ignora
      }
    }
    // Libera a vaga no semáforo
    pdfSemaphore.release();
  }
}

// ===== CLEANUP =====
// Fecha o Chromium ao desligar o servidor (graceful shutdown)
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    console.log('🔒 Fechando Chromium...');
    try {
      await browserInstance.close();
    } catch (err) {
      console.error('Erro ao fechar Chromium:', err);
    }
    browserInstance = null;
  }
}