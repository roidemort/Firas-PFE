// utils/generatePDFfromHTML.ts - COMPATIBLE VERSION
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
    // DETECT ENVIRONMENT
    const isProduction = process.env.NODE_ENV === 'production';
    const isWindows = process.platform === 'win32';
    const isLinux = process.platform === 'linux';
    
    let launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      timeout: 30000
    };

    // SET EXECUTABLE PATH BASED ON ENVIRONMENT
    if (isProduction && isLinux) {
      // Production Linux (your OVH server)
      launchOptions.executablePath = '/usr/bin/chromium-browser';
      launchOptions.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-accelerated-2d-canvas',
        '--disable-software-rasterizer'
      ];
    } else if (isWindows) {
      // Windows local development
      // Try to find Chrome automatically
      const chromePaths = [
        'C:\\Users\\ASUS\\.cache\\puppeteer\\chrome\\win64-143.0.7499.169\\chrome-win64\\chrome.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      ];
      
      const fs = require('fs');
      for (const path of chromePaths) {
        if (fs.existsSync(path)) {
          launchOptions.executablePath = path;
          break;
        }
      }
      
      // Remove Linux-specific args for Windows
      launchOptions.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Configure page settings - LARGER for certificates
    await page.setViewport({ 
      width: 1920, 
      height: 1080, 
      deviceScaleFactor: 2 // Higher DPI for better quality
    });

    // Set content with proper waiting
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for resources (compatible with all Puppeteer versions)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // PDF options with 10mm margins as requested
    const pdfSettings = {
      path: outputPath,
      format: options.format || 'A4',
      landscape: options.landscape || true,
      printBackground: options.printBackground || true,
      margin: options.margin || {
        top: '10mm',    // 10mm margin as requested
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      scale: options.scale || 0.9 // Slightly scale down to fit background
    };

    await page.pdf(pdfSettings);

  } catch (error) {
    console.error('PDF Generation Error:', error);
    
    // Create a simple fallback PDF for local development
    if (process.env.NODE_ENV !== 'production') {
      const fs = require('fs');
      const path = require('path');
      const dir = path.dirname(outputPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const fallbackPDF = `%PDF-1.4
1 0 obj <</Type/Catalog/Pages 2 0 R>> endobj
2 0 obj <</Type/Pages/Kids[3 0 R]/Count 1>> endobj
3 0 obj <</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>> endobj
trailer <</Root 1 0 R>>
%%EOF`;
      
      fs.writeFileSync(outputPath, fallbackPDF);
      console.log('Created fallback PDF for local development');
    }
    
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