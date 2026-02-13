
import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, History, ChevronDown, ChevronUp, FileText, Gift, Trash2, Edit2 } from 'lucide-react';
import { Shipment, ShipmentStatus, ReturnEvent } from '../types';

interface ShipmentListProps {
  shipments: Shipment[];
  onOpenReturn: (id: string) => void;
  onDeleteShipment: (id: string) => void;
  onDeleteReturn: (shipmentId: string, returnId: string) => void;
  onEditReturn: (shipmentId: string, event: ReturnEvent) => void;
  onBack: () => void;
}

const ShipmentList: React.FC<ShipmentListProps> = ({ shipments, onOpenReturn, onDeleteShipment, onDeleteReturn, onEditReturn, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Histórico de Remessas</h2>
      </div>

      {shipments.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
          <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-lg">Nenhuma remessa registrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => {
            const returns = Array.isArray(s.returns) ? s.returns : [];
            const totalReturned = returns.reduce((sum, r) => sum + (r.reformed || 0) + (r.repaired || 0) + (r.exchanged || 0) + (r.failed || 0), 0);
            const isExpanded = expandedId === s.id;
            const progressPercent = Math.min(100, (totalReturned / s.quantitySent) * 100);

            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(s.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${s.status === ShipmentStatus.FINISHED ? 'bg-green-500' : s.status === ShipmentStatus.PARTIAL ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-black uppercase ${s.status === ShipmentStatus.FINISHED ? 'text-green-500' : s.status === ShipmentStatus.PARTIAL ? 'text-yellow-600' : 'text-red-500'}`}>{s.status}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{new Date(s.sendDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{s.number}</h3>
                      <p className="text-sm font-bold text-slate-500">{totalReturned} / {s.quantitySent} Pneus</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {s.status !== ShipmentStatus.FINISHED && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); onOpenReturn(s.id); }} className="bg-red-600 text-white p-2 rounded-xl shadow-md active:scale-95 transition-all">
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteShipment(s.id); }} className="bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-red-500 p-2 rounded-xl active:scale-95 transition-all">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <div className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${s.status === ShipmentStatus.FINISHED ? 'bg-green-500' : s.status === ShipmentStatus.PARTIAL ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                </div>

                {isExpanded && returns.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Etapas do Retorno</h4>
                    {returns.map((r) => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-3 h-3 text-red-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{r.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{new Date(r.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-[10px] text-green-600 font-bold">Ref: {r.reformed}</span>
                            <span className="text-[10px] text-red-600 font-bold">Cons: {r.repaired}</span>
                            <span className="text-[10px] text-purple-600 font-bold">Troc: {r.exchanged}</span>
                            <span className="text-[10px] text-slate-500 font-bold">S/R: {r.failed}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                           <button onClick={() => onEditReturn(s.id, r)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                            <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => onDeleteReturn(s.id, r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShipmentList;
