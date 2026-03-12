import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils, RefreshCw, ChevronRight } from 'lucide-react';

type Question = {
  id: string;
  text: string;
  options: { text: string; value: string }[];
};

const QUESTIONS: Question[] = [
  {
    id: 'base',
    text: '오늘의 메인 베이스는?',
    options: [
      { text: '🍚 한국인은 밥심이지!', value: 'rice' },
      { text: '🍜 후루룩 면이나 빵!', value: 'noodle' },
    ]
  },
  {
    id: 'soup',
    text: '국물이 필요하신가요?',
    options: [
      { text: '🍲 뜨끈하거나 시원한 국물!', value: 'soup' },
      { text: '🍛 국물 없이 깔끔하게!', value: 'nosoup' },
    ]
  },
  {
    id: 'spicy',
    text: '매운 음식이 땡기나요?',
    options: [
      { text: '🌶️ 스트레스 확 풀리는 매운맛!', value: 'spicy' },
      { text: '😌 속 편안하고 담백한 맛!', value: 'mild' },
    ]
  },
  {
    id: 'weight',
    text: '어떤 느낌으로 먹고 싶나요?',
    options: [
      { text: '🍖 배터지게! 든든하고 기름진 거', value: 'heavy' },
      { text: '🥗 가볍고 산뜻하게!', value: 'light' },
    ]
  }
];

const RESULTS: Record<string, { name: string; desc: string; emoji: string }> = {
  'rice-soup-spicy-heavy': { name: '뼈해장국 / 짬뽕밥', desc: '얼큰하고 든든하게 속을 채워줄 국물 요리!', emoji: '🥘' },
  'rice-soup-spicy-light': { name: '김치찌개 / 순두부찌개', desc: '매콤하지만 너무 무겁지 않은 깔끔한 찌개!', emoji: '🍲' },
  'rice-soup-mild-heavy': { name: '국밥 (돼지/순대) / 갈비탕', desc: '뜨끈하고 진한 국물로 든든한 한 끼!', emoji: '🥣' },
  'rice-soup-mild-light': { name: '콩나물국밥 / 맑은 곰탕', desc: '자극적이지 않고 속이 편안해지는 맑은 국물!', emoji: '🍲' },
  'rice-nosoup-spicy-heavy': { name: '제육볶음 / 쭈꾸미 볶음', desc: '매콤달콤 양념에 밥 비벼 먹으면 꿀맛!', emoji: '🔥' },
  'rice-nosoup-spicy-light': { name: '매콤 비빔밥 / 낙지덮밥', desc: '가볍게 채소와 함께 즐기는 매콤한 밥!', emoji: '🥗' },
  'rice-nosoup-mild-heavy': { name: '돈까스 / 규동 (소고기덮밥)', desc: '단짠단짠 고기와 밥의 환상적인 조화!', emoji: '🍱' },
  'rice-nosoup-mild-light': { name: '초밥 / 포케 / 연어덮밥', desc: '신선하고 깔끔하게 즐기는 한 끼!', emoji: '🍣' },
  'noodle-soup-spicy-heavy': { name: '마라탕 / 얼큰 짬뽕', desc: '자극의 끝판왕! 땀 흘리며 먹는 매운 국물 면!', emoji: '🍜' },
  'noodle-soup-spicy-light': { name: '얼큰 칼국수 / 매운 잔치국수', desc: '깔끔하게 매운 국물로 입맛 돋우기!', emoji: '🌶️' },
  'noodle-soup-mild-heavy': { name: '돈코츠 라멘 / 고기국수', desc: '진한 고기 육수와 쫄깃한 면발의 만남!', emoji: '🍜' },
  'noodle-soup-mild-light': { name: '잔치국수 / 우동 / 쌀국수', desc: '부담 없이 호로록 넘어가는 깔끔한 국물 면!', emoji: '🍜' },
  'noodle-nosoup-spicy-heavy': { name: '불닭볶음면 / 매운 볶음우동', desc: '스트레스 날려버릴 화끈한 볶음면!', emoji: '🍝' },
  'noodle-nosoup-spicy-light': { name: '비빔냉면 / 쫄면', desc: '새콤달콤 매콤하게 입맛 살려주는 비빔면!', emoji: '🥢' },
  'noodle-nosoup-mild-heavy': { name: '짜장면 / 크림 파스타', desc: '꾸덕하고 진한 소스의 매력!', emoji: '🍝' },
  'noodle-nosoup-mild-light': { name: '물냉면 / 메밀소바 / 샐러드 파스타', desc: '시원하고 가볍게 즐기는 깔끔한 면 요리!', emoji: '🧊' },
};

export default function FoodRecommendation() {
  const [step, setStep] = useState<'intro' | 'question' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleStart = () => {
    setStep('question');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (value: string) => {
    const questionId = QUESTIONS[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setStep('result');
    }
  };

  const getResult = () => {
    const key = `${answers['base']}-${answers['soup']}-${answers['spicy']}-${answers['weight']}`;
    return RESULTS[key] || { name: '아무거나 맛있는 거!', desc: '오늘은 끌리는 대로 드세요!', emoji: '✨' };
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden relative min-h-[600px]">
      <div className="w-full max-w-md mx-auto h-full flex flex-col relative">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Utensils size={40} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-neutral-100 mb-3 tracking-tight">
                오늘 뭐 먹지?
              </h2>
              <p className="text-slate-500 dark:text-neutral-400 mb-10 font-medium">
                간단한 테스트로<br/>지금 딱 맞는 메뉴를 추천해드려요!
              </p>
              <button
                onClick={handleStart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 text-lg"
              >
                테스트 시작하기
                <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {step === 'question' && (
            <motion.div
              key={`question-${currentQuestionIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-6 sm:p-8"
            >
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-neutral-800 h-2 rounded-full mb-8 overflow-hidden">
                <motion.div 
                  className="bg-indigo-600 h-full rounded-full"
                  initial={{ width: `${(currentQuestionIndex / QUESTIONS.length) * 100}%` }}
                  animate={{ width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 text-sm">
                  Q{currentQuestionIndex + 1}.
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-neutral-100 mb-10 leading-snug">
                  {QUESTIONS[currentQuestionIndex].text}
                </h3>

                <div className="flex flex-col gap-3 sm:gap-4">
                  {QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-800 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-neutral-200 font-bold py-5 px-6 rounded-2xl transition-all hover:shadow-md active:scale-[0.98] text-left text-lg flex items-center justify-between group"
                    >
                      <span>{option.text}</span>
                      <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-neutral-700 group-hover:border-indigo-500 flex items-center justify-center transition-colors">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4 tracking-wider uppercase">
                추천 메뉴 결과
              </div>
              
              <div className="text-8xl mb-6 drop-shadow-lg animate-bounce-slow">
                {getResult().emoji}
              </div>
              
              <h3 className="text-3xl font-extrabold text-slate-800 dark:text-neutral-100 mb-4 break-keep">
                {getResult().name}
              </h3>
              
              <p className="text-slate-500 dark:text-neutral-400 mb-12 font-medium text-lg bg-white dark:bg-neutral-900 py-3 px-6 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-sm">
                {getResult().desc}
              </p>

              <button
                onClick={handleStart}
                className="w-full bg-slate-800 dark:bg-neutral-100 hover:bg-slate-900 dark:hover:bg-white text-white dark:text-neutral-900 font-bold py-4 px-8 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-lg"
              >
                <RefreshCw size={20} />
                다시 추천받기
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
