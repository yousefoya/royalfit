
import React from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { TrainerStats } from '../types';

interface TrainerDetailsModalProps {
  trainer: TrainerStats | null;
  onClose: () => void;
}

const TrainerDetailsModal: React.FC<TrainerDetailsModalProps> = ({ trainer, onClose }) => {
  if (!trainer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#0a0a0a] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-[#10b981] p-8 text-black relative">
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-black mb-1">{trainer.name}</h2>
            <p className="text-black/70 text-sm font-bold">قائمة المشتركين النشطين</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          <div className="w-1.5 h-32 bg-[#10b981] absolute right-0 top-1/2 -translate-y-1/2 rounded-l-full"></div>
          
          {trainer.members.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center justify-between p-4 bg-[#121212] rounded-2xl hover:bg-[#1a1a1a] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-[#10b981] font-bold text-lg">
                  {member.initial}
                </div>
                <h4 className="font-bold text-gray-200">{member.name}</h4>
              </div>
              <ChevronLeft size={18} className="text-gray-600 group-hover:text-emerald-500 transition-colors" />
            </div>
          ))}
          
          {trainer.members.length === 0 && (
            <div className="text-center py-10 text-gray-500">لا يوجد أعضاء نشطون حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDetailsModal;
