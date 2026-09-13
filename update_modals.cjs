const fs = require('fs');
let code = fs.readFileSync('src/components/GameView.tsx', 'utf8');

// Update Pause Modal
code = code.replace(
  "                <button\n                  onClick={() => { triggerHaptic('click'); setTab('map'); }}\n                  className=\"w-full py-3 bg-[#11193b] border border-rose-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-rose-950 text-rose-300 cursor-pointer\"\n                >\n                  Quit to Map\n                </button>\n              </div>",
  "                <button\n                  onClick={() => { triggerHaptic('click'); setTab('map'); }}\n                  className=\"w-full py-3 bg-[#11193b] border border-rose-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-rose-950 text-rose-300 cursor-pointer\"\n                >\n                  Quit to Map\n                </button>\n                <button\n                  onClick={() => { triggerHaptic('click'); setTab('home'); }}\n                  className=\"w-full py-3 bg-[#11193b] border border-indigo-400/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer\"\n                >\n                  Home\n                </button>\n              </div>"
);

// Update Win/Loss Modal
code = code.replace(
  "              <div className=\"flex flex-col gap-3\">\n                <button\n                  onClick={() => { triggerHaptic('click'); if (gameResult === 'won') { setTab('map'); } else { initBoard(); } }}\n                  className=\"w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer\"\n                >\n                  {gameResult === 'won' ? 'Continue' : 'Try Again'}\n                </button>\n                <button\n                  onClick={() => { triggerHaptic('click'); setTab('map'); }}\n                  className=\"w-full py-3 bg-[#11193b] border border-indigo-400/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-violet-200 cursor-pointer transition-all\"\n                >\n                  Exit to Map\n                </button>\n              </div>",
  `              <div className="flex flex-col gap-2">
                {gameResult === 'won' && (
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(251,191,36,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Next Level
                  </button>
                )}
                {gameResult === 'lost' && (
                  <button
                    onClick={() => { triggerHaptic('click'); initBoard(); }}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-400 to-red-500 text-white rounded-xl font-headline text-sm font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(244,63,94,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => { triggerHaptic('click'); initBoard(); }}
                  className="w-full py-2.5 bg-[#11193b] border border-indigo-400/50 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-900 text-white cursor-pointer transition-all"
                >
                  Replay
                </button>
                <div className="flex gap-2 w-full mt-1">
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('map'); }}
                    className="flex-1 py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all"
                  >
                    Levels
                  </button>
                  <button
                    onClick={() => { triggerHaptic('click'); setTab('home'); }}
                    className="flex-1 py-2.5 bg-[#11193b] border border-indigo-500/40 rounded-xl font-headline text-xs font-bold uppercase tracking-wider hover:bg-indigo-950 text-violet-300 cursor-pointer transition-all"
                  >
                    Home
                  </button>
                </div>
              </div>`
);

fs.writeFileSync('src/components/GameView.tsx', code);
