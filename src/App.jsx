import React, { useState, useEffect } from 'react';
import { 
  Play, Film, Calendar, Clock, AlertTriangle, CheckCircle, 
  ArrowRight, RotateCcw, Youtube, BarChart2, Save, Layout, 
  ChevronRight, Settings, Plus, Trash2, ExternalLink, Menu, X,
  Library, Home, Activity, Sparkles, Brain, Loader, Lightbulb
} from 'lucide-react';

// --- API CONFIGURATION ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

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
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    if (!response.ok) throw new Error("API Call Failed");
    
    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      // Nettoyage du Markdown (```json ... ```) pour éviter les erreurs de parsing
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("AI Error:", error);
    return null;
  }
};

// --- STYLING CONSTANTS (Notion/Productivity Aesthetic) ---
const STYLES = {
  bg: "bg-[#F7F7F5]", // Notion light gray background
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
  caution: "text-[#D9730D]", // Notion Orange
  ai: "text-[#9D34DA]", // Notion Purple for AI
};

// Helper to extract YouTube ID
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper for dates
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
    sm: "px-2 py-1 text-sm",
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
    <span className={`${colors[color]} px-1.5 py-0.5 rounded text-xs font-medium uppercase tracking-wide`}>
      {children}
    </span>
  );
};

// --- PAGES ---

// ** Restored Landing Page Component **
const LandingPage = ({ onSelectMode }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 animate-fade-in max-w-5xl mx-auto">
    <div className="text-center space-y-6">
      <div className="inline-block p-4 rounded-full bg-[#F1F1EF] mb-4 shadow-sm border border-[#E9E9E7]">
        <Layout className="text-[#37352F]" size={48} />
      </div>
      <h1 className={`${STYLES.fontSerif} text-5xl md:text-6xl font-bold ${STYLES.textMain} tracking-tight`}>
        Content Strategy OS
      </h1>
      <p className={`${STYLES.textLight} text-xl max-w-2xl mx-auto leading-relaxed`}>
        Your central command for V4 Framework logic. <br/>
        Now powered by <span className="text-[#9D34DA] font-medium flex items-center gap-1 inline-flex"><Sparkles size={16}/>Gemini AI</span>.
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
        <h2 className="text-2xl font-bold text-[#37352F] mb-2">Smart Analyzer</h2>
        <p className="text-[#787774]">
          Let AI analyze your franchise volume, vibe, and structure to decide: <br/>
          <b>Ranking</b> vs <b>One Sitting</b>.
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
          See visual timelines and "Cooldown" periods to prevent burnout.
        </p>
      </button>
    </div>
  </div>
);

const FormatDecider = ({ settings }) => {
  const [mode, setMode] = useState('manual'); // manual, ai
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ episodes: 0, length: 20 });
  const [result, setResult] = useState(null);
  
  // AI State
  const [franchiseName, setFranchiseName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const calculateHours = () => Math.round((data.episodes * data.length) / 60);

  const reset = () => { 
    setResult(null); 
    setAiResult(null);
    setStep(0); 
    setData({episodes:0, length:20});
    setMode('manual');
    setFranchiseName("");
  };

  const runAIAnalysis = async () => {
    if (!franchiseName) return;
    setAiLoading(true);
    
    const prompt = `Analyze the TV show or movie franchise "${franchiseName}".
    Return a JSON object with these fields:
    - episodeCount: number (estimate total episodes or movies)
    - averageLengthMinutes: number (approximate length in minutes)
    - isCulturallyMassive: boolean (is it known for being endless/huge like One Piece/Pokemon?)
    - varietyLevel: "High" or "Low" (Do episodes stand alone well like Black Mirror, or are they repetitive?)
    - fandomVibe: "Debate" (fans argue about quality) or "Chaos" (fans meme about pain/length)
    - recommendedFormat: "ONE SITTING" or "RANKING"
    - reasoning: string (2 sentences explaining why based on volume and fandom)
    `;

    const response = await callGemini(prompt);
    if (response) {
      setAiResult(response);
      setResult(response.recommendedFormat);
    }
    setAiLoading(false);
  };

  // --- MANUAL STEPS LOGIC ---
  const steps = [
    {
      title: 'Gate 1: Volume',
      question: 'Episode/Movie Count',
      subtext: 'Does it reach the Absurdity Threshold?',
      input: true,
      next: (val) => {
        const count = parseInt(val);
        if (count >= settings.thresholdAbsurd) return 'ONE SITTING';
        if (count >= settings.thresholdHigh) return 'ONE SITTING';
        if (count < 100) return 'RANKING';
        return 'next_step'; 
      }
    },
    {
      title: 'Gate 1: Runtime',
      question: 'Avg Length (Minutes)',
      subtext: `Checking if total > ${settings.thresholdHours} hours`,
      input: true,
      field: 'length',
      next: (val) => {
        const totalHours = (data.episodes * parseInt(val)) / 60;
        if (totalHours > settings.thresholdHours) return 'ONE SITTING';
        return 'next_step';
      }
    },
    {
      title: 'Gate 1: Culture',
      question: 'Cultural Perception',
      options: [
        { label: 'Legendary Length (One Piece)', value: 'ONE SITTING' },
        { label: 'Standard Show (Friends)', value: 'next_step' }
      ]
    },
    {
      title: 'Gate 2: Variety',
      question: 'Content Structure',
      options: [
        { label: 'High Variety (Pixar)', value: 'RANKING' },
        { label: 'Repetitive (Pokemon)', value: 'next_step' } 
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

  const handleNext = (val) => {
    const currentStep = steps[step];
    const logicVal = val || data[currentStep.field || 'episodes'];
    const outcome = currentStep.next ? currentStep.next(logicVal) : val;
    outcome === 'next_step' ? setStep(step + 1) : setResult(outcome);
  };

  // --- RENDER RESULTS ---
  if (result) return (
    <div className="animate-fade-in flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
      <div className="mb-8 w-full">
        {aiResult && (
          <div className="bg-white border border-[#E9E9E7] p-6 rounded-lg mb-8 text-left shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#9D34DA]">
              <Sparkles size={18} />
              <span className="font-bold text-sm uppercase tracking-wide">AI Analysis: {franchiseName}</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div className="bg-[#F7F7F5] p-3 rounded">
                <div className="text-[#9B9A97] text-xs font-bold uppercase">Volume</div>
                <div className="font-mono text-[#37352F]">{aiResult.episodeCount} eps</div>
              </div>
              <div className="bg-[#F7F7F5] p-3 rounded">
                <div className="text-[#9B9A97] text-xs font-bold uppercase">Vibe</div>
                <div className="font-mono text-[#37352F]">{aiResult.fandomVibe}</div>
              </div>
              <div className="bg-[#F7F7F5] p-3 rounded">
                <div className="text-[#9B9A97] text-xs font-bold uppercase">Structure</div>
                <div className="font-mono text-[#37352F]">{aiResult.varietyLevel} Variety</div>
              </div>
            </div>
            <p className="text-[#37352F] italic border-l-2 border-[#9D34DA] pl-4">"{aiResult.reasoning}"</p>
          </div>
        )}

        <h2 className="text-[#9B9A97] text-xs font-bold uppercase tracking-widest mb-4">Final Verdict</h2>
        <h1 className={`${STYLES.fontSerif} text-6xl font-bold text-[#37352F] mb-6`}>{result}</h1>
        <p className="text-[#37352F] leading-relaxed max-w-lg mx-auto">
          {result.includes('ONE SITTING') 
            ? "The volume or repetitive nature makes this an endurance challenge. Focus on the psychological journey and the 'feat' of finishing it." 
            : "The variety and fandom demand analysis. Focus on quality judgment, lists, and debating 'best vs worst'."}
        </p>
      </div>
      <Button onClick={reset} variant="secondary">Check Another</Button>
    </div>
  );

  // --- RENDER INPUT ---
  return (
    <div className="max-w-xl mx-auto mt-12 animate-fade-in">
      {/* Mode Switcher */}
      <div className="flex gap-4 mb-8 justify-center">
        <button 
          onClick={() => setMode('manual')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'manual' ? 'bg-[#37352F] text-white shadow-lg' : 'text-[#9B9A97] hover:text-[#37352F]'}`}
        >
          Manual Check
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${mode === 'ai' ? 'bg-white text-[#9D34DA] shadow-md border border-[#E9E9E7]' : 'text-[#9B9A97] hover:text-[#9D34DA]'}`}
        >
          <Sparkles size={14} /> AI Analysis
        </button>
      </div>

      <Card className="p-10 relative overflow-hidden">
        {mode === 'ai' ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F] mb-2`}>Smart Analyzer</h2>
              <p className="text-[#9B9A97]">Enter a franchise name. Gemini will run the 4 Gates for you.</p>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={franchiseName}
                onChange={(e) => setFranchiseName(e.target.value)}
                placeholder="e.g. Naruto, Breaking Bad..."
                className="w-full bg-[#F7F7F5] border border-[#E9E9E7] focus:border-[#9D34DA] rounded-lg p-4 text-xl font-medium text-[#37352F] outline-none transition-all placeholder-[#D3D1CB]"
                onKeyDown={(e) => e.key === 'Enter' && runAIAnalysis()}
              />
              <div className="absolute right-2 top-2">
                <Button onClick={runAIAnalysis} variant="ai" disabled={aiLoading || !franchiseName}>
                  {aiLoading ? <Loader className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                </Button>
              </div>
            </div>
            
            <div className="bg-[#F1F1EF] p-4 rounded text-xs text-[#9B9A97] text-center">
              Uses Gemini 2.5 Flash to analyze episode counts, runtimes, and community sentiment.
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex justify-between items-center text-[#9B9A97] text-xs font-bold uppercase tracking-widest">
              <span>Gate {step + 1}</span>
              <span>{step + 1} / {steps.length}</span>
            </div>
            
            <h2 className={`text-2xl font-bold text-[#37352F] mb-2 ${STYLES.fontSerif}`}>{steps[step].question}</h2>
            {steps[step].subtext && <p className="text-[#787774] mb-8">{steps[step].subtext}</p>}

            {steps[step].input ? (
              <>
                <input 
                  type="number" 
                  value={data[steps[step].field || 'episodes'] || ''}
                  onChange={(e) => setData({...data, [steps[step].field || 'episodes']: e.target.value})}
                  className="w-full text-5xl font-bold bg-transparent border-b-2 border-[#E9E9E7] focus:border-[#2383E2] outline-none py-2 text-[#37352F] placeholder-[#E3E2E0]"
                  placeholder="0"
                  autoFocus
                />
                {steps[step].field === 'length' && (
                  <p className="mt-4 font-mono text-[#787774]">Total: ≈ {calculateHours()} Hours</p>
                )}
                <div className="mt-8 flex justify-end">
                  <Button onClick={() => handleNext()}>Next <ChevronRight size={16}/></Button>
                </div>
              </>
            ) : (
              <div className="grid gap-3">
                {steps[step].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleNext(opt.value)}
                    className="text-left p-4 rounded border border-[#E9E9E7] hover:border-[#2383E2] hover:bg-[#F7F7F5] transition-all"
                  >
                    <span className="font-medium text-[#37352F]">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

// --- LIBRARY PAGE WITH AI BRAINSTORM ---

const LibraryPage = ({ library, setLibrary }) => {
  const [newEntry, setNewEntry] = useState({ title: '', format: 'RANKING', link: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [brainstormItem, setBrainstormItem] = useState(null); // Which item is being brainstormed
  const [aiIdeas, setAiIdeas] = useState(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  const addEntry = () => {
    if (!newEntry.title) return;
    setLibrary([...library, { ...newEntry, id: Date.now() }]);
    setNewEntry({ title: '', format: 'RANKING', link: '' });
    setShowAdd(false);
  };

  const removeEntry = (id) => {
    setLibrary(library.filter(item => item.id !== id));
  };

  const generateIdeas = async (item) => {
    setBrainstormItem(item);
    setLoadingIdeas(true);
    setAiIdeas(null);

    const prompt = `Generate content ideas for a YouTube video about the franchise "${item.title}" using the "${item.format}" format.
    Return JSON with:
    - titles: array of 3 clickbaity, high-stakes titles.
    - hooks: array of 3 opening lines/hooks (first 5 seconds).
    - thumbnailIdea: string describing a high-CTR thumbnail.
    
    Make the tone tailored to a 19-25 year old male audience (Gen Z humor, high energy).
    `;

    const result = await callGemini(prompt);
    setAiIdeas(result);
    setLoadingIdeas(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`${STYLES.fontSerif} text-3xl font-bold text-[#37352F]`}>Franchise Library</h1>
        <Button onClick={() => setShowAdd(!showAdd)} variant="primary" size="sm">
          <Plus size={16} /> New Entry
        </Button>
      </div>

      {showAdd && (
        <Card className="p-6 mb-8 bg-[#FBFBFA]">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <Input label="Franchise Name" value={newEntry.title} onChange={v => setNewEntry({...newEntry, title: v})} placeholder="e.g. Marvel" />
            <div>
              <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5">Format</label>
              <select 
                className="w-full bg-white border border-[#E9E9E7] rounded p-2.5 text-[#37352F] outline-none"
                value={newEntry.format}
                onChange={e => setNewEntry({...newEntry, format: e.target.value})}
              >
                <option value="RANKING">Ranking Every...</option>
                <option value="ONE SITTING">One Sitting</option>
              </select>
            </div>
            <Input label="YouTube Link" value={newEntry.link} onChange={v => setNewEntry({...newEntry, link: v})} placeholder="https://..." />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowAdd(false)} variant="ghost" size="sm">Cancel</Button>
            <Button onClick={addEntry} variant="primary" size="sm">Save to Library</Button>
          </div>
        </Card>
      )}

      {/* Brainstorm Modal Overlay */}
      {brainstormItem && (
        <div className="fixed inset-0 bg-[#37352F]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8 relative shadow-2xl">
            <button 
              onClick={() => setBrainstormItem(null)}
              className="absolute top-4 right-4 text-[#9B9A97] hover:text-[#37352F]"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#F4EBF9] p-3 rounded-lg text-[#9D34DA]">
                <Brain size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#37352F]">{brainstormItem.title}</h2>
                <Badge color="purple">AI Strategy Session</Badge>
              </div>
            </div>

            {loadingIdeas ? (
              <div className="py-12 text-center text-[#9B9A97] flex flex-col items-center gap-4">
                <Loader className="animate-spin" size={32} />
                <p>Gemini is cooking up viral ideas...</p>
              </div>
            ) : aiIdeas ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-bold uppercase text-[#9B9A97] mb-3 flex items-center gap-2">
                    <Youtube size={14} /> Viral Titles
                  </h3>
                  <div className="space-y-2">
                    {aiIdeas.titles.map((t, i) => (
                      <div key={i} className="bg-[#F7F7F5] p-3 rounded text-[#37352F] font-medium border border-[#E9E9E7]">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-[#9B9A97] mb-3 flex items-center gap-2">
                    <Activity size={14} /> Opening Hooks (0-5s)
                  </h3>
                  <div className="space-y-3">
                    {aiIdeas.hooks.map((h, i) => (
                      <div key={i} className="text-sm text-[#37352F] leading-relaxed border-l-2 border-[#9D34DA] pl-3 italic">
                        "{h}"
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-[#9B9A97] mb-3 flex items-center gap-2">
                    <Film size={14} /> Thumbnail Concept
                  </h3>
                  <div className="bg-[#F4EBF9] p-4 rounded text-sm text-[#37352F] border border-[#EADCF5]">
                    {aiIdeas.thumbnailIdea}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-500">Failed to generate. Try again.</div>
            )}
          </Card>
        </div>
      )}

      <div className="grid gap-4">
        {library.length === 0 && (
          <div className="text-center py-12 text-[#9B9A97] italic border-2 border-dashed border-[#E9E9E7] rounded-lg">
            No franchises tracked yet. Add one to start building your history.
          </div>
        )}
        
        {library.map((item) => {
          const videoId = getYoutubeId(item.link);
          return (
            <Card key={item.id} className="group flex overflow-hidden hover:shadow-md transition-all">
              {/* Preview Section */}
              <div className="w-40 bg-black flex-shrink-0 relative">
                {videoId ? (
                  <img 
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 bg-[#37352F]">
                    <Film size={24} />
                  </div>
                )}
                {videoId && (
                  <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors group-hover:scale-110 duration-300"
                  >
                    <Play className="text-white fill-white" size={32} />
                  </a>
                )}
              </div>

              {/* Info Section */}
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start h-full">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[#37352F]">{item.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge color={item.format === 'ONE SITTING' ? 'red' : 'blue'}>
                          {item.format}
                        </Badge>
                        {item.link && <Badge color="gray">Completed</Badge>}
                      </div>
                    </div>
                    
                    {!item.link && (
                      <div className="mt-2">
                        <Button onClick={() => generateIdeas(item)} variant="ai" size="sm" className="text-xs">
                          <Sparkles size={14} /> AI Brainstorm
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <button onClick={() => removeEntry(item.id)} className="text-[#D3D1CB] hover:text-[#EB5757] transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
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
        <span className="text-xs font-bold uppercase text-[#9B9A97]">Visual Timeline</span>
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
                <label className="block text-[#787774] text-xs font-bold uppercase tracking-wider mb-1.5">2. Last Scope</label>
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
            <NavItem id="format" icon={Brain} label="Smart Analyzer" />
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
          {view === 'format' && <FormatDecider settings={settings} />}
          {view === 'schedule' && <Scheduler settings={settings} />}
          {view === 'library' && <LibraryPage library={library} setLibrary={setLibrary} />}
          {view === 'settings' && <SettingsPage settings={settings} setSettings={setSettings} />}
        </main>
      </div>
    </div>
  );
}