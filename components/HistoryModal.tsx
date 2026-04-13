
import React from 'react';
import { X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyData } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MonthlyData[];
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <X size={24} />
          </button>
          <h2 className="text-2xl font-black">تاريخ التسجيل (آخر 12 شهر)</h2>
        </div>
        
        <div className="p-8 h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#9ca3af" fontSize={12} tick={{fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                cursor={{fill: '#1a1a1a'}}
                contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', textAlign: 'right'}}
              />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
