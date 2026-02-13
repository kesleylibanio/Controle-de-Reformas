
import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, AlertCircle, FileText, Calendar, Info, Gift, CheckCircle, Minus, Plus } from 'lucide-react';
import { Shipment, ReturnEvent } from '../types';

interface ReturnFormProps {
  shipment: Shipment;
  editData?: ReturnEvent;
  pendingBonuses: number;
  existingInvoiceNumbers: string[];
  onSave: (event: ReturnEvent) => void;
  onCancel: () => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({ shipment, editData, pendingBonuses, existingInvoiceNumbers, onSave, onCancel }) => {
  const [reformed, setReformed] = useState(0);
  const [repaired, setRepaired] = useState(0);
  const [exchanged, setExchanged] = useState(0);
  const [failed, setFailed] = useState(0);
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [bonusesToRedeem, setBonusesToRedeem] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Inicializa dados se for edição
  useEffect(() => {
    if (editData) {
      setReformed(editData.reformed);
      setRepaired(editData.repaired);
      setExchanged(editData.exchanged);
      setFailed(editData.failed);
      setReturnDate(editData.date);
      setInvoiceNumber(editData.invoiceNumber);
      setBonusesToRedeem(editData.bonusesRedeemed || 0);
    }
  }, [editData]);

  // Calcula o que já foi retornado EXCLUINDO o registro atual (se for edição)
  const returnedOthers = useMemo(() => {
    return shipment.returns
      .filter(r => r.id !== editData?.id)
      .reduce((sum, r) => sum + r.reformed + r.repaired + r.exchanged + r.failed, 0);
  }, [shipment.returns, editData]);

  const currentTotalInThisForm = reformed + repaired + exchanged + failed;
  const remainingTotal = shipment.quantitySent - returnedOthers;
  
  const isInvoiceDuplicate = useMemo(() => {
    // Se for edição, ignora o próprio número da nota original
    const otherInvoices = existingInvoiceNumbers.filter(inv => inv !== editData?.invoiceNumber?.toLowerCase());
    return otherInvoices.includes(invoiceNumber.trim().toLowerCase());
  }, [invoiceNumber, existingInvoiceNumbers, editData]);

  const canSave = currentTotalInThisForm > 0 && 
                  currentTotalInThisForm <= remainingTotal && 
                  invoiceNumber.trim().length > 0 && 
                  !isInvoiceDuplicate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isInvoiceDuplicate) {
      setError("Este número de Nota Fiscal já foi cadastrado em outro lançamento.");
      return;
    }

    if (!canSave) return;

    const newEvent: ReturnEvent = {
      id: editData?.id || crypto.randomUUID(),
      date: returnDate,
      invoiceNumber: invoiceNumber.trim(),
      reformed,
      repaired,
      exchanged,
      failed,
      bonusesRedeemed: bonusesToRedeem
    };
    
    onSave(newEvent);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // O bônus disponível para o formulário é o global + o que já foi usado neste retorno se for edição
  const maxAvailableBonus = pendingBonuses + (editData?.bonusesRedeemed || 0);

  const incrementBonus = () => {
    if (bonusesToRedeem < maxAvailableBonus) {
      setBonusesToRedeem(prev => prev + 1);
    }
  };

  const decrementBonus = () => {
    if (bonusesToRedeem > 0) {
      setBonusesToRedeem(prev => prev - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-slate-800 dark:bg-slate-950 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{editData ? 'Editar Retorno' : 'Registrar Retorno'}</h2>
          <p className="text-xs text-slate-400">Referente a {shipment.number}</p>
        </div>
        <button onClick={onCancel} className="p-1 hover:bg-slate-700 dark:hover:bg-slate-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700">
        <div className="text-center px-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Enviado</p>
          <p className="text-xl font-black text-slate-700 dark:text-slate-200">{shipment.quantitySent}</p>
        </div>
        <div className="text-center px-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Disponível</p>
          <p className="text-xl font-black text-red-600 dark:text-red-400">{remainingTotal}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-red-600" /> Data de Retorno
            </label>
            <input 
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-red-600" /> Número da Nota
            </label>
            <input 
              type="text"
              value={invoiceNumber}
              onChange={(e) => {
                setInvoiceNumber(e.target.value);
                setError(null);
              }}
              placeholder="Ex: NF-12345"
              className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all ${isInvoiceDuplicate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 dark:border-slate-700'}`}
              required
            />
            {isInvoiceDuplicate && (
              <p className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Nota já existente!
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-green-700 dark:text-green-500 uppercase">Reformados</label>
            <input 
              type="number"
              min="0"
              value={reformed}
              onFocus={handleFocus}
              onChange={(e) => setReformed(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-green-50/30 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-3 text-lg font-bold text-green-700 dark:text-green-400 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-red-700 dark:text-red-400 uppercase">Consertados</label>
            <input 
              type="number"
              min="0"
              value={repaired}
              onFocus={handleFocus}
              onChange={(e) => setRepaired(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-red-50/30 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-3 text-lg font-bold text-red-700 dark:text-red-400 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 uppercase">Trocados</label>
            <input 
              type="number"
              min="0"
              value={exchanged}
              onFocus={handleFocus}
              onChange={(e) => setExchanged(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-purple-50/30 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-3 text-lg font-bold text-purple-700 dark:text-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-bold text-red-900 dark:text-red-300 uppercase">Sem Reforma</label>
            <input 
              type="number"
              min="0"
              value={failed}
              onFocus={handleFocus}
              onChange={(e) => setFailed(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-red-50/30 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-lg font-bold text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        {maxAvailableBonus > 0 && (
          <div className="p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/30 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${bonusesToRedeem > 0 ? 'bg-yellow-400 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'}`}>
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm dark:text-slate-200">Uso de bônus</p>
                  <p className="text-[10px] font-medium opacity-70 dark:text-slate-400">Máx. permitido: {maxAvailableBonus}</p>
                </div>
              </div>
              {bonusesToRedeem > 0 && <CheckCircle className="w-6 h-6 text-yellow-500" />}
            </div>
            
            <div className="flex items-center justify-center gap-6 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <button 
                type="button" 
                onClick={decrementBonus}
                disabled={bonusesToRedeem === 0}
                className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 dark:text-slate-400 disabled:opacity-30 active:scale-95 transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="text-center min-w-[3rem]">
                <p className="text-2xl font-black text-slate-800 dark:text-white">{bonusesToRedeem}</p>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resgatando</p>
              </div>

              <button 
                type="button" 
                onClick={incrementBonus}
                disabled={bonusesToRedeem >= maxAvailableBonus}
                className="p-2 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm text-yellow-600 dark:text-yellow-500 disabled:opacity-30 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className={`p-4 rounded-xl flex items-center justify-between transition-colors ${currentTotalInThisForm > remainingTotal ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : currentTotalInThisForm === remainingTotal ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-slate-900 text-red-800 dark:text-slate-300'}`}>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            <span className="text-sm font-bold">Total do Registro: {currentTotalInThisForm} pneus</span>
          </div>
          {currentTotalInThisForm > remainingTotal ? (
            <span className="text-xs font-black uppercase">Excede o limite!</span>
          ) : (
            <span className="text-xs font-black uppercase">{currentTotalInThisForm === remainingTotal ? 'Fechamento Total' : 'Parcial'}</span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2 text-sm font-bold animate-in shake duration-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
           <button 
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={!canSave}
            className={`flex-[2] font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
              canSave 
                ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white shadow-red-200' 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <Save className="w-5 h-5" />
            {editData ? 'Salvar Alterações' : 'Registrar Retorno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnForm;
