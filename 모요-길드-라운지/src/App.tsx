import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Tv, Calculator, CheckCircle2, Circle, RefreshCw, X, Moon, Sun, Maximize, Minimize, Utensils } from 'lucide-react';
import YouTube from 'react-youtube';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import BossCalculator from './components/BossCalculator';
import FoodRecommendation from './components/FoodRecommendation';

const firebaseConfig = {
  apiKey: "AIzaSyCR4rKTS_FEkLLhUuBlgbNgHbo-c_mp2Mw",
  authDomain: "moyo-e54c3.firebaseapp.com",
  projectId: "moyo-e54c3",
  storageBucket: "moyo-e54c3.firebasestorage.app",
  messagingSenderId: "205436695627",
  appId: "1:205436695627:web:418c76a1ffb5c2d0b2c9ce",
  measurementId: "G-91EYV404M4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [activeTab, setActiveTab] = useState<'youtube' | 'calc' | 'food'>('youtube');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  
  // 동기화 관련 상태
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState('jfKfPfyJRdk');
  const [inputUrl, setInputUrl] = useState('');
  const [isPipClosed, setIsPipClosed] = useState(false);
  const [isFitToScreen, setIsFitToScreen] = useState(false);
  const playerRef = useRef<YouTube>(null);
  const isInternalChange = useRef(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useLayoutEffect(() => {
    if (activeTab === 'youtube') {
      setIsPipClosed(false);
    } else {
      if (!isPlayingRef.current || !currentVideoId) {
        setIsPipClosed(true);
      }
    }
  }, [activeTab, currentVideoId]);

  useEffect(() => {
    const roomRef = doc(db, 'rooms', 'moyo_youtube');
    
    const unsubscribe = onSnapshot(roomRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.videoId && data.videoId !== currentVideoId) {
          setCurrentVideoId(data.videoId);
        }

        if (playerRef.current) {
          const player = playerRef.current.getInternalPlayer();

          if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
          }

          try {
            player.getCurrentTime().then((currentTime: number) => {
              if (Math.abs(currentTime - (data.currentTime || 0)) > 2) {
                player.seekTo(data.currentTime || 0);
              }

              if (data.isPlaying) {
                isPlayingRef.current = true;
                player.playVideo();
              } else {
                isPlayingRef.current = false;
                player.pauseVideo();
              }

              const now = new Date();
              const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
              setLastSyncTime(timeString);
              setIsSyncing(false);
            }).catch(() => {});
          } catch (e) {
            console.error(e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [currentVideoId]);

  const updateServerState = async (isPlaying: boolean) => {
    if (!playerRef.current) return;
    
    isInternalChange.current = true;
    const player = playerRef.current.getInternalPlayer();
    const currentTime = await player.getCurrentTime();

    await setDoc(doc(db, 'rooms', 'moyo_youtube'), {
      videoId: currentVideoId,
      isPlaying: isPlaying,
      currentTime: currentTime,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  const onPlay = () => {
    isPlayingRef.current = true;
    updateServerState(true);
  };
  const onPause = () => {
    isPlayingRef.current = false;
    updateServerState(false);
  };

  const handleVideoChange = async () => {
    const extractVideoId = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

    const newVideoId = extractVideoId(inputUrl);
    if (newVideoId) {
      setIsSyncing(true);
      await setDoc(doc(db, 'rooms', 'moyo_youtube'), {
        videoId: newVideoId,
        isPlaying: false,
        currentTime: 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setInputUrl('');
      setIsSyncing(false);
    } else {
      alert('유효한 유튜브 링크를 입력해주세요.');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    if (playerRef.current) {
        const player = playerRef.current.getInternalPlayer();
        const state = await player.getPlayerState();
        const isPlaying = state === 1;
        await updateServerState(isPlaying);
        
        setIsSyncing(false);
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        setLastSyncTime(timeString);
    } else {
        setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-gray-800 dark:text-neutral-100 p-4 sm:p-8 font-sans transition-colors duration-300">
      <div className="w-full mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {/* Logo Container */}
            <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm flex items-center justify-center overflow-hidden border border-gray-200 dark:border-neutral-700 shrink-0 transition-colors">
              <img 
                src="/logo.png" 
                alt="Guild Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white font-title tracking-tight">모요 길드 라운지</h1>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-sm text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveTab('youtube')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === 'youtube'
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-300 dark:hover:bg-neutral-700'
            }`}
          >
            <Tv size={20} />
            1. 유튜브 같이 보기
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === 'calc'
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-300 dark:hover:bg-neutral-700'
            }`}
          >
            <Calculator size={20} />
            2. 결정 수익 계산기
          </button>
          <button
            onClick={() => setActiveTab('food')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base transition-all ${
              activeTab === 'food'
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-300 dark:hover:bg-neutral-700'
            }`}
          >
            <Utensils size={20} />
            3. 음식 메뉴 추천
          </button>
        </nav>

        {/* Content */}
        <main className="bg-white dark:bg-neutral-800 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-neutral-700 min-h-[500px] transition-colors">
          {activeTab === 'youtube' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white">
                    📺 모요 시청각실
                  </h2>
                  <p className="text-slate-500 dark:text-neutral-400 text-sm">
                    * 링크를 입력하면 모든 길드원의 화면이 해당 영상으로 바뀝니다.
                  </p>
                </div>
                
                <div className="flex flex-col items-end shrink-0">
                  <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} />
                    {isSyncing ? '동기화 중...' : '다함께 동기화'}
                  </button>
                  {lastSyncTime && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      마지막 동기화: {lastSyncTime}
                    </span>
                  )}
                </div>
              </div>

              {/* 영상 변경 입력창 */}
              <div className="mb-6 flex flex-col sm:flex-row gap-2 w-full mx-auto">
                <input 
                  type="text" 
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="유튜브 링크를 붙여넣으세요 (예: https://youtu.be/...)"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500 dark:text-white transition-all"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleVideoChange}
                    className="flex-1 sm:flex-none px-6 py-3 bg-slate-800 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold rounded-xl hover:bg-slate-700 dark:hover:bg-white transition-all whitespace-nowrap shadow-sm active:scale-95"
                  >
                    영상 변경
                  </button>
                  <button 
                    onClick={() => setIsFitToScreen(true)}
                    className="flex-1 sm:flex-none px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all whitespace-nowrap shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Maximize size={18} />
                    <span className="hidden sm:inline">화면에 맞추기</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'calc' && (
            <BossCalculator />
          )}

          {activeTab === 'food' && (
            <FoodRecommendation />
          )}

          {/* YouTube Player - Always Rendered for PIP */}
          <AnimatePresence>
            {(activeTab === 'youtube' || (!isPipClosed && currentVideoId)) && (
              <motion.div 
                layout
                initial={activeTab !== 'youtube' ? { opacity: 0, x: 100 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 200, transition: { duration: 0.2 } }}
                drag={activeTab !== 'youtube' ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, info) => {
                  if (activeTab !== 'youtube' && info.offset.x > 100) {
                    setIsPipClosed(true);
                  }
                }}
                whileHover={activeTab !== 'youtube' ? { scale: 1.05 } : {}}
                className={
                  activeTab === 'youtube'
                    ? isFitToScreen
                      ? "fixed inset-0 z-[100] bg-neutral-950 flex flex-col"
                      : "aspect-video w-full mx-auto rounded-xl overflow-hidden shadow-lg bg-black relative group mt-2"
                    : "fixed bottom-6 right-6 w-72 sm:w-96 aspect-video rounded-xl overflow-hidden shadow-2xl bg-black z-50 border-4 border-slate-800 cursor-grab active:cursor-grabbing group"
                }
              >
                {/* 화면 꽉차게 보기 닫기 버튼 (상단 바) */}
                {activeTab === 'youtube' && isFitToScreen && (
                  <div className="h-10 bg-neutral-900 border-b border-neutral-800 flex items-center justify-end px-4 shrink-0 z-[110]">
                    <button
                      onClick={() => setIsFitToScreen(false)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-all flex items-center gap-1.5 font-bold shadow-sm text-xs"
                    >
                      <Minimize size={14} />
                      <span>원래 크기로</span>
                    </button>
                  </div>
                )}

                <YouTube
                  videoId={currentVideoId}
                  ref={playerRef}
                  opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
                  onPlay={onPlay}
                  onPause={onPause}
                  onEnd={() => { isPlayingRef.current = false; updateServerState(false); }}
                  onStateChange={(e) => {
                    isPlayingRef.current = (e.data === 1 || e.data === 3);
                  }}
                  className={activeTab === 'youtube' && isFitToScreen ? "absolute top-10 bottom-0 left-0 right-0 bg-black" : "absolute inset-0 w-full h-full"}
                  iframeClassName="w-full h-full pointer-events-auto"
                />
                
                {/* 동기화 중 오버레이 (시각적 효과) */}
                {isSyncing && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300 pointer-events-none">
                    <div className="bg-white/95 dark:bg-neutral-800/95 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 sm:gap-3 shadow-xl text-sm sm:text-base">
                      <RefreshCw size={20} className="animate-spin" />
                      {activeTab === 'youtube' ? '영상을 동기화하고 있습니다...' : '동기화 중...'}
                    </div>
                  </div>
                )}

                {/* PIP 모드일 때 클릭 캡처 및 오버레이 */}
                {activeTab !== 'youtube' && (
                  <div 
                    className="absolute inset-0 z-20"
                    onClick={() => setActiveTab('youtube')}
                  >
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-black/80 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 backdrop-blur-sm transition-all transform translate-y-2 group-hover:translate-y-0">
                        <Tv size={16} />
                        크게 보기
                      </div>
                    </div>
                    
                    {/* 닫기 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPipClosed(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-30"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
