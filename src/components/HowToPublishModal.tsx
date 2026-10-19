import React, { useState } from 'react';
import { X, Globe, Terminal, Rocket, CheckCircle2, Copy, Check } from 'lucide-react';

interface HowToPublishModalProps {
  onClose: () => void;
}

export const HowToPublishModal: React.FC<HowToPublishModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-cyan-400" />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Como Executar e Publicar Gratuitamente
              </h3>
              <p className="text-xs text-slate-400">
                Guia prático para correr no teu computador e colocar online sem custos
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-6 py-4 pr-1 text-sm text-slate-300">
          {/* Section 1: Running Locally */}
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
              <Terminal className="w-4 h-4" />
              <span>1. Como Executar no teu Computador</span>
            </div>
            <p className="text-xs text-slate-400 mb-2.5">
              Certifica-te de que tens o <span className="text-cyan-300 font-mono">Node.js</span> instalado. No terminal do teu projeto:
            </p>

            <div className="space-y-2">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs text-cyan-300">
                <span>npm install</span>
                <button
                  onClick={() => copyToClipboard('npm install', 1)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  {copiedIndex === 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs text-cyan-300">
                <span>npm run dev</span>
                <button
                  onClick={() => copyToClipboard('npm run dev', 2)}
                  className="text-slate-400 hover:text-white transition p-1"
                >
                  {copiedIndex === 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Abre <span className="text-white font-mono">http://localhost:3000</span> no teu navegador (Chrome, Edge, Firefox ou Safari) e o jogo estará pronto a correr a 60 FPS!
            </p>
          </div>

          {/* Section 2: Building */}
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Gerar a Versão de Produção</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Para compilar os ficheiros otimizados (HTML, CSS e JavaScript empacotados na pasta <span className="text-amber-300 font-mono">dist/</span>):
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between font-mono text-xs text-amber-300">
              <span>npm run build</span>
              <button
                onClick={() => copyToClipboard('npm run build', 3)}
                className="text-slate-400 hover:text-white transition p-1"
              >
                {copiedIndex === 3 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section 3: Publishing for Free */}
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2.5">
              <Globe className="w-4 h-4" />
              <span>3. Opções para Publicar Online 100% Grátis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Option A: Vercel */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    <span>Opção A: Vercel</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                      Recomendado
                    </span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-400 mt-2 space-y-1">
                    <li>Cria uma conta em <span className="text-white">vercel.com</span></li>
                    <li>Importa o repositório GitHub do teu jogo</li>
                    <li>Clica em <b>Deploy</b>. Fica ativo com HTTPS em menos de 1 minuto!</li>
                  </ol>
                </div>
              </div>

              {/* Option B: Netlify */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Opção B: Netlify Drop</div>
                  <ol className="list-decimal list-inside text-slate-400 mt-2 space-y-1">
                    <li>Corre <span className="font-mono text-cyan-300">npm run build</span></li>
                    <li>Vai a <span className="text-white">app.netlify.com/drop</span></li>
                    <li>Arrasta e larga a pasta <b className="text-white">dist</b> diretamente no navegador. O teu link fica ativo de imediato!</li>
                  </ol>
                </div>
              </div>

              {/* Option C: GitHub Pages */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 sm:col-span-2">
                <div className="font-bold text-white text-sm">Opção C: GitHub Pages</div>
                <p className="text-slate-400 mt-1">
                  Envia o código para um repositório no GitHub, ativa o <b>GitHub Pages</b> nas Definições do repositório escolhendo a pasta raiz ou a branch <span className="font-mono text-cyan-300">gh-pages</span>, e o teu jogo fica acessível gratuitamente em <span className="text-cyan-300 font-mono">oteunome.github.io/corrida-infinita</span>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Architecture highlights */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400">
            <span className="text-slate-200 font-bold block mb-1">
              Sem Custos, Sem Dependências Externas, Sem Servidores Pagos:
            </span>
            O jogo funciona totalmente do lado do cliente (Client-Side). Os sons são sintetizados matematicamente via Web Audio API, os gráficos são desenhados em WebGL (Three.js), e os recordes e moedas ficam guardados de forma segura no <span className="text-cyan-300 font-mono">localStorage</span> do navegador do jogador.
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
          >
            ENTENDI, VAMOS JOGAR!
          </button>
        </div>
      </div>
    </div>
  );
};
