// src/components/WeeklyIntegratedDayCard.tsx
import React from 'react';
import { Meal } from '../types';
import { Dumbbell, Utensils, Zap, Calendar } from 'lucide-react';

interface WeeklyIntegratedDayCardProps {
  dayName: string;           // مثال: "اليوم الأول"
  muscleGroup: string;       // مثال: "عضلات الصدر"
  exercises: string[];       // مثال: ["سكوات", "برنش"]
  meals: Meal[];             // من nutrition template
  onClick?: () => void;
}

const WeeklyIntegratedDayCard = ({
  dayName,
  muscleGroup,
  exercises,
  meals,
  onClick
}: WeeklyIntegratedDayCardProps) => {
  // اختيار صورة حسب العضلة (نستخدم MUSCLE_IMAGES الموجود عندك)
  const getImageUrl = () => {
    const images: Record<string, string> = {
      'عضلات الصدر': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      'عضلات الظهر': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438',
      'عضلات الأرجل': 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d',
      'عضلات الأكتاف': 'https://images.unsplash.com/photo-1517964603305-11c0f6f66012',
      'عضلات البايسيبس': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e',
      'عضلات الترايسيبس': 'https://images.unsplash.com/photo-1530822847156-5df684ec5ee1',
      'عضلات المعدة': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      'كارديو وإحماء': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
    };
    return images[muscleGroup] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48';
  };

  return (
    <div 
      className="rounded-2xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all bg-zinc-900 border border-zinc-800"
      onClick={onClick}
    >
      {/* الصورة الواقعية */}
      <div className="h-48 relative">
        <img 
          src={`${getImageUrl()}?q=80&w=600&auto=format&fit=crop`} 
          alt={muscleGroup}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-3 right-3 z-10">
          <span className="text-white font-bold text-lg">{dayName}</span>
          <p className="text-amber-400 text-sm">{muscleGroup}</p>
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-4">
        {/* التمارين */}
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2 text-royal-400">
            <Dumbbell size={14} />
            <span className="text-xs font-bold">التمارين</span>
          </div>
          <ul className="space-y-1">
            {exercises.slice(0, 2).map((ex, i) => (
              <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                <span className="text-royal-500 mt-0.5">•</span> {ex}
              </li>
            ))}
            {exercises.length > 2 && (
              <li className="text-xs text-amber-500">+ {exercises.length - 2} تمارين</li>
            )}
          </ul>
        </div>

        {/* الوجبات */}
        <div>
          <div className="flex items-center gap-1 mb-2 text-amber-400">
            <Utensils size={14} />
            <span className="text-xs font-bold">الوجبات</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            {meals.map((meal, i) => (
              <div key={i} className="text-center">
                <p>{meal.time}</p>
                <p className="font-bold text-white">{meal.calories} سعرة</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyIntegratedDayCard;
