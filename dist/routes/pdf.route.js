"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdf_service_1 = require("../services/pdf.service");
const router = (0, express_1.Router)();
router.post('/gerar/:setor/:layout', async (req, res) => {
    const { setor, layout } = req.params;
    const dados = req.body;
    try {
        const pdfBuffer = await (0, pdf_service_1.gerarPdfHandlebars)({ setor, layout, dados });
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${dados.solicitacao.osNumber}.pdf"`,
        });
        res.send(pdfBuffer);
    }
    catch (error) {
        res.status(500).json({ erro: 'Erro ao gerar PDF', detalhes: error.message });
    }
});
exports.default = router;
