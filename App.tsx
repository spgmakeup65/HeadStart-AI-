
import React, { useState, useRef, useEffect } from 'react';
import { AppState, GrowthPlan, BookSummary, ViewType, HistoricalFigure, Course } from './types';
import { INTERESTS } from './constants';
import { generateGrowthPlan, generateBookSummary, speakText, getBooksByTopic, generateHistoricalFigure, generateCourse } from './services/geminiService';
import Layout from './components/Layout';
import InterestCard from './components/InterestCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.ONBOARDING);
  const [activeView, setActiveView] = useState<ViewType>('HOME');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [growthPlan, setGrowthPlan] = useState<GrowthPlan | null>(null);
  const [activeSummary, setActiveSummary] = useState<BookSummary | null>(null);
  const [activeHistory, setActiveHistory] = useState<HistoricalFigure | null>(null);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  
  const [loadingMessage, setLoadingMessage] = useState("Diseñando tu camino...");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [savedBooks, setSavedBooks] = useState<BookSummary[]>([]);
  const [topicRecommendations, setTopicRecommendations] = useState<string[]>([]);
  const [isTopicLoading, setIsTopicLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('headstart_saved');
    if (saved) setSavedBooks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('headstart_saved', JSON.stringify(savedBooks));
  }, [savedBooks]);

  const handleToggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const decodeAudio = async (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const playAudio = async (text: string) => {
    setIsAudioLoading(true);
    try {
      const base64 = await speakText(text);
      const buffer = await decodeAudio(base64);
      const ctx = audioContextRef.current!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (error) {
      alert("Error al generar audio.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const startGrowth = async () => {
    if (selectedInterests.length === 0) return;
    setAppState(AppState.LOADING);
    setLoadingMessage("Preparando tu plan de 15 minutos...");
    try {
      const plan = await generateGrowthPlan(selectedInterests);
      setGrowthPlan(plan);
      setAppState(AppState.MAIN);
      setActiveView('HOME');
    } catch (error) {
      setAppState(AppState.ONBOARDING);
    }
  };

  const handleBookSearch = async (query: string) => {
    if (!query.trim()) return;
    setAppState(AppState.LOADING);
    setLoadingMessage(`Resumiendo "${query}"...`);
    try {
      const summary = await generateBookSummary(query);
      setActiveSummary(summary);
      setActiveView('SUMMARY');
      setAppState(AppState.MAIN);
    } catch (error) {
      setAppState(AppState.MAIN);
    }
  };

  const handleHistorySearch = async (name: string) => {
    setAppState(AppState.LOADING);
    setLoadingMessage(`Consultando la sabiduría de ${name}...`);
    try {
      const figure = await generateHistoricalFigure(name);
      setActiveHistory(figure);
      setActiveView('HISTORY_DETAIL');
      setAppState(AppState.MAIN);
    } catch (error) {
      setAppState(AppState.MAIN);
    }
  };

  const handleCreateCourse = async (topic: string) => {
    setAppState(AppState.LOADING);
    setLoadingMessage(`Diseñando curso intensivo sobre ${topic}...`);
    try {
      const course = await generateCourse(topic);
      setActiveCourse(course);
      setActiveView('COURSE_DETAIL');
      setAppState(AppState.MAIN);
    } catch (error) {
      setAppState(AppState.MAIN);
    }
  };

  const handleExploreTopic = async (topic: string) => {
    setIsTopicLoading(true);
    setTopicRecommendations([]);
    try {
      const books = await getBooksByTopic(topic);
      setTopicRecommendations(books);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTopicLoading(false);
    }
  };

  if (appState === AppState.ONBOARDING) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12 flex flex-col max-w-md mx-auto">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-blue-200">H</div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">Transforma tu vida con <span className="text-blue-600">IA</span>.</h1>
          <p className="text-gray-500">¿Qué quieres dominar hoy?</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {INTERESTS.map(interest => (
            <InterestCard 
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onToggle={handleToggleInterest}
            />
          ))}
        </div>
        <button
          onClick={startGrowth}
          disabled={selectedInterests.length === 0}
          className={`mt-auto w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl active:scale-95 ${selectedInterests.length > 0 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          Comenzar Experiencia →
        </button>
      </div>
    );
  }

  if (appState === AppState.LOADING) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-float">🧠</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspirando Conocimiento</h2>
        <p className="text-gray-500 animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'HOME' && (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Dashboard de Crecimiento</p>
              <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
            </div>
            <div className="flex gap-2">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">🔥 1</div>
            </div>
          </div>

          {/* Sección de Nuevas Funciones Resaltadas */}
          <div className="grid grid-cols-1 gap-4">
             <button 
                onClick={() => setActiveView('HISTORY')}
                className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left overflow-hidden transition-all hover:shadow-md active:scale-[0.98]"
             >
                <div className="flex items-center justify-between mb-3">
                   <span className="text-3xl">🏛️</span>
                   <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Nuevo</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg">Mentores Históricos</h3>
                <p className="text-xs text-gray-500 mt-1">Aprende directamente de Séneca, Da Vinci y más.</p>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
             </button>

             <button 
                onClick={() => setActiveView('COURSES')}
                className="group relative bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm text-left overflow-hidden transition-all hover:shadow-md active:scale-[0.98]"
             >
                <div className="flex items-center justify-between mb-3">
                   <span className="text-3xl">🎓</span>
                   <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Formación IA</span>
                </div>
                <h3 className="font-black text-gray-900 text-lg">Micro-Cursos Personalizados</h3>
                <p className="text-xs text-gray-500 mt-1">Crea formaciones de cualquier tema al instante.</p>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
             </button>
          </div>

          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-100 relative overflow-hidden group">
             <div className="relative z-10">
                <p className="text-[10px] font-black bg-white/20 inline-block px-3 py-1 rounded-full mb-3 uppercase tracking-widest">Enfoque de hoy</p>
                <h3 className="text-2xl font-black leading-tight mb-4">{growthPlan?.dailyFocus}</h3>
                <div className="flex gap-2">
                   {growthPlan?.steps.slice(0, 2).map((s, i) => (
                      <div key={i} className="text-[10px] bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 font-bold">
                         {s.duration} • {s.title}
                      </div>
                   ))}
                </div>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
               <span>📖</span> Resúmenes de 15 min
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {growthPlan?.suggestedBooks.map((book, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleBookSearch(book)}
                  className="min-w-[140px] bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 text-left active:scale-95 transition-transform"
                >
                  <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl mb-3 flex items-center justify-center text-4xl">📚</div>
                  <h4 className="text-xs font-black text-gray-900 line-clamp-2 leading-tight">{book}</h4>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'HISTORY' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('HOME')} className="text-xl">←</button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Mentores Históricos</h1>
           </div>
           <p className="text-sm text-gray-500 leading-relaxed italic">"Aprender de los errores es sabiduría; aprender de los éxitos de los grandes es atajo."</p>
           
           <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Recomendados para ti</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { name: 'Marco Aurelio', icon: '🏛️', bio: 'Sabiduría Estoica' },
                   { name: 'Leonardo da Vinci', icon: '🎨', bio: 'Polimatía y Creatividad' },
                   { name: 'Marie Curie', icon: '🧪', bio: 'Resiliencia y Ciencia' },
                   { name: 'Séneca', icon: '📜', bio: 'Control Emocional' }
                 ].map(m => (
                   <button 
                     key={m.name}
                     onClick={() => handleHistorySearch(m.name)}
                     className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:border-blue-500 text-center transition-all group"
                   >
                     <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">{m.icon}</span>
                     <span className="font-black text-sm block leading-tight text-gray-800">{m.name}</span>
                     <span className="text-[9px] text-gray-400 mt-1 block uppercase font-bold">{m.bio}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="pt-6 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">¿A quién buscas?</h3>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Ej: Alejandro Magno, Cleopatra..."
                   className="w-full bg-white border border-gray-100 rounded-3xl py-5 px-8 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleHistorySearch((e.target as HTMLInputElement).value);
                   }}
                 />
                 <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white w-10 h-10 rounded-full font-bold">→</button>
              </div>
           </div>
        </div>
      )}

      {activeView === 'COURSES' && (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('HOME')} className="text-xl">←</button>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Formaciones con IA</h1>
           </div>
           <p className="text-sm text-gray-500">Convierte cualquier curiosidad en una formación estructurada y accionable.</p>
           
           <div className="bg-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-purple-100">
              <h3 className="font-black text-lg mb-2">Generador de Micro-Cursos</h3>
              <p className="text-xs opacity-80 mb-4">Ingresa un tema y nuestra IA creará un currículo de 5 módulos en segundos.</p>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="¿Qué quieres aprender hoy?"
                   className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 px-6 text-white placeholder:text-white/50 focus:bg-white/20 outline-none"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') handleCreateCourse((e.target as HTMLInputElement).value);
                   }}
                 />
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Rutas de Éxito</h3>
              <div className="grid gap-3">
                 {[
                   { title: 'Inversiones para Principiantes', color: 'bg-green-50 text-green-700' },
                   { title: 'Hablar en Público con Impacto', color: 'bg-orange-50 text-orange-700' },
                   { title: 'Fundamentos de IA Generativa', color: 'bg-blue-50 text-blue-700' },
                   { title: 'Psicología del Alto Rendimiento', color: 'bg-red-50 text-red-700' }
                 ].map(course => (
                   <button 
                     key={course.title} 
                     onClick={() => handleCreateCourse(course.title)}
                     className={`w-full p-5 rounded-3xl flex justify-between items-center font-black text-sm text-left border border-transparent hover:border-gray-200 transition-all ${course.color}`}
                   >
                     <span>{course.title}</span>
                     <span className="text-lg">→</span>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeView === 'COURSE_DETAIL' && activeCourse && (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500 pb-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('COURSES')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">←</button>
              <h2 className="font-bold text-gray-900 truncate flex-1">Formación Activa</h2>
           </div>
           
           <div>
              <h1 className="text-3xl font-black text-gray-900 leading-tight">{activeCourse.title}</h1>
              <p className="text-purple-600 font-black mt-2 uppercase text-xs tracking-[0.2em]">{activeCourse.totalDuration} • CURSO IA</p>
           </div>
           
           <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
              <h4 className="text-[10px] font-black text-purple-600 uppercase mb-2 tracking-widest">Tu Objetivo</h4>
              <p className="text-gray-800 text-sm leading-relaxed font-medium italic">"{activeCourse.objective}"</p>
           </div>

           <div className="space-y-6">
              {activeCourse.modules.map((mod, idx) => (
                <div key={idx} className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Módulo 0{idx + 1}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{mod.duration}</span>
                   </div>
                   <h3 className="text-xl font-black text-gray-900 leading-tight">{mod.title}</h3>
                   <div className="h-0.5 w-12 bg-purple-200 rounded-full"></div>
                   <p className="text-gray-600 text-sm leading-relaxed">{mod.content}</p>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'HISTORY_DETAIL' && activeHistory && (
        <div className="space-y-8 animate-in slide-in-from-bottom-10 duration-500 pb-20">
           <div className="flex items-center gap-4">
              <button onClick={() => setActiveView('HISTORY')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">←</button>
              <h2 className="font-bold text-gray-900 truncate flex-1">Mentor Histórico</h2>
           </div>
           
           <div className="text-center py-6">
              <div className="w-40 h-40 bg-white rounded-full mx-auto flex items-center justify-center text-6xl mb-8 shadow-2xl border-[12px] border-gray-50">🏛️</div>
              <h1 className="text-4xl font-black text-gray-900 leading-tight">{activeHistory.name}</h1>
              <p className="text-blue-600 font-black mt-2 text-xs uppercase tracking-[0.3em]">{activeHistory.title}</p>
           </div>

           <div className="bg-gray-900 text-white p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
              <span className="text-6xl text-blue-500/20 absolute -top-2 left-4 font-serif">“</span>
              <p className="text-xl font-bold leading-relaxed italic text-center relative z-10">{activeHistory.famousQuote}</p>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
           </div>

           <div className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 px-4 flex items-center gap-2">
                 <span className="w-2 h-2 bg-blue-600 rounded-full"></span> 
                 Filosofía y Principios
              </h3>
              {activeHistory.corePrinciples.map((p, idx) => (
                <div key={idx} className="bg-white p-7 rounded-[2rem] border border-gray-50 shadow-sm flex gap-6 group hover:border-blue-200 transition-colors">
                   <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0 flex items-center justify-center font-black text-lg">0{idx + 1}</span>
                   <p className="text-gray-700 font-bold text-sm leading-snug pt-1">{p}</p>
                </div>
              ))}
           </div>

           <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-blue-100">
              <h4 className="text-[10px] font-black uppercase mb-3 tracking-[0.2em] opacity-80">Por qué es leyenda</h4>
              <p className="text-sm leading-relaxed font-medium">{activeHistory.legacy}</p>
           </div>
        </div>
      )}

      {/* Otras vistas (EXPLORE, SUMMARY, etc.) se mantienen igual */}
      {activeView === 'EXPLORE' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <h1 className="text-2xl font-bold text-gray-900">Explorar por Temas</h1>
          <div className="grid grid-cols-2 gap-3">
            {['Disciplina', 'Finanzas', 'Psicología', 'Liderazgo', 'Hábitos', 'Productividad'].map(topic => (
              <button 
                key={topic}
                onClick={() => handleExploreTopic(topic)}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-blue-500 transition-all text-left font-bold text-sm"
              >
                {topic}
              </button>
            ))}
          </div>
          {isTopicLoading && <div className="text-center py-8 text-blue-600 font-bold animate-pulse">Buscando mejores libros...</div>}
          {topicRecommendations.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-gray-900">Libros Recomendados</h3>
              <div className="grid gap-3">
                {topicRecommendations.map((book, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleBookSearch(book)}
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">📚</span>
                    <span className="font-bold text-sm text-gray-800">{book}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeView === 'SUMMARY' && activeSummary && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 pb-32">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveView('HOME')} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">←</button>
            <h2 className="font-bold text-gray-900 truncate flex-1">Resumen del Libro</h2>
          </div>
          <div className="text-center px-4">
            <div className="w-40 h-60 bg-white rounded-[2.5rem] mx-auto shadow-2xl border-8 border-gray-50 flex flex-col items-center justify-center p-6 mb-8">
               <span className="text-6xl mb-4">📘</span>
               <div className="h-2 w-12 bg-blue-600 rounded-full"></div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">{activeSummary.title}</h1>
            <p className="text-blue-600 font-bold mt-2 uppercase tracking-widest text-xs">{activeSummary.author}</p>
          </div>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => playAudio(`${activeSummary.title}. Por ${activeSummary.author}. Idea principal: ${activeSummary.mainTakeaway}`)}
              disabled={isAudioLoading}
              className="bg-blue-600 text-white px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-xl shadow-blue-200 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isAudioLoading ? 'Cargando...' : '▶ ESCUCHAR'}
            </button>
          </div>
          <div className="bg-blue-50 rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4">La Gran Idea</h3>
            <p className="text-xl font-bold text-gray-900 leading-relaxed italic">"{activeSummary.mainTakeaway}"</p>
          </div>
          <div className="space-y-6">
            <h3 className="text-lg font-black text-gray-900 px-2">Aprendizajes Clave</h3>
            {activeSummary.keyInsights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex gap-6">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 text-blue-600 flex-shrink-0 flex items-center justify-center font-black">0{idx + 1}</div>
                <p className="text-gray-700 leading-snug font-medium pt-1">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'PROFILE' && (
        <div className="space-y-8 animate-in fade-in duration-500 text-center py-12">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-4xl mb-4">👤</div>
            <h2 className="text-xl font-bold text-gray-900">Usuario Premium</h2>
            <p className="text-sm text-gray-500 mb-8">Nivel de Sabiduría: Aprendiz</p>
            <button onClick={() => setAppState(AppState.ONBOARDING)} className="bg-red-50 text-red-600 px-6 py-3 rounded-full font-bold text-sm">Reiniciar Experiencia</button>
        </div>
      )}
    </Layout>
  );
};

export default App;
