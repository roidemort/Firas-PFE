// test-certificate-standalone.ts
import puppeteer from 'pug';
import fs from 'fs';
import path from 'path';

// Mock the database functions (we'll simulate the data)
const mockData = {
  user: {
    id: '397feec4-c73c-41d7-9daa-cfe4875f7e0c',
    firstName: 'semer',
    lastName: 'bg',
    email: 'test@example.com'
  },
  course: {
    id: 'd8577a6f-4a47-4a82-b432-aa13be840797',
    title: 'Ureal',
    certificate: {
      id: '1f1c20d9-28ec-4387-af2b-718af5b846f9',
      name: 'Galio Certif test',
      title: '{{student_name}}',
      sub_title: '{{course_name}}',
      description: '{{date}}',
      background: {
        secure_url: 'https://res.cloudinary.com/db18xtaer/image/upload/v1766400018/pharmacy/images/vuhvvjptm2rphkhcfmql.jpg',
        width: 845,
        height: 597
      },
      signature: {
        secure_url: 'https://via.placeholder.com/200x80/2c3e50/ffffff?text=Signature'
      },
      positionTitle: '{"x": 275, "y": 92}',
      positionSubTitle: '{"x": 116, "y": 273}',
      positionDescription: '{"x": -43, "y": 516}',
      positionSignature: '{"x": 309, "y": 0}'
    }
  },
  enrollment: {
    endedAt: new Date()
  }
};

// Replace placeholders function
const replacePlaceholders = (template: string, params: { [key: string]: string }): string => {
  if (!template) return '';
  let result = template;
  result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    return params[key.trim()] || match;
  });
  return result;
};

// Generate PDF function (simplified)
const generatePDFfromHTML = async (htmlContent: string, outputPath: string): Promise<void> => {
  const puppeteer = require('puppeteer');
  let browser: any = null;
  
  try {
    console.log('🖨️  Generating PDF...');
    
    // For Windows
    const launchOptions: any = {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    };
    
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.setViewport({ 
      width: 1920, 
      height: 1080, 
      deviceScaleFactor: 2 
    });
    
    await page.setContent(htmlContent, { waitUntil: 'load' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm', 
        bottom: '10mm',
        left: '10mm'
      },
      scale: 0.9
    });
    
    console.log('✅ PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

// Main test function
async function testCertificateGeneration() {
  console.log('🧪 STARTING CERTIFICATE TEST 🧪');
  console.log('='.repeat(50));
  
  try {
    // 1. Prepare data
    const params = {
      student_name: mockData.user.firstName + ' ' + mockData.user.lastName,
      course_name: mockData.course.title,
      date: '2025-12-22'
    };
    
    console.log('📊 Template Parameters:', params);
    
    // 2. Replace placeholders
    const description = replacePlaceholders(mockData.course.certificate.description, params);
    const title = replacePlaceholders(mockData.course.certificate.title, params);
    const subTitle = replacePlaceholders(mockData.course.certificate.sub_title, params);
    
    console.log('📝 Generated Text:');
    console.log('   Title:', title);
    console.log('   Subtitle:', subTitle);
    console.log('   Description:', description);
    
    // 3. Parse position data
    const parsePosition = (pos: string) => {
      try {
        return JSON.parse(pos);
      } catch {
        return { x: 100, y: 100 };
      }
    };
    
    const titlePos = parsePosition(mockData.course.certificate.positionTitle);
    const subTitlePos = parsePosition(mockData.course.certificate.positionSubTitle);
    const descriptionPos = parsePosition(mockData.course.certificate.positionDescription);
    const signaturePos = parsePosition(mockData.course.certificate.positionSignature);
    
    console.log('📍 Positions:');
    console.log('   Title:', titlePos);
    console.log('   Subtitle:', subTitlePos);
    console.log('   Description:', descriptionPos);
    console.log('   Signature:', signaturePos);
    
    // 4. Create HTML using Pug template
    const templateContent = `
doctype html
html
  head
    style.
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; }
      
      /* Certificate container - full page */
      .certificate {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
      }
      
      /* Background image - full coverage */
      .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        z-index: 0;
      }
      
      /* Text elements */
      .title {
        position: absolute;
        left: ${titlePos.x}px;
        top: ${titlePos.y}px;
        color: #000;
        font-size: 42px;
        font-weight: bold;
        z-index: 1;
        text-shadow: 2px 2px 4px rgba(255,255,255,0.7);
        max-width: 80%;
        text-align: center;
      }
      
      .subtitle {
        position: absolute;
        left: ${subTitlePos.x}px;
        top: ${subTitlePos.y}px;
        color: #000;
        font-size: 28px;
        font-weight: bold;
        z-index: 1;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.7);
        max-width: 80%;
        text-align: center;
      }
      
      .description {
        position: absolute;
        left: ${descriptionPos.x}px;
        top: ${descriptionPos.y}px;
        color: #000;
        font-size: 20px;
        z-index: 1;
        text-shadow: 1px 1px 2px rgba(255,255,255,0.7);
        max-width: 80%;
        text-align: center;
      }
      
      .signature {
        position: absolute;
        left: ${signaturePos.x}px;
        top: ${signaturePos.y}px;
        height: 80px;
        width: 200px;
        z-index: 1;
        object-fit: contain;
      }
      
      /* Print styles */
      @media print {
        .certificate {
          width: 297mm;
          height: 210mm;
        }
      }
  body
    .certificate
      img.background(src="${mockData.course.certificate.background.secure_url}")
      .title ${title}
      .subtitle ${subTitle}
      .description ${description}
      img.signature(src="${mockData.course.certificate.signature.secure_url}")
    `;
    
    // Write HTML to file for inspection
    const htmlPath = path.join(__dirname, 'test-certificate.html');
    fs.writeFileSync(htmlPath, templateContent);
    console.log('📄 HTML saved to:', htmlPath);
    
    // 5. Generate PDF
    const pdfPath = path.join(__dirname, 'test-certificate-output.pdf');
    console.log('📁 PDF will be saved to:', pdfPath);
    
    await generatePDFfromHTML(templateContent, pdfPath);
    
    // 6. Verify
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log('✅ TEST COMPLETED SUCCESSFULLY!');
      console.log('📊 PDF file size:', stats.size, 'bytes');
      console.log('🔗 Open HTML in browser: file://' + htmlPath);
      console.log('🔗 Open PDF: file://' + pdfPath);
      
      // Check if PDF is valid
      if (stats.size < 5000) {
        console.log('⚠️  Warning: PDF file is very small, might be empty');
      }
    } else {
      console.log('❌ PDF file was not created');
    }
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    console.error(error.stack);
  }
  
  console.log('='.repeat(50));
  console.log('🧪 TEST COMPLETE 🧪');
}

// Run the test
testCertificateGeneration();