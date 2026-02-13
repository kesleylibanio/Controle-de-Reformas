
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Disc, 
  RotateCcw, 
  Plus, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  AlertCircle,
  Trophy,
  History,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  PieChart,
  Gift,
  CloudUpload,
  Check,
  Moon,
  Sun,
  Settings,
  Loader2
} from 'lucide-react';
import { Shipment, ShipmentStatus, ReturnEvent, BonusStats } from './types';
import Dashboard from './components/Dashboard';
import ShipmentList from './components/ShipmentList';
import ShipmentForm from './components/ShipmentForm';
import ReturnForm from './components/ReturnForm';
import BonusNotification from './components/BonusNotification';
import Login from './components/Login';
import PasswordChange from './components/PasswordChange';

const STORAGE_KEY = 'pneucontrol_data_v3';
const AUTH_KEY = 'pneucontrol_user';
const THEME_KEY = 'pneucontrol_theme';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpXLsLVFn0ULlwo-fU49lJRm3KW7EQHqxxH1BSQ7tXGh8K8dRIMm1stJ2MBTqt5B8/exec';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [validUsers, setValidUsers] = useState<{username: string, password: string}[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [view, setView] = useState<'dashboard' | 'new' | 'list' | 'return' | 'settings' | 'edit'>('dashboard');
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [activeReturnId, setActiveReturnId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);
  const isInitialMount = useRef(true);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  const apiGet = useCallback(async (action: string) => {
    const url = `${GOOGLE_SCRIPT_URL}?action=${action}&t=${Date.now()}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Erro GET ${action}:`, error);
      throw error;
    }
  }, []);

  const apiPost = useCallback(async (payload: object) => {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        credentials: 'omit',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        redirect: 'follow',
      });
      return response;
    } catch (error) {
      console.error("Erro POST:", error);
      throw error;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiGet('getUsers');
      if (Array.isArray(data)) {
        setValidUsers(data.map((u: any) => ({
          username: String(u.username),
          password: String(u.password)
        })));
      }
    } catch (error) {
      setValidUsers([
        { username: "Éder", password: "1" },
        { username: "Wender", password: "1" },
        { username: "Kesley", password: "1" },
        { username: "Roberto", password: "1" }
      ]);
    }
  }, [apiGet]);

  const fetchShipments = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const data = await apiGet('getShipments');
      const incoming = (data && data.shipments) ? data.shipments : (Array.isArray(data) ? data : []);
      const sanitized = incoming.map((s: any) => ({
        ...s,
        quantitySent: Number(s.quantitySent) || 0,
        returns: typeof s.returns === 'string' ? JSON.parse(s.returns) : (Array.isArray(s.returns) ? s.returns : [])
      }));
      setShipments(sanitized);
      setHasLoadedFromDB(true);
      setSyncStatus('success');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      setSyncStatus('error');
      const local = localStorage.getItem(STORAGE_KEY);
      if (local && shipments.length === 0) {
        try { setShipments(JSON.parse(local)); } catch(e) {}
      }
    } finally {
      setLoadingInitial(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [apiGet, shipments.length]);

  useEffect(() => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      try { 
        const parsed = JSON.parse(localData);
        setShipments(Array.isArray(parsed) ? parsed : []); 
      } catch(e) {}
    }
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) setCurrentUser(savedUser);
    fetchUsers();
    fetchShipments();
  }, [fetchUsers, fetchShipments]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (loadingInitial || !hasLoadedFromDB) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    const timeoutId = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        await apiPost({ action: 'syncShipments', shipments });
        setSyncStatus('success');
      } catch (error) {
        setSyncStatus('error');
      } finally {
        setTimeout(() => setSyncStatus('idle'), 2000);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [shipments, loadingInitial, hasLoadedFromDB, apiPost]);

  const stats: BonusStats = useMemo(() => {
    let tReformed = 0, tRepaired = 0, tExchanged = 0, tFailed = 0, tBonusPaid = 0;
    shipments.forEach(s => {
      (s.returns || []).forEach(r => {
        tReformed += (Number(r.reformed) || 0);
        tRepaired += (Number(r.repaired) || 0);
        tExchanged += (Number(r.exchanged) || 0);
        tFailed += (Number(r.failed) || 0);
        tBonusPaid += (Number(r.bonusesRedeemed) || 0);
      });
    });
    const totalEarned = Math.floor(tReformed / 15);
    const pending = totalEarned - tBonusPaid;
    return { 
      totalSent: shipments.reduce((a, b) => a + (Number(b.quantitySent) || 0), 0),
      totalReformed: tReformed, 
      totalRepaired: tRepaired, 
      totalExchanged: tExchanged, 
      totalFailed: tFailed,
      totalBonusEarned: totalEarned, 
      totalBonusPaid: tBonusPaid, 
      pendingBonuses: Math.max(0, pending) 
    };
  }, [shipments]);

  const allInvoiceNumbers = useMemo(() => {
    const list: string[] = [];
    shipments.forEach(s => (s.returns || []).forEach(r => {
      if(r.invoiceNumber) list.push(String(r.invoiceNumber).toLowerCase());
    }));
    return list;
  }, [shipments]);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem(AUTH_KEY, username);
    fetchShipments();
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    setSyncStatus('syncing');
    try {
      await apiPost({ action: 'registerUser', username, password });
      await new Promise(r => setTimeout(r, 1500));
      await fetchUsers();
      setSyncStatus('success');
      return true;
    } catch (e) {
      setSyncStatus('error');
      return false;
    }
  };

  const handlePasswordChange = async (newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    setSyncStatus('syncing');
    try {
      await apiPost({ action: 'changePassword', username: currentUser, newPassword });
      await new Promise(r => setTimeout(r, 1500));
      await fetchUsers();
      setSyncStatus('success');
      return true;
    } catch (e) {
      setSyncStatus('error');
      return false;
    }
  };

  const handleAddShipment = (data: { date: string, quantity: number }) => {
    const newShipment: Shipment = {
      id: crypto.randomUUID(),
      number: `REM-${String(shipments.length + 1).padStart(4, '0')}`,
      sendDate: data.date,
      quantitySent: Number(data.quantity),
      status: ShipmentStatus.AWAITING,
      returns: []
    };
    setShipments(prev => [newShipment, ...prev]);
    setView('dashboard');
  };

  const handleDeleteShipment = (id: string) => {
    if (window.confirm("Deseja realmente excluir toda esta remessa e seus retornos?")) {
      setShipments(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSaveReturn = (shipmentId: string, event: ReturnEvent) => {
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        let updatedReturns;
        if (activeReturnId) {
          // Edição
          updatedReturns = s.returns.map(r => r.id === activeReturnId ? event : r);
        } else {
          // Novo
          updatedReturns = [...(s.returns || []), event];
        }

        const totalRet = updatedReturns.reduce((acc, r) => 
          acc + Number(r.reformed) + Number(r.repaired) + Number(r.exchanged) + Number(r.failed), 0);
        
        return { 
          ...s, 
          status: totalRet >= s.quantitySent ? ShipmentStatus.FINISHED : (totalRet > 0 ? ShipmentStatus.PARTIAL : ShipmentStatus.AWAITING), 
          returns: updatedReturns 
        };
      }
      return s;
    }));
    setActiveReturnId(null);
    setActiveShipmentId(null);
    setView('dashboard');
  };

  const handleDeleteReturn = (shipmentId: string, returnId: string) => {
    if (!window.confirm("Deseja realmente excluir este lançamento de retorno?")) return;
    
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        const updatedReturns = s.returns.filter(r => r.id !== returnId);
        const totalRet = updatedReturns.reduce((acc, r) => 
          acc + Number(r.reformed) + Number(r.repaired) + Number(r.exchanged) + Number(r.failed), 0);
        
        return {
          ...s,
          status: totalRet >= s.quantitySent ? ShipmentStatus.FINISHED : (totalRet > 0 ? ShipmentStatus.PARTIAL : ShipmentStatus.AWAITING),
          returns: updatedReturns
        };
      }
      return s;
    }));
  };

  if (!currentUser) return (
    <Login 
      onLogin={handleLogin} 
      onRegister={handleRegister} 
      validUsers={validUsers} 
      isLoading={loadingInitial} 
      darkMode={darkMode} 
    />
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} flex flex-col transition-colors duration-300 pb-20 md:pb-0`}>
      <header className="bg-red-700 dark:bg-red-900 text-white p-4 shadow-lg sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Disc className="w-7 h-7 animate-spin-slow" />
            <h1 className="text-xl font-bold tracking-tight">Controle de Reformas</h1>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center px-2">
              {syncStatus === 'syncing' && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
              {syncStatus === 'success' && <Check className="w-4 h-4 text-green-400" />}
              {syncStatus === 'error' && <AlertCircle className="w-4 h-4 text-yellow-400" />}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-red-600 rounded-full transition-colors">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            <button onClick={fetchShipments} className="p-2 hover:bg-red-600 rounded-full transition-colors"><RotateCcw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /></button>
            <button onClick={() => setView('settings')} className="p-2 hover:bg-red-600 rounded-full transition-colors"><Settings className="w-5 h-5" /></button>
            <button onClick={() => { setCurrentUser(null); localStorage.removeItem(AUTH_KEY); }} className="p-2 hover:bg-red-600 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 relative">
        {loadingInitial && !hasLoadedFromDB && shipments.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
             <Loader2 className="w-12 h-12 animate-spin text-red-600 mb-4" />
             <p className="text-slate-700 dark:text-slate-300 font-bold">Conectando ao Banco de Dados...</p>
          </div>
        )}
        
        {view === 'dashboard' && <Dashboard stats={stats} onNewShipment={() => setView('new')} onViewList={() => setView('list')} recentShipments={shipments.slice(0, 5)} onOpenReturn={(id) => {setActiveShipmentId(id); setView('return');}} />}
        
        {view === 'new' && (
          <ShipmentForm 
            onSave={handleAddShipment} 
            onCancel={() => { setView('dashboard'); }} 
          />
        )}
        
        {view === 'list' && (
          <ShipmentList 
            shipments={shipments} 
            onOpenReturn={(id) => {setActiveShipmentId(id); setView('return');}} 
            onEditReturn={(shipId, retId) => { setActiveShipmentId(shipId); setActiveReturnId(retId); setView('return'); }}
            onDeleteReturn={handleDeleteReturn}
            onDeleteShipment={handleDeleteShipment}
            onBack={() => setView('dashboard')} 
          />
        )}
        
        {view === 'return' && activeShipmentId && (
          <ReturnForm 
            shipment={shipments.find(s => s.id === activeShipmentId)!} 
            editData={activeReturnId ? shipments.find(s => s.id === activeShipmentId)?.returns.find(r => r.id === activeReturnId) : undefined}
            pendingBonuses={stats.pendingBonuses} 
            existingInvoiceNumbers={allInvoiceNumbers} 
            onSave={(e) => handleSaveReturn(activeShipmentId, e)} 
            onCancel={() => { setActiveShipmentId(null); setActiveReturnId(null); setView('list'); }} 
          />
        )}

        {view === 'settings' && (
          <PasswordChange 
            username={currentUser!} 
            validUsers={validUsers} 
            onSave={handlePasswordChange} 
            onCancel={() => setView('dashboard')} 
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 md:hidden flex justify-around items-center z-10 shadow-lg">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${view === 'dashboard' ? 'text-red-600' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Início</span>
        </button>
        <button onClick={() => setView('new')} className="bg-red-600 text-white p-3 rounded-full -mt-10 shadow-xl active:scale-90 transition-all border-4 border-slate-50 dark:border-slate-900">
          <Plus className="w-6 h-6" />
        </button>
        <button onClick={() => setView('list')} className={`flex flex-col items-center p-2 rounded-lg transition-colors ${view === 'list' ? 'text-red-600' : 'text-slate-400'}`}>
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Lista</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
