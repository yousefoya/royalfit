import React, { useEffect, useState } from 'react';

type Exercise = {
  id: string;
  muscle: string;
  name: string;
};

const API_BASE = 'https://royalfitness.fit/royal_api';

const MUSCLE_OPTIONS = [
  'عضلات الصدر',
  'عضلات الظهر',
  'عضلات الأرجل',
  'عضلات الأكتاف',
  'عضلات البايسيبس',
  'عضلات الترايسيبس',
  'عضلات المعدة',
  'كارديو وإحماء'
];

const AdminExercisesManager: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscle, setMuscle] = useState('');
  const [name, setName] = useState('');

  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');

  const fetchExercises = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_exercises.php`);
      const data = await res.json();
      if (data.success) {
        setExercises(data.exercises);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleAdd = async () => {
    if (!muscle || !name) return alert('املأ جميع الحقول');

    const res = await fetch(`${API_BASE}/add_exercise.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muscle, name })
    });

    const data = await res.json();
    if (data.success) {
      setMuscle('');
      setName('');
      fetchExercises();
    } else {
      alert('فشل الإضافة');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف التمرين؟')) return;

    const res = await fetch(`${API_BASE}/delete_exercise.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (data.success) {
      fetchExercises();
    } else {
      alert('فشل الحذف');
    }
  };

  const filteredExercises = exercises
    .filter(ex =>
      (filterMuscle === 'all' || ex.muscle === filterMuscle) &&
      ex.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">💪 إدارة مكتبة التمارين</h1>

      {/* ADD SECTION */}
      <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MUSCLE_OPTIONS.map(option => (
            <label
              key={option}
              className={`p-3 rounded-xl border cursor-pointer text-sm font-bold text-center transition-all
                ${
                  muscle === option
                    ? 'bg-emerald-600 text-black border-emerald-600'
                    : 'bg-black border-zinc-700 text-gray-400 hover:border-emerald-500'
                }`}
            >
              <input
                type="radio"
                value={option}
                checked={muscle === option}
                onChange={() => setMuscle(option)}
                className="hidden"
              />
              {option}
            </label>
          ))}
        </div>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="اسم التمرين"
          className="w-full bg-black border border-zinc-700 p-3 rounded-xl text-white"
        />

        <button
          onClick={handleAdd}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-xl font-bold transition"
        >
          إضافة تمرين
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
        <div className="grid md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="🔎 بحث عن تمرين..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-black border border-zinc-700 p-3 rounded-xl text-white"
          />

          <select
            value={filterMuscle}
            onChange={e => setFilterMuscle(e.target.value)}
            className="bg-black border border-zinc-700 p-3 rounded-xl text-white"
          >
            <option value="all">كل العضلات</option>
            {MUSCLE_OPTIONS.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-center bg-black border border-zinc-700 rounded-xl text-gray-400 font-bold">
            {filteredExercises.length} تمرين
          </div>

        </div>
      </div>

      {/* LIST SECTION */}
      <div className="grid md:grid-cols-3 gap-4">
        {filteredExercises.map(ex => (
          <div
            key={ex.id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <div className="text-white font-bold">{ex.name}</div>
              <div className="text-xs text-gray-400">{ex.muscle}</div>
            </div>

            <button
              onClick={() => handleDelete(ex.id)}
              className="text-red-400 hover:text-red-300 font-bold"
            >
              حذف
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminExercisesManager;
