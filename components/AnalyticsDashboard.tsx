import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Activity, Dumbbell, UserCheck, UserX, Clock3, Edit, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from './StatCard';
import TrainerDetailsModal from './TrainerDetailsModal';
import { fetchDashboardData } from '../services/apiService';
import { TrainerStats, GymStats } from '../types';
import { WORKOUT_DB } from '../constants';

const API_BASE = 'https://royalfitness.fit/royal_api';

// ─── helpers ────────────────────────────────────────────────────────────────

const isActive = (dateString?: string): boolean => {
  if (!dateString) return true;
  const expiry = new Date(dateString);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  return today <= expiry;
};

type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'need_update';

// نفس منطق App.tsx بالضبط
const computeStatus = (
  scheduleText: string,
  updatedAt: string | undefined,
  workoutLibrary: Record<string, string[]>
): ScheduleStatus => {
  if (!scheduleText || scheduleText.trim() === '') return 'pending';

  const muscleGroups = Object.values(workoutLibrary);
  let coveredCount = 0;

  for (const exercises of muscleGroups) {
    const covered = exercises.some(ex =>
      scheduleText.toLowerCase().includes(ex.toLowerCase())
    );
    if (covered) coveredCount++;
  }

  if (coveredCount < muscleGroups.length) return 'in_progress';

  // completed — لكن نشوف إذا محتاج تحديث (أكثر من 21 يوم)
  if (updatedAt) {
    const diffDays = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 21) return 'need_update';
  }

  return 'completed';
};

// ─── types ───────────────────────────────────────────────────────────────────

interface RawUser {
  id: string;
  name: string;
  role: string;
  phone: string;
  trainerId?: string;
  subscriptionEndDate?: string;
}

interface TrainerRow {
  id: string;
  name: string;
  memberCount: number;
  pending: number;
  in_progress: number;
  completed: number;
  need_update: number;
}

// ─── status config ───────────────────────────────────────────────────────────

const statusConfig = {
  pending:     { label: 'قيد الانتظار', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40', icon: Clock3 },
  in_progress: { label: 'في تقدم',      color: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-700/40',  icon: Edit },
  completed:   { label: 'مكتمل',        color: 'text-blue-400',   bg: 'bg-blue-900/30',   border: 'border-blue-700/40',   icon: CheckCircle },
  need_update: { label: 'يحتاج تحديث', color: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-700/40',    icon: AlertTriangle },
};

const StatusCell: React.FC<{ count: number; status: ScheduleStatus }> = ({ count, status }) => {
  const cfg = statusConfig[status];
  return (
    <td className="py-4 px-3 text-center">
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
        {count}
      </span>
    </td>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const AnalyticsDashboard: React.FC = () => {

  const [stats, setStats]                     = useState<GymStats | null>(null);
  const [trainers, setTrainers]               = useState<TrainerStats[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerStats | null>(null);
  const [loading, setLoading]                 = useState(true);

  const [activeCount, setActiveCount]     = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [trainerRows, setTrainerRows]     = useState<TrainerRow[]>([]);

  // workoutLibrary: نبدأ بـ WORKOUT_DB ثم نحدّثها من get_exercises.php
  const [workoutLibrary, setWorkoutLibrary] = useState<Record<string, string[]>>(WORKOUT_DB);

  useEffect(() => {
    async function loadAll() {
      try {
        // 1. dashboard (trainers list)
        const dashData = await fetchDashboardData();
        if (dashData) {
          setStats(dashData.stats);
          setTrainers(dashData.trainers);
        }

        // 2. exercises من DB (نفس ما يعمله App.tsx)
        let library: Record<string, string[]> = { ...WORKOUT_DB };
        try {
          const exRes  = await fetch(`${API_BASE}/get_exercises.php`);
          const exData = await exRes.json();
          if (exData.success && Array.isArray(exData.exercises)) {
            const grouped: Record<string, string[]> = {};
            exData.exercises.forEach((ex: { muscle: string; name: string }) => {
              if (!grouped[ex.muscle]) grouped[ex.muscle] = [];
              grouped[ex.muscle].push(ex.name);
            });
            if (Object.keys(grouped).length > 0) library = grouped;
          }
        } catch {
          // نستمر بـ WORKOUT_DB الاحتياطي
        }
        setWorkoutLibrary(library);

        // 3. users
        const usersRes  = await fetch(`${API_BASE}/get_users.php`);
        const usersData: RawUser[] = await usersRes.json();

        // 4. schedules — يرجع object مفتاحه client_id
        // { "33": { "text": "...", "updatedAt": "..." }, ... }
        const schRes = await fetch(`${API_BASE}/get_schedules.php`);
        const schRaw = await schRes.json();
        const scheduleMap: Record<string, { text: string; updatedAt?: string }> = schRaw;

        // 5. active / inactive members
        const members  = usersData.filter(u => u.role === 'member');
        const active   = members.filter(u => isActive(u.subscriptionEndDate));
        const inactive = members.filter(u => !isActive(u.subscriptionEndDate));
        setActiveCount(active.length);
        setInactiveCount(inactive.length);

        // 6. trainer rows — فقط المشتركين الفعّالين
        if (!dashData?.trainers) return;

        const rowMap: Record<string, TrainerRow> = {};
        dashData.trainers.forEach((t: TrainerStats) => {
          rowMap[String(t.id)] = {
            id: String(t.id),
            name: t.name,
            memberCount: 0,
            pending: 0,
            in_progress: 0,
            completed: 0,
            need_update: 0,
          };
        });

        active.forEach(member => {
          const tid = String(member.trainerId);
          if (!tid || !rowMap[tid]) return;

          const sched  = scheduleMap[String(member.id)];
          const text   = sched?.text ?? '';
          const status = computeStatus(text, sched?.updatedAt, library);

          rowMap[tid].memberCount++;
          rowMap[tid][status]++;
        });

        setTrainerRows(
          Object.values(rowMap).filter(r => r.memberCount > 0)
        );

      } catch (err) {
        console.error('AnalyticsDashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto" dir="rtl">

      {/* ── Row 1: stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="إجمالي المسجلين" value={stats?.registeredUsers || 0} icon={<Users size={24} />} />
        <StatCard title="عدد الأعضاء"     value={stats?.totalMembers   || 0} icon={<Dumbbell size={24} />} />
        <StatCard title="الأعضاء النشطين" value={stats?.activeUsers    || 0} icon={<Activity size={24} />} />
      </div>

      {/* ── Row 2: active / inactive ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-3xl p-7 shadow-xl flex items-center gap-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <UserCheck size={32} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">المشتركين الفعّالين</p>
            <p className="text-5xl font-black text-emerald-400">{activeCount}</p>
            <p className="text-xs text-gray-600 mt-1">اشتراك سارٍ المفعول</p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-3xl p-7 shadow-xl flex items-center gap-6">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <UserX size={32} className="text-red-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">المشتركين غير الفعّالين</p>
            <p className="text-5xl font-black text-red-400">{inactiveCount}</p>
            <p className="text-xs text-gray-600 mt-1">اشتراك منتهي الصلاحية</p>
          </div>
        </div>
      </div>

      {/* ── Row 3: trainer schedule table ── */}
      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-bold text-right mb-2">حالة برامج المدربين</h2>
        <p className="text-gray-500 text-sm text-right mb-8">
          يشمل فقط المشتركين الفعّالين (اشتراك غير منتهٍ)
        </p>

        {/* legend */}
        <div className="flex flex-wrap gap-4 justify-end mb-6">
          {(Object.keys(statusConfig) as ScheduleStatus[]).map(s => {
            const cfg  = statusConfig[s];
            const Icon = cfg.icon;
            return (
              <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                <Icon size={12} /> {cfg.label}
              </span>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 pr-3 text-gray-400 font-semibold text-sm">المدرب</th>
                {(Object.keys(statusConfig) as ScheduleStatus[]).map(s => (
                  <th key={s} className={`pb-4 px-3 text-center text-xs font-bold ${statusConfig[s].color}`}>
                    {statusConfig[s].label}
                  </th>
                ))}
                <th className="pb-4 px-3 text-center text-gray-400 font-semibold text-sm">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {trainerRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-600">لا توجد بيانات</td>
                </tr>
              ) : (
                trainerRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                  >
                    <td className="py-5 pr-3 font-bold text-white">{row.name}</td>
                    <StatusCell count={row.pending}     status="pending" />
                    <StatusCell count={row.in_progress} status="in_progress" />
                    <StatusCell count={row.completed}   status="completed" />
                    <StatusCell count={row.need_update} status="need_update" />
                    <td className="py-5 px-3 text-center">
                      <span className="text-white font-black text-lg">{row.memberCount}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {trainerRows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-white/10 bg-white/[0.03]">
                  <td className="py-4 pr-3 font-black text-emerald-400 text-sm">الإجمالي</td>
                  {(['pending', 'in_progress', 'completed', 'need_update'] as ScheduleStatus[]).map(s => (
                    <td key={s} className="py-4 px-3 text-center font-black text-white">
                      {trainerRows.reduce((acc, r) => acc + r[s], 0)}
                    </td>
                  ))}
                  <td className="py-4 px-3 text-center font-black text-emerald-400 text-lg">
                    {trainerRows.reduce((acc, r) => acc + r.memberCount, 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Row 4: bar chart ── */}
      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-bold text-right mb-8">توزيع الأعضاء لكل مدرب</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trainers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={140} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
              <Bar
                dataKey="memberCount"
                fill="#10b981"
                barSize={35}
                onClick={(data) => data?.payload && setSelectedTrainer(data.payload)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 5: trainers list ── */}
      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-xl">
        <h2 className="text-2xl font-bold text-right mb-8">قائمة المدربين</h2>
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
                <td className="py-6 text-emerald-400 font-bold">{trainer.memberCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TrainerDetailsModal trainer={selectedTrainer} onClose={() => setSelectedTrainer(null)} />
    </div>
  );
};

export default AnalyticsDashboard;
