import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  MessageCircle,
  Star,
  CheckCircle,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronUp,
  Search,
  Award,
  Zap,
  Users,
  Building2,
  Home,
  AlertTriangle,
  Camera,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const PHONE = "54458857";
const PHONE_DISPLAY = "5445-8857";
const WA_NUMBER = "85255994450";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('你好，我想查詢滅蟲服務及報價')}`;
const WEBHOOK_URL = "https://pestkiller.app.n8n.cloud/webhook/pest-general-lp";

// ─── Service URL Mapping ───────────────────────────────────────────────────────
const SERVICE_URLS: Record<string, string> = {
  '蟑螂': 'https://pestkillerhk.com/cockroach/',
  '老鼠': 'https://pestkillerhk.com/rats/',
  '跳蚤': 'https://pestkillerhk.com/flea/',
  '螞蟻': 'https://pestkillerhk.com/ants/',
  '蚊蠅': 'https://pestkillerhk.com/',
  '蛀木蟲': 'https://pestkillerhk.com/wood-borer/',
  '潮濕蟲': 'https://pestkillerhk.com/damp-bug/',
  '蜜蜂': 'https://pestkillerhk.com/bee/',
  '其他家居服務': 'https://pestkillerhk.com/home-pest-control/',
  '商業客戶': 'https://pestkillerhk.com/',
};

const HOME_SERVICES = ['蟑螂', '老鼠', '跳蚤', '螞蟻', '蚊蠅', '蛀木蟲', '潮濕蟲', '蜜蜂', '其他家居服務'];

// ─── Country Codes ─────────────────────────────────────────────────────────────
const COUNTRY_CODES = [
  { code: '+852', label: '🇭🇰 香港 +852' },
  { code: '+86', label: '🇨🇳 中國 +86' },
  { code: '+886', label: '🇹🇼 台灣 +886' },
  { code: '+853', label: '🇲🇴 澳門 +853' },
  { code: '+1', label: '🇺🇸 美國 +1' },
  { code: '+44', label: '🇬🇧 英國 +44' },
  { code: '+61', label: '🇦🇺 澳洲 +61' },
  { code: '+65', label: '🇸🇬 新加坡 +65' },
  { code: '+81', label: '🇯🇵 日本 +81' },
  { code: '+82', label: '🇰🇷 韓國 +82' },
];

// ─── Districts (from bed-bug-landingpage) ─────────────────────────────────────
const DISTRICTS = {
  '港島': ['中西區', '灣仔', '東區', '南區'],
  '九龍': ['油尖旺', '深水埗', '九龍城', '黃大仙', '觀塘'],
  '新界': ['荃灣', '屯門', '元朗', '北區', '大埔', '沙田', '西貢', '葵青', '離島'],
};

// ─── FadeIn Component ──────────────────────────────────────────────────────────
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}
const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// ─── Searchable Country Code Select ───────────────────────────────────────────
function CountryCodeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = COUNTRY_CODES.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search)
  );
  const selected = COUNTRY_CODES.find(c => c.code === value) || COUNTRY_CODES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm font-medium"
      >
        <span>{selected.label}</span>
        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100">
              <input
                autoFocus
                type="text"
                placeholder="搜尋..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-red-400"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onChange(c.code); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 hover:text-red-700 transition-colors ${value === c.code ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <img src="/logo.png" alt="滅蟲職人 Pest Killer" className="h-10 sm:h-12 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <a href={`tel:${PHONE}`} className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-red-600 font-bold transition-colors">
            <Phone className="w-4 h-4" />
            {PHONE_DISPLAY}
          </a>
          <a href={WA_LINK} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow-md">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">即時WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Dynamic Quote Form ────────────────────────────────────────────────────────
function QuoteForm() {
  const [service, setService] = useState('');
  const [countryCode, setCountryCode] = useState('+852');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locations, setLocations] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const isCommercial = service === '商業客戶';
  const isHomeService = HOME_SERVICES.includes(service);

  const toggleLocation = (loc: string) => {
    setLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value || null;

    const payload: Record<string, unknown> = {
      service,
      salutation: get('salutation'),
      country_code: countryCode,
      phone: get('phone'),
      district: get('district'),
      source: 'pest-general-landing-page',
      submitted_at: new Date().toISOString(),
    };

    if (isCommercial) {
      payload.business_type = get('businessType');
      payload.unit_size = get('unitSizeCommercial');
      payload.message = get('messageCommercial');
    } else {
      payload.unit_size = get('unitSizeHome');
      payload.found_locations = locations.length > 0 ? locations : null;
      payload.problem_duration = get('duration');
      payload.self_treated = get('selfTreated');
      payload.message = get('messageHome');
    }

    setSubmitState('loading');
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitState('success');
        formRef.current?.reset();
        setService('');
        setLocations([]);
        setCountryCode('+852');
      } else {
        setSubmitState('error');
      }
    } catch {
      setSubmitState('error');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-bold text-slate-700 mb-1";

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-slate-900 mb-2">立即索取免費報價</h2>
        <p className="text-slate-500 text-sm">填表後 <span className="text-red-600 font-bold">30分鐘內</span> 專員聯絡您</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

        {/* 1. 服務項目（觸發動態表單） */}
        <div>
          <label className={labelClass}>
            🐛 服務項目 <span className="text-red-500">*</span>
          </label>
          <select
            name="service"
            required
            value={service}
            onChange={e => { setService(e.target.value); setLocations([]); }}
            className={inputClass + " appearance-none"}
          >
            <option value="">-- 請選擇服務項目 --</option>
            <optgroup label="家居蟲害">
              {HOME_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
            <optgroup label="商業服務">
              <option value="商業客戶">商業客戶</option>
            </optgroup>
          </select>
          {service && SERVICE_URLS[service] && (
            <a
              href={SERVICE_URLS[service]}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-red-600 hover:underline"
            >
              <Search className="w-3 h-3" />
              了解更多關於{service}服務
            </a>
          )}
        </div>

        {/* 2. 稱呼 */}
        <div>
          <label className={labelClass}>稱呼 <span className="text-red-500">*</span></label>
          <input type="text" name="salutation" required placeholder="例：陳先生 / 陳小姐" className={inputClass} />
        </div>

        {/* 3. 區號 + 電話 */}
        <div>
          <label className={labelClass}>聯絡電話 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-5 gap-2">
            <div className="col-span-2">
              <CountryCodeSelect value={countryCode} onChange={setCountryCode} />
            </div>
            <div className="col-span-3">
              <input type="tel" name="phone" required placeholder="電話號碼" className={inputClass} />
            </div>
          </div>
        </div>

        {/* 4. 服務地區（下拉選單，參照 bed-bug-landingpage） */}
        <div>
          <label className={labelClass}>服務地區 <span className="text-red-500">*</span></label>
          <select name="district" required className={inputClass + " appearance-none"}>
            <option value="">-- 請選擇地區 --</option>
            {Object.entries(DISTRICTS).map(([region, areas]) => (
              <optgroup key={region} label={region}>
                {areas.map(area => (
                  <option key={area}>{area}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* ── 動態表單：家居 ── */}
        <AnimatePresence mode="wait">
          {isHomeService && (
            <motion.div
              key="home-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              {/* 單位呎數 */}
              <div>
                <label className={labelClass}>服務單位呎數（尺）<span className="text-red-500">*</span></label>
                <select name="unitSizeHome" required className={inputClass + " appearance-none"}>
                  <option value="">-- 請選擇 --</option>
                  <option>100~300尺</option>
                  <option>300~500尺</option>
                  <option>500~700尺</option>
                  <option>700~900尺</option>
                  <option>900~1200尺</option>
                  <option>1200~1600尺</option>
                  <option>1600~2000尺</option>
                  <option>2000尺以上</option>
                </select>
              </div>

              {/* 發現位置（多選 pill buttons） */}
              <div>
                <label className={labelClass}>發現位置（可多選）</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {['廚房', '洗手間', '客廳', '房間', '其他'].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        locations.includes(loc)
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-600'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* 問題持續時間 */}
              <div>
                <label className={labelClass}>問題持續時間 <span className="text-red-500">*</span></label>
                <select name="duration" required className={inputClass + " appearance-none"}>
                  <option value="">-- 請選擇 --</option>
                  <option>1~2星期</option>
                  <option>2~4星期</option>
                  <option>1~3個月</option>
                  <option>3~6個月</option>
                  <option>半年~一年</option>
                  <option>一年或以上</option>
                </select>
              </div>

              {/* 有否自行用藥（Radio） */}
              <div>
                <label className={labelClass}>有自己用過藥劑 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {['有', '沒有'].map(opt => (
                    <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
                      <input type="radio" name="selfTreated" value={opt} required className="accent-red-600 w-4 h-4" />
                      <span className="text-sm font-medium text-slate-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 描述（選填） */}
              <div>
                <label className={labelClass}>描述一下你遇到的蟲害情況（選填）</label>
                <textarea name="messageHome" rows={3} placeholder="例：廚房發現蟑螂，已有一段時間，晚上較多..." className={inputClass + " resize-none"} />
              </div>
            </motion.div>
          )}

          {/* ── 動態表單：商業 ── */}
          {isCommercial && (
            <motion.div
              key="commercial-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700 font-medium">您已選擇商業客戶服務，請填寫以下商業資料</p>
              </div>

              {/* 業務類型 */}
              <div>
                <label className={labelClass}>業務類型 <span className="text-red-500">*</span></label>
                <input type="text" name="businessType" required placeholder="如：餐飲、學校、酒店、辦公室..." className={inputClass} />
              </div>

              {/* 商業單位呎數 */}
              <div>
                <label className={labelClass}>服務單位呎數（尺）<span className="text-red-500">*</span></label>
                <select name="unitSizeCommercial" required className={inputClass + " appearance-none"}>
                  <option value="">-- 請選擇 --</option>
                  <option>800呎以下</option>
                  <option>800-1200呎</option>
                  <option>1200-1600呎</option>
                  <option>1600-2000呎</option>
                  <option>2000-4000呎</option>
                  <option>4000-6000呎</option>
                  <option>6000呎以上</option>
                </select>
              </div>

              {/* 商業描述（必填） */}
              <div>
                <label className={labelClass}>描述一下你所遇到的情況及所需要的服務 <span className="text-red-500">*</span></label>
                <textarea name="messageCommercial" required rows={4} placeholder="請描述蟲害情況、所需服務類型及任何特殊要求..." className={inputClass + " resize-none"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 提交按鈕 */}
        {submitState === 'success' ? (
          <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl py-5 px-4 text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-lg mb-1">
              <CheckCircle className="w-6 h-6" />
              表單已成功提交！
            </div>
            <p className="text-emerald-600 text-sm">我們的專員會在 <strong>30 分鐘內</strong>聯絡您，請保持電話暢通。</p>
          </div>
        ) : (
          <div className="space-y-2">
            {submitState === 'error' && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl py-3 px-4 text-center text-red-700 text-sm font-bold">
                提交失敗，請稍後再試或直接 WhatsApp 我們。
              </div>
            )}
            <button
              type="submit"
              disabled={submitState === 'loading' || (!isHomeService && !isCommercial)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2"
            >
              {submitState === 'loading' ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  提交中...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  {(!isHomeService && !isCommercial) ? '請先選擇服務項目' : '立即獲取免費報價'}
                </>
              )}
            </button>
          </div>
        )}
      </form>

      <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> 您的資料受到保護，絕不外洩
      </p>
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-slate-900">
      {/* 桌面/Pad 背景圖 */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/hero-mobile.jpg" />
          <img
            src="/images/hero-desktop.jpg"
            alt="滅蟲職人專業施工"
            className="w-full h-full object-cover object-center"
          />
        </picture>
        {/* 覆蓋層：降低透明度讓文字更清晰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/75 to-slate-900/40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
            >
              <AlertTriangle className="w-4 h-4" />
              全港緊急上門 · 最快24小時內處理
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6"
            >
              香港專業<span className="text-red-500">滅蟲服務</span><br />
              根治蟲害，<span className="text-red-500">徹底解決</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed"
            >
              專業處理蟑螂、老鼠、跳蚤、螞蟻、蚊蠅等各類蟲害，採用<strong className="text-white">漁護署認可藥劑</strong>，家居商業均適用，徹底根治不復發。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Star, text: "Google 4.9分 / 200+真實好評", color: "text-yellow-400" },
                { icon: ShieldCheck, text: "漁護署認可藥劑", color: "text-emerald-400" },
                { icon: Home, text: "家居商業均適用", color: "text-blue-400" },
                { icon: CheckCircle, text: "服務後保障回訪", color: "text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  {item.text}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <p className="text-slate-400 text-sm mb-3 font-medium">我們處理的蟲害類型：</p>
              <div className="flex flex-wrap gap-2">
                {HOME_SERVICES.map(s => (
                  <a
                    key={s}
                    href={SERVICE_URLS[s]}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-white/10 hover:bg-red-500/20 border border-white/20 hover:border-red-500/40 text-white text-xs font-medium rounded-full transition-all"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <QuoteForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <div className="bg-red-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { value: '200+', label: '真實 Google 好評' },
            { value: '4.9⭐', label: 'Google 評分' },
            { value: '10年+', label: '專業滅蟲經驗' },
            { value: '24H', label: '最快上門時間' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl font-black">{stat.value}</div>
              <div className="text-red-200 text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Services Grid ─────────────────────────────────────────────────────────────
function ServicesGrid() {
  const services = [
    { name: '蟑螂', icon: '🪳', desc: '廚房、廁所、縫隙全面清除，藥劑殘效長達數月', url: SERVICE_URLS['蟑螂'] },
    { name: '老鼠', icon: '🐀', desc: '捕鼠、堵截入侵路線，徹底解決鼠患問題', url: SERVICE_URLS['老鼠'] },
    { name: '跳蚤', icon: '🦟', desc: '針對地毯、床墊、寵物活動區域全面處理', url: SERVICE_URLS['跳蚤'] },
    { name: '螞蟻', icon: '🐜', desc: '追蹤蟻巢根源，使用餌劑系統徹底消滅蟻群', url: SERVICE_URLS['螞蟻'] },
    { name: '蚊蠅', icon: '🦟', desc: '清除滋生源頭，噴灑驅蚊藥劑，長效防護', url: SERVICE_URLS['蚊蠅'] },
    { name: '蛀木蟲', icon: '🪲', desc: '木製家具、地板、結構木材全面保護處理', url: SERVICE_URLS['蛀木蟲'] },
    { name: '潮濕蟲', icon: '🐛', desc: '針對潮濕環境滋生的各類蟲害進行專業處理', url: SERVICE_URLS['潮濕蟲'] },
    { name: '蜜蜂', icon: '🐝', desc: '安全人道移除蜂巢，保護住戶安全', url: SERVICE_URLS['蜜蜂'] },
    { name: '商業服務', icon: '🏢', desc: '餐廳、酒店、學校、辦公室等商業場所定期防治', url: SERVICE_URLS['商業客戶'] },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">全面蟲害防治服務</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">無論家居或商業場所，我們提供全方位蟲害解決方案</p>
        </FadeIn>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <FadeIn key={s.name} delay={i * 0.05}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group block p-5 rounded-2xl border border-slate-100 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all bg-slate-50 hover:bg-white"
              >
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-black text-slate-900 group-hover:text-red-600 transition-colors mb-1">{s.name}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Case Gallery (真實個案相片) ───────────────────────────────────────────────
function CaseGallery() {
  const cases = [
    {
      img: '/images/case-1.jpg',
      title: '商業場所通風管道檢查',
      desc: '師傅使用手電筒深入檢查商業場所通風管道及隱蔽位置，找出老鼠、蟑螂等蟲害藏匿根源。',
      tag: '商業服務',
    },
    {
      img: '/images/case-2.jpg',
      title: '辦公室霧化滅蟲處理',
      desc: '技術員穿著全套防護裝備，使用專業霧化機對辦公室進行全面滅蟲處理，安全徹底。',
      tag: '商業服務',
    },
    {
      img: '/images/case-3.jpg',
      title: '床底隱蔽位置深度處理',
      desc: '師傅針對床底、床架縫隙等蟲害藏匿點進行深度藥劑處理，配合吸塵清除蟲卵。',
      tag: '家居服務',
    },
    {
      img: '/images/case-4.jpg',
      title: '廁所管道蟲害評估',
      desc: '使用專業內窺鏡設備，深入廁所管道及牆身縫隙進行全面蟲害檢查，精準定位蟲害根源。',
      tag: '專業評估',
    },
    {
      img: '/images/case-5.jpg',
      title: '天花夾層老鼠捕獲成果',
      desc: '在天花夾層安裝黏鼠板後成功捕獲多隻老鼠，有效解決商業場所嚴重鼠患問題。',
      tag: '老鼠防治',
    },
    {
      img: '/images/case-6.jpg',
      title: '戶外環境滅蟲施工',
      desc: '師傅對商業場所戶外環境進行針對性藥劑噴灑，有效防止蟲害從外部入侵室內。',
      tag: '商業服務',
    },
  ];

  return (
    <section className="py-16 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <Camera className="w-4 h-4" />
            真實施工個案
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">真實個案相片</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">每一個個案都是我們的承諾，以專業技術為每位客戶徹底解決蟲害問題</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className="group rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 hover:border-red-500/50 transition-all hover:shadow-xl hover:shadow-red-900/20">
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={c.img}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {c.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-white mb-2">{c.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Why Us ────────────────────────────────────────────────────────────────────
function WhyUs() {
  const reasons = [
    { icon: ShieldCheck, title: '漁護署認可藥劑', desc: '所有使用藥劑均獲香港漁護署核准，安全有效，對人類及寵物無害。', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Award, title: '專業保障服務', desc: '服務後如問題未完全解決，我們承諾免費回訪跟進，直至徹底根治。', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: Zap, title: '快速上門處理', desc: '覆蓋全港18區，緊急個案最快24小時內安排技術員上門。', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Users, title: '200+ 真實好評', desc: 'Google 評分 4.9/5.0，超過200位真實客戶見證，口碑有保證。', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Building2, title: '家居商業均適用', desc: '同時服務住宅及商業客戶，提供定期防治合約，全面保障。', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: Lock, title: '透明合理收費', desc: '報價清晰，無隱藏收費，服務前詳細說明，讓您完全放心。', color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">為何選擇滅蟲職人？</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">香港專業滅蟲公司，以技術、安全、保障贏得客戶信賴</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <FadeIn key={r.title} delay={i * 0.08}>
              <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 ${r.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <r.icon className={`w-6 h-6 ${r.color}`} />
                </div>
                <h3 className="font-black text-slate-900 mb-2">{r.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process Steps ─────────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { num: '01', title: '免費查詢報價', desc: '填寫表單或 WhatsApp 查詢，專員30分鐘內回覆，提供免費評估報價。', tag: '免費評估' },
    { num: '02', title: '上門檢查評估', desc: '技術員上門全面檢查，找出蟲害來源及藏匿點，制定針對性處理方案。', tag: '專業診斷' },
    { num: '03', title: '專業藥劑處理', desc: '使用漁護署認可藥劑，針對不同蟲害採用最有效的處理方法，安全徹底。', tag: '安全認可' },
    { num: '04', title: '後續追蹤保障', desc: '提供後續追蹤與回訪，指導預防措施，確保問題徹底解決，讓您安心。', tag: '保障回訪' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">四步驟專業根治流程</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">系統化處理方法，確保蟲害徹底根治不復發</p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 0.1}>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-red-200 hover:shadow-md transition-all">
                <div className="text-4xl font-black text-red-100 mb-3">{s.num}</div>
                <h3 className="font-black text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-3">{s.desc}</p>
                <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">{s.tag}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Reviews (TrustIndex Widget) ───────────────────────────────────────────────
function Reviews() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 先移除舊的 script（如有）
    const existingScript = document.querySelector('script[src*="trustindex.io"]');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.src = 'https://cdn.trustindex.io/loader.js?8986e4665c80642e431622491c6';
    script.defer = true;
    script.async = true;
    // 注入到容器內，確保 widget 渲染在正確位置
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    } else {
      document.body.appendChild(script);
    }
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">真實客戶好評見證</h2>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
            <span className="ml-2 text-slate-700 font-bold text-lg">4.9 / 5.0</span>
          </div>
          <p className="text-slate-500">超過 200 位客戶的真實 Google 評論</p>
        </FadeIn>

        {/* TrustIndex Widget - script 注入到此容器內 */}
        <FadeIn>
          <div ref={containerRef} className="trustindex-widget-container min-h-[300px] overflow-hidden"></div>
        </FadeIn>

        <FadeIn className="text-center mt-8">
          <a
            href="https://www.google.com/maps/place/%E6%BB%85%E8%9F%B2%E8%81%B7%E4%BA%BA%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8+-+Pest+Killer+Ltd/@22.336997,114.1494176,15.75z/data=!3m1!5s0x3403f9440c7967bd:0x7508b0d71c9822a6!4m8!3m7!1s0x34040703684e1483:0xaadb34e63464cc13!8m2!3d22.3371349!4d114.148673!9m1!1b1!16s%2Fg%2F11q4jq41zm?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-red-400 text-slate-700 hover:text-red-600 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
          >
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            查看所有 Google 評論
          </a>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: '滅蟲服務大概需要多少費用？', a: '費用視乎蟲害種類、單位面積及感染程度而定。我們提供免費上門評估及報價，報價透明無隱藏收費。建議填寫表單或 WhatsApp 我們獲取準確報價。' },
    { q: '需要幾次處理才能完全根治？', a: '一般家居蟲害（如蟑螂、螞蟻）通常1-2次可根治。較嚴重或大範圍感染可能需要2-3次。師傅第一次到現場會評估所需次數，給您最合適的處理方案。' },
    { q: '處理後多久可以回到家中？', a: '視乎使用的藥劑種類，一般需要離開1-3小時。技術員會在服務前詳細告知，確保您和家人的安全。' },
    { q: '藥劑對小孩和寵物安全嗎？', a: '我們使用的所有藥劑均獲香港漁護署認可，對人類及寵物安全。技術員會提供詳細的注意事項，確保使用安全。' },
    { q: '服務覆蓋香港哪些地區？', a: '我們覆蓋全港18區，包括港島、九龍及新界各區，緊急個案最快24小時內安排上門。' },
    { q: '商業客戶可以簽訂定期防治合約嗎？', a: '可以！我們為餐廳、酒店、學校、辦公室等商業場所提供定期防治合約，確保場所持續符合衛生標準。請選擇「商業客戶」填寫表單，專員會聯絡您詳細討論。' },
    { q: '蟑螂處理後多久會看到效果？', a: '噴灑藥水後，蟑螂接觸藥劑後會逐漸中毒死亡，一般1-3天內可見明顯減少。蟑螂卵未孵化前有抗藥性，建議10-14天後進行第二次處理，根據生命週期徹底根治。' },
    { q: '老鼠問題一次服務可以解決嗎？', a: '家居誤入情況多數一次能夠解決，但必須跟從師傅建議收好食物及做好預防。師傅到場後會先檢查老鼠可能進入的源頭，並提供預防建議，防止再有老鼠入屋。' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">常見問題解答</h2>
          <p className="text-slate-500">解答您對滅蟲服務的疑問</p>
        </FadeIn>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 pr-4">{faq.q}</span>
                  {open === i ? <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ───────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-16 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">立即解決蟲害問題，今天就行動！</h2>
          <p className="text-slate-300 mb-8 text-lg">蟲害繁殖速度極快，每拖一天問題就更嚴重。立即聯絡我們，獲取免費評估及報價。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl"
            >
              <Phone className="w-5 h-5" />
              立即致電：{PHONE_DISPLAY}
            </a>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white px-8 py-4 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp 免費查詢
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/logo.png" alt="滅蟲職人" className="h-8 w-auto brightness-0 invert opacity-70" />
          <div className="text-center sm:text-right text-sm">
            <p>© 2026 滅蟲職人有限公司 · 香港專業滅蟲公司</p>
            <p className="mt-1">電話：{PHONE_DISPLAY} · WhatsApp：5599-4450</p>
            <a href="https://pestkillerhk.com" target="_blank" rel="noreferrer" className="text-red-400 hover:text-red-300 transition-colors">pestkillerhk.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Floating WhatsApp ─────────────────────────────────────────────────────────
function FloatingWA() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 animate-pulse"
      aria-label="WhatsApp 查詢"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200 selection:text-red-900">
      <Navbar />
      <Hero />
      <StatsBar />
      <ServicesGrid />
      <CaseGallery />
      <WhyUs />
      <Process />
      <Reviews />
      <FAQ />
      <CTASection />
      <Footer />
      <FloatingWA />
    </div>
  );
}
