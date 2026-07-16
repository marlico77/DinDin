import Papa from 'papaparse';
import { XMLParser } from 'fast-xml-parser';

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  externalId: string;
  balance?: number;
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  finalBalance?: number;
}

export async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions: ParsedTransaction[] = [];
          
          for (let i = 0; i < results.data.length; i++) {
            const row: any = results.data[i];
            
            // Tentar inferir colunas comuns
            // Date: Date, Data, Data Lançamento
            // Amount: Amount, Valor, Valor (R$)
            // Description: Description, Descrição, Histórico
            
            const dateStr = row['Date'] || row['Data'] || row['Data Lançamento'] || Object.values(row)[0];
            const amountStr = row['Amount'] || row['Valor'] || row['Valor (R$)'] || Object.values(row)[1];
            const descStr = row['Description'] || row['Descrição'] || row['Histórico'] || Object.values(row)[2];
            const balanceStrRow = row['Saldo'] || row['Balance'] || row['Saldo Atual'] || row['Saldo (R$)'];
            
            if (!dateStr || !amountStr || !descStr) continue;

            // Converter valor "R$ 1.500,00" para número, lidando com vírgula e ponto
            let numAmount = 0;
            if (typeof amountStr === 'number') {
              numAmount = amountStr;
            } else if (typeof amountStr === 'string') {
              const cleanedStr = amountStr.replace(/[R$ ]/g, '');
              // Se tiver vírgula e ponto: 1.500,00 -> 1500.00
              if (cleanedStr.includes(',') && cleanedStr.includes('.')) {
                numAmount = parseFloat(cleanedStr.replace(/\./g, '').replace(',', '.'));
              } else if (cleanedStr.includes(',')) {
                numAmount = parseFloat(cleanedStr.replace(',', '.'));
              } else {
                numAmount = parseFloat(cleanedStr);
              }
            }

            // Converter data DD/MM/YYYY para YYYY-MM-DD
            let formattedDate = dateStr;
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                // assume DD/MM/YYYY
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              }
            }

            const externalId = `csv_${formattedDate}_${Math.abs(numAmount)}_${i}`;

            let numBalance: number | undefined = undefined;
            if (balanceStrRow) {
              const cleanedStrBal = String(balanceStrRow).replace(/[R$ ]/g, '');
              if (cleanedStrBal.includes(',') && cleanedStrBal.includes('.')) {
                numBalance = parseFloat(cleanedStrBal.replace(/\./g, '').replace(',', '.'));
              } else if (cleanedStrBal.includes(',')) {
                numBalance = parseFloat(cleanedStrBal.replace(',', '.'));
              } else {
                numBalance = parseFloat(cleanedStrBal);
              }
            }

            if (!isNaN(numAmount) && formattedDate) {
              transactions.push({
                date: formattedDate,
                amount: numAmount,
                description: String(descStr).trim(),
                externalId,
                balance: !isNaN(numBalance as any) ? numBalance : undefined
              });
            }
          }
          let finalBalance: number | undefined;
          if (results.data.length > 0) {
            // Try to find balance in the last or first row
            const lastRow: any = results.data[results.data.length - 1];
            const firstRow: any = results.data[0];
            const balanceStr = lastRow['Saldo'] || lastRow['Balance'] || lastRow['Saldo Atual'] ||
                               firstRow['Saldo'] || firstRow['Balance'] || firstRow['Saldo Atual'];
            if (balanceStr) {
              const cleaned = String(balanceStr).replace(/[R$ ]/g, '');
              if (cleaned.includes(',') && cleaned.includes('.')) {
                finalBalance = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
              } else if (cleaned.includes(',')) {
                finalBalance = parseFloat(cleaned.replace(',', '.'));
              } else {
                finalBalance = parseFloat(cleaned);
              }
            }
          }
          resolve({ transactions, finalBalance });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function parseOFX(file: File): Promise<ParseResult> {
  const text = await file.text();
  
  // Limpar cabeçalho do OFX que não é XML válido (ex: OFXHEADER:100...)
  const xmlStart = text.indexOf('<OFX>');
  if (xmlStart === -1) {
    throw new Error('Invalid OFX file');
  }
  const cleanXml = text.substring(xmlStart);

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
  });
  
  const parsed = parser.parse(cleanXml);
  const transactions: ParsedTransaction[] = [];
  let finalBalance: number | undefined;

  try {
    // OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
    // Ou CREDMSGSRSV1 para cartões de crédito
    let stmtTrn = null;
    
    if (parsed.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN) {
      stmtTrn = parsed.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN;
    } else if (parsed.OFX?.CREDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN) {
      stmtTrn = parsed.OFX.CREDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN;
    }

    if (parsed.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.LEDGERBAL?.BALAMT !== undefined) {
      finalBalance = parseFloat(parsed.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.LEDGERBAL.BALAMT);
    } else if (parsed.OFX?.CREDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.LEDGERBAL?.BALAMT !== undefined) {
      finalBalance = parseFloat(parsed.OFX.CREDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.LEDGERBAL.BALAMT);
    }

    if (!stmtTrn) {
      return { transactions, finalBalance };
    }

    // Se for só uma transação, o parser pode não retornar como array
    const trnList = Array.isArray(stmtTrn) ? stmtTrn : [stmtTrn];

    for (const trn of trnList) {
      // OFX Date format: YYYYMMDDHHMMSS or YYYYMMDD
      const dateStr = String(trn.DTPOSTED || trn.DTUSER);
      let date = dateStr;
      if (dateStr.length >= 8) {
        date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      }

      const amount = parseFloat(trn.TRNAMT);
      const description = trn.MEMO || trn.NAME || 'Transação sem descrição';
      const externalId = trn.FITID ? String(trn.FITID) : `ofx_${date}_${Math.abs(amount)}`;

      if (!isNaN(amount)) {
        transactions.push({
          date,
          amount,
          description,
          externalId
        });
      }
    }
  } catch (error) {
    console.error('Error parsing OFX nodes:', error);
    throw new Error('Could not read transactions from OFX');
  }

  return { transactions, finalBalance };
}
