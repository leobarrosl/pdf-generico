import { Router, Request, Response } from 'express';
import { gerarPdfHandlebars } from '../services/pdf.service';

const router = Router();

router.post('/gerar/:setor/:layout', async (req: Request, res: Response) => {
  const { setor, layout } = req.params;
  const dados = req.body;

  try {
    const pdfBuffer = await gerarPdfHandlebars({ setor, layout, dados });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${dados.solicitacao.osNumber}.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar PDF', detalhes: (error as any).message });
  }
});

export default router;
