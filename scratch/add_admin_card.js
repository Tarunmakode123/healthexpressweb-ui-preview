import fs from 'fs';

const filePath = 'src/pages/AdminDashboardPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetAnchor = '<p className="text-slate-400 text-[11px]">Private prescriptions storage bucket using 300s signed URLs.</p>\n              </div>\n            </div>';

const newCard = `
            {/* GEMINI AI API KEY & ENGINE STATUS CONTROL CARD */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-sm font-black text-white">HEX AI Agent Engine Configuration</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Hybrid RAG Architecture & Gemini 2.5 Flash Telemetry</p>
                  </div>
                </div>

                <span className={\`px-3 py-1 rounded-full text-[10px] font-black border uppercase \${
                  geminiStatus.isOnline ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }\`}>
                  {geminiStatus.isOnline ? 'ENGINE ONLINE (GEMINI 2.5)' : 'FALLBACK ACTIVE (LOCAL ENGINE)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Active Key Source</span>
                  <div className="font-extrabold text-purple-300">{geminiStatus.activeKeySource}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Engine Mode</span>
                  <div className="font-extrabold text-emerald-400">{geminiStatus.engineType || 'GEMINI_2.5_FLASH'}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Fail-Safe Status</span>
                  <div className="font-extrabold text-amber-300">Local Engine Fallback Ready</div>
                </div>
              </div>

              <form onSubmit={handleSaveAdminGeminiKey} className="space-y-3 pt-2">
                <label className="block text-slate-300 font-extrabold">
                  Gemini API Key (Admin Panel Dynamic Override)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={adminGeminiKey}
                    onChange={(e) => setAdminGeminiKey(e.target.value)}
                    placeholder="Paste new Gemini API Key..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl transition-all cursor-pointer text-xs shrink-0"
                  >
                    Save AI Key
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tip: If your primary key runs out of daily quota (1,500 requests/day), paste a new key here to override immediately without code edits or server restarts.
                </p>
              </form>
            </div>`;

if (content.includes('Private prescriptions storage bucket using 300s signed URLs.')) {
  content = content.replace(targetAnchor, targetAnchor + newCard);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully injected Gemini AI Card into Admin Dashboard System Settings!');
} else {
  console.error('Target anchor not found in file!');
}
