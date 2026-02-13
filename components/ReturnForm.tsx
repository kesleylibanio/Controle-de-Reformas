
import React, { useState, useMemo, useEffect } from 'react';
import { X, Save, FileText, Calendar, Info, Gift, Minus, Plus } from 'lucide-react';
import { Shipment, ReturnEvent } from '../types';

interface ReturnFormProps {
  shipment: Shipment;
  initialData?: ReturnEvent;
  pendingBonuses: number;
  existingInvoiceNumbers: string[];
  onSave: (event: ReturnEvent) => void;
  onCancel: () => void;
}

const ReturnForm: React.FC<ReturnFormProps> = ({ shipment, initialData, pendingBonuses, existingInvoiceNumbers, onSave, onCancel }) => {
  const [reformed, setReformed] = useState(initialData?.reformed || 0);
  const [repaired, setRepaired] = useState(initialData?.repaired || 0);
  const [exchanged, setExchanged] = useState(initialData?.exchanged || 0);
  const [failed, setFailed] = useState(initialData?.failed || 0);
  const [returnDate, setReturnDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber || '');
  const [bonusesToRedeem, setBonusesToRedeem] = useState(initialData?.bonusesRedeemed || 0);

  const alreadyReturned = useMemo(() => {
    return shipment.returns
      .filter(r => r.id !== initialData?.id)
      .reduce((sum, r) => sum + r.reformed + r.repaired + r.exchanged + r.failed, 0);
  }, [shipment.returns, initialData]);

  const currentTotal = reformed + repaired + exchanged + failed;
  const remainingTotal = shipment.quantitySent - alreadyReturned;
  const isInvoiceDuplicate = existingInvoiceNumbers.includes(invoiceNumber.trim().toLowerCase());

  const canSave = currentTotal > 0 && currentTotal <= remainingTotal && invoiceNumber.trim().length > 0 && !isInvoiceDuplicate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      date: returnDate,
      invoiceNumber: invoiceNumber.trim(),
      reformed, repaired, exchanged, failed,
      bonusesRedeemed: bonusesToRedeem
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="bg-slate-800 dark:bg-slate-950 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">{initialData ? 'Editar Etapa' : 'Registrar Retorno'}</h2>
          <p className="text-xs text-slate-400">{shipment.number}</p>
        </div>
        <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6" /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Data</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-white" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Nota Fiscal</label>
            <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="NF-000" className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl p-3 text-sm text-slate-800 dark:text-white ${isInvoiceDuplicate ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/10 p-3 rounded-xl">
            <label className="block text-[10px] font-black text-green-600 uppercase mb-1">Reformados</label>
            <input type="number" min="0" value={reformed} onChange={(e) => setReformed(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-xl font-bold text-green-700 outline-none" />
          </div>
          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl">
            <label className="block text-[10px] font-black text-red-600 uppercase mb-1">Consertados</label>
            <input type="number" min="0" value={repaired} onChange={(e) => setRepaired(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-xl font-bold text-red-700 outline-none" />
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl">
            <label className="block text-[10px] font-black text-purple-600 uppercase mb-1">Trocados</label>
            <input type="number" min="0" value={exchanged} onChange={(e) => setExchanged(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-xl font-bold text-purple-700 outline-none" />
          </div>
          <div className="bg-slate-100 dark:bg-slate-900/30 p-3 rounded-xl">
            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Sem Reforma</label>
            <input type="number" min="0" value={failed} onChange={(e) => setFailed(parseInt(e.target.value) || 0)} className="w-full bg-transparent text-xl font-bold text-slate-700 dark:text-slate-300 outline-none" />
          </div>
        </div>

        {pendingBonuses > 0 && (
          <div className="p-4 rounded-2xl border border-slate-100 dark:border-slate-700 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div className="flex items-center gap-3 mb-3">
              <Gift className="w-5 h-5 text-yellow-600" />
              <p className="font-bold text-sm text-yellow-800 dark:text-yellow-400">Resgatar Bônus? (Disp: {pendingBonuses})</p>
            </div>
            <div className="flex items-center justify-center gap-6">
              <button type="button" onClick={() => setBonusesToRedeem(Math.max(0, bonusesToRedeem - 1))} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm"><Minus className="w-5 h-5" /></button>
              <span className="text-2xl font-black text-slate-800 dark:text-white">{bonusesToRedeem}</span>
              <button type="button" onClick={() => setBonusesToRedeem(Math.min(pendingBonuses, bonusesToRedeem + 1))} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm"><Plus className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        <div className={`p-4 rounded-xl flex items-center gap-2 ${currentTotal > remainingTotal ? 'bg-red-100 text-red-800' : 'bg-slate-100 dark:bg-slate-900 text-slate-600'}`}>
          <Info className="w-5 h-5" />
          <span className="text-xs font-bold">Total nesta etapa: {currentTotal} pneu(s)</span>
        </div>

        <button type="submit" disabled={!canSave} className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${canSave ? 'bg-red-600 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
          <Save className="w-5 h-5" />
          {initialData ? 'Atualizar Dados' : 'Registrar Retorno'}
        </button>
      </form>
    </div>
  );
};

export default ReturnForm;
