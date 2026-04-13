import React from 'react';
import { Meal } from '../types';
import { Clock, Zap } from 'lucide-react';

interface NutritionCardProps {
  meal: Meal;
  onClick?: () => void;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ meal, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="
        bg-[#121212]
        border border-zinc-800
        hover:border-[#00a67e]
        transition-all
        rounded-xl
        p-5
        group
        cursor-pointer
      "
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[#00a67e] text-xs font-bold flex items-center gap-1 mb-1">
            <Clock size={12} /> {meal.time}
          </span>
          <h3 className="text-xl font-bold text-white">
            {meal.name}
          </h3>
        </div>

        <div className="bg-[#00a67e]/10 text-[#00a67e] px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Zap size={14} /> {meal.calories} سعرة
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {meal.ingredients.map((ing, idx) => (
          <div key={idx} className="flex items-center gap-2 text-zinc-400 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00a67e]" />
            <span>{ing.name}</span>
            <span className="text-zinc-500">({ing.amount})</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-zinc-800">
        <div className="text-center">
          <p className="text-[10px] text-zinc-500">بروتين</p>
          <p className="text-sm font-bold text-white">{meal.protein}g</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-500">كارب</p>
          <p className="text-sm font-bold text-white">{meal.carbs}g</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-zinc-500">دهون</p>
          <p className="text-sm font-bold text-white">{meal.fats}g</p>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;
