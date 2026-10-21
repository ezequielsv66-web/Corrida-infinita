import React, { useState } from 'react';
import { X, LogIn, LogOut, Check, Edit3, Shield, Coins, Trophy, Compass, Lock } from 'lucide-react';
import { PlayerProfile, updatePlayerUsername } from '../firebase/playerService';
import { loginWithGoogle, logoutUser } from '../firebase/authService';

interface UserProfileModalProps {
  profile: PlayerProfile | null;
  onClose: () => void;
  onProfileUpdated: (updated: PlayerProfile) => void;
  onLoginSuccess: (profile: PlayerProfile) => void;
  onLogoutSuccess: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
  onLoginSuccess,
  onLogoutSuccess,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>(profile?.username || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSaveUsername = async () => {
    if (!profile) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      await updatePlayerUsername(profile.userId, usernameInput);
      const updated = { ...profile, username: usernameInput.trim() };
      onProfileUpdated(updated);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao atualizar o nome.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const { profile: loggedProfile } = await loginWithGoogle();
      onLoginSuccess(loggedProfile);
    } catch (err) {
      setErrorMsg('Falha ao iniciar sessão com Google. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onLogoutSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Perfil do Corredor</h3>
              <p className="text-xs text-slate-400">Autenticação e dados na Nuvem</p>
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

        {/* Content */}
        <div className="py-4 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {profile ? (
            <>
              {/* User Avatar & Name Section */}
              <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                {profile.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt={profile.username}
                    className="w-14 h-14 rounded-2xl border-2 border-cyan-500/60 object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        maxLength={24}
                        placeholder="Nome do corredor"
                        className="w-full bg-slate-900 border border-cyan-500 rounded-lg px-2.5 py-1 text-sm text-white font-semibold focus:outline-none"
                      />
                      <button
                        onClick={handleSaveUsername}
                        disabled={loading}
                        className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white truncate">
                        {profile.username}
                      </span>
                      <button
                        onClick={() => {
                          setUsernameInput(profile.username);
                          setIsEditing(true);
                        }}
                        className="text-slate-400 hover:text-cyan-400 transition p-1"
                        title="Editar nome"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-xs text-slate-400 truncate block">
                    {profile.email || 'Conta Firebase Segura'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 mb-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Recorde</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-white font-mono">
                    {profile.highScore.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-yellow-400 mb-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Moedas</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
                    {profile.totalCoins.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-cyan-400 mb-1">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Distância</span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-white font-mono">
                    {profile.maxDistance}m
                  </span>
                </div>
              </div>

              {/* Security info note */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Os teus dados estão protegidos por regras de segurança no Firestore da Google. Nenhum outro jogador pode alterar as tuas moedas ou recordes.
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar Sessão</span>
              </button>
            </>
          ) : (
            /* Unauthenticated / Guest state */
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <LogIn className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Guarda o teu progresso na Nuvem
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mb-6">
                Inicia sessão com a tua conta Google para guardar os teus recordes e moedas permanentemente e competir na Classificação Global.
              </p>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>ENTRAR COM GOOGLE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
