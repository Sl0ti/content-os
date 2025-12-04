import React, { useState, useEffect } from 'react';
import { 
  Play, Film, Calendar, Clock, AlertTriangle, CheckCircle, 
  ArrowRight, RotateCcw, Youtube, BarChart2, Save, Layout, 
  ChevronRight, Settings, Plus, Trash2, ExternalLink, Menu, X,
  Library, Home, Activity, Sparkles, Brain, Loader, Lightbulb, Info,
  TrendingUp, Target, Eye, MousePointer
} from 'lucide-react';

// --- API CONFIGURATION ---
const apiKey = ""; 

// --- GEMINI HELPER ---
const callGemini = async (prompt) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.2 
          }
        }),
      }
    );

    if (!response.ok) throw new Error("API Call Failed");
    
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

// --- STYLING CONSTANTS ---
const STYLES = {
  bg: "bg-[#F7F7F5]", 
  sidebar: "bg-[#F7F7F5]", 
  cardBg: "bg-white",
  textMain: "text-[#37352F]",
  textLight: "text-[#9B9A97]",
  border: "border-[#E9E9E7]",
  activeItem: "bg-[#EAEAE8]",
  hoverItem: "hover:bg-[#EFEFED]",
  fontSerif: "font-serif",
  fontMono: "font-mono text-xs",
  danger: "text-[#EB5757]",
  success: "text-[#2D755D]",
  caution: "text-[#D9730D]",
  ai: "text-[#9D34DA]",
};

// --- UTILS ---
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// --- COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`${STYLES.cardBg} border ${STYLES.border} rounded-sm shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", size = "md", disabled = false }) => {
  const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  const variants = {
    primary: "bg-[#2383E2] hover:bg-[#1D6ED0] text-white border-transparent shadow-sm",
    secondary: "bg-white hover:bg-[#F1F1EF] text-[#37352F] border-[#D3D1CB]",
    ghost: "bg-transparent hover:bg-[#EFEFED] text-[#787774]",
    danger: "bg-transparent hover:bg-[#FFEBEB] text-[#EB5757] border border-transparent hover:border-[#FFCBCB]",
    ai: "bg-white hover:bg-[#F6F0F8] text-[#9D34DA] border-[#EADCF5] hover:border-[#D8BFEA] shadow-sm"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 border ${sizes[size]} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "" }) => (
  <div className="w-full">
    {label && <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5">{label}</label>}
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#F7F7F5] border border-[#E9E9E7] focus:border-[#2383E2] focus:bg-white rounded p-2.5 text-[#37352F] outline-none transition-all placeholder-[#D3D1CB]"
    />
  </div>
);

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    gray: "bg-[#E3E2E0] text-[#787774]",
    blue: "bg-[#E7F3F8] text-[#2383E2]",
    green: "bg-[#EDF3EC] text-[#2D755D]",
    red: "bg-[#FDEBEC] text-[#EB5757]",
    orange: "bg-[#FAEBDD] text-[#D9730D]",
    purple: "bg-[#F4EBF9] text-[#9D34DA]",
  };
  return (
    <span className={`${colors[color]} px-1.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};

const InfoTooltip = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="relative inline-block ml-2 group">
      <button 
        className="text-[#9B9A97] hover:text-[#2383E2] transition-colors cursor-help"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={14} />
      </button>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#37352F] text-white text-xs p-3 rounded shadow-lg z-50 pointer-events-none leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#37352F]"></div>
        </div>
      )}
    </div>
  );
};

// --- ORACLE WIDGET ---
const OracleGauge = ({ score }) => {
  const getColor = (s) => {
    if (s >= 8) return "text-[#2D755D]";
    if (s >= 5) return "text-[#D9730D]";
    return "text-[#EB5757]";
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className={`text-4xl font-black ${getColor(score)}`}>{score}/10</div>
      <div className="text-[10px] uppercase font-bold text-[#9B9A97] tracking-wider">Viral Potential</div>
    </div>
  );
};

// --- PAGES ---

const LandingPage = ({ onSelectMode }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 animate-fade-in max-w-5xl mx-auto">
    <div className="text-center space-y-6">
      <div className="inline-block p-4 rounded-full bg-[#F1F1EF] mb-4 shadow-sm border border-[#E9E9E7]">
        <Layout className="text-[#37352F]" size={48} />
      </div>
      <h1 className={`${STYLES.fontSerif} text-5xl md:text-6xl font-bold ${STYLES.textMain} tracking-tight`}>
        Content Strategy OS <span className="text-[#9D34DA] text-2xl align-top">v3</span>
      </h1>
      <p className={`${STYLES.textLight} text-xl max-w-2xl mx-auto leading-relaxed`}>
        Central Command for Content Creation. <br/>
        <b>The Oracle</b> is now online.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-6 w-full px-4">
      <button 
        onClick={() => onSelectMode('format')}
        className={`group text-left p-8 rounded-lg border border-[#E9E9E7] bg-white hover:bg-[#FBFBFA] transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#E3E2E0] p-3 rounded-md text-[#37352F]">
            <Brain size={24} />
          </div>
          <ArrowRight className="text-[#D3D1CB] group-hover:text-[#37352F] transition-colors" />
        </div>
        <h2 className="text-2xl font-bold text-[#37352F] mb-2">The Oracle & Gates</h2>
        <p className="text-[#787774]">
          Analyze volume, variety, and fandom. <br/>
          <b>New:</b> Auto-saves to library with Virality Score.
        </p>
      </button>

      <button 
        onClick={() => onSelectMode('schedule')}
        className={`group text-left p-8 rounded-lg border border-[#E9E9E7] bg-white hover:bg-[#FBFBFA] transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="bg-[#E3E2E0] p-3 rounded-md text-[#37352F]">
            <Calendar size={24} />
          </div>
          <ArrowRight className="text-[#D3D1CB] group-hover:text-[#37352F] transition-colors" />
        </div>
        <h2 className="text-2xl font-bold text-[#37352F] mb-2">Safety Protocol</h2>
        <p className="text-[#787774]">
          Input your last upload. <br/>
          Visual timelines to prevent burnout.
        </p>
      </button>
    </div>
  </div>
);

const FormatDecider = ({ settings, library, setLibrary }) => {
  const [mode, setMode] = useState('manual');
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ episodes: 0, length: 20, mediaType: 'tv' }); 
  const [result, setResult] = useState(null);
  
  // AI States
  const [franchiseName, setFranchiseName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [autoFillQuery, setAutoFillQuery] = useState("");

  const calculateHours = () => Math.round((data.episodes * data.length) / 60);

  const reset = () => { 
    setResult(null); 
    setAiResult(null);
    setStep(0); 
    setData({episodes:0, length:20, mediaType: 'tv'});
    setMode('manual');
    setFranchiseName("");
    setShowAutoFill(false);
  };

  const handleAutoFill = async () => {
    if (!autoFillQuery) return;
    setAiLoading(true);
    const prompt = `Return a JSON object with one key: "count", which is the total number of ${data.mediaType === 'tv' ? 'episodes' : 'movies'} for the franchise "${autoFillQuery}". Include main-line entries. Return ONLY the number in JSON.`;
    const res = await callGemini(prompt);
    if (res && res.count) {
      setData({ ...data, episodes: res.count });
      setShowAutoFill(false);
    }
    setAiLoading(false);
  };

  const saveToLibrary = (finalResult, analysisData) => {
    // Check if already exists to avoid duplicates
    if (library.some(item => item.title === analysisData.title)) return;

    const newItem = {
      id: Date.now(),
      title: analysisData.title,
      format: finalResult,
      episodes: analysisData.count,
      mediaType: analysisData.mediaType,
      viralityScore: analysisData.viralityScore || 5,
      trend: analysisData.trend || 'Stable',
      reasoning: analysisData.reasoning || "Manual Analysis",
      competitors: [],
      performance: { views: '', ctr: '' },
      link: ''
    };
    setLibrary([newItem, ...library]);
  };

  const runAIAnalysis = async () => {
    if (!franchiseName) return;
    setAiLoading(true);
    
    // UPDATED PROMPT: ORACLE INCLUDED
    const prompt = `Analyze the franchise "${franchiseName}".
    
    CRITICAL RULES:
    1. TV Shows > 500 eps -> "ONE SITTING".
    2. Movie Franchises > 60h runtime -> "ONE SITTING".
    3. High Variety -> "RANKING".
    
    THE ORACLE TASK:
    Estimate the current "Virality Score" (0-10) based on global search interest/pop culture relevance right now.
    Identify the Trend Direction (Rising, Falling, Stable).
    
    Return JSON:
    - title: string (Formal Name)
    - mediaType: "TV Show" or "Movie Franchise"
    - count: number (estimated total)
    - viralityScore: number (0-10)
    - trend: "Rising" | "Falling" | "Stable"
    - recommendedFormat: "ONE SITTING" or "RANKING"
    - reasoning: string (2 sentences)
    `;

    const response = await callGemini(prompt);
    if (response) {
      setAiResult(response);
      setResult(response.recommendedFormat);
      saveToLibrary(response.recommendedFormat, response);
    }
    setAiLoading(false);
  };

  // MANUAL SAVE WRAPPER
  const handleManualComplete = (finalFormat) => {
    setResult(finalFormat);
    saveToLibrary(finalFormat, {
      title: "Manual Entry (Rename in Library)",
      mediaType: data.mediaType === 'tv' ? "TV Show" : "Movie Franchise",
      count: data.episodes,
      viralityScore: 5, // Default for manual
      trend: "Unknown",
      reasoning: "Manually passed the gates."
    });
  };

  const steps = [
    {
      title: 'Gate 0: Media Type',
      question: 'What type of franchise is this?',
      info: "Films = Marathon de 24h sans dormir (Défi physique). Séries = Marathon de vie (Endurance long terme).",
      options: [
        { label: 'TV Series / Anime', value: 'next_step', action: () => setData({...data, mediaType: 'tv'}) },
        { label: 'Movie Franchise', value: 'next_step', action: () => setData({...data, mediaType: 'movie', length: 110}) } 
      ]
    },
    {
      title: 'Gate 1: Volume',
      question: data.mediaType === 'tv' ? 'Episode Count' : 'Movie Count',
      subtext: data.mediaType === 'tv' ? `Absurd > ${settings.thresholdAbsurd} eps` : `Absurd > 60 movies`, 
      info: "Volume 'Absurde' = Le concept est la souffrance. Volume 'Normal' = Le concept est l'analyse.",
      input: true,
      next: (val) => {
        const count = parseInt(val);
        if (data.mediaType === 'movie') {
          if (count >= 60) return 'ONE SITTING'; 
        } else {
          if (count >= settings.thresholdAbsurd) return 'ONE SITTING';
        }
        return 'next_step'; 
      }
    },
    {
      title: 'Gate 1: Runtime',
      question: 'Avg Length (Minutes)',
      subtext: `Checking if total > ${settings.thresholdHours} hours.`,
      input: true,
      field: 'length',
      next: (val) => {
        const totalHours = (data.episodes * parseInt(val)) / 60;
        const threshold = data.mediaType === 'movie' ? 60 : settings.thresholdHours; 
        if (totalHours > threshold) return 'ONE SITTING';
        return 'next_step';
      }
    },
    {
      title: 'Gate 1: Culture',
      question: 'Cultural Perception',
      info: "Est-ce connu pour être 'infini' ? (Ex: One Piece). L'intuition du public valide le titre 'One Sitting'.",
      options: [
        { label: 'Legendary Length (One Piece/MCU)', value: 'ONE SITTING' },
        { label: 'Standard Length', value: 'next_step' }
      ]
    },
    {
      title: 'Gate 2: Variety',
      question: 'Content Structure',
      info: "Si répétitif (Pokemon) -> One Sitting. Si varié (Pixar) -> Ranking.",
      options: [
        { label: 'High Variety (Distinct Themes)', value: 'RANKING' },
        { label: 'Repetitive (Same Formula)', value: 'next_step' } 
      ]
    },
    {
      title: 'Gate 3: Fandom',
      question: 'Community Vibe',
      options: [
        { label: 'Debates & Lists', value: 'RANKING' },
        { label: 'Memes & Pain', value: 'ONE SITTING' }
      ]
    }
  ];

  const handleNext = (val, optionAction) => {
    if (optionAction) optionAction();
    const currentStep = steps[step];
    setTimeout(() => {
      const logicVal = val || data[currentStep.field || 'episodes'];
      const outcome = currentStep.next ? currentStep.next(logicVal) : val;
      if (outcome === 'next_step') {
        setStep(step + 1);
      } else {
        handleManualComplete(outcome);
      }
    }, 0);
  };

  if (result) return (
    <div className="animate-fade-in flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <div className="mb-8 w-full">
        {aiResult && (
          <div className="bg-white border border-[#E9E9E7] p-6 rounded-lg mb-8 text-left shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={100} className="text-[#9D34DA]" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#9D34DA] mb-1">
                  <Brain size={18} />
                  <span className="font-bold text-xs uppercase tracking-wide">The Oracle Analysis</span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#37352F]">{aiResult.title}</h2>
              </div>
              <OracleGauge score={aiResult.viralityScore} />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#F7F7F5] p-3 rounded border border-[#E9E9E7]">
                <div className="text-[#9B9A97] text-xs font-bold uppercase mb-1">Trend</div>
                <div className="font-medium text-[#37352F] flex items-center gap-1">
                  {aiResult.trend === 'Rising' ? <TrendingUp size={14} className="text-[#2D755D]"/> : <Activity size={14}/>}
                  {aiResult.trend}
                </div>
              </div>
              <div className="bg-[#F7F7F5] p-3 rounded border border-[#E9E9E7]">
                <div className="text-[#9B9A97] text-xs font-bold uppercase mb-1">Volume</div>
                <div className="font-medium text-[#37352F]">{aiResult.count} entries</div>
              </div>
              <div className="bg-[#F7F7F5] p-3 rounded border border-[#E9E9E7]">
                <div className="text-[#9B9A97] text-xs font-bold uppercase mb-1">Vibe</div>
                <div className="font-medium text-[#37352F]">{aiResult.fandomVibe}</div>
              </div>
            </div>
            
            <div className="bg-[#F4EBF9] p-4 rounded text-sm text-[#37352F] border-l-4 border-[#9D34DA] italic leading-relaxed">
              "{aiResult.reasoning}"
            </div>
            
            <div className="mt-4 text-center">
              <Badge color="green">Saved to Library</Badge>
            </div>
          </div>
        )}

        <h2 className="text-[#9B9A97] text-xs font-bold uppercase tracking-widest mb-4">Recommended Strategy</h2>
        <h1 className={`${STYLES.fontSerif} text-6xl font-bold text-[#37352F] mb-6`}>{result}</h1>
      </div>
      <Button onClick={reset} variant="secondary">Analyze Another</Button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto mt-12 animate-fade-in">
      <div className="flex gap-4 mb-8 justify-center">
        <button onClick={() => setMode('manual')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'manual' ? 'bg-[#37352F] text-white shadow-lg' : 'text-[#9B9A97] hover:text-[#37352F]'}`}>Manual Check</button>
        <button onClick={() => setMode('ai')} className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-white text-[#9D34DA] shadow-md border border-[#E9E9E7]' : 'text-[#9B9A97] hover:text-[#9D34DA]'}`}><Sparkles size={14} /> The Oracle</button>
      </div>

      <Card className="p-10 relative overflow-hidden">
        {mode === 'ai' ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F] mb-2`}>Ask The Oracle</h2>
              <p className="text-[#9B9A97]">Enter a franchise. Get format, volume, and virality score.</p>
            </div>
            <div className="relative">
              <input type="text" value={franchiseName} onChange={(e) => setFranchiseName(e.target.value)} placeholder="e.g. One Piece, MCU..." className="w-full bg-[#F7F7F5] border border-[#E9E9E7] focus:border-[#9D34DA] rounded-lg p-4 text-xl font-medium text-[#37352F] outline-none transition-all placeholder-[#D3D1CB]" onKeyDown={(e) => e.key === 'Enter' && runAIAnalysis()} />
              <div className="absolute right-2 top-2">
                <Button onClick={runAIAnalysis} variant="ai" disabled={aiLoading || !franchiseName}>{aiLoading ? <Loader className="animate-spin" size={20} /> : <ArrowRight size={20} />}</Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center text-[#9B9A97] text-xs font-bold uppercase tracking-widest">
              <span>Gate {step}</span> 
              <span>{step + 1} / {steps.length}</span>
            </div>
            <div className="flex items-start gap-2 mb-2">
              <h2 className={`text-2xl font-bold text-[#37352F] ${STYLES.fontSerif}`}>{steps[step].question}</h2>
              {steps[step].info && <InfoTooltip text={steps[step].info} />}
            </div>
            {steps[step].subtext && <p className="text-[#787774] mb-8">{steps[step].subtext}</p>}
            {steps[step].input ? (
              <>
                <div className="relative">
                  <input type="number" value={data[steps[step].field || 'episodes'] || ''} onChange={(e) => setData({...data, [steps[step].field || 'episodes']: e.target.value})} className="w-full text-5xl font-bold bg-transparent border-b-2 border-[#E9E9E7] focus:border-[#2383E2] outline-none py-2 text-[#37352F] placeholder-[#E3E2E0]" placeholder="0" autoFocus />
                  {steps[step].title === 'Gate 1: Volume' && (
                    <div className="absolute right-0 top-2">
                      {showAutoFill ? (
                        <div className="flex items-center gap-2 bg-white shadow-lg border border-[#E9E9E7] p-2 rounded-lg animate-fade-in"><input type="text" value={autoFillQuery} onChange={(e) => setAutoFillQuery(e.target.value)} placeholder="e.g. Dexter" className="bg-[#F7F7F5] p-1 rounded text-sm outline-none w-32" onKeyDown={(e) => e.key === 'Enter' && handleAutoFill()} /><button onClick={handleAutoFill} disabled={aiLoading} className="text-[#9D34DA] hover:bg-[#F4EBF9] p-1 rounded">{aiLoading ? <Loader size={14} className="animate-spin"/> : <ArrowRight size={14}/>}</button></div>
                      ) : (
                        <button onClick={() => setShowAutoFill(true)} className="flex items-center gap-1 text-xs text-[#9D34DA] bg-[#F4EBF9] px-2 py-1 rounded hover:bg-[#EADCF5] transition-colors"><Sparkles size={12} /> Auto-count?</button>
                      )}
                    </div>
                  )}
                </div>
                {steps[step].field === 'length' && <p className="mt-4 font-mono text-[#787774]">Total: ≈ {calculateHours()} Hours</p>}
                <div className="mt-8 flex justify-end"><Button onClick={() => handleNext()}>Next <ChevronRight size={16}/></Button></div>
              </>
            ) : (
              <div className="grid gap-3">{steps[step].options.map((opt, i) => (<button key={i} onClick={() => handleNext(opt.value, opt.action)} className="text-left p-4 rounded border border-[#E9E9E7] hover:border-[#2383E2] hover:bg-[#F7F7F5] transition-all"><span className="font-medium text-[#37352F]">{opt.label}</span></button>))}</div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

const LibraryPage = ({ library, setLibrary }) => {
  const [newEntry, setNewEntry] = useState({ title: '', format: 'RANKING', link: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null); // Accordion state
  
  // Competitor State inside library items
  const addCompetitor = (id, url) => {
    if (!url) return;
    setLibrary(library.map(item => 
      item.id === id ? { ...item, competitors: [...(item.competitors || []), url] } : item
    ));
  };

  const updatePerformance = (id, field, val) => {
    setLibrary(library.map(item => 
      item.id === id ? { ...item, performance: { ...item.performance, [field]: val } } : item
    ));
  };

  const removeCompetitor = (itemId, urlIdx) => {
    setLibrary(library.map(item => 
      item.id === itemId ? { ...item, competitors: item.competitors.filter((_, i) => i !== urlIdx) } : item
    ));
  };

  const addEntry = () => {
    if (!newEntry.title) return;
    setLibrary([...library, { ...newEntry, id: Date.now(), competitors: [], performance: { views: '', ctr: '' } }]);
    setNewEntry({ title: '', format: 'RANKING', link: '' });
    setShowAdd(false);
  };

  const removeEntry = (id) => setLibrary(library.filter(item => item.id !== id));

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F]`}>Franchise Library</h1>
        <Button onClick={() => setShowAdd(!showAdd)} variant="primary" size="sm"><Plus size={16} /> New Entry</Button>
      </div>

      {showAdd && (
        <Card className="p-6 mb-8 bg-[#FBFBFA]">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Input label="Name" value={newEntry.title} onChange={v => setNewEntry({...newEntry, title: v})} placeholder="e.g. Marvel" />
            <div>
              <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5">Format</label>
              <select className="w-full bg-white border border-[#E9E9E7] rounded p-2.5 text-[#37352F] outline-none" value={newEntry.format} onChange={e => setNewEntry({...newEntry, format: e.target.value})}>
                <option value="RANKING">Ranking Every...</option>
                <option value="ONE SITTING">One Sitting</option>
              </select>
            </div>
            <Input label="Link" value={newEntry.link} onChange={v => setNewEntry({...newEntry, link: v})} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2"><Button onClick={() => setShowAdd(false)} variant="ghost" size="sm">Cancel</Button><Button onClick={addEntry} variant="primary" size="sm">Save</Button></div>
        </Card>
      )}

      <div className="grid gap-4">
        {library.length === 0 && <div className="text-center py-12 text-[#9B9A97] italic border-2 border-dashed border-[#E9E9E7] rounded-lg">No franchises yet. Use The Oracle to analyze one.</div>}
        
        {library.map((item) => {
          const videoId = getYoutubeId(item.link);
          const isExpanded = expandedId === item.id;
          
          return (
            <Card key={item.id} className={`group overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-[#2383E2] shadow-md' : 'hover:shadow-sm'}`}>
              <div className="flex">
                <div className="w-32 bg-black flex-shrink-0 relative cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  {videoId ? (
                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20 bg-[#37352F]"><Film size={24} /></div>
                  )}
                </div>

                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start">
                    <div className="cursor-pointer flex-1" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                      <h3 className="font-bold text-lg text-[#37352F] flex items-center gap-2">
                        {item.title}
                        {item.viralityScore && (
                          <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${item.viralityScore >= 8 ? 'bg-[#EDF3EC] text-[#2D755D]' : 'bg-[#FAEBDD] text-[#D9730D]'}`}>
                            {item.viralityScore}/10
                          </span>
                        )}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <Badge color={item.format === 'ONE SITTING' ? 'red' : 'blue'}>{item.format}</Badge>
                        {item.episodes && <span className="text-xs text-[#9B9A97] flex items-center">{item.episodes} items</span>}
                      </div>
                    </div>
                    <button onClick={() => removeEntry(item.id)} className="text-[#D3D1CB] hover:text-[#EB5757] p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>

              {/* EXPANDED SECTION */}
              {isExpanded && (
                <div className="border-t border-[#E9E9E7] p-6 bg-[#FBFBFA]">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* COMPETITORS */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-[#9B9A97] mb-3 flex items-center gap-2"><Target size={14}/> Intelligence (Competitors)</h4>
                      <div className="space-y-2 mb-3">
                        {item.competitors && item.competitors.map((url, i) => (
                          <div key={i} className="flex items-center justify-between bg-white border border-[#E9E9E7] p-2 rounded text-sm text-[#37352F]">
                            <a href={url} target="_blank" rel="noreferrer" className="truncate flex-1 hover:text-[#2383E2]">{url}</a>
                            <button onClick={() => removeCompetitor(item.id, i)} className="text-[#D3D1CB] hover:text-[#EB5757]"><X size={14}/></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input id={`comp-${item.id}`} type="text" placeholder="Paste video URL" className="flex-1 bg-white border border-[#E9E9E7] rounded px-2 py-1 text-sm outline-none focus:border-[#2383E2]" onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addCompetitor(item.id, e.target.value);
                            e.target.value = '';
                          }
                        }}/>
                        <Button size="xs" variant="secondary" onClick={() => {
                          const input = document.getElementById(`comp-${item.id}`);
                          addCompetitor(item.id, input.value);
                          input.value = '';
                        }}>Add</Button>
                      </div>
                    </div>

                    {/* PERFORMANCE */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-[#9B9A97] mb-3 flex items-center gap-2"><BarChart2 size={14}/> Post-Mortem</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-[#9B9A97] mb-1">Views</label>
                          <div className="relative">
                            <Eye size={14} className="absolute left-2 top-2.5 text-[#D3D1CB]" />
                            <input 
                              type="text" 
                              value={item.performance?.views || ''} 
                              onChange={(e) => updatePerformance(item.id, 'views', e.target.value)}
                              placeholder="0" 
                              className="w-full pl-7 pr-2 py-2 bg-white border border-[#E9E9E7] rounded text-sm font-mono focus:border-[#2D755D] outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-[#9B9A97] mb-1">CTR (%)</label>
                          <div className="relative">
                            <MousePointer size={14} className="absolute left-2 top-2.5 text-[#D3D1CB]" />
                            <input 
                              type="text" 
                              value={item.performance?.ctr || ''} 
                              onChange={(e) => updatePerformance(item.id, 'ctr', e.target.value)}
                              placeholder="0.0%" 
                              className="w-full pl-7 pr-2 py-2 bg-white border border-[#E9E9E7] rounded text-sm font-mono focus:border-[#2D755D] outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      {item.reasoning && (
                        <div className="mt-4 p-3 bg-[#F4EBF9] rounded border border-[#EADCF5] text-xs text-[#37352F] italic">
                          "AI Reason: {item.reasoning}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const CalendarWidget = ({ lastDate, safeDate, daysRemaining }) => {
  const startDate = new Date(lastDate);
  const displayStart = new Date(startDate);
  displayStart.setDate(1); 

  const weeks = [];
  let current = new Date(displayStart);
  for (let i = 0; i < 42; i++) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div className="bg-white border border-[#E9E9E7] rounded p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold uppercase text-[#9B9A97] flex items-center gap-1">
          Visual Timeline
          <InfoTooltip text="Rouge = Risque de lassitude maximal. Jaune = Période de récupération (changer de format). Vert = Audience prête pour le même sujet." />
        </span>
        <div className="flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#EB5757]"></div>Danger</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#E2B203]"></div>Caution</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#388B6F]"></div>Safe</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map(d => (
          <div key={d} className="text-center text-[10px] text-[#9B9A97] mb-1">{d}</div>
        ))}
        {weeks.map((day, idx) => {
          const isPast = day < new Date(lastDate);
          const isDanger = day >= new Date(lastDate) && day < addDays(new Date(lastDate), 28); 
          const isCaution = day >= addDays(new Date(lastDate), 28) && day < new Date(safeDate);
          const isSafe = day >= new Date(safeDate);
          
          let bgClass = "bg-[#F7F7F5] text-[#D3D1CB]"; 
          if (!isPast) {
            if (isDanger) bgClass = "bg-[#FFEDED] text-[#EB5757]";
            else if (isCaution) bgClass = "bg-[#FFF8E6] text-[#D9730D]";
            else if (isSafe) bgClass = "bg-[#EDF3EC] text-[#2D755D]";
          }
          
          const isUploadDay = day.toDateString() === new Date(lastDate).toDateString();
          const isSafeDay = day.toDateString() === new Date(safeDate).toDateString();

          return (
            <div key={idx} className={`aspect-square rounded-sm flex items-center justify-center text-xs relative ${bgClass} ${isUploadDay || isSafeDay ? 'font-bold ring-1 ring-offset-1 ring-current' : ''}`}>
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Scheduler = ({ settings }) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('scheduler_data_v2');
    return saved ? JSON.parse(saved) : { lastUpload: '', lastScope: 'full', lastFormat: 'RANKING', newScope: 'full' };
  });
  
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    localStorage.setItem('scheduler_data_v2', JSON.stringify(formData));
    if (formData.lastUpload) calculateDate();
  }, [formData]);

  const calculateDate = () => {
    if (!formData.lastUpload) return;
    const lastDate = new Date(formData.lastUpload);
    const today = new Date();
    
    let weeksToAdd = 0;
    let reason = "";
    let status = "safe";

    if (formData.lastScope === 'full' && formData.newScope === 'full') {
      weeksToAdd = 12;
      reason = "⚠️ Topic Fatigue: Two full deep dives need 12 weeks gap.";
      status = "danger";
    } else if (formData.lastScope !== formData.newScope) {
      weeksToAdd = 4;
      reason = "✅ Scope Separation: Different scopes allow a 4-week gap.";
      status = "safe";
    }
    
    if (formData.lastFormat === 'ONE SITTING') {
      weeksToAdd = Math.max(weeksToAdd, 8);
      reason += " 🛑 Endurance Rule: One Sitting videos need 8 weeks recovery.";
      status = status === 'danger' ? 'danger' : 'caution';
    }

    const safeDate = new Date(lastDate);
    safeDate.setDate(lastDate.getDate() + (weeksToAdd * 7));
    const diffDays = Math.ceil((safeDate - today) / (1000 * 60 * 60 * 24));

    setAnalysis({
      safeDate: safeDate.toDateString(),
      safeDateObj: safeDate,
      daysRemaining: diffDays,
      reason,
      status
    });
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in grid md:grid-cols-2 gap-8">
      <div>
        <h2 className={`${STYLES.fontSerif} text-2xl font-bold text-[#37352F] mb-6`}>Safety Protocol</h2>
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <Input 
              label="1. Last Upload Date" 
              type="date" 
              value={formData.lastUpload} 
              onChange={v => setFormData({...formData, lastUpload: v})} 
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  2. Last Scope <InfoTooltip text="Full = Toute la série. Partial = Juste les vilains, ou une saison spécifique." />
                </label>
                <select 
                  className="w-full bg-[#F7F7F5] border border-[#E9E9E7] rounded p-2 text-[#37352F]"
                  value={formData.lastScope}
                  onChange={e => setFormData({...formData, lastScope: e.target.value})}
                >
                  <option value="full">Full Franchise</option>
                  <option value="partial">Partial (Villains/Seasons)</option>
                </select>
              </div>
              <div>
                <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5">3. Last Format</label>
                <select 
                  className="w-full bg-[#F7F7F5] border border-[#E9E9E7] rounded p-2 text-[#37352F]"
                  value={formData.lastFormat}
                  onChange={e => setFormData({...formData, lastFormat: e.target.value})}
                >
                  <option value="RANKING">Ranking</option>
                  <option value="ONE SITTING">One Sitting</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[#2383E2] text-xs font-bold uppercase tracking-wider mb-1.5">4. Next Video Scope</label>
              <select 
                className="w-full bg-white border border-[#2383E2] rounded p-2 text-[#37352F]"
                value={formData.newScope}
                onChange={e => setFormData({...formData, newScope: e.target.value})}
              >
                <option value="full">Full Franchise</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>
        </Card>
        
        {analysis && (
          <Card className={`p-6 border-l-4 ${analysis.status === 'danger' ? 'border-l-[#EB5757]' : analysis.status === 'caution' ? 'border-l-[#E2B203]' : 'border-l-[#388B6F]'}`}>
            <h3 className="text-[#9B9A97] text-xs font-bold uppercase tracking-widest mb-2">Verdict</h3>
            <p className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F] mb-1`}>{analysis.safeDate}</p>
            <p className={`${STYLES.fontMono} text-[#787774] mb-4`}>
              {analysis.daysRemaining > 0 ? `${analysis.daysRemaining} days cooldown remaining` : "You are clear to post."}
            </p>
            <div className="bg-[#F7F7F5] p-3 rounded text-sm text-[#37352F]">
              {analysis.reason}
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <h2 className={`${STYLES.fontSerif} text-2xl font-bold text-[#37352F] mb-6 md:opacity-0`}>Calendar</h2>
        {analysis && formData.lastUpload ? (
          <CalendarWidget lastDate={formData.lastUpload} safeDate={analysis.safeDateObj} daysRemaining={analysis.daysRemaining} />
        ) : (
          <div className="h-64 border-2 border-dashed border-[#E9E9E7] rounded flex items-center justify-center text-[#D3D1CB]">
            Enter a date to see the timeline
          </div>
        )}
        
        <div className="bg-[#F1F1EF] p-6 rounded-lg border border-[#E9E9E7]">
          <div className="flex items-center gap-2 mb-2 text-[#37352F] font-bold">
            <Activity size={18} /> Channel Balance
          </div>
          <p className="text-sm text-[#787774]">
            Remember your framework: <br/>
            <b>Don't post two "One Sitting" videos back to back.</b> <br/>
            If you are in cooldown, switch to a "Creative Challenge" or "Exploration" video.
          </p>
        </div>
      </div>
    </div>
  );
};

const SettingsPage = ({ settings, setSettings }) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F] mb-8`}>Framework Calibration</h1>
      
      <Card className="p-8 mb-8">
        <h2 className="font-bold text-[#37352F] mb-6 flex items-center gap-2">
          <Clock size={20} /> Gate 1 Thresholds
        </h2>
        
        <div className="space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-[#37352F]">Absurd Episode Count</label>
              <span className="font-mono text-[#787774]">{settings.thresholdAbsurd} eps</span>
            </div>
            <input 
              type="range" min="300" max="1000" step="50"
              value={settings.thresholdAbsurd}
              onChange={(e) => setSettings({...settings, thresholdAbsurd: parseInt(e.target.value)})}
              className="w-full accent-[#37352F]"
            />
            <p className="text-xs text-[#9B9A97] mt-1">Below this, it's just "Long". Above this, it's "Spectacle".</p>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-[#37352F]">Absurd Runtime (Hours)</label>
              <span className="font-mono text-[#787774]">{settings.thresholdHours} hours</span>
            </div>
            <input 
              type="range" min="50" max="300" step="10"
              value={settings.thresholdHours}
              onChange={(e) => setSettings({...settings, thresholdHours: parseInt(e.target.value)})}
              className="w-full accent-[#37352F]"
            />
            <p className="text-xs text-[#9B9A97] mt-1">The point where "Ranking" becomes physically impossible in one go.</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-[#FDFDFC] border-l-4 border-[#2383E2]">
        <h3 className="font-bold text-[#37352F] mb-2">Why change these?</h3>
        <p className="text-sm text-[#787774] leading-relaxed">
          The default V4 Framework uses <b>600 episodes</b> and <b>150 hours</b> as the cut-off for "One Sitting" necessity. If you are willing to suffer more, raise these numbers. If you prefer shorter challenges, lower them.
        </p>
      </Card>
    </div>
  );
};

// --- APP SHELL ---

export default function ContentStrategyApp() {
  const [view, setView] = useState('home');
  const [isSidebarOpen, setSidebar] = useState(true);
  
  // Persisted States
  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('library_v1');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('settings_v1');
    return saved ? JSON.parse(saved) : { thresholdAbsurd: 600, thresholdHigh: 400, thresholdHours: 150 };
  });

  useEffect(() => { localStorage.setItem('library_v1', JSON.stringify(library)); }, [library]);
  useEffect(() => { localStorage.setItem('settings_v1', JSON.stringify(settings)); }, [settings]);

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setView(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${view === id ? 'bg-[#E3E2E0] text-[#37352F] font-medium' : 'text-[#787774] hover:bg-[#EFEFED]'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen ${STYLES.bg} flex text-[#37352F] font-sans selection:bg-[#CDE5FE]`}>
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#F7F7F5] border-r border-[#E9E9E7] flex-shrink-0 transition-all duration-300 overflow-hidden relative`}>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-6 h-6 bg-[#37352F] rounded-sm flex items-center justify-center text-white font-serif font-bold">C</div>
            <span className="font-bold whitespace-nowrap">Content OS</span>
          </div>
          
          <div className="space-y-1">
            <p className="px-3 text-xs font-bold text-[#9B9A97] mb-2 uppercase tracking-wider">Tools</p>
            <NavItem id="home" icon={Home} label="Dashboard" />
            <NavItem id="format" icon={Brain} label="The Oracle" />
            <NavItem id="schedule" icon={Calendar} label="Scheduler" />
            
            <p className="px-3 text-xs font-bold text-[#9B9A97] mt-6 mb-2 uppercase tracking-wider">Database</p>
            <NavItem id="library" icon={Library} label="Franchises" />
            
            <p className="px-3 text-xs font-bold text-[#9B9A97] mt-6 mb-2 uppercase tracking-wider">System</p>
            <NavItem id="settings" icon={Settings} label="Calibration" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-[#E9E9E7] bg-white flex items-center px-4 justify-between shrink-0">
          <button onClick={() => setSidebar(!isSidebarOpen)} className="p-2 hover:bg-[#F7F7F5] rounded text-[#787774]">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#9B9A97]">AI ACTIVE</span>
            <div className="w-2 h-2 bg-[#9D34DA] rounded-full animate-pulse"></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-12">
          {view === 'home' && <LandingPage onSelectMode={setView} />}
          {view === 'format' && <FormatDecider settings={settings} library={library} setLibrary={setLibrary} />}
          {view === 'schedule' && <Scheduler settings={settings} />}
          {view === 'library' && <LibraryPage library={library} setLibrary={setLibrary} />}
          {view === 'settings' && <SettingsPage settings={settings} setSettings={setSettings} />}
        </main>
      </div>
    </div>
  );
}