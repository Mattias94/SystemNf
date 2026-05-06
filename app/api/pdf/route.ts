import { NextRequest, NextResponse } from 'next/server';
import { NoteUploadResponse } from '@/types/notes';

function extractNumeroNota(text: string) {
  const normalizedText = text
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r/g, '\n');

  const contents = [text, normalizedText];

  const numeroPatterns = [
    // DANFE clássico: "NÚMERO 000.123.456 SÉRIE 1"
    /(?:N[UÚ]MERO|NUMERO|N[º°o])\s*(?:DA\s+NOTA|DA\s+NF(?:[\s\-]?E)?|NOTA(?:\s+FISCAL)?)?\s*[:#\-]?\s*([0-9][0-9 .\/-]{0,20})\s*(?:S[EÉ]RIE|SERIE)\b/i,
    // DANFE: "NF-e Nº 123456789" ou "Nº 123456789"
    /(?:NF(?:[\s\-]?E)?|NFS(?:[\s\-]?E)?|NOTA(?:\s+FISCAL)?)\s*(?:N[º°o]|N[UÚ]MERO|NUMERO)?\s*[:#\-]?\s*([0-9][0-9 .\/-]{0,20})\b/i,
    /(?:NUMERO|N[UÚ]MERO|N[º°o])\s*(?:DA|DO)?\s*(?:NOTA(?:\s+FISCAL)?|NF(?:[\s\-]?E)?|NFS(?:[\s\-]?E)?)?\s*[:#\-]?\s*([0-9][0-9 .\/-]{0,20})/i,
    /(?:NOTA\s+FISCAL|NOTA\s+DE\s+(?:PECA|PEÇA|SERVICO|SERVIÇO)|NF(?:[\s\-]?E)?|NFS(?:[\s\-]?E)?)\s*(?:N[º°o]|NUMERO|N[UÚ]MERO)?\s*[:#\-]?\s*([0-9][0-9 .\/-]{0,20})/i,
    /(?:^|\n|\s)NF(?:[\s\-]?E)?\s*[:#\-]?\s*([0-9][0-9 .\/-]{2,20})/i,
  ];

  for (const content of contents) {
    for (const pattern of numeroPatterns) {
      const match = content.match(pattern);
      if (!match) continue;

      const normalized = match[1].replace(/\D/g, '');

      // Evita capturar valores longos como chave de acesso e outros identificadores.
      if (normalized.length >= 3 && normalized.length <= 15) {
        return normalized;
      }
    }
  }

  // Fallback DANFE: busca número em janelas próximas da chave de acesso.
  const labelRegex = /(?:N[UÚ]MERO|NUMERO|N[º°o])\s*(?:DA\s+NOTA|DA\s+NF(?:[\s\-]?E)?|NOTA(?:\s+FISCAL)?)?/gi;
  let labelMatch: RegExpExecArray | null = null;
  while ((labelMatch = labelRegex.exec(normalizedText)) !== null) {
    const window = normalizedText.slice(labelMatch.index, labelMatch.index + 180);
    const candidate = window.match(/([0-9][0-9 .\/-]{2,20})(?:\s*(?:S[EÉ]RIE|SERIE|CHAVE|PROTOCOLO|CNPJ|IE|IM|CPF)\b|$)/i);
    if (!candidate) continue;

    const normalized = candidate[1].replace(/\D/g, '');
    if (normalized.length >= 3 && normalized.length <= 15) {
      return normalized;
    }
  }

  return '';
}

function extractNotaInfo(text: string) {
  const numeroNota = extractNumeroNota(text);

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

function normalizeCnpj(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) {
    return value.trim();
  }

  return `${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12)}`;
}

function normalizeDate(value: string) {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parts = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (parts) {
    const dia = parts[1].padStart(2, '0');
    const mes = parts[2].padStart(2, '0');
    let ano = parts[3];

    if (ano.length === 2) {
      ano = parseInt(ano, 10) > 50 ? `19${ano}` : `20${ano}`;
    }

    return `${ano}-${mes}-${dia}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}

function buildMissingFields(note: ReturnType<typeof extractNotaInfo>) {
  const missingFields: string[] = [];

  if (!note.numeroNota.trim()) missingFields.push('número da nota');
  if (!note.cnpjFornecedor.trim()) missingFields.push('CNPJ do fornecedor');
  if (!Number.isFinite(note.valorNota) || note.valorNota <= 0) missingFields.push('valor da nota');
  if (!note.dataEmissao.trim()) missingFields.push('data de emissão');

  return missingFields;
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
    const normalizedData = {
      ...notaInfo,
      numeroNota: notaInfo.numeroNota.trim(),
      nomeFornecedor: notaInfo.nomeFornecedor.trim(),
      cnpjFornecedor: normalizeCnpj(notaInfo.cnpjFornecedor),
      placa: notaInfo.placa.trim().toUpperCase().replace(/\s/g, ''),
      valorNota: Number.isFinite(notaInfo.valorNota) ? notaInfo.valorNota : 0,
      dataEmissao: normalizeDate(notaInfo.dataEmissao),
      codigoFornecedor: notaInfo.codigoFornecedor.trim(),
    };
    const missingFields = buildMissingFields(normalizedData);
    
    // Log para debug
    console.log('Texto extraído do PDF (primeiros 500 chars):', extractedText.substring(0, 500));
    console.log('Dados extraídos:', {
      numeroNota: normalizedData.numeroNota,
      tipoNota: normalizedData.tipoNota,
      valorNota: normalizedData.valorNota,
      cnpj: normalizedData.cnpjFornecedor,
      dataEmissao: normalizedData.dataEmissao,
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
        ...normalizedData,
      },
      missingFields: missingFields.length > 0 ? missingFields : undefined,
    });
  } catch (error) {
    console.error('Erro ao processar PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar PDF' },
      { status: 500 }
    );
  }
}
