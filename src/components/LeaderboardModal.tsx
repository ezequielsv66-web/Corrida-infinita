import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, User as UserIcon, RefreshCw } from 'lucide-react';
import { subscribeToLeaderboard, LeaderboardItem } from '../firebase/playerService';

interface LeaderboardModalProps {
  currentUserId?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ currentUserId, onClose }) => {
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLeaderboard((items) => {
      setLeaders(items);
      setLoading(false);
    }, 25);

    return () => unsubscribe();
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase font-chakra">
                Classificação Global
              </h3>
              <p className="text-xs text-slate-400">
                Os melhores corredores da autoestrada e carris 3D
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
              <span className="text-xs">A carregar recordes globais...</span>
            </div>
          ) : leaders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <Medal className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Ainda sem recordes globais</p>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Joga agora, bate um recorde e sê o primeiro a entrar no Top Mundial!
              </p>
            </div>
          ) : (
            leaders.map((item, index) => {
              const isCurrentUser = currentUserId && item.userId === currentUserId;
              const rank = index + 1;

              return (
                <div
                  key={item.userId}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    isCurrentUser
                      ? 'bg-cyan-950/50 border-cyan-500/70 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 flex items-center justify-center font-black text-xs">
                      {rank === 1 ? (
                        <Crown className="w-6 h-6 text-yellow-400 drop-shadow" />
                      ) : rank === 2 ? (
                        <Medal className="w-5 h-5 text-slate-300" />
                      ) : rank === 3 ? (
                        <Medal className="w-5 h-5 text-amber-600" />
                      ) : (
                        <span className="text-slate-500 font-mono">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    {item.photoURL ? (
                      <img
                        src={item.photoURL}
                        alt={item.username}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}

                    {/* Name */}
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        {item.username}
                        {isCurrentUser && (
                          <span className="text-[10px] bg-cyan-900/80 text-cyan-300 border border-cyan-700 px-1.5 rounded uppercase font-mono">
                            Tu
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.maxDistance ? `${item.maxDistance}m percorridos` : 'Corrida Infinita'}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-amber-300 font-mono tabular-nums">
                      {item.highScore.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Sincronização em tempo real (Firebase Firestore)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
