import express from 'express';
import pdfRoutes from './routes/pdf.route';

const app = express();
app.use(express.json());

app.use('/pdf', pdfRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`PDF Service running on port ${PORT}`);
});
