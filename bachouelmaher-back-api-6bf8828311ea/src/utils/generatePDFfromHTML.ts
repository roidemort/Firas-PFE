import puppeteer from "puppeteer";

interface PDFOptions {
  format?: 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'Tabloid';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  scale?: number;
}

export const generatePDFfromHTML = async (
  htmlContent: string,
  outputPath: string,
  options: PDFOptions = {}
): Promise<void> => {
  let browser;
  try {
    // Production-ready browser configuration
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-accelerated-2d-canvas',
        '--disable-software-rasterizer'
      ],
      timeout: 30000 // 30 seconds
    });

    const page = await browser.newPage();

    // Configure page settings
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    // Set content with proper waiting
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Default PDF options
    const pdfSettings = {
      path: outputPath,
      format: options.format || 'A4',
      landscape: options.landscape || true,
      printBackground: options.printBackground || true,
      margin: options.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      scale: options.scale || 1.0
    };

    await page.pdf(pdfSettings);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
};