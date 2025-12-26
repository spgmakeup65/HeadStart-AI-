
import React from 'react';
import { ViewType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('HOME')}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">HeadStart</span>
          </div>
          <button 
            onClick={() => onNavigate('PROFILE')}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <span className="text-xs">👤</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-6 overflow-y-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-100 pb-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          <NavItem 
            icon="🏠" 
            label="Inicio" 
            active={activeView === 'HOME'} 
            onClick={() => onNavigate('HOME')}
          />
          <NavItem 
            icon="🎓" 
            label="Cursos" 
            active={activeView === 'COURSES'} 
            onClick={() => onNavigate('COURSES')}
          />
          <NavItem 
            icon="🔍" 
            label="Explorar" 
            active={activeView === 'EXPLORE'} 
            onClick={() => onNavigate('EXPLORE')}
          />
          <NavItem 
            icon="🏛️" 
            label="Historia" 
            active={activeView === 'HISTORY'} 
            onClick={() => onNavigate('HISTORY')}
          />
          <NavItem 
            icon="👤" 
            label="Perfil" 
            active={activeView === 'PROFILE'} 
            onClick={() => onNavigate('PROFILE')}
          />
        </div>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default Layout;
