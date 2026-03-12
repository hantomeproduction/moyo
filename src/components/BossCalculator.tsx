import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Check, X, Settings, Users, Swords, PieChart, Calculator, ChevronRight } from 'lucide-react';
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
];

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

  const applyPreset = (presetBosses: Record<string, Difficulty>) => {
    if (!activeCharId) return;
    setCharacters(chars => chars.map(char => {
      if (char.id !== activeCharId) return char;
      const newBosses: Record<string, { difficulty: Difficulty; partySize: number }> = {};
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
    <div className="flex flex-col gap-6 font-sans animate-in fade-in duration-300 w-full mx-auto text-slate-800 dark:text-neutral-100 transition-colors">
      
      {/* 시세 설정 (Compact Top Bar) */}
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 transition-colors">
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-100 dark:bg-neutral-800 p-2 rounded-lg">
            <Settings size={18} className="text-slate-600 dark:text-neutral-400" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-neutral-100">시세 설정</h3>
          <span className="text-slate-500 dark:text-neutral-500 text-xs ml-2 hidden sm:inline">1억 메소 당 가격</span>
        </div>
        
        <div className="hidden lg:block w-px h-8 bg-slate-200 dark:bg-neutral-800"></div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {[
            { id: 'mainMapo', label: '본섭 메포', color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'mainEom', label: '본섭 엄', color: 'text-emerald-600 dark:text-emerald-400' },
            { id: 'aetherMapo', label: '에헬 메포', color: 'text-indigo-600 dark:text-indigo-400' },
            { id: 'aetherEom', label: '에헬 엄', color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => (
            <div key={item.id} className="flex flex-col gap-1">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${item.color}`}>{item.label}</label>
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-400 dark:focus-within:ring-indigo-500 transition-all">
                <input 
                  type="text" 
                  value={prices[item.id as keyof typeof prices] ? prices[item.id as keyof typeof prices].toLocaleString() : ''} 
                  onChange={e => handlePriceChange(item.id as keyof typeof prices, e.target.value)}
                  className="w-full bg-transparent text-slate-900 dark:text-neutral-100 font-semibold text-sm focus:outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600"
                  placeholder="0"
                />
                <span className="text-slate-500 dark:text-neutral-500 text-xs font-medium">원</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. 캐릭터 관리 (Sidebar) */}
        <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col h-[1400px] shadow-sm transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-slate-600 dark:text-neutral-400" />
              <h3 className="font-bold text-slate-800 dark:text-neutral-100">캐릭터 목록</h3>
              <span className="bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 font-semibold text-xs px-2 py-0.5 rounded-full ml-auto">
                {characters.length}
              </span>
            </div>
            
            <form onSubmit={handleAddChar} className="flex flex-col gap-2 mb-4">
              <div className="flex bg-slate-100 dark:bg-neutral-900 rounded-lg p-1 border border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNewCharServer('MAIN')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${newCharServer === 'MAIN' ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 shadow-sm' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300'}`}
                >
                  본섭
                </button>
                <button
                  type="button"
                  onClick={() => setNewCharServer('AETHER')}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${newCharServer === 'AETHER' ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 shadow-sm' : 'text-slate-500 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300'}`}
                >
                  에헬
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-500 text-slate-800 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 transition-all" 
                  placeholder="새 캐릭터 이름" 
                  value={newCharName} 
                  onChange={e => setNewCharName(e.target.value)} 
                />
                <button type="submit" className="bg-slate-800 dark:bg-zinc-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-neutral-900 p-2 rounded-lg transition-colors shadow-sm shrink-0">
                  <Plus size={18} />
                </button>
              </div>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {characters.map(char => (
                <div 
                  key={char.id} 
                  onClick={() => setActiveCharId(char.id)} 
                  className={`p-3 rounded-xl cursor-pointer transition-all relative group flex items-center gap-3 border ${activeCharId === char.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-sm' : 'bg-white dark:bg-neutral-900 border-transparent hover:bg-slate-50 dark:hover:bg-neutral-800/50 hover:border-slate-200 dark:hover:border-neutral-700'}`}
                >
                  <div className={`w-1 h-8 rounded-full ${activeCharId === char.id ? 'bg-indigo-500' : 'bg-transparent'}`}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${char.serverType === 'MAIN' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'}`}>
                        {char.serverType === 'MAIN' ? '본섭' : '에헬'}
                      </span>
                      <span className={`font-bold truncate ${activeCharId === char.id ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-700 dark:text-neutral-300'}`}>{char.name}</span>
                    </div>
                    <div className="text-xs mt-1 text-slate-500 dark:text-neutral-500 font-medium">
                      보스 {Object.keys(char.bosses).length}마리
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setCharacters(chars => chars.filter(c => c.id !== char.id));
                      if (activeCharId === char.id) setActiveCharId(null);
                    }} 
                    className="text-slate-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {characters.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-neutral-500 text-sm gap-2">
                  <Users size={24} className="opacity-50" />
                  <span>캐릭터를 추가해주세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. 보스 선택 (Main Content) */}
        <div className="lg:col-span-6 xl:col-span-7 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col h-[1400px] shadow-sm transition-colors">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg shrink-0">
                <Swords size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-neutral-100 whitespace-nowrap">
                  보스 토벌
                </h3>
                {activeCharacter && (
                  <>
                    <ChevronRight size={14} className="text-slate-400 dark:text-neutral-500 shrink-0" />
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[150px] sm:max-w-[200px]">{activeCharacter.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              <button 
                onClick={() => applyPreset({})}
                disabled={!activeCharId}
                className="bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-red-200 dark:border-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mr-1"
              >
                초기화
              </button>
              {PRESETS.map(preset => (
                <button 
                  key={preset.name}
                  onClick={() => applyPreset(preset.bosses)}
                  disabled={!activeCharId}
                  className="bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          
          {!activeCharId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-neutral-500 text-sm gap-3 bg-slate-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800">
              <Swords size={32} className="opacity-30" />
              <span>좌측에서 캐릭터를 선택해주세요</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="grid grid-cols-[110px_1fr_70px_90px] gap-3 px-4 py-2 text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider border-b border-slate-200 dark:border-neutral-800/50 mb-2 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <div>보스</div>
                <div>난이도</div>
                <div className="text-center">파티원</div>
                <div className="text-right">수익</div>
              </div>
              {BOSSES.map(boss => {
                const activeChar = characters.find(c => c.id === activeCharId);
                const selectedDiff = activeChar?.bosses[boss.id]?.difficulty;
                const partySize = activeChar?.bosses[boss.id]?.partySize || 1;
                const price = selectedDiff ? Math.floor((boss.difficulties.find(d => d.level === selectedDiff)?.price || 0) / partySize) : 0;

                return (
                  <div key={boss.id} className={`grid grid-cols-[110px_1fr_70px_90px] gap-3 items-center px-4 py-3 rounded-xl transition-colors border ${selectedDiff ? 'bg-slate-50 dark:bg-neutral-800/30 border-slate-200 dark:border-neutral-700/50 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50/50 dark:hover:bg-neutral-800/20'}`}>
                    <div className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-2 text-sm">
                      <div 
                        className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${selectedDiff ? 'bg-indigo-600 dark:bg-zinc-100 border-indigo-600 dark:border-zinc-100 text-white dark:text-neutral-900 shadow-sm' : 'border-slate-300 dark:border-zinc-600 bg-white dark:bg-neutral-900 hover:border-indigo-400 dark:hover:border-zinc-400'}`} 
                        onClick={() => {
                          if (selectedDiff) {
                            handleToggleBoss(boss.id, selectedDiff);
                          } else {
                            handleToggleBoss(boss.id, boss.difficulties[0].level);
                          }
                        }}
                      >
                        {selectedDiff && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className="truncate flex-1">{boss.name}</span>
                      {boss.type === 'MONTHLY' && (
                        <span className="text-[8px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded font-bold shrink-0">월간</span>
                      )}
                    </div>
                    <div className="flex flex-row gap-1.5 overflow-x-auto no-scrollbar">
                      {boss.difficulties.map(d => (
                        <button 
                          key={d.level} 
                          onClick={() => handleToggleBoss(boss.id, d.level)} 
                          className={`text-[10px] font-bold px-2 py-1 rounded border transition-all shrink-0 ${selectedDiff === d.level ? diffColors[d.level] + ' shadow-sm' : 'border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-500 hover:border-slate-300 dark:hover:border-neutral-600 hover:text-slate-700 dark:hover:text-neutral-300'}`}
                        >
                          {diffShort[d.level]}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <select 
                        value={partySize} 
                        onChange={(e) => handleChangePartySize(boss.id, Number(e.target.value))}
                        disabled={!selectedDiff}
                        className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-1 py-1.5 text-xs font-bold text-slate-700 dark:text-neutral-300 disabled:opacity-30 outline-none w-full focus:border-indigo-500 dark:focus:border-neutral-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-neutral-500 transition-all cursor-pointer appearance-none text-center shadow-sm"
                      >
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}인</option>)}
                      </select>
                    </div>
                    <div className={`text-right text-sm font-bold truncate ${selectedDiff ? 'text-slate-800 dark:text-neutral-200' : 'text-slate-400 dark:text-neutral-500'}`}>
                      {selectedDiff ? formatMeso(price) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. 정산 및 환산 (Right Column) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-6 h-[1400px]">
          
          {/* 총 수익 요약 */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col shrink-0 transition-colors">
            <div className="text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2">총 주간 메소 수익</div>
            <div className="text-3xl font-black text-slate-900 dark:text-neutral-100 tracking-tight mb-4">{formatMeso(totalWeeklyProfit)}</div>

            <div className="text-slate-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2 border-t border-slate-100 dark:border-neutral-800 pt-4">총 월간 메소 수익 (4주)</div>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight mb-4">{formatMeso(totalMonthlyProfit)}</div>
            
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700">
              {characters.map(char => (
                <div key={char.id} className={`flex items-center justify-between text-sm ${char.isChecked ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div 
                      className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${char.isChecked ? 'bg-slate-800 dark:bg-zinc-500 border-slate-800 dark:border-zinc-500' : 'border-slate-300 dark:border-neutral-700'}`} 
                      onClick={() => {
                        setCharacters(chars => chars.map(c => c.id === char.id ? { ...c, isChecked: !c.isChecked } : c));
                      }}
                    >
                      {char.isChecked && <Check size={10} className="text-white dark:text-neutral-900" strokeWidth={3} />}
                    </div>
                    <span className="truncate font-medium text-slate-700 dark:text-neutral-300">{char.name}</span>
                  </div>
                  <span className="font-bold text-slate-600 dark:text-neutral-400 shrink-0">{formatMeso(getCharWeeklyProfit(char))}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 환산 결과 */}
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex-1 flex flex-col transition-colors min-h-0">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                <Calculator size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-neutral-100">환산 결과</h3>
            </div>

            <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* 주간 환산 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-neutral-800 pb-2">주간 환산</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* 본섭 주간 */}
                  <div className="bg-indigo-50/50 dark:bg-neutral-900/50 border border-indigo-100 dark:border-neutral-800/80 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 본섭
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">메포</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{mainWeeklyMapo.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">엄</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{mainWeeklyEom.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {/* 에헬 주간 */}
                  <div className="bg-emerald-50/50 dark:bg-neutral-900/50 border border-emerald-100 dark:border-neutral-800/80 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 에헬
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">메포</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{aetherWeeklyMapo.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">엄</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{aetherWeeklyEom.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 주간 총합 */}
                <div className="bg-slate-100 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 flex justify-between items-center">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">주간 총합</div>
                  <div className="flex gap-4">
                    <div className="flex items-end gap-1.5">
                      <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold mb-0.5">메포</span>
                      <span className="text-sm font-black text-slate-800 dark:text-neutral-100">{totalWeeklyMapo.toLocaleString()}</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold mb-0.5">엄</span>
                      <span className="text-sm font-black text-slate-800 dark:text-neutral-100">{totalWeeklyEom.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 월간 환산 */}
              <div className="space-y-3 mt-2">
                <h4 className="text-sm font-bold text-slate-700 dark:text-neutral-300 border-b border-slate-200 dark:border-neutral-800 pb-2">월간 환산 (4주)</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* 본섭 월간 */}
                  <div className="bg-indigo-50/50 dark:bg-neutral-900/50 border border-indigo-100 dark:border-neutral-800/80 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> 본섭
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">메포</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{mainMonthlyMapo.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">엄</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{mainMonthlyEom.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  {/* 에헬 월간 */}
                  <div className="bg-emerald-50/50 dark:bg-neutral-900/50 border border-emerald-100 dark:border-neutral-800/80 rounded-xl p-3">
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> 에헬
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">메포</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{aetherMonthlyMapo.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold">엄</span>
                        <span className="text-sm font-black text-slate-800 dark:text-neutral-200">{aetherMonthlyEom.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 월간 총합 */}
                <div className="bg-slate-100 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 rounded-xl p-3 flex justify-between items-center">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">월간 총합</div>
                  <div className="flex gap-4">
                    <div className="flex items-end gap-1.5">
                      <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold mb-0.5">메포</span>
                      <span className="text-sm font-black text-slate-800 dark:text-neutral-100">{totalMonthlyMapo.toLocaleString()}</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      <span className="text-slate-500 dark:text-neutral-500 text-[10px] font-bold mb-0.5">엄</span>
                      <span className="text-sm font-black text-slate-800 dark:text-neutral-100">{totalMonthlyEom.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
