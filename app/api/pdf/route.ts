import { NextRequest, NextResponse } from 'next/server';
import { NoteUploadResponse } from '@/types/notes';

function extractNotaInfo(text: string) {
  let numeroNota = '';
  const numeroPatterns = [
    /(?:NUMERO\s+DA\s+(?:NF|NF[\s\-]?E|NOTA))[\s\-:]*[\#]?(\d{1,10})/i,
    /(?:N[\s\-]?(?:DA\s+)?(?:NF|NF[\s\-]?E|NOTA))[\s\-:]*[\#]?(\d{1,10})/i,
    /(?:^|\s)NF[\s\-]?E?[\s\-:]*(\d{1,10})/i,
    /(?:NOTA\s+FISCAL|NOTA)[\s\-:]*[\#]?(\d{1,10})/i,
    /NF[EeÉé]?\s*:?\s*(\d{1,10})/i,
    /(?:Número|numero|NUMERO)[\s\-:]?(?:da\s+)?(?:NF[Ee]?)?[\s\-:]?(\d{1,10})/i,
    /(?:NOTA\s+DE\s+(?:PEÇA|SERVICO|SERVIÇO))[\s\-:]*[\#]?(\d{1,10})/i,
    /(?:NOTA\s+DE\s+(?:PEÇA|SERVICO|SERVIÇO))[\s\-:]*(?:Nº|N°|N)[\s\-:]*(\d{1,10})/i,
  ];
  for (const pattern of numeroPatterns) {
    const match = text.match(pattern);
    if (match) {
      numeroNota = match[1].trim();
      if (numeroNota.length > 0) break;
    }
  }

  let tipoNota = '';
  if (text.match(/(?:NOTA\s+DE\s+)?SERVICO|SERVIÇO|NFSe|NFS[\s\-]?E/i)) {
    tipoNota = 'NFSe';
  } else if (text.match(/(?:NOTA\s+DE\s+)?PEÇA|NFe|NF[\s\-]?E/i)) {
    tipoNota = 'NFe';
  }

  let cnpj = '';
  const cnpjPatterns = [
    /(?:CNPJ\s+(?:DO\s+)?(?:FORNECEDOR|REMETENTE|EMITENTE))[\s\-:]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i,
    /(?:CNPJ\s+FORNECEDOR|CNPJ\s+REMETENTE)[\s\-:]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i,
    /(?:CNPJ)[\s\-:]+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i,
    /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/,
  ];
  for (const pattern of cnpjPatterns) {
    const match = text.match(pattern);
    if (match) {
      cnpj = match[1];
      if (cnpj.length === 14 && !cnpj.includes('.')) {
        cnpj = `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12)}`;
      }
      break;
    }
  }

  let nomeFornecedor = '';
  const nomeFornecedorPatterns = [
    /(?:NOME\s+(?:DO\s+)?(?:FORNECEDOR|REMETENTE|EMITENTE))[\s\-:]*([^\n,]+)/i,
    /(?:FORNECEDOR|REMETENTE|EMITENTE)[\s\-:]*([^\n,]+?)(?:\s+CNPJ|\s+CPF|\s+\d{2}\.\d{3}|$)/i,
    /RAZÃO\s+SOCIAL[\s\-:]*([^\n,]+)/i,
  ];
  for (const pattern of nomeFornecedorPatterns) {
    const match = text.match(pattern);
    if (match) {
      nomeFornecedor = match[1].trim();
      if (nomeFornecedor.length > 3 && nomeFornecedor.length < 200) break;
    }
  }

  let valorNota = 0;
  const valorPatterns = [
    // Padrões específicos para NFSe (Nota Fiscal de Serviço)
    /(?:VALOR\s+(?:DO\s+)?SERVI[ÇC]O|VALOR\s+L[IÍ]QUIDO\s+(?:DO\s+)?SERVI[ÇC]O)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:VALOR\s+L[IÍ]QUIDO\s+(?:DA\s+)?NFS[\s\-]?E|VALOR\s+DA\s+NFS[\s\-]?E)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:VALOR\s+(?:DO\s+)?RPS|VALOR\s+RECIBO)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    // Padrões específicos para NFe (Nota Fiscal Eletrônica)
    /(?:VALOR\s+L[IÍ]QUIDO\s+DA\s+NF[Ee]?)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:VALOR\s+L[IÍ]QUIDO)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:L[IÍ]QUIDO\s+NF[Ee]?)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    // Padrões genéricos
    /(?:VALOR\s+(?:TOTAL|DA\s+(?:NOTA|NF|FATURA|SERVI[ÇC]O)))[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:TOTAL\s+(?:GERAL|DA\s+(?:NOTA|NF|NFE|SERVI[ÇC]O))?)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /(?:TOTAL)[\s\-:]*R?\$?\s*([\d.,]+)(?!\s+\d{4})/i,
    /(?:Valor|VALOR)[\s\-:]*R?\$?\s*([\d.,]+)/i,
    /R?\$?\s*([\d.,]+)(?:\s+(?:TOTAL|total))/i,
    /VALOR\s*[:=]?\s*R?\$?\s*([\d.,]+)/i,
    /(?:total|TOTAL)[\s:]*R?\$?\s*([\d.,]+)/i,
  ];
  for (const pattern of valorPatterns) {
    const match = text.match(pattern);
    if (match) {
      const valorStr = match[1].replace(/\s/g, '');
      const valor = parseFloat(valorStr.replace('.', '').replace(',', '.'));
      if (valor > 0 && valor < 999999999) {
        valorNota = valor;
        break;
      }
    }
  }

  let dataFormatada = '';
  const dataPatterns = [
    /(?:DATA\s+(?:DA\s+)?(?:EMISSAO|EMISSAO\s+DA\s+NF|EMISSAO\s+DA\s+NOTA))[\s\-:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /(?:EMISSAO|Emissao)[\s\-:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /(?:DATA|Data)[\s\-:]*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
  ];

  for (const pattern of dataPatterns) {
    const match = text.match(pattern);
    if (match) {
      const dia = match[1].padStart(2, '0');
      const mes = match[2].padStart(2, '0');
      let ano = match[3];

      const mesNum = parseInt(mes);
      if (mesNum < 1 || mesNum > 12) continue;

      const diaNum = parseInt(dia);
      if (diaNum < 1 || diaNum > 31) continue;

      if (ano.length === 2) {
        ano = parseInt(ano) > 50 ? `19${ano}` : `20${ano}`;
      }

      dataFormatada = `${ano}-${mes}-${dia}`;
      break;
    }
  }

  let placa = '';
  const placaPatterns = [
    /(?:PLACA|Placa|VEICULO|Veiculo|CARRO|Carro)[\s\-:]*([A-Z]{3}[-\s]?\d{4}[A-Z]{2}|[A-Z0-9]{7,8})/i,
    /([A-Z]{3}[-\s]?\d{4}[A-Z]{2})/,
  ];
  for (const pattern of placaPatterns) {
    const match = text.match(pattern);
    if (match) {
      placa = match[1].toUpperCase().replace(/\s/g, '');
      break;
    }
  }

  let codigoFornecedor = '';
  const codigoMatch = text.match(/(?:CODIGO|Codigo|CODE)(?:\s+(?:DO\s+)?FORNECEDOR)?[\s\-:]+(\d+)/i);
  if (codigoMatch) {
    codigoFornecedor = codigoMatch[1];
  }

  return {
    numeroNota,
    nomeFornecedor,
    cnpjFornecedor: cnpj,
    placa,
    valorNota,
    dataEmissao: dataFormatada,
    codigoFornecedor,
    tipoNota,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<NoteUploadResponse>> {       
  try {
    const formData = await request.formData();
    const usuario = formData.get('usuario') as string;
    const extractedText = formData.get('text') as string;

    if (!extractedText) {
      return NextResponse.json(
        { success: false, error: 'Texto do PDF nao fornecido' },
        { status: 400 }
      );
    }

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario nao fornecido' },
        { status: 400 }
      );
    }

    const notaInfo = extractNotaInfo(extractedText);
    
    // Log para debug
    console.log('Texto extraído do PDF (primeiros 500 chars):', extractedText.substring(0, 500));
    console.log('Dados extraídos:', {
      numeroNota: notaInfo.numeroNota,
      tipoNota: notaInfo.tipoNota,
      valorNota: notaInfo.valorNota,
      cnpj: notaInfo.cnpjFornecedor,
      dataEmissao: notaInfo.dataEmissao,
    });

    return NextResponse.json({
      success: true,
      data: {
        usuario,
        numeroOrdem: 0,
        criadoEm: new Date().toISOString(),
        dataLancamento: new Date().toLocaleString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        ...notaInfo,
      },
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar PDF' },
      { status: 500 }
    );
  }
}
