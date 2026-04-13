import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-[#121212] border border-white/5 p-6 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-300 shadow-lg h-full flex flex-col justify-center">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/10">
          {icon}
        </div>
      </div>
      <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-2 text-right">{title}</h3>
      <p className="text-4xl font-black text-white tracking-tighter text-right">{value}</p>
    </div>
  );
};

export default StatCard;
