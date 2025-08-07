import puppeteer from 'puppeteer';
import { readFile } from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DadosPdf {
  setor: string;
  layout: string;
  dados: Record<string, any>;
}

handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

handlebars.registerHelper('formatarData', function (data: string) {
  return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
});

export async function gerarPdfHandlebars({ setor, layout, dados }: DadosPdf): Promise<Buffer> {
  const templatePath = path.resolve(__dirname, `../templates/${setor}`, `${layout}.hbs`);

  const templateFile = await readFile(templatePath, 'utf-8');
  const template = handlebars.compile(templateFile);

  dados.anexos.forEach((anexo: any) => {
    anexo.nomeArquivo = anexo.nomeArquivo.startsWith('http')
      ? anexo.nomeArquivo
      : `https://eelsoftwares.tech/tridigito/files/imagem/${anexo.nomeArquivo}`;
  });
  const html = template({ ...dados, setor });

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ],
    headless: true
  });

  try {
    const page = await browser.newPage();
    
    // Configuração de ignorar erros HTTPS movida para a página
    await page.setDefaultNavigationTimeout(60000);
    await page.setJavaScriptEnabled(true);
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0'
    });

    const pdf = await page.pdf({ 
      format: 'A4'
    });

    return Buffer.from(pdf);
  } catch (error) {
    console.error('Erro durante a geração do PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (browser && browser.process() != null) {
      await browser.close().catch(e => console.error('Erro ao fechar o browser:', e));
    }
  }
}