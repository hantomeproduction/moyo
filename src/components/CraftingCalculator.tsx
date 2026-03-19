import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertCircle, Info, CheckCircle2, ArrowRight, Coins, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const FEE = 0.97; // 3% 수수료 제외

export default function CraftingCalculator() {
  // 1. 숫돌 (마법의 숫돌)
  const [whetstonePrices, setWhetstonePrices] = useState({
    superiorCrystal: 0,
    twistedTimeEssence: 0,
    superiorSpellEssence: 0,
    finishedProduct: 0,
  });

  // 2. 농축비 (소형 고농축 경험 축적의 비약)
  const [expPotionPrices, setExpPotionPrices] = useState({
    recipe: 0,
    smallExpPotion: 0,
    twilightEssence: 0,
    hyssopOil: 0,
    magicCrystal: 0,
    finishedProduct: 0,
  });

  // 3. 소재비 (소형 재물 획득의 비약)
  const [wealthPotionPrices, setWealthPotionPrices] = useState({
    emptyBottle: 0,
    sageStone: 0,
    superiorCrystal: 0,
    juniperOil: 0,
    juniperSeed: 0,
    finishedProduct: 0,
  });

  // 숫돌 계산
  const whetstoneResult = useMemo(() => {
    const cost = 
      (whetstonePrices.superiorCrystal * 10) + 
      (whetstonePrices.twistedTimeEssence * 10) + 
      (whetstonePrices.superiorSpellEssence * 10);
    const revenue = whetstonePrices.finishedProduct * FEE;
    const profit = revenue - cost;
    return { cost, revenue, profit };
  }, [whetstonePrices]);

  // 농축비 계산
  const expPotionResult = useMemo(() => {
    const cost = 
      expPotionPrices.recipe + 
      (expPotionPrices.smallExpPotion * 4) + 
      (expPotionPrices.twilightEssence * 2) + 
      (expPotionPrices.hyssopOil * 10) +
      (expPotionPrices.magicCrystal * 1000);
    const revenue = (expPotionPrices.finishedProduct * 4) * FEE;
    const profit = revenue - cost;
    return { cost, revenue, profit };
  }, [expPotionPrices]);

  // 소재비 계산
  const wealthPotionResult = useMemo(() => {
    const oilCostDirect = wealthPotionPrices.juniperOil * 5;
    const oilCostFromSeed = (wealthPotionPrices.juniperSeed * 6 / 0.9) * 5;
    
    const baseCost = 
      wealthPotionPrices.emptyBottle + 
      wealthPotionPrices.sageStone + 
      (wealthPotionPrices.superiorCrystal * 2);

    const costDirect = baseCost + oilCostDirect;
    const costFromSeed = baseCost + oilCostFromSeed;
    
    const revenue = (wealthPotionPrices.finishedProduct * 6) * FEE;
    
    const profitDirect = revenue - costDirect;
    const profitFromSeed = revenue - costFromSeed;

    return { 
      costDirect, 
      costFromSeed, 
      revenue, 
      profitDirect, 
      profitFromSeed,
      isSeedBetter: profitFromSeed > profitDirect && wealthPotionPrices.juniperSeed > 0
    };
  }, [wealthPotionPrices]);

  // 가장 이득인 아이템 추천
  const recommendation = useMemo(() => {
    const items = [
      { name: '마법의 숫돌', profit: whetstoneResult.profit, color: 'amber' },
      { name: '경험 축적의 비약', profit: expPotionResult.profit, color: 'sky' },
      { name: '재물 획득의 비약', profit: Math.max(wealthPotionResult.profitDirect, wealthPotionResult.profitFromSeed), color: 'emerald' }
    ];
    
    return items.sort((a, b) => b.profit - a.profit)[0];
  }, [whetstoneResult, expPotionResult, wealthPotionResult]);

  const formatNumber = (num: number) => Math.floor(num).toLocaleString();

  return (
    <div className="space-y-10">
      {/* Hero Section / Recommendation */}
      <div className="relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 blur-[80px] rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold tracking-widest uppercase">
              전문기술 제작 가이드
            </div>
            <h2 className="text-3xl font-black tracking-tight">전문기술 제작 수익 계산기</h2>
            <p className="text-indigo-100/80 text-sm font-medium">실시간 경매장 시세를 입력하고 최고의 마진을 확인하세요.</p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20 min-w-[280px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-xs font-bold text-indigo-100 uppercase tracking-wider">오늘의 추천 제작</span>
            </div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-black text-white">{recommendation.profit > 0 ? recommendation.name : '제작 보류'}</p>
                <p className="text-xs font-medium text-indigo-200 mt-1">
                  {recommendation.profit > 0 ? `예상 순이익: +${formatNumber(recommendation.profit)} 메소` : '현재 모든 품목이 손해입니다.'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className={recommendation.profit > 0 ? "text-emerald-400" : "text-slate-400"} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. 숫돌 */}
        <CraftingCard 
          id="1"
          title="마법의 숫돌"
          color="amber"
          icon={<Sparkles size={18} />}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <PriceInput label="최상급 아이템 결정 (10개) (개당 가격)" value={whetstonePrices.superiorCrystal} onChange={(v) => setWhetstonePrices({...whetstonePrices, superiorCrystal: v})} />
              <PriceInput label="뒤틀린 시간의 정수 (10개) (개당 가격)" value={whetstonePrices.twistedTimeEssence} onChange={(v) => setWhetstonePrices({...whetstonePrices, twistedTimeEssence: v})} />
              <PriceInput label="상급 주문의 정수 (10개) (개당 가격)" value={whetstonePrices.superiorSpellEssence} onChange={(v) => setWhetstonePrices({...whetstonePrices, superiorSpellEssence: v})} />
              <PriceInput label="숫돌 완제품 가격 (1개)" value={whetstonePrices.finishedProduct} highlight onChange={(v) => setWhetstonePrices({...whetstonePrices, finishedProduct: v})} />
            </div>
            <ResultDisplay 
              cost={whetstoneResult.cost} 
              revenue={whetstoneResult.revenue} 
              profit={whetstoneResult.profit} 
            />
          </div>
        </CraftingCard>

        {/* 2. 농축비 */}
        <CraftingCard 
          id="2"
          title="농축비 (소형 경험 축적의 비약)"
          color="sky"
          icon={<TrendingUp size={18} />}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <PriceInput label="제작 레시피 (1개)" value={expPotionPrices.recipe} onChange={(v) => setExpPotionPrices({...expPotionPrices, recipe: v})} />
              <PriceInput label="소형 경축비 (4개) (개당 가격)" value={expPotionPrices.smallExpPotion} onChange={(v) => setExpPotionPrices({...expPotionPrices, smallExpPotion: v})} />
              <PriceInput label="영롱한 황혼의 정수 (2개) (개당 가격)" value={expPotionPrices.twilightEssence} onChange={(v) => setExpPotionPrices({...expPotionPrices, twilightEssence: v})} />
              <PriceInput label="히솝 꽃 오일 (10개) (개당 가격)" value={expPotionPrices.hyssopOil} onChange={(v) => setExpPotionPrices({...expPotionPrices, hyssopOil: v})} />
              <PriceInput label="마력 결정 (1000개) (개당 가격)" value={expPotionPrices.magicCrystal} onChange={(v) => setExpPotionPrices({...expPotionPrices, magicCrystal: v})} />
              <PriceInput label="농축비 완제품 가격 (1개)" value={expPotionPrices.finishedProduct} highlight onChange={(v) => setExpPotionPrices({...expPotionPrices, finishedProduct: v})} />
            </div>
            <ResultDisplay 
              cost={expPotionResult.cost} 
              revenue={expPotionResult.revenue} 
              profit={expPotionResult.profit} 
              count={4}
            />
          </div>
        </CraftingCard>

        {/* 3. 소재비 */}
        <CraftingCard 
          id="3"
          title="소재비 (소형 재물 획득의 비약)"
          color="emerald"
          icon={<Coins size={18} />}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <PriceInput label="최고급 포션 빈 병 (1개)" value={wealthPotionPrices.emptyBottle} onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, emptyBottle: v})} />
              <PriceInput label="현자의 돌 (1개)" value={wealthPotionPrices.sageStone} onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, sageStone: v})} />
              <PriceInput label="최상급 아이템 결정 (2개) (개당 가격)" value={wealthPotionPrices.superiorCrystal} onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, superiorCrystal: v})} />
              <div className="grid grid-cols-2 gap-3">
                <PriceInput label="씨앗 오일 (5개) (개당)" value={wealthPotionPrices.juniperOil} onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, juniperOil: v})} />
                <PriceInput label="씨앗 (30개) (개당)" value={wealthPotionPrices.juniperSeed} onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, juniperSeed: v})} />
              </div>
              <PriceInput label="소재비 완제품 가격 (1개)" value={wealthPotionPrices.finishedProduct} highlight onChange={(v) => setWealthPotionPrices({...wealthPotionPrices, finishedProduct: v})} />
            </div>
            
            <div className="p-3 bg-slate-100/50 dark:bg-neutral-800/50 rounded-xl border border-slate-200 dark:border-neutral-700 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">오일 구매 시</span>
                <span className={wealthPotionResult.profitDirect > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {formatNumber(wealthPotionResult.profitDirect)} 메소
                </span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-500">씨앗 제작 시</span>
                <span className={wealthPotionResult.profitFromSeed > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {formatNumber(wealthPotionResult.profitFromSeed)} 메소
                </span>
              </div>
              {wealthPotionPrices.juniperSeed > 0 && wealthPotionPrices.juniperOil > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 flex items-center gap-2 text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase">
                  <Info size={12} />
                  {wealthPotionResult.isSeedBetter ? '씨앗 제작 추천' : '오일 구매 추천'}
                </div>
              )}
            </div>

            <ResultDisplay 
              cost={wealthPotionResult.isSeedBetter ? wealthPotionResult.costFromSeed : wealthPotionResult.costDirect} 
              revenue={wealthPotionResult.revenue} 
              profit={Math.max(wealthPotionResult.profitDirect, wealthPotionResult.profitFromSeed)} 
              count={6}
            />
          </div>
        </CraftingCard>
      </div>

      {/* Tips Section */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <AlertCircle size={20} />
          </div>
          <h4 className="text-xl font-black dark:text-white">제작 전 필수 체크리스트</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { text: "모든 계산은 경매장 수수료 3%를 제외한 실수령액 기준입니다.", icon: <CheckCircle2 size={16} /> },
            { text: "소재비(재획비)는 씨앗 6개로 오일 1개 제작 시 성공 확률 90%를 반영했습니다.", icon: <CheckCircle2 size={16} /> },
            { text: "마진이 마이너스라면 제작하지 마세요. 손해가 발생합니다.", icon: <CheckCircle2 size={16} /> },
            { text: "시세는 수시로 변하므로 제작 직전에 다시 한번 확인해 주세요!", icon: <CheckCircle2 size={16} /> }
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-100 dark:border-neutral-700/50">
              <div className="mt-0.5 text-emerald-500">{tip.icon}</div>
              <p className="text-sm font-medium text-slate-600 dark:text-neutral-400 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CraftingCard({ id, title, color, icon, children }: { id: string, title: string, color: string, icon: React.ReactNode, children: React.ReactNode }) {
  const colorClasses: Record<string, string> = {
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-slate-200 dark:border-neutral-800 shadow-sm transition-all duration-300 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${colorClasses[color]}`}>
          {icon}
        </div>
        <h3 className="font-black text-base dark:text-white tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

function PriceInput({ label, value, onChange, highlight = false }: { label: string, value: number, onChange: (v: number) => void, highlight?: boolean }) {
  const displayValue = value === 0 ? '' : value.toLocaleString();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (rawValue === '') {
      onChange(0);
      return;
    }
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-black text-slate-400 dark:text-neutral-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <input 
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          className={`w-full px-3 py-1.5 bg-slate-50 dark:bg-neutral-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white text-xs font-bold transition-all placeholder:text-slate-300 dark:placeholder:text-neutral-700 ${
            highlight ? 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-neutral-800'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 dark:text-neutral-600 uppercase tracking-tighter">메소</span>
      </div>
    </div>
  );
}

function ResultDisplay({ cost, revenue, profit, count = 1 }: { cost: number, revenue: number, profit: number, count?: number }) {
  const isProfit = profit > 0;
  const formatNumber = (num: number) => Math.floor(num).toLocaleString();

  return (
    <div className={`p-3 rounded-lg border transition-all duration-500 mt-auto min-h-[150px] flex flex-col justify-between ${
      isProfit 
        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' 
        : 'bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30'
    }`}>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-neutral-500">
          <span>제작 원가</span>
          <span className="font-mono">{formatNumber(cost)}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-neutral-500">
          <span>실수령액 ({count}개)</span>
          <span className="font-mono">{formatNumber(revenue)}</span>
        </div>
        <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-neutral-600">예상 순이익</span>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-black font-mono ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isProfit ? '+' : ''}{formatNumber(profit)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <div 
          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
            isProfit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
          }`}
        >
          {isProfit ? '제작 추천' : '제작 비추천'}
        </div>
      </div>
    </div>
  );
}
