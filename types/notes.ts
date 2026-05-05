export interface ExtractedNote {
  id: string;
  numeroNota: string;
  nomeFornecedor?: string;
  cnpjFornecedor: string;
  placa: string;
  valorNota: number;
  dataEmissao: string;
  usuario: string;
  numeroOrdem: number;
  codigoFornecedor?: string;
  bp?: string;
  criadoEm: string;
  dataLancamento?: string;
}

export interface NoteUploadResponse {
  success: boolean;
  data?: Partial<ExtractedNote>;
  error?: string;
}
