
import React from 'react';
import { Interest } from '../types';

interface InterestCardProps {
  interest: Interest;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const InterestCard: React.FC<InterestCardProps> = ({ interest, isSelected, onToggle }) => {
  return (
    <button
      onClick={() => onToggle(interest.id)}
      className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left flex flex-col gap-3 group
        ${isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-white bg-white shadow-sm hover:border-gray-200'
        }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${interest.color}`}>
        {interest.icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{interest.label}</h3>
        <p className="text-xs text-gray-500">Ver aprendizajes</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">
          ✓
        </div>
      )}
    </button>
  );
};

export default InterestCard;
