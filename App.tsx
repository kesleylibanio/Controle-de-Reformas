
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Disc, 
  RotateCcw, 
  Plus, 
  LogOut, 
  CloudUpload, 
  Check, 
  Moon, 
  Sun, 
  Loader2,
  LayoutDashboard,
  History
} from 'lucide-react';
import { Shipment, ShipmentStatus, ReturnEvent, BonusStats } from './types';
import Dashboard from './components/Dashboard';
import ShipmentList from './components/ShipmentList';
import ShipmentForm from './components/ShipmentForm';
import ReturnForm from './components/ReturnForm';
import Login from './components/Login';

const STORAGE_KEY = 'pneucontrol_data_v3';
const AUTH_KEY = 'pneucontrol_user';
const THEME_KEY = 'pneucontrol_theme';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpXLsLVFn0ULlwo-fU49lJRm3KW7EQHqxxH1BSQ7tXGh8K8dRIMm1stJ2MBTqt5B8/exec';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [validUsers, setValidUsers] = useState<{username: string, password: string}[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [view, setView] = useState<'dashboard' | 'new' | 'list' | 'return'>('dashboard');
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [editingReturn, setEditingReturn] = useState<{shipmentId: string, event: ReturnEvent} | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);
  const isInitialMount = useRef(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  const forceSync = async (currentShipments: Shipment[]) => {
    setSyncStatus('syncing');
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'syncShipments', shipments: currentShipments }),
      });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 1500);
    } catch (error) {
      setSyncStatus('error');
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers&t=${Date.now()}`);
      const data = await response.json();
      if (Array.isArray(data)) setValidUsers(data);
    } catch (error) {
      setValidUsers([
        { username: "Éder", password: "1" }, { username: "Wender", password: "1" },
        { username: "Kesley", password: "1" }, { username: "Roberto", password: "1" }
      ]);
    }
  }, []);

  const fetchShipments = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getShipments&t=${Date.now()}`);
      const data = await response.json();
      const incoming = Array.isArray(data.shipments) ? data.shipments : (Array.isArray(data) ? data : []);
      const sanitized = incoming.map((s: any) => ({
        ...s,
        returns: typeof s.returns === 'string' ? JSON.parse(s.returns) : (Array.isArray(s.returns) ? s.returns : [])
      }));
      setShipments(sanitized);
      setHasLoadedFromDB(true);
      setSyncStatus('success');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      setSyncStatus('error');
    } finally {
      setLoadingInitial(false);
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, []);

  useEffect(() => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try { setShipments(JSON.parse(localData)); } catch(e) {}
    }
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) setCurrentUser(savedUser);
    Promise.all([fetchUsers(), fetchShipments()]).finally(() => setLoadingInitial(false));
  }, [fetchUsers, fetchShipments]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Sync automático apenas para mudanças que não foram manuais ou deletar
  useEffect(() => {
    if (loadingInitial || !hasLoadedFromDB) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  }, [shipments, loadingInitial, hasLoadedFromDB]);

  const stats: BonusStats = useMemo(() => {
    let tReformed = 0, tRepaired = 0, tExchanged = 0, tFailed = 0, tBonusPaid = 0;
    shipments.forEach(s => {
      (s.returns || []).forEach(r => {
        tReformed += (r.reformed || 0);
        tRepaired += (r.repaired || 0);
        tExchanged += (r.exchanged || 0);
        tFailed += (r.failed || 0);
        tBonusPaid += (r.bonusesRedeemed || 0);
      });
    });
    const paidReforms = Math.max(0, tReformed - tBonusPaid);
    return { 
      totalSent: shipments.reduce((a, b) => a + (b.quantitySent || 0), 0),
      totalReformed: tReformed, totalRepaired: tRepaired, totalExchanged: tExchanged, totalFailed: tFailed,
      totalBonusEarned: Math.floor(paidReforms / 15), totalBonusPaid: tBonusPaid, pendingBonuses: Math.floor(paidReforms / 15)
    };
  }, [shipments]);

  const allInvoiceNumbers = useMemo(() => {
    const list: string[] = [];
    shipments.forEach(s => s.returns?.forEach(r => {
      if(r.invoiceNumber) list.push(r.invoiceNumber.toLowerCase());
    }));
    return list;
  }, [shipments]);

  const handleAddShipment = async (data: { date: string, quantity: number }) => {
    const newShipment: Shipment = {
      id: crypto.randomUUID(),
      number: `REM-${String(shipments.length + 1).padStart(4, '0')}`,
      sendDate: data.date,
      quantitySent: data.quantity,
      status: ShipmentStatus.AWAITING,
      returns: []
    };
    const updated = [newShipment, ...shipments];
    setShipments(updated);
    setView('dashboard');
    await forceSync(updated);
  };

  const handleRegisterReturn = async (id: string, event: ReturnEvent) => {
    const updated = shipments.map(s => {
      if (s.id === id) {
        let updatedReturns = [...(s.returns || [])];
        if (editingReturn) {
          updatedReturns = updatedReturns.map(r => r.id === event.id ? event : r);
        } else {
          updatedReturns.push(event);
        }
        const totalRet = updatedReturns.reduce((acc, r) => acc + r.reformed + r.repaired + r.exchanged + r.failed, 0);
        return { 
          ...s, 
          status: totalRet >= s.quantitySent ? ShipmentStatus.FINISHED : (totalRet > 0 ? ShipmentStatus.PARTIAL : ShipmentStatus.AWAITING), 
          returns: updatedReturns 
        };
      }
      return s;
    });
    setShipments(updated);
    setEditingReturn(null);
    setView('dashboard');
    await forceSync(updated);
  };

  const handleDeleteShipment = async (id: string) => {
    const shipment = shipments.find(s => s.id === id);
    if (shipment?.status === ShipmentStatus.FINISHED) {
      alert("Não é possível excluir uma remessa finalizada.");
      return;
    }
    if (!confirm("Tem certeza que deseja excluir esta remessa e todo o seu histórico?")) return;
    const updated = shipments.filter(s => s.id !== id);
    setShipments(updated);
    await forceSync(updated);
  };

  const handleDeleteReturn = async (shipmentId: string, returnId: string) => {
    if (!confirm("Excluir esta etapa do retorno?")) return;
    const updated = shipments.map(s => {
      if (s.id === shipmentId) {
        const updatedReturns = s.returns.filter(r => r.id !== returnId);
        const totalRet = updatedReturns.reduce((acc, r) => acc + r.reformed + r.repaired + r.exchanged + r.failed, 0);
        return {
          ...s,
          returns: updatedReturns,
          status: totalRet >= s.quantitySent ? ShipmentStatus.FINISHED : (totalRet > 0 ? ShipmentStatus.PARTIAL : ShipmentStatus.AWAITING)
        };
      }
      return s;
    });
    setShipments(updated);
    await forceSync(updated);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} flex flex-col transition-colors duration-300 pb-20 md:pb-0`}>
      <header className="bg-red-700 dark:bg-red-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Disc className="w-7 h-7 animate-spin-slow" />
            <h1 className="text-xl font-bold tracking-tight">Controle de Reformas</h1>
          </div>
          <div className="flex items-center gap-1">
            {syncStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-white/50 mr-2" />}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-red-600 rounded-full transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={fetchShipments} className="p-2 hover:bg-red-600 rounded-full transition-colors"><RotateCcw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /></button>
            <button onClick={() => { setCurrentUser(null); localStorage.removeItem(AUTH_KEY); }} className="p-2 hover:bg-red-600 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 relative">
        {loadingInitial && !hasLoadedFromDB && shipments.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
             <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
             <p className="text-slate-500 font-bold">Sincronizando...</p>
          </div>
        )}
        {view === 'dashboard' && <Dashboard stats={stats} onNewShipment={() => setView('new')} onViewList={() => setView('list')} recentShipments={shipments.slice(0, 5)} onOpenReturn={(id) => {setActiveShipmentId(id); setView('return');}} />}
        {view === 'new' && <ShipmentForm onSave={handleAddShipment} onCancel={() => setView('dashboard')} />}
        {view === 'list' && (
          <ShipmentList 
            shipments={shipments} 
            onOpenReturn={(id) => {setActiveShipmentId(id); setView('return');}} 
            onDeleteShipment={handleDeleteShipment}
            onDeleteReturn={handleDeleteReturn}
            onEditReturn={(shipmentId, event) => { setEditingReturn({shipmentId, event}); setActiveShipmentId(shipmentId); setView('return'); }}
            onBack={() => setView('dashboard')} 
          />
        )}
        {view === 'return' && activeShipmentId && (
          <ReturnForm 
            shipment={shipments.find(s => s.id === activeShipmentId)!} 
            initialData={editingReturn?.event}
            pendingBonuses={stats.pendingBonuses + (editingReturn?.event.bonusesRedeemed || 0)} 
            existingInvoiceNumbers={allInvoiceNumbers.filter(n => n !== editingReturn?.event.invoiceNumber?.toLowerCase())} 
            onSave={(e) => handleRegisterReturn(activeShipmentId, e)} 
            onCancel={() => { setView('list'); setEditingReturn(null); }} 
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 md:hidden flex justify-around items-center z-10">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'dashboard' ? 'text-red-600' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Início</span>
        </button>
        <button onClick={() => setView('new')} className="bg-red-600 text-white p-3 rounded-full -mt-10 shadow-lg active:scale-95 transition-all">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setView('list')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'list' ? 'text-red-600' : 'text-slate-400'}`}>
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Lista</span>
        </button>
      </nav>
      {syncStatus !== 'idle' && (
        <div className="fixed bottom-24 right-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-full shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-right-4 duration-300">
          {syncStatus === 'syncing' ? <CloudUpload className="w-4 h-4 text-blue-500 animate-bounce" /> : <Check className="w-4 h-4 text-green-500" />}
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
            {syncStatus === 'syncing' ? 'Sincronizando...' : 'Salvo'}
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
