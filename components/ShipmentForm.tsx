
import React, { useState, useEffect } from 'react';
import { X, Calendar, Hash } from 'lucide-react';
import { Shipment } from '../types';

interface ShipmentFormProps {
  initialData?: Shipment;
  onSave: (data: { date: string, quantity: number }) => void;
  onCancel: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({ initialData, onSave, onCancel }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.sendDate);
      setQuantity(initialData.quantitySent.toString());
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !quantity || parseInt(quantity) <= 0) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }
    
    if (initialData) {
      const totalReturned = (initialData.returns || []).reduce((acc, r) => acc + r.reformed + r.repaired + r.exchanged + r.failed, 0);
      if (parseInt(quantity) < totalReturned) {
        alert(`A nova quantidade (${quantity}) não pode ser menor que o total já retornado (${totalReturned} pneus).`);
        return;
      }
    }

    onSave({ date, quantity: parseInt(quantity) });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom duration-300">
      <div className="bg-red-700 dark:bg-red-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">{initialData ? `Editar ${initialData.number}` : 'Nova Remessa'}</h2>
        <button onClick={onCancel} className="p-1 hover:bg-red-600 dark:hover:bg-red-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
            Data da Remessa
          </label>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4 text-red-600 dark:text-red-400" />
            Quantidade Total de Pneus
          </label>
          <input 
            type="number"
            inputMode="numeric"
            placeholder="Ex: 20"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-lg text-slate-800 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
            min="1"
            required
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-[2] bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 transition-all"
          >
            {initialData ? 'Atualizar Remessa' : 'Cadastrar Remessa'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;
