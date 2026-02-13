
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Settings
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
  const [view, setView] = useState<'dashboard' | 'new' | 'list' | 'return' | 'settings'>('dashboard');
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [showBonusAlert, setShowBonusAlert] = useState(false);
  const [lastBonusCount, setLastBonusCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [hasLoadedFromDB, setHasLoadedFromDB] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  // Busca lista de usuários
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers&t=${Date.now()}`);
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      const data = await response.json();
      if (Array.isArray(data)) {
        setValidUsers(data);
      }
    } catch (error) {
      console.warn("Usando usuários padrão:", error);
      setValidUsers([
        { username: "Éder", password: "1" },
        { username: "Wender", password: "1" },
        { username: "Kesley", password: "1" },
        { username: "Roberto", password: "1" }
      ]);
    }
  }, []);

  // BUSCA GLOBAL DE REMESSAS (O QUE RESOLVE O PROBLEMA DE COMPARTILHAMENTO)
  const fetchShipments = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getShipments&t=${Date.now()}`);
      if (!response.ok) throw new Error("Erro ao buscar dados remotos");
      const data = await response.json();
      
      let incoming: Shipment[] = [];
      if (data && Array.isArray(data.shipments)) {
        incoming = data.shipments;
      } else if (Array.isArray(data)) {
        incoming = data;
      }

      // Sanitização básica para evitar erros de renderização
      const sanitized = incoming.map(s => ({
        ...s,
        returns: Array.isArray(s.returns) ? s.returns : []
      }));

      setShipments(sanitized);
      setHasLoadedFromDB(true); // Marca que o app agora tem a versão "oficial" do banco
      setSyncStatus('success');
    } catch (error) {
      console.error("Erro na sincronização Master:", error);
      setSyncStatus('error');
      // Tenta recuperar do storage local como fallback apenas em erro de rede
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { setShipments(JSON.parse(saved)); } catch(e){}
      }
    } finally {
      setLoadingInitial(false);
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  }, []);

  // Inicialização
  useEffect(() => {
    const init = async () => {
      const savedUser = localStorage.getItem(AUTH_KEY);
      if (savedUser) setCurrentUser(savedUser);
      
      await fetchUsers();
      await fetchShipments(); // Puxa dados globais logo no início
    };
    init();
  }, [fetchUsers, fetchShipments]);

  // Dark Mode
  useEffect(() => {
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Efeito de Sincronização (PUSH para a nuvem)
  useEffect(() => {
    // SÓ envia para a nuvem se já tivermos carregado a versão global uma vez
    // Isso evita que o estado [] inicial apague o banco de dados remoto
    if (loadingInitial || !hasLoadedFromDB) return;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
    
    const syncWithSheets = async () => {
      setSyncStatus('syncing');
      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'syncShipments', shipments }),
        });
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (error) {
        setSyncStatus('error');
      }
    };

    const timeoutId = setTimeout(syncWithSheets, 1500); 
    return () => clearTimeout(timeoutId);
  }, [shipments, loadingInitial, hasLoadedFromDB]);

  // Cálculos de estatísticas
  const stats: BonusStats = useMemo(() => {
    let totalSent = 0;
    let totalReformed = 0;
    let totalRepaired = 0;
    let totalExchanged = 0;
    let totalFailed = 0;
    let totalBonusPaid = 0;

    (shipments || []).forEach(s => {
      totalSent += s.quantitySent;
      (s.returns || []).forEach(r => {
        totalReformed += r.reformed;
        totalRepaired += r.repaired;
        totalExchanged += r.exchanged;
        totalFailed += r.failed;
        totalBonusPaid += r.bonusesRedeemed || 0;
      });
    });

    const paidReforms = Math.max(0, totalReformed - totalBonusPaid);
    const totalEarned = Math.floor(paidReforms / 15);
    const pendingBonuses = Math.max(0, totalEarned - totalBonusPaid);

    return { 
      totalSent, totalReformed, totalRepaired, totalExchanged, totalFailed,
      totalBonusEarned: totalEarned, totalBonusPaid, pendingBonuses 
    };
  }, [shipments]);

  const allInvoiceNumbers = useMemo(() => {
    const numbers: string[] = [];
    (shipments || []).forEach(s => {
      (s.returns || []).forEach(r => {
        numbers.push(r.invoiceNumber.toLowerCase());
      });
    });
    return numbers;
  }, [shipments]);

  useEffect(() => {
    if (stats.pendingBonuses > lastBonusCount) {
      setShowBonusAlert(true);
      setLastBonusCount(stats.pendingBonuses);
    } else if (stats.pendingBonuses < lastBonusCount) {
      setLastBonusCount(stats.pendingBonuses);
    }
  }, [stats.pendingBonuses, lastBonusCount]);

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem(AUTH_KEY, username);
    fetchShipments(); // Força atualização ao logar
  };

  const handleRegister = async (username: string, password: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', user: { username, password } }),
      });
      setSyncStatus('success');
      await fetchUsers();
      return true;
    } catch (error) {
      setSyncStatus('error');
      return false;
    }
  };

  const handleChangePassword = async (newPassword: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      setSyncStatus('syncing');
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'changePassword', user: { username: currentUser, password: newPassword } }),
      });
      setSyncStatus('success');
      await fetchUsers();
      return true;
    } catch (error) {
      setSyncStatus('error');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_KEY);
    setView('dashboard');
  };

  const handleAddShipment = (data: { date: string, quantity: number }) => {
    const newShipment: Shipment = {
      id: crypto.randomUUID(),
      number: `REM-${String(shipments.length + 1).padStart(4, '0')}`,
      sendDate: data.date,
      quantitySent: data.quantity,
      status: ShipmentStatus.AWAITING,
      returns: []
    };
    setShipments(prev => [newShipment, ...prev]);
    setView('dashboard');
  };

  const handleRegisterReturn = (id: string, event: ReturnEvent) => {
    setShipments(prev => prev.map(s => {
      if (s.id === id) {
        const updatedReturns = [...s.returns, event];
        const totalReturnedCount = updatedReturns.reduce((acc, r) => 
          acc + r.reformed + r.repaired + r.exchanged + r.failed, 0);
        
        let newStatus = ShipmentStatus.PARTIAL;
        if (totalReturnedCount >= s.quantitySent) {
          newStatus = ShipmentStatus.FINISHED;
        }

        return { ...s, status: newStatus, returns: updatedReturns };
      }
      return s;
    }));
    setView('dashboard');
  };

  const openReturnForm = (id: string) => {
    setActiveShipmentId(id);
    setView('return');
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        onRegister={handleRegister}
        validUsers={validUsers} 
        isLoading={loadingInitial} 
        darkMode={darkMode}
      />
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-900' : 'bg-slate-50'} flex flex-col pb-20 md:pb-0 transition-colors duration-300`}>
      <header className="bg-red-700 dark:bg-red-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Disc className="w-7 h-7 animate-spin-slow" />
            <h1 className="text-xl font-bold tracking-tight">Controle de Reformas</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-red-600 dark:hover:bg-red-800 rounded-full transition-colors"
              title={darkMode ? "Modo Claro" : "Modo Escuro"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* BOTÃO DE REFRESH MANUAL */}
            <button 
              onClick={fetchShipments}
              className="p-2 hover:bg-red-600 dark:hover:bg-red-800 rounded-full transition-colors"
              title="Atualizar Dados"
            >
              <RotateCcw className={`w-5 h-5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            </button>

            {syncStatus !== 'idle' && (
              <div className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${
                syncStatus === 'syncing' ? 'bg-red-800/50 border-red-400/20 animate-pulse' :
                syncStatus === 'success' ? 'bg-green-500/20 border-green-400/40 text-green-100' :
                'bg-yellow-500/20 border-yellow-400/40 text-yellow-100'
              }`}>
                {syncStatus === 'syncing' && <CloudUpload className="w-3 h-3" />}
                {syncStatus === 'success' && <Check className="w-3 h-3" />}
                {syncStatus === 'error' && <AlertCircle className="w-3 h-3" />}
                <span className="hidden xs:inline">
                  {syncStatus === 'syncing' ? 'Sincronizando...' : 
                   syncStatus === 'success' ? 'Salvo' : 'Erro'}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
               <button 
                 onClick={() => setView('settings')}
                 className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-red-400/20 transition-colors ${view === 'settings' ? 'bg-white text-red-700' : 'bg-red-800/50 text-white'}`}
               >
                 <UserIcon className="w-3 h-3" />
                 <span className="hidden xs:inline">{currentUser}</span>
               </button>
            </div>

            <button onClick={handleLogout} className="p-2 hover:bg-red-600 dark:hover:bg-red-800 rounded-full transition-colors text-red-100" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 animate-in fade-in duration-500">
        {view === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            onNewShipment={() => setView('new')} 
            onViewList={() => setView('list')}
            recentShipments={shipments.slice(0, 5)}
            onOpenReturn={openReturnForm}
          />
        )}
        
        {view === 'new' && (
          <ShipmentForm onSave={handleAddShipment} onCancel={() => setView('dashboard')} />
        )}

        {view === 'list' && (
          <ShipmentList shipments={shipments} onOpenReturn={openReturnForm} onBack={() => setView('dashboard')} />
        )}

        {view === 'return' && activeShipmentId && (
          <ReturnForm 
            shipment={shipments.find(s => s.id === activeShipmentId)!}
            pendingBonuses={stats.pendingBonuses}
            existingInvoiceNumbers={allInvoiceNumbers}
            onSave={(event) => handleRegisterReturn(activeShipmentId, event)}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'settings' && (
          <PasswordChange 
            username={currentUser}
            validUsers={validUsers}
            onSave={handleChangePassword}
            onCancel={() => setView('dashboard')}
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-2 md:hidden flex justify-around items-center z-10 transition-colors">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'dashboard' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-xs">Início</span>
        </button>
        <button onClick={() => setView('new')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'new' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <div className="bg-red-600 dark:bg-red-700 text-white p-2 rounded-full -mt-8 shadow-lg ring-4 ring-slate-50 dark:ring-slate-900 transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs mt-1">Nova</span>
        </button>
        <button onClick={() => setView('list')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'list' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
          <History className="w-6 h-6" />
          <span className="text-xs">Histórico</span>
        </button>
      </nav>

      {showBonusAlert && (
        <BonusNotification availableCount={stats.pendingBonuses} onClose={() => setShowBonusAlert(false)} />
      )}
    </div>
  );
};

export default App;
