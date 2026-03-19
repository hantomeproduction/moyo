import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Tv, Calculator, CheckCircle2, Circle, RefreshCw, X, Moon, Sun, Maximize, Minimize, Utensils, Swords } from 'lucide-react';
import YouTube from 'react-youtube';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import BossCalculator from './components/BossCalculator';
import FoodRecommendation from './components/FoodRecommendation';
import CraftingCalculator from './components/CraftingCalculator';

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
  const [activeTab, setActiveTab] = useState<'youtube' | 'calc' | 'food' | 'craft'>('youtube');
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
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100 font-sans transition-colors duration-500 selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-xl blur opacity-5 group-hover:opacity-10 transition duration-1000 group-hover:duration-200" />
              <div className="relative w-14 h-14 bg-white dark:bg-neutral-900 rounded-xl shadow-xl flex items-center justify-center overflow-hidden border border-white/50 dark:border-neutral-800 shrink-0 transition-transform duration-500 group-hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="Guild Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
                모요 <span className="text-indigo-600 dark:text-indigo-400">길드 라운지</span>
              </h1>
              <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.2em]">
                Moyo Guild Community Hub
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-slate-200 dark:border-neutral-800 rounded-xl shadow-lg text-slate-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-300"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Navigation */}
        <nav className="flex flex-wrap gap-1 mb-4 p-1 bg-slate-200/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-lg border border-white/20 dark:border-neutral-800/50">
          {[
            { id: 'youtube', icon: Tv, label: '시청각실', color: 'indigo' },
            { id: 'calc', icon: Calculator, label: '결정 수익', color: 'amber' },
            { id: 'food', icon: Utensils, label: '메뉴 추천', color: 'rose' },
            { id: 'craft', icon: Swords, label: '제작 수익', color: 'emerald' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-md font-bold text-xs transition-all duration-300 flex-1 sm:flex-none justify-center ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50'
              }`}
            >
              {activeTab === tab.id && (
                <div
                  className="absolute inset-0 bg-indigo-600 dark:bg-indigo-500 rounded-md shadow-md shadow-indigo-500/20"
                />
              )}
              <tab.icon size={16} className="relative z-10" />
              <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <main 
          className="glass-card p-2 sm:p-3 rounded-lg min-h-[600px] transition-all duration-500"
        >
          {activeTab === 'youtube' && (
            <div className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold tracking-wider uppercase">
                    실시간 동기화
                  </div>
                  <h2 className="text-3xl font-extrabold dark:text-white tracking-tight">
                    📺 모요 시청각실
                  </h2>
                  <p className="text-slate-500 dark:text-neutral-400 text-sm leading-relaxed max-w-xl">
                    길드원들과 실시간으로 영상을 공유하세요. 링크를 입력하면 모든 접속자의 화면이 동기화됩니다.
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <RefreshCw size={20} className={isSyncing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                    {isSyncing ? '동기화 중...' : '다함께 동기화'}
                  </motion.button>
                  {lastSyncTime && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full"
                    >
                      <CheckCircle2 size={14} />
                      최종 동기화: {lastSyncTime}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* 영상 변경 입력창 */}
              <div className="flex flex-col sm:flex-row gap-3 p-1.5 bg-slate-100 dark:bg-neutral-900/50 rounded-xl border border-slate-200 dark:border-neutral-800">
                <div className="relative flex-1 group">
                  <input 
                    type="text" 
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="유튜브 링크를 붙여넣으세요..."
                    className="w-full px-5 py-2.5 bg-transparent text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-600 font-medium text-sm"
                  />
                  <div className="absolute bottom-0 left-5 right-5 h-0.5 bg-indigo-500 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                </div>
                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVideoChange}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:shadow-lg transition-all whitespace-nowrap text-sm"
                  >
                    영상 변경
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsFitToScreen(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-bold rounded-xl border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                  >
                    <Maximize size={18} />
                    <span className="hidden sm:inline">전체화면</span>
                  </motion.button>
                </div>
              </div>

              {/* Video Placeholder or Info */}
              {activeTab === 'youtube' && !isFitToScreen && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-2xl bg-black group ring-8 ring-slate-100 dark:ring-neutral-900/50">
                  <YouTube
                    videoId={currentVideoId}
                    ref={playerRef}
                    opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0, rel: 0, modestbranding: 1 } }}
                    onPlay={onPlay}
                    onPause={onPause}
                    onEnd={() => { isPlayingRef.current = false; updateServerState(false); }}
                    onStateChange={(e) => {
                      isPlayingRef.current = (e.data === 1 || e.data === 3);
                    }}
                    className="absolute inset-0 w-full h-full"
                    iframeClassName="w-full h-full"
                  />
                  {isSyncing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-10 pointer-events-none">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCw size={48} className="text-indigo-400 animate-spin" />
                        <span className="text-white font-bold tracking-widest uppercase text-sm">콘텐츠 동기화 중...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'calc' && <BossCalculator />}
          {activeTab === 'food' && <FoodRecommendation />}
          {activeTab === 'craft' && <CraftingCalculator />}
        </main>

        {/* Picture-in-Picture Mode */}
        <AnimatePresence>
          {activeTab !== 'youtube' && !isPipClosed && currentVideoId && (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              drag
              dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
              className="fixed bottom-8 right-8 w-80 sm:w-[400px] aspect-video rounded-xl overflow-hidden shadow-2xl bg-black z-50 border-4 border-white dark:border-neutral-800 cursor-grab active:cursor-grabbing group ring-1 ring-black/5"
            >
              <YouTube
                videoId={currentVideoId}
                ref={playerRef}
                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0, controls: 0, disablekb: 1 } }}
                onPlay={onPlay}
                onPause={onPause}
                className="absolute inset-0 w-full h-full"
              />
              
              <div 
                className="absolute inset-0 z-20 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group"
                onClick={() => setActiveTab('youtube')}
              >
                <div className="opacity-0 group-hover:opacity-100 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  <Tv size={18} />
                  시청각실로 이동
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPipClosed(true);
                  }}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Overlay */}
        <AnimatePresence>
          {isFitToScreen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col"
            >
              <div className="h-16 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white font-bold font-title">모요 시청각실</span>
                </div>
                <button
                  onClick={() => setIsFitToScreen(false)}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all flex items-center gap-2 font-bold text-sm border border-neutral-700"
                >
                  <Minimize size={18} />
                  <span>원래 크기로</span>
                </button>
              </div>
              <div className="flex-1 relative bg-black">
                <YouTube
                  videoId={currentVideoId}
                  ref={playerRef}
                  opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
                  onPlay={onPlay}
                  onPause={onPause}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
