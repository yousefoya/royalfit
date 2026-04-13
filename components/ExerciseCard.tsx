
import React from 'react';
import { Exercise } from '../types';
import { Hash, Repeat, Zap } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  isEditable?: boolean; // Now defaults to false or is ignored based on request
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 hover:border-[#00a67e] transition-all group relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#00a67e]/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-[#00a67e]/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-xl font-bold text-white group-hover:text-[#00a67e] transition-colors z-10">
          {exercise.name}
        </h4>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 flex items-center gap-1">
            <Hash size={10} /> جولات
          </p>
          <p className="text-lg font-bold text-white">{exercise.sets}</p>
        </div>
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 flex items-center gap-1">
            <Repeat size={10} /> تكرار
          </p>
          <p className="text-lg font-bold text-white">{exercise.reps}</p>
        </div>
        <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 flex flex-col items-center">
          <p className="text-[10px] text-zinc-500 font-black uppercase mb-1 flex items-center gap-1">
            <Zap size={10} /> راحة
          </p>
          <p className="text-lg font-bold text-white">{exercise.rest}</p>
        </div>
      </div>
      
      {exercise.notes && (
        <div className="mt-4 p-2 bg-zinc-900/30 rounded-lg border-r-2 border-[#00a67e]">
          <p className="text-xs text-zinc-400 italic">
            {exercise.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;
