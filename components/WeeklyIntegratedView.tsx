import React from 'react';
import { Calendar } from 'lucide-react';
import WeeklyIntegratedDayCard from './WeeklyIntegratedDayCard';
import { NUTRITION_TEMPLATES, WORKOUT_DB } from '../constants';

const WeeklyIntegratedView = () => {
  const days = [
    "اليوم الأول",
    "اليوم الثاني",
    "اليوم الثالث",
    "اليوم الرابع",
    "اليوم الخامس",
    "اليوم السادس",
    "اليوم السابع"
  ];

  const nutritionTemplate = NUTRITION_TEMPLATES[0]; // قالب التغذية الثابت

  const getDayData = (index: number) => {
    const muscleGroups = Object.keys(WORKOUT_DB);
    const muscle = muscleGroups[index % muscleGroups.length];

    const exercises = WORKOUT_DB[muscle]?.slice(0, 3) ?? [];
    const meals = nutritionTemplate?.meals ?? [];

    return { muscle, exercises, meals };
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">الأسبوع المتكامل</h1>
        <button className="text-sm text-royal-400 hover:text-royal-300 flex items-center gap-1">
          <Calendar size={14} /> عرض الأسبوع
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {days.map((day, idx) => {
          const { muscle, exercises, meals } = getDayData(idx);

          return (
            <WeeklyIntegratedDayCard
              key={day}
              dayName={day}
              muscleGroup={muscle}
              exercises={exercises}
              meals={meals}
              onClick={() => alert(`تفاصيل ${day}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyIntegratedView;
