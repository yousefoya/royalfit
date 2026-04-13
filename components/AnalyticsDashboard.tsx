import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Activity, Dumbbell } from 'lucide-react';
import StatCard from './StatCard';
import TrainerDetailsModal from './TrainerDetailsModal';
import { fetchDashboardData } from '../services/apiService';
import { TrainerStats, GymStats } from '../types';

const AnalyticsDashboard: React.FC = () => {

  const [stats, setStats] = useState<GymStats | null>(null);
  const [trainers, setTrainers] = useState<TrainerStats[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchDashboardData();
      if (data) {
        setStats(data.stats);
        setTrainers(data.trainers);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
      </div>
    );
  }

  const chartData = trainers;

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="إجمالي المسجلين"
          value={stats?.registeredUsers || 0}
          icon={<Users size={24} />}
        />

        <StatCard
          title="عدد الأعضاء"
          value={stats?.totalMembers || 0}
          icon={<Dumbbell size={24} />}
        />

        <StatCard
          title="الأعضاء النشطين"
          value={stats?.activeUsers || 0}
          icon={<Activity size={24} />}
        />
      </div>

      {/* Trainers Chart */}
      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-bold text-right mb-8">
          توزيع الأعضاء لكل مدرب
        </h2>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#9ca3af"
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#000',
                  border: '1px solid #333'
                }}
              />
              <Bar
                dataKey="memberCount"
                fill="#10b981"
                barSize={35}
                onClick={(data) =>
                  data?.payload && setSelectedTrainer(data.payload)
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-bold text-right mb-8">
          قائمة المدربين
        </h2>

        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/10 text-gray-400">
              <th className="pb-4">المدرب</th>
              <th className="pb-4">عدد الأعضاء</th>
            </tr>
          </thead>

          <tbody>
            {trainers.map((trainer) => (
              <tr
                key={trainer.id}
                className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                onClick={() => setSelectedTrainer(trainer)}
              >
                <td className="py-6">{trainer.name}</td>
                <td className="py-6 text-emerald-400 font-bold">
                  {trainer.memberCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Members Modal */}
      <TrainerDetailsModal
        trainer={selectedTrainer}
        onClose={() => setSelectedTrainer(null)}
      />

    </div>
  );
};

export default AnalyticsDashboard;
