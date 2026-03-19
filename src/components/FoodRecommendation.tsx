import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, RefreshCw, Trophy, Sparkles } from 'lucide-react';

const FOOD_LIST = [
  "김치찌개", "된장찌개", "제육볶음", "국밥", "뼈해장국",
  "비빔밥", "삼겹살", "보쌈", "족발", "찜닭",
  "닭갈비", "감자탕", "부대찌개", "육회비빔밥", "갈비탕",
  "짜장면", "짬뽕", "볶음밥", "탕수육", "마라탕",
  "마라샹궈", "깐풍기", "양꼬치", "초밥", "돈가스",
  "라멘", "우동", "규동", "사케동", "카레",
  "냉소바", "파스타", "피자", "햄버거", "스테이크",
  "리조또", "샐러드", "샌드위치", "떡볶이", "튀김",
  "순대", "김밥", "라면", "쫄면", "쌀국수",
  "팟타이", "나시고랭", "타코", "브리또", "샤브샤브"
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
  '#9575CD', '#4FC3F7', '#81C784', '#DCE775', '#FFF176',
  '#FFB74D', '#FF8A65', '#A1887F', '#E0E0E0', '#90A4AE'
];

export default function FoodRecommendation() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // 최소 5바퀴(1800도) 이상 회전 + 랜덤 각도
    const extraRotation = 1800 + Math.floor(Math.random() * 360);
    const newRotation = rotation + extraRotation;
    setRotation(newRotation);

    // 애니메이션 시간(3초) 후 결과 계산
    setTimeout(() => {
      setIsSpinning(false);
      
      const sliceSize = 360 / FOOD_LIST.length;
      // 룰렛이 시계방향으로 회전하므로, 고정된 화살표(상단)가 가리키는 지점은 반대 방향 각도임
      // 초기 상태(0도)에서 화살표는 첫 번째 슬라이스(0~7.2도)의 시작점을 가리킨다고 가정
      const actualRotation = newRotation % 360;
      const pointerPos = (360 - actualRotation) % 360;
      const index = Math.floor(pointerPos / sliceSize);
      
      setResult(FOOD_LIST[index]);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden relative min-h-[600px] p-4">
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-neutral-100 mb-2 flex items-center justify-center gap-2">
            <Utensils className="text-indigo-500" />
            오늘의 메뉴 추천
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 font-medium">
            결정 장애 해결! 룰렛을 돌려보세요.
          </p>
        </div>

        {/* Roulette Wheel Container */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-10 group">
          {/* Pointer (Arrow) */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-md">
            <div className="w-6 h-8 bg-indigo-600 clip-path-arrow" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
          </div>

          {/* The Wheel */}
          <motion.div
            ref={wheelRef}
            className="w-full h-full rounded-full border-8 border-slate-800 dark:border-neutral-800 shadow-2xl overflow-hidden relative"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.45, 0.05, 0.55, 0.95] }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {FOOD_LIST.map((food, i) => {
                const sliceSize = 360 / FOOD_LIST.length;
                const startAngle = i * sliceSize;
                const endAngle = (i + 1) * sliceSize;
                
                // SVG arc path calculation
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                
                return (
                  <path
                    key={i}
                    d={pathData}
                    fill={COLORS[i % COLORS.length]}
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.1"
                  />
                );
              })}
            </svg>
            
            {/* Center Pin */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-full shadow-lg border-4 border-slate-800 dark:border-neutral-700 z-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Result Area */}
        <div className="w-full h-32 flex flex-col items-center justify-center mb-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-widest text-xs">
                  <Sparkles size={14} />
                  오늘의 추천 메뉴
                  <Sparkles size={14} />
                </div>
                <div className="text-4xl font-black text-slate-800 dark:text-neutral-100 flex items-center gap-3">
                  <Trophy className="text-yellow-500" size={32} />
                  {result}
                </div>
              </motion.div>
            ) : isSpinning ? (
              <motion.div
                key="spinning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-400 dark:text-neutral-500 font-bold animate-pulse"
              >
                두구두구두구... 무엇이 나올까요?
              </motion.div>
            ) : (
              <div className="text-slate-300 dark:text-neutral-700 font-bold italic">
                버튼을 눌러 룰렛을 돌려보세요!
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`w-full py-2 px-6 rounded-lg font-bold text-base transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            isSpinning
              ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/25'
          }`}
        >
          <RefreshCw className={`transition-transform duration-500 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? '돌아가는 중...' : '룰렛 돌리기'}
        </button>
      </div>
    </div>
  );
}
