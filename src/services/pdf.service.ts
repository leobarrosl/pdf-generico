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

  const html = template({ ...dados, setor });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return Buffer.from(pdf);
}
