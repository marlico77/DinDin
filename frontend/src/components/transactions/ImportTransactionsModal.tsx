import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, UploadCloud, CheckCircle2, RefreshCw } from 'lucide-react';
import { parseCSV, parseOFX, ParsedTransaction } from '../../utils/bankParsers';
import { useBatchCreateTransactions, useGuessCategories } from '../../hooks/api/useTransactions';
import { useAccounts } from '../../hooks/api/useAccounts';
import { useDefaultHousehold } from '../../hooks/useDefaultHousehold';
import { formatCurrency, formatDate } from '../../utils/format';
import { CategoryName, TransactionType } from '../../lib/enums';
import clsx from 'clsx';
import CategoryCombobox from '../CategoryCombobox';
import SelectCombobox from '../SelectCombobox';

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ParsedRow = ParsedTransaction & {
  selected: boolean;
  guessedCategory?: string;
  isDuplicate?: boolean; // We could theoretically check duplicates here if we fetch existing externalIds
};

export default function ImportTransactionsModal({ isOpen, onClose }: ImportTransactionsModalProps) {
  const { householdId } = useDefaultHousehold();
  const { data: accountsData } = useAccounts({ householdId: householdId || '' });
  const accounts: any[] = (accountsData as any)?.accounts || (Array.isArray(accountsData) ? accountsData : []);
  
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [step, setStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [isParsing, setIsParsing] = useState(false);
  const [extractedBalance, setExtractedBalance] = useState<number | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  
  const batchCreateMutation = useBatchCreateTransactions();
  const guessCategoriesMutation = useGuessCategories();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setParsedRows([]);
      setStep('upload');
      setSelectedAccountId('');
      setExtractedBalance(undefined);
      setParsingProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    try {
      let transactions: ParsedTransaction[] = [];
      let finalBalance: number | undefined;
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const result = await parseCSV(file);
        transactions = result.transactions;
        finalBalance = result.finalBalance;
      } else if (file.name.toLowerCase().endsWith('.ofx')) {
        const result = await parseOFX(file);
        transactions = result.transactions;
        finalBalance = result.finalBalance;
      } else {
        alert('Formato de arquivo não suportado. Use CSV ou OFX.');
        setIsParsing(false);
        return;
      }

      setExtractedBalance(finalBalance);

      setParsingProgress(10); // file parsed

      // Automatically guess categories based on backend
      const descriptions = transactions.map(t => t.description);
      let categoryGuesses: any = {};
      try {
        const batchSize = 25;
        const totalBatches = Math.ceil(descriptions.length / batchSize);
        
        for (let i = 0; i < totalBatches; i++) {
          const batch = descriptions.slice(i * batchSize, (i + 1) * batchSize);
          const response = await guessCategoriesMutation.mutateAsync({
            householdId,
            descriptions: batch
          });
          
          if (response?.data) {
            categoryGuesses = { ...categoryGuesses, ...response.data };
          }
          
          const currentProgress = 10 + Math.round(((i + 1) / totalBatches) * 80);
          setParsingProgress(currentProgress);
        }
      } catch (err) {
        console.warn('AI categorization failed, proceeding without full guessed categories', err);
      }

      setParsingProgress(95);

      const rows: ParsedRow[] = transactions.map(t => ({
        ...t,
        selected: true,
        guessedCategory: categoryGuesses?.[t.description] || undefined
      }));

      setParsedRows(rows);
      setStep('review');
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Erro ao processar arquivo. Verifique o formato e tente novamente.');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleRowSelection = (index: number) => {
    const newRows = [...parsedRows];
    newRows[index].selected = !newRows[index].selected;
    setParsedRows(newRows);
  };

  const handleCategoryChange = (index: number, category: string) => {
    const newRows = [...parsedRows];
    newRows[index].guessedCategory = category;
    setParsedRows(newRows);
  };


  const handleSubmit = async () => {
    if (!selectedAccountId) {
      alert('Por favor, selecione uma conta.');
      return;
    }

    const rowsToImport = parsedRows.filter(r => r.selected && r.amount !== 0);
    if (rowsToImport.length === 0) return;

    try {
      const payload = rowsToImport.map(row => {
        // Fallback to OTHER_INCOME if positive, OTHER_EXPENSES if negative
        const categoryName = row.guessedCategory || (row.amount > 0 ? CategoryName.OTHER_INCOME : CategoryName.OTHER_EXPENSES);
        return {
          accountId: selectedAccountId,
          amount: Math.abs(row.amount),
          date: row.date,
          description: row.description,
          categoryName: categoryName as CategoryName,
          paid: true,
          externalId: row.externalId
        };
      });

      const batchSize = 100;
      const totalBatches = Math.ceil(payload.length / batchSize);
      
      for (let i = 0; i < totalBatches; i++) {
        const batch = payload.slice(i * batchSize, (i + 1) * batchSize);
        const isLastBatch = i === totalBatches - 1;
        
        await batchCreateMutation.mutateAsync({
          householdId,
          transactions: batch,
          updateAccountBalanceTo: (isLastBatch && extractedBalance !== undefined) ? extractedBalance : undefined
        });
      }

      setStep('success');
    } catch (error) {
      console.error('Error importing:', error);
      alert('Erro ao importar transações.');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 animate-fade-in transition-opacity duration-300 ease-out" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Scrollable Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full sm:w-[900px] max-w-5xl p-6 border rounded-lg bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto min-w-0 animate-slide-in-bottom">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Importar Extrato (CSV/OFX)
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            {step === 'upload' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Conta de Destino
                  </label>
                  <div className="mt-1">
                    <SelectCombobox
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                      options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                      placeholder="Selecione uma conta..."
                    />
                  </div>
                </div>

                <div 
                  className={clsx(
                    "relative mt-4 flex justify-center w-full rounded-lg border-2 border-dashed px-6 py-16 transition-colors cursor-pointer",
                    isDragging 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
                      : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragOver}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 z-10" />
                  )}
                  <div className="text-center pointer-events-none">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                      <span className="relative cursor-pointer rounded-md font-semibold text-primary-600 focus-within:outline-none hover:text-primary-500 dark:text-primary-400 pointer-events-auto">
                        <span>Faça upload do arquivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv,.ofx" ref={fileInputRef} onChange={handleFileChange} />
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-gray-500 mt-2">CSV ou OFX até 10MB</p>
                  </div>
                </div>

                {isParsing && (
                  <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 mt-4">
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                    Processando arquivo... {parsingProgress}%
                  </div>
                )}
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg gap-2">
                  <div className="flex flex-col">
                    <div className="flex items-center text-primary-700 dark:text-primary-300">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span className="font-medium">{parsedRows.length} transações encontradas</span>
                    </div>
                    {extractedBalance !== undefined && (
                      <div className="text-sm text-primary-600 dark:text-primary-400 mt-1 ml-7">
                        Saldo da conta após importação: <span className="font-semibold">{formatCurrency(extractedBalance, 'BRL')}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-primary-600 dark:text-primary-400">
                    Selecione as que deseja importar e revise as categorias.
                  </div>
                </div>


                <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-800" 
                            checked={parsedRows.every(r => r.selected)}
                            onChange={(e) => setParsedRows(parsedRows.map(r => ({ ...r, selected: e.target.checked })))}
                          />
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descrição</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categoria Sugerida</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={clsx(!row.selected && 'opacity-50', 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors')}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white dark:bg-gray-800" 
                              checked={row.selected}
                              onChange={() => toggleRowSelection(idx)}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatDate(row.date)}
                          </td>
                          <td 
                            className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-[150px] sm:max-w-[250px] whitespace-normal break-words"
                            title={row.description}
                          >
                            {row.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <div className="w-56">
                              <CategoryCombobox
                                value={row.guessedCategory || ''}
                                onValueChange={(val) => handleCategoryChange(idx, val)}
                                type={row.amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE}
                                householdId={householdId || undefined}
                              />
                            </div>
                          </td>
                          <td className={clsx("px-4 py-3 whitespace-nowrap text-sm text-right font-medium", row.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                            {formatCurrency(row.amount, 'BRL')}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                            {row.balance !== undefined ? formatCurrency(row.balance, 'BRL') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">Importação Concluída</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  As transações foram importadas com sucesso para a sua conta.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            {step === 'review' && (
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                Voltar
              </button>
            )}
            
            <button
              type="button"
              onClick={step === 'success' ? onClose : (step === 'upload' ? onClose : handleSubmit)}
              disabled={batchCreateMutation.isPending || (step === 'upload')}
              className={clsx(
                "px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
                step === 'upload' ? 'bg-primary-400 cursor-not-allowed hidden' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-sm'
              )}
            >
              {step === 'success' ? 'Fechar' : (batchCreateMutation.isPending ? 'Importando...' : `Importar ${parsedRows.filter(r => r.selected).length} Transações`)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
