
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Shield, Zap, Flame, Droplets, Leaf, Sun, Coins, BrainCircuit, Loader2, Sword, Skull, Lightbulb, Sparkles, User, Users } from 'lucide-react';
import { getOracleAdvice } from '../services/geminiService';
import { GameState, ColorSlot, Champion } from '../types';

const SLOTS: ColorSlot[] = [
  { id: 'red', name: 'RED', color: '#ff1744', faction: 'Fire', points: 10 },
  { id: 'green', name: 'GREEN', color: '#00e676', faction: 'Nature', points: 10 },
  { id: 'blue', name: 'BLUE', color: '#2979ff', faction: 'Water', points: 10 },
  { id: 'yellow', name: 'YELLOW', color: '#ffea00', faction: 'Light', points: 10 },
];

const ColorGameRoyale: React.FC = () => {
  const [champion, setChampion] = useState<Champion | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    phase: 'title',
    hasInsertedCoin: false,
    score: 0,
    coins: 100,
    umbraHp: 1000,
    umbraMaxHp: 1000,
    elementalBalance: { Fire: 0, Water: 0, Nature: 0, Light: 0 },
    activeBets: {},
    history: [],
    lastResult: [],
    isRolling: false,
    roundTimer: 60,
    streakCount: 0,
    activeBuff: null,
  });

  const [oracleAdvice, setOracleAdvice] = useState<any>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gridColors, setGridColors] = useState<string[][]>([]);

  // Initialize a random 6x6 grid of the 4 colors
  useEffect(() => {
    const newGrid = Array.from({ length: 6 }, () =>
      Array.from({ length: 6 }, () => SLOTS[Math.floor(Math.random() * SLOTS.length)].color)
    );
    setGridColors(newGrid);
  }, []);

  // --- Game Logic ---

  const handlePlaceBet = (slotId: string) => {
    if (gameState.coins <= 0 || gameState.isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - 5,
      activeBets: {
        ...prev.activeBets,
        [slotId]: (Number(prev.activeBets[slotId]) || 0) + 5
      }
    }));
  };

  const triggerOracle = async () => {
    setIsAiThinking(true);
    const advice = await getOracleAdvice(gameState.history, gameState.umbraHp, gameState.elementalBalance);
    setOracleAdvice(advice.hint);
    setIsAiThinking(false);
  };

  const rollDice = () => {
    if (Object.keys(gameState.activeBets).length === 0 || gameState.isRolling) return;

    setGameState(prev => ({ ...prev, isRolling: true }));
    setShowResult(false);

    // Simulate ball drop timing
    setTimeout(() => {
      const results = Array.from({ length: 3 }, () => {
        return SLOTS[Math.floor(Math.random() * SLOTS.length)].id;
      });

      calculateResults(results);
    }, 2500);
  };

  const calculateResults = (results: string[]) => {
    let roundWinnings = 0;
    let totalDamage = 0;
    let newBalance = { ...gameState.elementalBalance };

    Object.entries(gameState.activeBets).forEach(([slotId, amount]) => {
      const matches = results.filter(r => r === slotId).length;
      if (matches > 0) {
        const betAmount = Number(amount);
        roundWinnings += betAmount + (betAmount * matches);
        
        const slot = SLOTS.find(s => s.id === slotId)!;
        newBalance[slot.faction] += matches;
        totalDamage += (slot.points * matches);
      }
    });

    const isWin = roundWinnings > 0;
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + roundWinnings,
      coins: prev.coins + roundWinnings,
      umbraHp: Math.max(0, prev.umbraHp - totalDamage),
      history: [...prev.history, ...results],
      lastResult: results,
      isRolling: false,
      activeBets: {},
      elementalBalance: newBalance,
      streakCount: isWin ? prev.streakCount + 1 : 0
    }));

    setShowResult(true);
    triggerOracle();
  };

  useEffect(() => {
    if (gameState.phase === 'playing') triggerOracle();
  }, [gameState.phase]);

  const handleInsertCoin = () => {
    setGameState(prev => ({ ...prev, hasInsertedCoin: true }));
    setTimeout(() => {
        setGameState(prev => ({ ...prev, phase: 'champion-select' }));
    }, 800);
  };

  const handleSelectChampion = (c: Champion) => {
    setChampion(c);
    setGameState(prev => ({ ...prev, phase: 'playing' }));
  };

  const StarBackground = () => (
    <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_100%)] opacity-40" />
        {[...Array(120)].map((_, i) => (
            <div 
                key={i} 
                className="absolute w-[2px] h-[2px] bg-white rounded-full animate-pulse"
                style={{ 
                    top: `${Math.random() * 100}%`, 
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random() * 0.5 + 0.2
                }}
            />
        ))}
    </div>
  );

  const TitleScreen = () => (
    <div className="min-h-screen bg-[#1a0b2e] flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
        <StarBackground />
        <div className="z-10 mb-12">
            <h1 className="text-8xl font-black italic tracking-tighter bg-gradient-to-r from-red-500 via-yellow-400 via-green-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                COLOR GAME
            </h1>
            <h2 className="text-5xl font-black text-white tracking-[0.3em] mt-2 drop-shadow-xl">
                ROYALE
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8 text-[#b3a8ff] font-bold tracking-[0.4em] uppercase text-xs">
                <Sword className="w-5 h-5" /> THE CHROMATIC KINGDOM AWAITS <Sword className="w-5 h-5" />
            </div>
        </div>

        <div className="relative w-72 h-72 mb-16 z-10 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-[#5c4eb5]/30 rounded-full animate-[spin_15s_linear_infinite]" />
            <div className="absolute inset-4 border border-[#5c4eb5]/50 rounded-full animate-[spin_10s_linear_infinite_reverse]" />
            {SLOTS.map((slot, i) => {
                const angle = (i * 90) * (Math.PI / 180);
                return (
                    <div 
                        key={slot.id}
                        className="absolute w-16 h-16 rounded-full blur-sm animate-pulse shadow-2xl"
                        style={{ 
                            left: `calc(50% + ${Math.cos(angle) * 110}px - 32px)`,
                            top: `calc(50% + ${Math.sin(angle) * 110}px - 32px)`,
                            backgroundColor: slot.color,
                            boxShadow: `0 0 40px ${slot.color}`
                        }}
                    />
                );
            })}
            <Sparkles className="w-16 h-16 text-white/40 animate-spin-slow" />
        </div>

        <div className="z-10 flex flex-col items-center gap-10">
            <div className="w-56 h-32 bg-[#1f2937] border-4 border-[#374151] rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
                <div className="w-28 h-5 bg-black rounded-full border-2 border-[#111827] group-hover:bg-[#0c121e] transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
            </div>

            <button 
                onClick={handleInsertCoin}
                disabled={gameState.hasInsertedCoin}
                className={`group relative px-16 py-6 rounded-3xl flex items-center gap-4 border-b-8 transition-all ${gameState.hasInsertedCoin ? 'bg-green-600 border-green-800 scale-95 opacity-50 cursor-default' : 'bg-gradient-to-b from-[#facc15] to-[#ca8a04] border-[#854d0e] hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(202,138,4,0.4)]'}`}
            >
                <Coins className="w-8 h-8 text-yellow-950" />
                <span className="text-2xl font-black text-yellow-950 tracking-widest uppercase italic">INSERT COIN</span>
                <Coins className="w-8 h-8 text-yellow-950" />
            </button>
        </div>
    </div>
  );

  const ChampionSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a0b2e] p-8 text-white font-sans relative overflow-hidden">
      <StarBackground />
      <h1 className="text-6xl font-black mb-12 italic tracking-tighter text-white z-10 drop-shadow-lg">
          SELECT YOUR CHAMPION
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl z-10">
        <button 
          onClick={() => handleSelectChampion('Ren')}
          className="group relative bg-black/40 backdrop-blur-md border-4 border-blue-500/30 hover:border-blue-500 rounded-[40px] p-12 transition-all overflow-hidden flex flex-col items-center shadow-2xl hover:-translate-y-2"
        >
          <div className="w-40 h-40 rounded-full bg-blue-500/20 mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)] group-hover:shadow-[0_0_80px_rgba(59,130,246,0.5)] transition-all">
             <Shield className="w-20 h-20 text-blue-400" />
          </div>
          <h2 className="text-5xl font-black mb-4 text-blue-400 italic tracking-widest">REN</h2>
          <p className="text-blue-100 text-center font-bold opacity-80 uppercase text-sm tracking-[0.3em]">THE DISCIPLINED SCHOLAR</p>
        </button>

        <button 
          onClick={() => handleSelectChampion('Rei')}
          className="group relative bg-black/40 backdrop-blur-md border-4 border-pink-500/30 hover:border-pink-500 rounded-[40px] p-12 transition-all overflow-hidden flex flex-col items-center shadow-2xl hover:-translate-y-2"
        >
          <div className="w-40 h-40 rounded-full bg-pink-500/20 mb-8 flex items-center justify-center shadow-[0_0_60px_rgba(236,72,153,0.3)] group-hover:shadow-[0_0_80px_rgba(236,72,153,0.5)] transition-all">
             <Zap className="w-20 h-20 text-pink-400" />
          </div>
          <h2 className="text-5xl font-black mb-4 text-pink-400 italic tracking-widest">REI</h2>
          <p className="text-pink-100 text-center font-bold opacity-80 uppercase text-sm tracking-[0.3em]">THE VISIONARY ARTIST</p>
        </button>
      </div>
    </div>
  );

  if (gameState.phase === 'title') return <TitleScreen />;
  if (gameState.phase === 'champion-select') return <ChampionSelect />;

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white font-sans overflow-hidden relative">
      <StarBackground />

      {/* RPG HUD Header */}
      <div className="p-4 z-20 bg-black/80 border-b border-purple-500/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
             <div className="flex flex-col">
                <p className="text-[10px] text-purple-400 font-black tracking-widest uppercase">System Stability</p>
                <div className="h-3 w-64 bg-gray-900 border border-purple-500/30 rounded-full overflow-hidden mt-1 relative">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-800 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" 
                      // Fixed line 334: Cast to number to avoid arithmetic operation type errors
                      style={{ width: `${(Number(gameState.umbraHp) / Number(gameState.umbraMaxHp || 1)) * 100}%` }}
                    />
                </div>
             </div>
             <div className="flex items-center gap-2">
                <Skull className="w-6 h-6 text-pink-500 animate-pulse" />
                <span className="text-xl font-black italic tracking-tighter">UMBRA: {gameState.umbraHp}</span>
             </div>
          </div>

          <div className="flex gap-10 items-center">
             <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Winnings</p>
                <p className="text-2xl font-black text-yellow-400">{gameState.score.toLocaleString()}</p>
             </div>
             <div className="text-right flex items-center gap-3">
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-xl">
                   <Coins className="w-6 h-6 text-green-400" />
                </div>
                <div>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Purse</p>
                   <p className="text-2xl font-black text-green-400">{gameState.coins}</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row overflow-hidden z-10 px-4 gap-4 pb-4">
        
        {/* Left: Prophetic Oracle */}
        <div className="w-72 flex flex-col gap-4 py-4">
            <div className="bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-[32px] p-6 flex-1 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6 text-cyan-400">
                    <BrainCircuit className="w-6 h-6" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">The Oracle</h2>
                </div>
                
                <div className="bg-black/60 rounded-2xl p-5 border border-cyan-500/20">
                  {isAiThinking ? (
                    <div className="flex flex-col items-center py-8 gap-4">
                      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                      <p className="text-[10px] font-black uppercase text-cyan-700 tracking-widest">Parsing Fate...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm italic leading-relaxed text-cyan-100/90 mb-6 drop-shadow-md">"{oracleAdvice?.message || 'The colors whisper of a great shift...'}"</p>
                      {oracleAdvice?.recommendedColor && (
                        <div className="flex items-center gap-4 p-4 bg-cyan-950/40 rounded-xl border border-cyan-400/20">
                            <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]" />
                            <div>
                                <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Prophecy</p>
                                <p className="text-sm font-black text-white uppercase">{oracleAdvice.recommendedColor}</p>
                            </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-8">
                   <h3 className="text-[10px] font-black uppercase text-purple-400 tracking-[0.3em] mb-4">Elemental Essence</h3>
                   <div className="space-y-4">
                      {Object.entries(gameState.elementalBalance).map(([f, v]) => (
                        <div key={f} className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                           <div className="flex-1">
                              <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                 <span>{f}</span>
                                 <span>{v}</span>
                              </div>
                              <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                                 <div className="h-full bg-white/40 transition-all duration-1000" style={{ width: `${Math.min(v*10, 100)}%` }} />
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
            </div>

            <div className="bg-gradient-to-tr from-purple-900/40 to-black p-6 rounded-[32px] border border-purple-500/30 text-center shadow-2xl">
                <p className="text-[10px] text-purple-300 uppercase mb-2 font-black tracking-widest">Active Core</p>
                <div className="flex items-center justify-center gap-3">
                   {champion === 'Ren' ? <Shield className="w-6 h-6 text-blue-400" /> : <Zap className="w-6 h-6 text-pink-400" />}
                   <p className="text-2xl font-black italic tracking-tighter text-white">{champion}</p>
                </div>
            </div>
        </div>

        {/* Main: The VINTAGE CARNIVAL BOOTH */}
        <div className="flex-1 flex flex-col items-center justify-center relative p-4">
           
           {/* THE BOOTH CONTAINER: High-angle eye-level perspective */}
           <div className="relative w-full max-w-4xl aspect-square flex items-center justify-center perspective-1000">
              
              {/* Outer Pink Frame (Handmade look) */}
              <div className="absolute inset-0 bg-[#edb1c7] rounded-sm border-[16px] border-[#e193b0] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-0 flex items-center justify-center">
                 {/* Inner Booth Netting Effect */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] scale-150" />
              </div>

              {/* PERIMETER BETTING PANELS: Corner-to-corner layout */}
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-1 pointer-events-none p-4">
                  
                  {/* BOTTOM: RED Section */}
                  <div className="col-start-2 col-end-12 row-start-11 row-end-13 flex gap-2 pointer-events-auto">
                    <button 
                      onClick={() => handlePlaceBet('red')}
                      className={`flex-1 bg-[#d32f2f] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 ${gameState.activeBets['red'] ? 'brightness-125 border-yellow-400' : ''}`}
                    >
                       <span className="text-4xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">RED</span>
                       {gameState.activeBets['red'] && <div className="mt-1 px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-full">${gameState.activeBets['red']}</div>}
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('green')}
                      className={`flex-1 bg-[#2e7d32] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 ${gameState.activeBets['green'] ? 'brightness-125 border-yellow-400' : ''}`}
                    >
                       <span className="text-4xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">GREEN</span>
                       {gameState.activeBets['green'] && <div className="mt-1 px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-full">${gameState.activeBets['green']}</div>}
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('blue')}
                      className={`flex-1 bg-[#1976d2] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 ${gameState.activeBets['blue'] ? 'brightness-125 border-yellow-400' : ''}`}
                    >
                       <span className="text-4xl font-black italic text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">BLUE</span>
                       {gameState.activeBets['blue'] && <div className="mt-1 px-3 py-1 bg-yellow-400 text-black text-xs font-black rounded-full">${gameState.activeBets['blue']}</div>}
                    </button>
                  </div>

                  {/* LEFT: YELLOW & MORE RED Section */}
                  <div className="col-start-1 col-end-2 row-start-2 row-end-11 flex flex-col gap-2 pointer-events-auto">
                    <button 
                      onClick={() => handlePlaceBet('yellow')}
                      className={`flex-1 bg-[#fbc02d] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 ${gameState.activeBets['yellow'] ? 'brightness-125 border-yellow-400' : ''}`}
                    >
                       <span className="text-3xl font-black italic text-black rotate-[-90deg] whitespace-nowrap">YELLOW</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('red')}
                      className="flex-1 bg-[#d32f2f] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-3xl font-black italic text-white rotate-[-90deg] whitespace-nowrap">RED</span>
                    </button>
                  </div>

                  {/* RIGHT: BLUE & YELLOW Section */}
                  <div className="col-start-12 col-end-13 row-start-2 row-end-11 flex flex-col gap-2 pointer-events-auto">
                    <button 
                      onClick={() => handlePlaceBet('blue')}
                      className="flex-1 bg-[#1976d2] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-3xl font-black italic text-white rotate-[90deg] whitespace-nowrap">BLUE</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('yellow')}
                      className="flex-1 bg-[#fbc02d] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-3xl font-black italic text-black rotate-[90deg] whitespace-nowrap">YELLOW</span>
                    </button>
                  </div>

                  {/* TOP: GREEN & YELLOW Section */}
                  <div className="col-start-2 col-end-12 row-start-1 row-end-2 flex gap-2 pointer-events-auto">
                     <button 
                      onClick={() => handlePlaceBet('green')}
                      className="flex-1 bg-[#2e7d32] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-2xl font-black italic text-white">GREEN</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('yellow')}
                      className="flex-1 bg-[#fbc02d] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-2xl font-black italic text-black">YELLOW</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet('blue')}
                      className="flex-1 bg-[#1976d2] border-4 border-white/20 rounded-md shadow-2xl flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all"
                    >
                       <span className="text-2xl font-black italic text-white">BLUE</span>
                    </button>
                  </div>
              </div>

              {/* CENTRAL 6x6 GRID AREA */}
              <div className="relative w-2/3 aspect-square bg-white border-[12px] border-white/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] p-1 grid grid-cols-6 grid-rows-6 gap-1 z-10">
                 {gridColors.map((row, r) => 
                   row.map((color, c) => (
                     <div key={`${r}-${c}`} className="w-full h-full shadow-inner border border-black/5" style={{ backgroundColor: color }} />
                   ))
                 )}

                 {/* FUNNEL WIRE BASKET OVER GRID */}
                 <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                    <svg width="100%" height="100%" viewBox="0 0 400 400" className={`transition-all duration-700 ${gameState.isRolling ? 'scale-110 -translate-y-4' : ''}`}>
                       {/* Wire Cage Ropes (Suspended from corners) */}
                       <line x1="0" y1="0" x2="150" y2="120" stroke="#fbc02d" strokeWidth="3" />
                       <line x1="400" y1="0" x2="250" y2="120" stroke="#fbc02d" strokeWidth="3" />
                       
                       {/* Funnel Basket Structure */}
                       <defs>
                          <radialGradient id="metalGrad" cx="50%" cy="50%" r="50%">
                             <stop offset="0%" stopColor="#e0e0e0" />
                             <stop offset="100%" stopColor="#9e9e9e" />
                          </radialGradient>
                       </defs>
                       
                       {/* Upper Ring */}
                       <ellipse cx="200" cy="120" rx="100" ry="40" fill="none" stroke="url(#metalGrad)" strokeWidth="6" />
                       <ellipse cx="200" cy="120" rx="95" ry="38" fill="rgba(0,0,0,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                       
                       {/* Vertical Ribs */}
                       {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                          const rad = angle * (Math.PI / 180);
                          const x1 = 200 + Math.cos(rad) * 100;
                          const y1 = 120 + Math.sin(rad) * 40;
                          const x2 = 200 + Math.cos(rad) * 30;
                          const y2 = 260 + Math.sin(rad) * 10;
                          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#metalGrad)" strokeWidth="3" />;
                       })}

                       {/* Lower Ring / Funnel Hole */}
                       <ellipse cx="200" cy="260" rx="30" ry="10" fill="none" stroke="url(#metalGrad)" strokeWidth="4" />
                       
                       {/* Floating Balls in Basket */}
                       {!gameState.isRolling && (
                          <g className="animate-float">
                             <circle cx="180" cy="130" r="10" fill="#ff1744" stroke="black" strokeWidth="1" />
                             <circle cx="210" cy="125" r="10" fill="#ffea00" stroke="black" strokeWidth="1" />
                             <circle cx="195" cy="140" r="10" fill="#2979ff" stroke="black" strokeWidth="1" />
                          </g>
                       )}

                       {/* Active Rolling Effect (Dice Falling) */}
                       {gameState.isRolling && (
                          <g>
                             <circle cx="200" cy="280" r="12" fill="white" className="animate-[bounce_0.5s_infinite]" />
                             <circle cx="180" cy="300" r="12" fill="white" className="animate-[bounce_0.6s_infinite]" />
                             <circle cx="220" cy="310" r="12" fill="white" className="animate-[bounce_0.7s_infinite]" />
                          </g>
                       )}
                    </svg>
                 </div>
              </div>

           </div>

           {/* ACTION CONSOLE */}
           <div className="mt-8 flex flex-col items-center gap-4 z-20">
              <button
                onClick={rollDice}
                disabled={gameState.isRolling || Object.keys(gameState.activeBets).length === 0}
                className={`
                  px-16 py-6 rounded-2xl font-black text-3xl italic tracking-[0.2em] transition-all flex items-center justify-center gap-6 border-b-8 group relative overflow-hidden shadow-2xl
                  ${(gameState.isRolling || Object.keys(gameState.activeBets).length === 0) 
                    ? 'bg-gray-800 border-gray-900 text-gray-500 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600 border-red-900 text-white hover:scale-105 hover:brightness-110 active:scale-95'}
                `}
              >
                {gameState.isRolling ? (
                  <><Loader2 className="animate-spin w-10 h-10" /> DROPPING...</>
                ) : (
                  <><Sword className="w-10 h-10" /> DROP BALLS</>
                )}
              </button>
              
              <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                 <Lightbulb className="w-4 h-4 text-yellow-400" />
                 <p className="text-[11px] text-white/60 font-black uppercase tracking-[0.2em]">
                   {gameState.coins > 0 ? "Place your bets on the perimeter panels" : "Purse empty - Call for refill"}
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* RESULT MODAL */}
      {showResult && (
         <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-[100] animate-in fade-in zoom-in duration-500 backdrop-blur-sm">
            <div className="bg-black/90 p-12 rounded-[64px] border-2 border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] text-center max-w-2xl w-full mx-4 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
               <h2 className="text-xl font-black text-cyan-400 mb-6 uppercase tracking-[0.4em]">Fateful Convergence</h2>
               
               <div className="flex gap-8 justify-center mb-10">
                  {gameState.lastResult.map((res, i) => {
                    const slot = SLOTS.find(s => s.id === res);
                    return (
                      <div 
                        key={i} 
                        className="w-28 h-28 rounded-[36px] border-2 border-white/20 flex items-center justify-center shadow-2xl animate-bounce relative"
                        style={{ 
                          backgroundColor: slot?.color, 
                          animationDelay: `${i * 150}ms`,
                          boxShadow: `0 0 40px ${slot?.color}66`
                        }}
                      >
                          <div className="w-14 h-14 bg-white/20 rounded-full blur-xl animate-pulse" />
                      </div>
                    );
                  })}
               </div>
               
               {gameState.streakCount > 1 && (
                 <div className="inline-block px-10 py-4 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 font-black text-2xl italic tracking-tighter animate-pulse uppercase">
                    COMBO STREAK x{gameState.streakCount}!
                 </div>
               )}
            </div>
         </div>
      )}

    </div>
  );
};

export default ColorGameRoyale;
