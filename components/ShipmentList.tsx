
import React, { useState } from 'react';
import { ChevronLeft, RotateCcw, Clock, CheckCircle2, History, ChevronDown, ChevronUp, FileText, Gift, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { Shipment, ShipmentStatus } from '../types';

interface ShipmentListProps {
  shipments: Shipment[];
  onOpenReturn: (id: string) => void;
  onEditReturn: (shipId: string, returnId: string) => void;
  onDeleteReturn: (shipId: string, returnId: string) => void;
  onDeleteShipment: (id: string) => void;
  onBack: () => void;
}

const ShipmentList: React.FC<ShipmentListProps> = ({ shipments, onOpenReturn, onEditReturn, onDeleteReturn, onDeleteShipment, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Histórico de Remessas</h2>
      </div>

      {(shipments || []).length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700">
          <History className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <p className="text-lg">Nenhuma remessa registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => {
            const returns = Array.isArray(s.returns) ? s.returns : [];
            const totalReturned = returns.reduce((sum, r) => sum + (r.reformed || 0) + (r.repaired || 0) + (r.exchanged || 0) + (r.failed || 0), 0);
            const isExpanded = expandedId === s.id;
            const progressPercent = Math.min(100, (totalReturned / s.quantitySent) * 100);

            // Verifica se foi recebida de uma única vez (1 retorno que completa a remessa)
            const isSingleReceipt = returns.length === 1 && totalReturned === s.quantitySent;

            let dotColor = "bg-red-500";
            let statusTextColor = "text-red-500";

            if (s.status === ShipmentStatus.PARTIAL) {
              dotColor = "bg-yellow-400";
              statusTextColor = "text-yellow-600 dark:text-yellow-500";
            } else if (s.status === ShipmentStatus.FINISHED) {
              dotColor = "bg-green-500";
              statusTextColor = "text-green-500 dark:text-green-400";
            }

            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(s.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                      <span className={`text-[10px] font-black uppercase ${statusTextColor}`}>{s.status}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{new Date(s.sendDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{s.number}</h3>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{totalReturned} / {s.quantitySent} Pneus</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Lógica solicitada: Excluir/Editar remessa inteira só se recebida de uma vez */}
                      {isSingleReceipt && (
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onDeleteShipment(s.id); 
                          }}
                          className="bg-slate-100 dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 p-2 rounded-xl transition-all active:scale-95"
                          title="Excluir Remessa Completa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}

                      {s.status !== ShipmentStatus.FINISHED && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onOpenReturn(s.id); }}
                          className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white p-2 rounded-xl shadow-md active:scale-95 transition-all"
                          title="Registrar Novo Retorno"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                      <div className="p-1 text-slate-400 dark:text-slate-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.status === ShipmentStatus.FINISHED ? 'bg-green-500' : 
                        s.status === ShipmentStatus.PARTIAL ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {isExpanded && returns.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Retornos Registrados</h4>
                    {returns.map((r) => (
                      <div key={r.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-50 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3 h-3 text-red-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{r.invoiceNumber}</span>
                            {r.bonusesRedeemed && r.bonusesRedeemed > 0 && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 uppercase">
                                    <Gift className="w-2 h-2" /> {r.bonusesRedeemed} {r.bonusesRedeemed === 1 ? 'Bônus Utilizado' : 'Bônus Utilizados'}
                                </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEditReturn(s.id, r.id); }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                              title="Editar este retorno"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDeleteReturn(s.id, r.id); }}
                              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title="Excluir este retorno"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-1">{new Date(r.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Ref</p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">{r.reformed}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Cons</p>
                            <p className="text-sm font-bold text-red-600 dark:text-red-400">{r.repaired}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">Troc</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{r.exchanged}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">S/R</p>
                            <p className="text-sm font-bold text-red-900 dark:text-red-300">{r.failed}</p>
                          </div>
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
