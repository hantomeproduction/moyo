import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Check, X, Settings, Users, Swords, PieChart, Calculator, ChevronRight, TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BOSSES, Difficulty } from '../data/bosses';

type Character = {
  id: string;
  name: string;
  isChecked: boolean;
  serverType: 'MAIN' | 'AETHER';
  bosses: Record<string, { difficulty: Difficulty; partySize: number }>;
};

const diffColors: Record<Difficulty, string> = {
  EASY: 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-neutral-700',
  NORMAL: 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/50',
  HARD: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800/50',
  CHAOS: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  EXTREME: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50',
};

const diffShort: Record<Difficulty, string> = {
  EASY: 'E', NORMAL: 'N', HARD: 'H', CHAOS: 'C', EXTREME: 'EX'
};

const PRESETS = [
  { name: '검밑솔', bosses: { papulatus: 'CHAOS', suu: 'HARD', demian: 'HARD', slime: 'CHAOS', lucid: 'HARD', will: 'HARD', dusk: 'CHAOS', jinhilla: 'HARD', dunkel: 'HARD' } as Record<string, Difficulty> },
  { name: '노세돌이', bosses: { papulatus: 'CHAOS', suu: 'HARD', demian: 'HARD', slime: 'CHAOS', lucid: 'HARD', will: 'HARD', dusk: 'CHAOS', jinhilla: 'HARD', dunkel: 'HARD', seren: 'NORMAL', kalos: 'EASY' } as Record<string, Difficulty> },
  { name: '이쌀돌이', bosses: { papulatus: 'CHAOS', suu: 'HARD', demian: 'HARD', slime: 'CHAOS', lucid: 'HARD', will: 'HARD', dusk: 'CHAOS', jinhilla: 'HARD', dunkel: 'HARD', seren: 'NORMAL', kalos: 'EASY', daejeokja: 'EASY' } as Record<string, Difficulty> },
  { name: '하세돌이', bosses: { papulatus: 'CHAOS', suu: 'HARD', demian: 'HARD', slime: 'CHAOS', lucid: 'HARD', will: 'HARD', dusk: 'CHAOS', jinhilla: 'HARD', dunkel: 'HARD', seren: 'HARD', kalos: 'EASY', daejeokja: 'EASY' } as Record<string, Difficulty> },
  { name: '익스우돌이', bosses: { suu: 'EXTREME', demian: 'HARD', slime: 'CHAOS', lucid: 'HARD', will: 'HARD', dusk: 'CHAOS', jinhilla: 'HARD', dunkel: 'HARD', seren: 'HARD', kalos: 'NORMAL', daejeokja: 'NORMAL', karing: 'EASY' } as Record<string, Difficulty> },
  { name: '+검마', bosses: { blackmage: 'HARD' } as Record<string, Difficulty> },
];

const CUBE_REWARDS: Record<string, Partial<Record<Difficulty, { bronze: number; silver: number; gold: number }>>> = {
  papulatus: { CHAOS: { bronze: 1, silver: 0, gold: 0 } },
  suu: { NORMAL: { bronze: 3, silver: 0, gold: 0 }, HARD: { bronze: 6, silver: 1, gold: 0 } },
  demian: { NORMAL: { bronze: 3, silver: 0, gold: 0 }, HARD: { bronze: 6, silver: 1, gold: 0 } },
  slime: { NORMAL: { bronze: 3, silver: 0, gold: 0 }, CHAOS: { bronze: 8, silver: 2, gold: 0 } },
  lucid: { EASY: { bronze: 3, silver: 0, gold: 0 }, NORMAL: { bronze: 5, silver: 0, gold: 0 }, HARD: { bronze: 8, silver: 2, gold: 0 } },
  will: { EASY: { bronze: 3, silver: 0, gold: 0 }, NORMAL: { bronze: 5, silver: 0, gold: 0 }, HARD: { bronze: 8, silver: 2, gold: 0 } },
  dusk: { NORMAL: { bronze: 5, silver: 0, gold: 0 }, CHAOS: { bronze: 8, silver: 2, gold: 0 } },
  jinhilla: { NORMAL: { bronze: 5, silver: 0, gold: 0 }, HARD: { bronze: 8, silver: 2, gold: 0 } },
  dunkel: { NORMAL: { bronze: 5, silver: 0, gold: 0 }, HARD: { bronze: 8, silver: 2, gold: 0 } },
  seren: { NORMAL: { bronze: 5, silver: 0, gold: 1 }, HARD: { bronze: 8, silver: 0, gold: 2 } },
  kalos: { EASY: { bronze: 8, silver: 0, gold: 2 } },
  daejeokja: { EASY: { bronze: 8, silver: 0, gold: 2 } },
  karing: { EASY: { bronze: 8, silver: 0, gold: 2 } },
  blackmage: { HARD: { bronze: 8, silver: 0, gold: 2 } },
};

const formatMeso = (amount: number) => {
  if (!amount) return '0';
  const uk = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);
  let result = '';
  if (uk > 0) result += `${uk}억 `;
  if (man > 0) result += `${man}만`;
  return result.trim() || amount.toLocaleString();
};

export default function BossCalculator() {
  const [characters, setCharacters] = useState<Character[]>(() => {
    const saved = localStorage.getItem('bossCalculatorCharacters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [activeCharId, setActiveCharId] = useState<string | null>(() => {
    return localStorage.getItem('bossCalculatorActiveCharId') || null;
  });
  const [newCharName, setNewCharName] = useState('');
  const [newCharServer, setNewCharServer] = useState<'MAIN' | 'AETHER'>('MAIN');

  const [prices, setPrices] = useState(() => {
    const saved = localStorage.getItem('bossCalculatorPrices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { mainMapo: 0, aetherMapo: 0, mainEom: 0, aetherEom: 0 };
      }
    }
    return { mainMapo: 0, aetherMapo: 0, mainEom: 0, aetherEom: 0 };
  });

  useEffect(() => {
    localStorage.setItem('bossCalculatorCharacters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('bossCalculatorPrices', JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    if (activeCharId) {
      localStorage.setItem('bossCalculatorActiveCharId', activeCharId);
    } else {
      localStorage.removeItem('bossCalculatorActiveCharId');
    }
  }, [activeCharId]);

  const handleAddChar = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newCharName.trim()) return;
    const newChar: Character = {
      id: Date.now().toString(),
      name: newCharName.trim(),
      isChecked: true,
      serverType: newCharServer,
      bosses: {}
    };
    setCharacters([...characters, newChar]);
    setNewCharName('');
    if (!activeCharId) setActiveCharId(newChar.id);
  };

  const handleToggleBoss = (bossId: string, diff: Difficulty) => {
    if (!activeCharId) return;
    setCharacters(chars => chars.map(char => {
      if (char.id !== activeCharId) return char;
      const newBosses = { ...char.bosses };
      if (newBosses[bossId]?.difficulty === diff) {
        delete newBosses[bossId];
      } else {
        newBosses[bossId] = { difficulty: diff, partySize: newBosses[bossId]?.partySize || 1 };
      }
      return { ...char, bosses: newBosses };
    }));
  };

  const handleChangePartySize = (bossId: string, size: number) => {
    if (!activeCharId) return;
    setCharacters(chars => chars.map(char => {
      if (char.id !== activeCharId) return char;
      const newBosses = { ...char.bosses };
      if (newBosses[bossId]) {
        newBosses[bossId].partySize = size;
      }
      return { ...char, bosses: newBosses };
    }));
  };

  const applyPreset = (presetBosses: Record<string, Difficulty>, isAdditive: boolean = false) => {
    if (!activeCharId) return;
    setCharacters(chars => chars.map(char => {
      if (char.id !== activeCharId) return char;
      const newBosses: Record<string, { difficulty: Difficulty; partySize: number }> = isAdditive ? { ...char.bosses } : {};
      Object.entries(presetBosses).forEach(([bId, diff]) => {
        newBosses[bId] = { difficulty: diff, partySize: 1 };
      });
      return { ...char, bosses: newBosses };
    }));
  };

  const getCharWeeklyProfit = (char: Character) => {
    let total = 0;
    Object.entries(char.bosses).forEach(([bossId, data]) => {
      const boss = BOSSES.find(b => b.id === bossId);
      if (boss && boss.type !== 'MONTHLY') {
        const diffData = boss.difficulties.find(d => d.level === data.difficulty);
        if (diffData) {
          total += Math.floor(diffData.price / data.partySize);
        }
      }
    });
    return total;
  };

  const getCharMonthlyBossProfit = (char: Character) => {
    let total = 0;
    Object.entries(char.bosses).forEach(([bossId, data]) => {
      const boss = BOSSES.find(b => b.id === bossId);
      if (boss && boss.type === 'MONTHLY') {
        const diffData = boss.difficulties.find(d => d.level === data.difficulty);
        if (diffData) {
          total += Math.floor(diffData.price / data.partySize);
        }
      }
    });
    return total;
  };

  const totalWeeklyProfit = useMemo(() => {
    return characters.filter(c => c.isChecked).reduce((sum, char) => sum + getCharWeeklyProfit(char), 0);
  }, [characters]);

  const totalMonthlyProfit = useMemo(() => {
    const weeklySum = characters.filter(c => c.isChecked).reduce((sum, char) => sum + getCharWeeklyProfit(char), 0);
    const monthlyBossSum = characters.filter(c => c.isChecked).reduce((sum, char) => sum + getCharMonthlyBossProfit(char), 0);
    return (weeklySum * 4) + monthlyBossSum;
  }, [characters]);

  const totalCubes = useMemo(() => {
    const checkedChars = characters.filter(c => c.isChecked);
    let bronze = 0;
    let silver = 0;
    let gold = 0;

    checkedChars.forEach(char => {
      Object.entries(char.bosses).forEach(([bossId, data]: [string, any]) => {
        const rewards = CUBE_REWARDS[bossId]?.[data.difficulty];
        if (rewards) {
          bronze += rewards.bronze;
          silver += rewards.silver;
          gold += rewards.gold;
        }
      });
    });

    return { bronze, silver, gold };
  }, [characters]);

  const getBossCountDisplay = (bosses: Record<string, any>) => {
    const keys = Object.keys(bosses);
    const hasBlackMage = keys.includes('blackmage');
    const count = keys.length;
    if (hasBlackMage) {
      if (count === 1) return '+검마';
      return `${count - 1}마리 +검마`;
    }
    return `${count}마리`;
  };

  const handlePriceChange = (field: keyof typeof prices, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    setPrices(prev => ({ ...prev, [field]: isNaN(num) ? 0 : num }));
  };

  const mainWeeklyProfit = characters.filter(c => c.isChecked && c.serverType === 'MAIN').reduce((sum, char) => sum + getCharWeeklyProfit(char), 0);
  const aetherWeeklyProfit = characters.filter(c => c.isChecked && c.serverType === 'AETHER').reduce((sum, char) => sum + getCharWeeklyProfit(char), 0);

  const mainWeeklyMapo = Math.floor((mainWeeklyProfit / 100000000) * prices.mainMapo);
  const mainWeeklyEom = Math.floor((mainWeeklyProfit / 100000000) * prices.mainEom);
  const aetherWeeklyMapo = Math.floor((aetherWeeklyProfit / 100000000) * prices.aetherMapo);
  const aetherWeeklyEom = Math.floor((aetherWeeklyProfit / 100000000) * prices.aetherEom);

  const totalWeeklyMapo = mainWeeklyMapo + aetherWeeklyMapo;
  const totalWeeklyEom = mainWeeklyEom + aetherWeeklyEom;

  const getCharMonthlyTotalProfit = (char: Character) => (getCharWeeklyProfit(char) * 4) + getCharMonthlyBossProfit(char);
  const mainMonthlyProfit = characters.filter(c => c.isChecked && c.serverType === 'MAIN').reduce((sum, char) => sum + getCharMonthlyTotalProfit(char), 0);
  const aetherMonthlyProfit = characters.filter(c => c.isChecked && c.serverType === 'AETHER').reduce((sum, char) => sum + getCharMonthlyTotalProfit(char), 0);

  const mainMonthlyMapo = Math.floor((mainMonthlyProfit / 100000000) * prices.mainMapo);
  const mainMonthlyEom = Math.floor((mainMonthlyProfit / 100000000) * prices.mainEom);
  const aetherMonthlyMapo = Math.floor((aetherMonthlyProfit / 100000000) * prices.aetherMapo);
  const aetherMonthlyEom = Math.floor((aetherMonthlyProfit / 100000000) * prices.aetherEom);

  const totalMonthlyMapo = mainMonthlyMapo + aetherMonthlyMapo;
  const totalMonthlyEom = mainMonthlyEom + aetherMonthlyEom;

  const activeCharacter = characters.find(c => c.id === activeCharId);

  return (
    <div className="flex flex-col gap-8 font-sans w-full mx-auto text-slate-800 dark:text-neutral-100 transition-colors pb-20">
      
      {/* 시세 설정 (Premium Top Bar) */}
      <div 
        className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-slate-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row lg:items-center gap-6 transition-all"
      >
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow-inner">
            <Settings size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white tracking-tight">시세 설정</h3>
            <p className="text-slate-500 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-widest">1억당 가격</p>
          </div>
        </div>
        
        <div className="hidden lg:block w-px h-10 bg-slate-200 dark:bg-neutral-800"></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          {[
            { id: 'mainMapo', label: '본섭 메포', color: 'indigo' },
            { id: 'mainEom', label: '본섭 무통', color: 'emerald' },
            { id: 'aetherMapo', label: '에헬 메포', color: 'indigo' },
            { id: 'aetherEom', label: '에헬 무통', color: 'emerald' },
          ].map((item) => (
            <div key={item.id} className="group">
              <label className={`text-[11px] font-black uppercase tracking-widest mb-1.5 block ${item.color === 'indigo' ? 'text-indigo-500' : 'text-emerald-500'}`}>
                {item.label}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={prices[item.id as keyof typeof prices] ? prices[item.id as keyof typeof prices].toLocaleString() : ''} 
                  onChange={e => handlePriceChange(item.id as keyof typeof prices, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white"
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400 dark:text-neutral-600">KRW</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1. 캐릭터 관리 (Sidebar) */}
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-3 flex flex-col min-h-[800px] shadow-lg shadow-slate-200/30 dark:shadow-none transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-indigo-500" />
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-sm">캐릭터 목록</h3>
              </div>
              <span className="bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                {characters.length}
              </span>
            </div>
            
            <form onSubmit={handleAddChar} className="space-y-2 mb-4">
              <div className="flex bg-slate-100 dark:bg-neutral-950 rounded-lg p-0.5 border border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNewCharServer('MAIN')}
                  className={`flex-1 text-[10px] font-black py-1.5 rounded-lg transition-all uppercase tracking-widest ${newCharServer === 'MAIN' ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400'}`}
                >
                  본섭
                </button>
                <button
                  type="button"
                  onClick={() => setNewCharServer('AETHER')}
                  className={`flex-1 text-[10px] font-black py-1.5 rounded-lg transition-all uppercase tracking-widest ${newCharServer === 'AETHER' ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400 dark:text-neutral-600 hover:text-slate-600 dark:hover:text-neutral-400'}`}
                >
                  에헬
                </button>
              </div>
              <div className="relative group">
                <input 
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg pl-3 pr-10 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-700 transition-all" 
                  placeholder="캐릭터 이름..." 
                  value={newCharName} 
                  onChange={e => setNewCharName(e.target.value)} 
                />
                <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-neutral-900 p-1.5 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md">
                  <Plus size={14} />
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              {characters.map(char => (
                <div 
                  key={char.id} 
                  onClick={() => setActiveCharId(char.id)} 
                  className={`group p-2 rounded-lg cursor-pointer transition-all relative flex items-center gap-3 border-2 ${activeCharId === char.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500 shadow-md shadow-indigo-500/10' : 'bg-white dark:bg-neutral-900 border-transparent hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:border-slate-100 dark:hover:border-neutral-800'}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`w-1 h-1 rounded-full ${char.serverType === 'MAIN' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                      <span className={`font-black text-xs truncate ${activeCharId === char.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-neutral-400'}`}>{char.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-neutral-600 uppercase tracking-tighter">
                      <div className="flex items-center gap-1">
                        <Target size={9} />
                        {getBossCountDisplay(char.bosses)}
                      </div>
                      <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-neutral-700" />
                      <span className={char.serverType === 'MAIN' ? 'text-indigo-500/80' : 'text-emerald-500/80'}>
                        {char.serverType === 'MAIN' ? '본섭' : '에헬'}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setCharacters(chars => chars.filter(c => c.id !== char.id));
                      if (activeCharId === char.id) setActiveCharId(null);
                    }} 
                    className="text-slate-300 dark:text-neutral-700 hover:text-rose-500 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {characters.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-neutral-700 text-[11px] gap-3 py-10">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-neutral-950 rounded-lg flex items-center justify-center">
                    <Users size={24} className="opacity-20" />
                  </div>
                  <span className="font-bold uppercase tracking-widest">캐릭터가 없습니다</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. 보스 선택 (Main Content) */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col min-h-[800px] shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center shadow-inner">
                <Swords size={20} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">보스 선택</h3>
                {activeCharacter ? (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{activeCharacter.name}</span>
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-neutral-700" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">{activeCharacter.serverType === 'MAIN' ? '본섭' : '에헬'}</span>
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-neutral-600 text-[10px] font-bold uppercase tracking-widest mt-0.5">캐릭터를 선택해주세요</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              <button 
                onClick={() => applyPreset({})}
                disabled={!activeCharId}
                className="bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 text-[10px] font-black px-3 py-2 rounded-lg transition-all border border-rose-100 dark:border-rose-900/30 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                초기화
              </button>
              <div className="w-px h-6 bg-slate-200 dark:bg-neutral-800 mx-0.5 hidden sm:block" />
              {PRESETS.map(preset => (
                <button 
                  key={preset.name}
                  onClick={() => applyPreset(preset.bosses, preset.name.startsWith('+'))}
                  disabled={!activeCharId}
                  className="bg-slate-50 dark:bg-neutral-950 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-neutral-400 text-[10px] font-black px-3 py-2 rounded-lg transition-all border border-slate-200 dark:border-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          
          {!activeCharId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-neutral-700 gap-6 bg-slate-50/50 dark:bg-neutral-950/50 rounded-xl border border-dashed border-slate-100 dark:border-neutral-900">
              <div className="w-20 h-20 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-xl">
                <Target size={40} className="opacity-20" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-black uppercase tracking-[0.2em] text-sm">대기 중</p>
                <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-600 uppercase tracking-widest">캐릭터를 선택해주세요</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 pr-2 space-y-1">
              <div className="grid grid-cols-[140px_1fr_80px_100px] gap-4 px-4 py-2 text-[11px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-[0.15em] border-b border-slate-100 dark:border-neutral-800/50 mb-2 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <div>보스</div>
                <div>난이도</div>
                <div className="text-center">인원수</div>
                <div className="text-right">수익</div>
              </div>
              {BOSSES.map(boss => {
                const activeChar = characters.find(c => c.id === activeCharId);
                const selectedDiff = activeChar?.bosses[boss.id]?.difficulty;
                const partySize = activeChar?.bosses[boss.id]?.partySize || 1;
                const price = selectedDiff ? Math.floor((boss.difficulties.find(d => d.level === selectedDiff)?.price || 0) / partySize) : 0;

                return (
                  <div 
                    key={boss.id} 
                    className={`grid grid-cols-[140px_1fr_80px_100px] gap-4 items-center px-4 py-2 rounded-xl transition-all border ${selectedDiff ? 'bg-slate-50/50 dark:bg-neutral-800/20 border-slate-100 dark:border-neutral-800/50 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50/30 dark:hover:bg-neutral-800/10'}`}
                  >
                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm">
                      <button 
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${selectedDiff ? 'bg-indigo-600 dark:bg-white border-indigo-600 dark:border-white text-white dark:text-neutral-900 shadow-lg shadow-indigo-500/20' : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-indigo-400 dark:hover:border-neutral-600'}`} 
                        onClick={() => {
                          if (selectedDiff) {
                            handleToggleBoss(boss.id, selectedDiff);
                          } else {
                            handleToggleBoss(boss.id, boss.difficulties[0].level);
                          }
                        }}
                      >
                        {selectedDiff && <Check size={14} strokeWidth={4} />}
                      </button>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate leading-tight">{boss.name}</span>
                        {boss.type === 'MONTHLY' && (
                          <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest mt-0.5">월간 보스</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 overflow-x-auto no-scrollbar py-1">
                      {boss.difficulties.map(d => (
                        <button 
                          key={d.level} 
                          onClick={() => handleToggleBoss(boss.id, d.level)} 
                          className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all shrink-0 uppercase tracking-widest ${selectedDiff === d.level ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-slate-400 dark:text-neutral-600 hover:border-slate-200 dark:hover:border-neutral-700'}`}
                        >
                          {diffShort[d.level]}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <div className="relative w-full group">
                        <select 
                          value={partySize} 
                          onChange={(e) => handleChangePartySize(boss.id, Number(e.target.value))}
                          disabled={!selectedDiff}
                          className="w-full bg-white dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800 rounded-xl px-2 py-2 text-[11px] font-black text-slate-700 dark:text-neutral-300 disabled:opacity-20 outline-none focus:border-indigo-500 dark:focus:border-neutral-600 transition-all cursor-pointer appearance-none text-center shadow-sm"
                        >
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}인</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 dark:text-neutral-700 group-hover:text-indigo-500 transition-colors">
                          <ChevronRight size={10} className="rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className={`text-right text-xs font-black font-mono tracking-tighter ${selectedDiff ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-neutral-800'}`}>
                      {selectedDiff ? formatMeso(price) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. 정산 및 환산 (Right Column) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-4 min-h-[800px]">
          {/* 총 수익 요약 */}
          <div className="bg-slate-900 dark:bg-neutral-900 rounded-lg p-4 shadow-xl shadow-indigo-500/20 flex flex-col shrink-0 text-white relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-24 h-24 bg-indigo-500/20 blur-[30px] rounded-full" />
            
            <div className="relative z-10">
              <div className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">주간 총 수익</div>
              <div className="text-2xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                {formatMeso(totalWeeklyProfit)} 메소
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-300/40 border-b border-white/5 pb-1.5">
                  <span>월간 예상 수익</span>
                  <span className="text-indigo-400">4주 기준</span>
                </div>
                <div className="text-lg font-black text-white tracking-tight">
                  {formatMeso(totalMonthlyProfit)} 메소
                </div>
              </div>
              
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1.5 custom-scrollbar-light">
                {characters.map(char => (
                  <div key={char.id} className={`flex items-center justify-between group ${char.isChecked ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="flex items-center gap-2 overflow-hidden">
                      <button 
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${char.isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`} 
                        onClick={() => {
                          setCharacters(chars => chars.map(c => c.id === char.id ? { ...c, isChecked: !c.isChecked } : c));
                        }}
                      >
                        {char.isChecked && <Check size={8} className="text-white" strokeWidth={4} />}
                      </button>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate text-[11px] font-bold text-indigo-100/80">{char.name}</span>
                        <span className={`text-[8px] font-black px-1 rounded-[2px] ${char.serverType === 'MAIN' ? 'bg-indigo-500/30 text-indigo-200' : 'bg-emerald-500/30 text-emerald-200'}`}>
                          {char.serverType === 'MAIN' ? '본섭' : '에헬'}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-[11px] text-white/90 font-mono tracking-tighter">{formatMeso(getCharWeeklyProfit(char))} 메소</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 환산 결과 */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col transition-all shrink-0">
            <div className="flex items-center gap-2.5 mb-6 shrink-0">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shadow-inner">
                <Calculator size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-base">환산 메포 계산기</h3>
            </div>

            <div className="flex flex-col gap-6">
              {/* 주간 환산 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-[0.2em]">주간 정산</h4>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-neutral-800 mx-3" />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <ConversionRow label="본섭" mapo={mainWeeklyMapo} eom={mainWeeklyEom} color="indigo" />
                  <ConversionRow label="에헬" mapo={aetherWeeklyMapo} eom={aetherWeeklyEom} color="emerald" />
                </div>
                
                <div className="bg-slate-900 dark:bg-neutral-800 p-3 rounded-lg flex justify-between items-center shadow-md shadow-slate-900/20 border border-white/5">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">주간 합계</div>
                  <div className="flex gap-3">
                    <div className="text-right">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">메포</div>
                      <div className="text-[13px] font-black text-white font-mono">{totalWeeklyMapo.toLocaleString()} 메포</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">무통</div>
                      <div className="text-[13px] font-black text-white font-mono">{totalWeeklyEom.toLocaleString()} 원</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 월간 환산 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-[0.2em]">월간 정산</h4>
                  <div className="h-px flex-1 bg-slate-100 dark:border-neutral-800 mx-3" />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <ConversionRow label="본섭" mapo={mainMonthlyMapo} eom={mainMonthlyEom} color="indigo" />
                  <ConversionRow label="에헬" mapo={aetherMonthlyMapo} eom={aetherMonthlyEom} color="emerald" />
                </div>

                <div className="bg-indigo-600 dark:bg-indigo-500 p-3 rounded-lg flex justify-between items-center shadow-md shadow-indigo-500/20 border border-white/5">
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">월간 합계</div>
                  <div className="flex gap-3">
                    <div className="text-right">
                      <div className="text-[9px] font-black text-indigo-200 uppercase tracking-tighter">메포</div>
                      <div className="text-[13px] font-black text-white font-mono">{totalMonthlyMapo.toLocaleString()} 메포</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-black text-indigo-200 uppercase tracking-tighter">무통</div>
                      <div className="text-[13px] font-black text-white font-mono">{totalMonthlyEom.toLocaleString()} 원</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메멘토 큐브 획득 갯수 */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg p-4 shadow-lg shadow-slate-200/50 dark:shadow-none flex-1 flex flex-col transition-all">
            <div className="flex items-center gap-2.5 mb-6 shrink-0">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shadow-inner">
                <Zap size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-base">큐브 전체 갯수</h3>
            </div>
            <div className="space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
              <CubeItem icon="🥉" label="메멘토 브론즈" count={totalCubes.bronze} />
              <CubeItem icon="🥈" label="메멘토 실버" count={totalCubes.silver} />
              <CubeItem icon="🥇" label="메멘토 골드" count={totalCubes.gold} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionRow({ label, mapo, eom, color }: { label: string, mapo: number, eom: number, color: 'indigo' | 'emerald' }) {
  return (
    <div className={`p-3 rounded-xl border transition-all ${color === 'indigo' ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-50 dark:border-indigo-900/20' : 'bg-emerald-50/30 dark:bg-emerald-900/10 border-emerald-50 dark:border-emerald-900/20'}`}>
      <div className="text-[12px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${color === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
        {label}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-tighter mb-0.5">메포</div>
          <div className="text-base font-black text-slate-900 dark:text-white font-mono tracking-tighter">{mapo.toLocaleString()} 메포</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-tighter mb-0.5">무통</div>
          <div className="text-base font-black text-slate-900 dark:text-white font-mono tracking-tighter">{eom.toLocaleString()} 원</div>
        </div>
      </div>
    </div>
  );
}

function CubeItem({ icon, label, count }: { icon: string, label: string, count: number }) {
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-100 dark:border-neutral-800 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center text-sm shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[13px] font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{count} 개</span>
    </div>
  );
}
