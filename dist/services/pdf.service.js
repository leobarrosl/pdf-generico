"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarPdfHandlebars = gerarPdfHandlebars;
const puppeteer_1 = __importDefault(require("puppeteer"));
const promises_1 = require("fs/promises");
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
handlebars_1.default.registerHelper('eq', function (a, b) {
    return a === b;
});
handlebars_1.default.registerHelper('formatarData', function (data) {
    return (0, date_fns_1.format)(new Date(data), 'dd/MM/yyyy', { locale: locale_1.ptBR });
});
async function gerarPdfHandlebars({ setor, layout, dados }) {
    const templatePath = path_1.default.resolve(__dirname, `../templates/${setor}`, `${layout}.hbs`);
    const templateFile = await (0, promises_1.readFile)(templatePath, 'utf-8');
    const template = handlebars_1.default.compile(templateFile);
    const html = template({ ...dados, setor });
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(pdf);
}
