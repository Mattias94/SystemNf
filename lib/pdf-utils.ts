export async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import para evitar imports no servidor
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction is only available on the client side');
  }

  const pdfjsLib = await import('pdfjs-dist');

  // Configurar o worker do PDF.js usando arquivo local
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    type PdfTextItem = { str?: string };
    const pageText = textContent.items
      .map((item: unknown) => {
        const maybe = item as PdfTextItem;
        return maybe && typeof maybe.str === 'string' ? maybe.str : '';
      })
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

export function extractNotaInfo(text: string) {
  // Extrair informações da nota fiscal do texto
  const numeroNotaMatch = text.match(/(?:NF|Nota(?:\s+Fiscal)?)[:\s]+(\d+)/i);
  const cnpjMatch = text.match(/CNPJ[:\s]+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i);
  const valorMatch = text.match(/(?:Total|Valor(?:\s+Total)?)[:\s]*R?\$?\s*([\d.,]+)/i);
  const dataMatch = text.match(
    /(?:Data|Emissão)[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i
  );
  const placaMatch = text.match(
    /(?:Veículo|Placa|Carro)[:\s]*([A-Z]{3}[-\s]?\d{4}[A-Z]{2}|[A-Z0-9-]{8})/i
  );

  return {
    numeroNota: numeroNotaMatch ? numeroNotaMatch[1] : '',
    cnpjFornecedor: cnpjMatch ? cnpjMatch[1] : '',
    placa: placaMatch ? placaMatch[1].toUpperCase() : '',
    valorNota: valorMatch
      ? parseFloat(valorMatch[1].replace('.', '').replace(',', '.'))
      : 0,
    dataEmissao: dataMatch
      ? `${dataMatch[1].padStart(2, '0')}/${dataMatch[2].padStart(2, '0')}/${dataMatch[3]}`
      : '',
  };
}
