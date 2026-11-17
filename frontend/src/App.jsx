import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit3, 
  Info, 
  ShieldCheck, 
  AlertCircle, 
  Globe, 
  MessageSquare, 
  ThumbsUp, 
  Repeat, 
  Moon, 
  Sun,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  X
} from 'lucide-react';

export default function App() {
  // Config & State
  const apiUrl = `${import.meta.env.VITE_API_URL}/generate`;
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDraft, setEditedDraft] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAgentLog, setShowAgentLog] = useState(false);

  // Attempt & Loop Real-time States
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [loopStatus, setLoopStatus] = useState('idle'); // 'searching', 'writing', 'reviewing', 'looping', 'approved'

  // Ref for auto-scrolling
  const outputRef = useRef(null);

  const suggestedTopics = [
    "AI trends in enterprise workflows",
    "Lessons scaling a SaaS from 0 to 10k users",
    "Remote leadership in engineering teams",
    "Why soft skills define modern tech careers"
  ];

  // Robust mock with multi-attempt simulation for demo mode
  const mockGenerate = (topicText) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentAttempt(1);
        setLoopStatus('writing');
      }, 500);

      setTimeout(() => {
        setCurrentAttempt(1);
        setLoopStatus('reviewing');
      }, 1500);

      setTimeout(() => {
        setCurrentAttempt(2);
        setLoopStatus('looping'); // Simulating a rewrite loop
      }, 2500);

      setTimeout(() => {
        setLoopStatus('approved');
        resolve({
          topic: topicText,
          draft: `Here is the real truth about ${topicText.toLowerCase()}:\n\nMost teams overcomplicate execution. Sustainable growth usually comes down to 3 relentless habits:\n\n1. Simplicity over complex systems.\n2. Daily consistent iterations.\n3. Direct customer feedback.\n\nWe tested this framework and cut time-to-market by 40%.\n\nWhat strategy has had the highest impact on your team this year?`,
          attempt: 2,
          approved: true,
          feedback: "Attempt 1 lacked a strong opening hook. Attempt 2 successfully resolved feedback with a punchy hook, concise word count, and engaging CTA."
        });
      }, 4000);
    });
  };

  const handleGenerate = async (topicToRun = topic) => {
    if (!topicToRun.trim()) return;
    
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setCurrentAttempt(1);
    setLoopStatus('searching');

    // Smooth scroll automatically to output preview area
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      let data;
      if (useFallback) {
        data = await mockGenerate(topicToRun);
      } else {
        // Step progression simulation for live FastAPI
        setLoopStatus('writing');
        const timer = setTimeout(() => {
          setCurrentAttempt(1);
          setLoopStatus('reviewing');
        }, 2000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: topicToRun.trim() }),
        });

        clearTimeout(timer);

        if (!response.ok) {
          throw new Error(`Backend response status: ${response.status}`);
        }
        data = await response.json();
        setCurrentAttempt(data.attempt || 1);
        setLoopStatus('approved');
      }

      setResult(data);
      setEditedDraft(typeof data.draft === 'string' ? data.draft : JSON.stringify(data.draft, null, 2));
      setIsEditing(false);
    } catch (err) {
      console.warn("API Call Failed:", err);
      setErrorMsg(`Cannot reach backend at ${apiUrl}. Switch to Demo Mode.`);
      setLoopStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = typeof editedDraft === 'string' ? editedDraft : '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = (text) => {
    const str = typeof text === 'string' ? text : '';
    return str.trim() ? str.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const charCount = (text) => {
    const str = typeof text === 'string' ? text : '';
    return str.length;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-blue-500/20 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAF9F6] text-stone-900'
    }`}>

      {/* Top Header */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
        isDarkMode ? 'bg-zinc-950/80 border-zinc-800/80' : 'bg-[#FAF9F6]/85 border-stone-200/80'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight font-serif">PostCraft</h1>
                <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                  isDarkMode ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  AI
                </span>
              </div>
              <p className={`text-[11px] hidden sm:block ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                Autonomous LinkedIn Content Generation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUseFallback(!useFallback)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                useFallback 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-300' 
                  : isDarkMode ? 'bg-zinc-900 border-zinc-800 text-emerald-400' : 'bg-stone-100 border-stone-200 text-emerald-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${useFallback ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="text-[11px] sm:text-xs">{useFallback ? 'Demo' : 'Live'}</span>
            </button>

            <button
              onClick={() => setShowAbout(true)}
              className={`p-2 rounded-lg border transition-all flex items-center space-x-1 text-xs font-medium ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white' : 'bg-white border-stone-200 text-stone-700 hover:text-stone-900'
              }`}
              title="About"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">About</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg border transition-all ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800 text-amber-300' : 'bg-white border-stone-200 text-stone-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* About Modal / Popup */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl relative ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base font-serif">About PostCraft</h3>
                <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>Your Autonomous AI Content Partner</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <div>
                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1">💡 What it does:</h4>
                <p className={`${isDarkMode ? 'text-zinc-300' : 'text-stone-700'}`}>
                  PostCraft helps you write professional, highly engaging LinkedIn posts instantly. You give it a brief topic or idea, and it transforms it into a polished post with an eye-catching opening hook, easy-to-read formatting, and a strong call-to-action.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-1">⚙️ How it does it:</h4>
                <p className={`${isDarkMode ? 'text-zinc-300' : 'text-stone-700'}`}>
                  It uses an intelligent multi-agent AI workflow (powered by LangGraph). Behind the scenes, one AI searches the web for fresh insights, another drafts the post, and a reviewer checks the quality before presenting the final result to you.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              Got it, let's write!
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button 
              onClick={() => setUseFallback(true)}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-colors"
            >
              Switch to Demo Mode
            </button>
          </div>
        )}

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-stretch">
          
          {/* LEFT: Input & Prompt Crafting */}
          <div className="lg:col-span-5 flex flex-col">
            <div className={`p-5 sm:p-7 rounded-3xl border shadow-sm transition-all flex-1 flex flex-col justify-between ${
              isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-stone-200/90'
            }`}>
              <div>
                <div className="mb-3.5">
                  <h2 className="text-lg sm:text-xl font-bold font-serif tracking-tight mb-0.5">
                    Drafting Prompt
                  </h2>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                    Describe your concept, industry trend, or takeaway.
                  </p>
                </div>

                <textarea
                  rows={4}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Why modern product teams should prioritize customer feedback..."
                  className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm border resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium leading-relaxed ${
                    isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100 placeholder-zinc-600' : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-400'
                  }`}
                />

                <div className="mt-4">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                    Quick Ideas:
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {suggestedTopics.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTopic(item);
                          handleGenerate(item);
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border text-left font-medium transition-all ${
                          isDarkMode 
                            ? 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-blue-500 hover:text-blue-400' 
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-blue-500 hover:text-blue-700'
                        }`}
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <button
                  disabled={loading || !topic.trim()}
                  onClick={() => handleGenerate()}
                  className={`mt-5 w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                    loading || !topic.trim()
                      ? 'bg-stone-200 text-stone-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed shadow-none'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 active:scale-[0.99]'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Multi-Agent Loop Running...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate LinkedIn Post</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Output & Smooth Scroll Target */}
          <div className="lg:col-span-7" ref={outputRef}>
            
            {/* Live Attempt & Loop Animation Status Card (Shows when loading or result is active) */}
            {(loading || result) && (
              <div className={`mb-5 p-4 sm:p-5 rounded-2xl border transition-all shadow-sm ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>LangGraph Agentic Loop Status</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                    Attempt {currentAttempt} of 3
                  </span>
                </div>

                {/* Animated Loop Step Indicator */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className={`p-2.5 rounded-xl border font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    loopStatus === 'searching' || loopStatus === 'writing'
                      ? 'bg-blue-600 text-white border-blue-600 animate-pulse shadow-md'
                      : loopStatus === 'reviewing' || loopStatus === 'looping' || loopStatus === 'approved'
                      ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <RefreshCw className={`w-3 h-3 ${loopStatus === 'searching' || loopStatus === 'writing' ? 'animate-spin' : ''}`} />
                    <span>Writer / Search</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    loopStatus === 'looping'
                      ? 'bg-amber-500 text-white border-amber-500 animate-bounce shadow-md'
                      : loopStatus === 'reviewing'
                      ? 'bg-blue-600 text-white border-blue-600 animate-pulse shadow-md'
                      : loopStatus === 'approved'
                      ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <RotateCcw className={`w-3 h-3 ${loopStatus === 'looping' ? 'animate-spin' : ''}`} />
                    <span>{loopStatus === 'looping' ? '🔄 Resetting Loop' : '2. Reviewer Check'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    loopStatus === 'approved'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-500' : 'bg-stone-50 border-stone-200 text-stone-400'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>3. Publish Ready</span>
                  </div>
                </div>

                {/* Subtext description of current agent activity */}
                <div className="mt-2.5 text-[11px] font-mono text-center text-stone-400">
                  {loopStatus === 'searching' && '🌐 Tavily searching web for fresh context...'}
                  {loopStatus === 'writing' && `✍️ Gemini generating draft for Attempt ${currentAttempt}...`}
                  {loopStatus === 'reviewing' && '⚖️ Groq reviewer checking hook, tone & criteria...'}
                  {loopStatus === 'looping' && '⚠️ Criteria missed! Resetting graph node to rewrite draft...'}
                  {loopStatus === 'approved' && '✅ Post approved successfully by multi-agent consensus!'}
                  {loopStatus === 'idle' && 'Ready to execute generation loop.'}
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-4">
                
                {/* LinkedIn Card Frame */}
                <div className={`rounded-3xl border shadow-xl overflow-hidden transition-all ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-stone-200'
                }`}>
                  
                  <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-900' : 'border-stone-100 bg-white'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        YP
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-xs sm:text-sm tracking-tight">Your Profile</h3>
                          <span className={`text-[10px] ${isDarkMode ? 'text-zinc-500' : 'text-stone-400'}`}>1st</span>
                        </div>
                        <p className={`text-[11px] ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>Thought Leader & Tech Creator</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors ${
                        isEditing
                          ? 'bg-blue-600 text-white'
                          : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>

                  <div className="p-4 sm:p-6">
                    {isEditing ? (
                      <textarea
                        value={editedDraft}
                        onChange={(e) => setEditedDraft(e.target.value)}
                        rows={10}
                        className={`w-full p-3.5 rounded-xl text-xs sm:text-sm font-sans resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed ${
                          isDarkMode ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-stone-50 text-stone-900 border-stone-200'
                        }`}
                      />
                    ) : (
                      <div className={`whitespace-pre-line text-xs sm:text-sm leading-relaxed font-normal ${
                        isDarkMode ? 'text-zinc-100' : 'text-stone-800'
                      }`}>
                        {editedDraft}
                      </div>
                    )}
                  </div>

                  {/* LinkedIn Engagement Footer */}
                  <div className={`px-4 sm:px-6 py-3 border-t flex items-center justify-between text-[11px] sm:text-xs font-medium ${
                    isDarkMode ? 'border-zinc-800 bg-zinc-950/40 text-zinc-400' : 'border-stone-100 bg-stone-50/50 text-stone-500'
                  }`}>
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      <span className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Like</span>
                      </span>
                      <span className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Comment</span>
                      </span>
                      <span className="flex items-center space-x-1 hover:text-blue-600 cursor-pointer">
                        <Repeat className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Repost</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] sm:text-[11px] font-semibold text-stone-400">
                      <span>{wordCount(editedDraft)} words</span>
                      <span>•</span>
                      <span>{charCount(editedDraft)} chars</span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className={`p-3.5 sm:p-4 border-t flex items-center justify-between ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-stone-100/80 border-stone-200'
                  }`}>
                    <button
                      onClick={() => handleGenerate()}
                      disabled={loading}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 border transition-all ${
                        isDarkMode ? 'border-zinc-700 text-zinc-200' : 'border-stone-300 text-stone-800'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Re-draft</span>
                    </button>

                    <button
                      onClick={handleCopy}
                      className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Post</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>

                {/* Audit Drawer */}
                <div className={`rounded-2xl border transition-all ${
                  isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-stone-200'
                }`}>
                  <button
                    onClick={() => setShowAgentLog(!showAgentLog)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-xs font-bold text-left text-stone-600 dark:text-zinc-300"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>LangGraph Reviewer Feedback (Passed on Attempt {result.attempt})</span>
                    </div>
                    {showAgentLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showAgentLog && (
                    <div className={`p-3.5 sm:p-4 border-t text-xs leading-relaxed space-y-1 ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-950/40 text-zinc-300' : 'border-stone-100 bg-stone-50/50 text-stone-700'
                    }`}>
                      <p>{result.feedback || "Approved on first attempt."}</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className={`h-full min-h-[380px] rounded-3xl border border-dashed flex flex-col items-center justify-center p-6 sm:p-8 text-center transition-all ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/30' : 'border-stone-300 bg-white/60'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 shadow-sm">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base sm:text-lg font-bold font-serif mb-1">Your Post Studio</h3>
                <p className={`text-xs max-w-sm mb-4 ${isDarkMode ? 'text-zinc-400' : 'text-stone-500'}`}>
                  {loading 
                    ? `Running LangGraph loop (Attempt ${currentAttempt})...` 
                    : "Enter a topic or pick a quick idea. Watch the multi-agent loop research, review, and refine in real-time."}
                </p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}