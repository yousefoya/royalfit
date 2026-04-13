import React, { useState } from 'react';
import { NutritionTemplate, NutritionGoal } from '../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_BASE = 'https://royalfitness.fit/royal_api';

interface Props {
  templates: NutritionTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<NutritionTemplate[]>>;
  onDeleteTemplate: (templateId: string) => void;
}

const AdminNutritionTemplates: React.FC<Props> = ({
  templates,
  setTemplates,
  onDeleteTemplate
}) => {

  // ================= TEMPLATE FORM =================
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<NutritionGoal>(NutritionGoal.BULK);

  // ================= MEAL FORM =================
  const [showMealForm, setShowMealForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [mealForm, setMealForm] = useState({
    name: '',
    time: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // ================= ADD TEMPLATE =================
  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`${API_BASE}/create_nutrition_template.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        goal: goal.toLowerCase()
      })
    });

    const result = await res.json();
    if (!result.success) return alert('❌ فشل إنشاء النموذج');

    setTemplates(prev => [
      ...prev,
      {
        id: String(result.id),
        name,
        description,
        goal,
        meals: []
      }
    ]);

    setName('');
    setDescription('');
    setGoal(NutritionGoal.BULK);
    setShowForm(false);
  };

  // ================= ADD MEAL =================
  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return;

    const res = await fetch(`${API_BASE}/add_nutrition_meal.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: 1, // 🔐 لاحقًا من auth
        templateId: selectedTemplateId,
        ...mealForm
      })
    });

    const result = await res.json();
    if (!result.success) return alert('❌ فشل إضافة الوجبة');

    setTemplates(prev =>
      prev.map(t =>
        t.id === selectedTemplateId
          ? {
              ...t,
              meals: [
                ...t.meals,
                {
                  id: String(result.mealId),
                  ...mealForm,
                  ingredients: []
                }
              ]
            }
          : t
      )
    );

    setMealForm({
      name: '',
      time: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    setShowMealForm(false);
  };

  // ================= RENDER =================
  return (
    <div className="container mx-auto px-4 py-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">نماذج التغذية</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus size={18} />
          إضافة نموذج
        </button>
      </div>

      {/* TEMPLATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(t => (
          <div
            key={t.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            <h3 className="text-white font-bold text-lg">{t.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{t.description}</p>

            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <span className="bg-emerald-900/20 text-emerald-400 px-2 py-1 rounded font-bold">
                {t.goal}
              </span>
              <span>🍽 {t.meals.length} وجبات</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTemplateId(t.id);
                  setShowMealForm(true);
                }}
                className="flex-1 bg-emerald-900/20 hover:bg-emerald-600 text-emerald-400 hover:text-white py-2 rounded-lg font-bold"
              >
                ➕ إضافة وجبة
              </button>

              <button
                onClick={() => onDeleteTemplate(t.id)}
                className="bg-red-900/30 hover:bg-red-600 text-red-400 hover:text-white px-4 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {templates.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          لا توجد نماذج تغذية بعد
        </div>
      )}

      {/* ADD TEMPLATE MODAL */}
{showForm && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <form
      onSubmit={handleAddTemplate}
      className="
        bg-zinc-900
        w-full max-w-md
        p-6
        rounded-2xl
        border border-zinc-800
        space-y-5
      "
    >
      <h3 className="text-xl font-bold text-white text-right">
        إضافة نموذج
      </h3>

      {/* اسم النموذج */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400 text-right">
          اسم النموذج
        </label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="
            w-full
            bg-zinc-950
            border border-zinc-700
            rounded-lg
            px-4 py-3
            text-white
            outline-none
            focus:border-emerald-500
          "
        />
      </div>

      {/* الوصف */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400 text-right">
          الوصف
        </label>
        <textarea
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="
            w-full
            bg-zinc-950
            border border-zinc-700
            rounded-lg
            px-4 py-3
            text-white
            outline-none
            focus:border-emerald-500
            resize-none
          "
        />
      </div>

      {/* الهدف */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400 text-right">
          الهدف
        </label>
        <select
          value={goal}
          onChange={e => setGoal(e.target.value as NutritionGoal)}
          className="
            w-full
            bg-zinc-950
            border border-zinc-700
            rounded-lg
            px-4 py-3
            text-white
            outline-none
            focus:border-emerald-500
          "
        >
          <option value={NutritionGoal.BULK}>تضخيم</option>
          <option value={NutritionGoal.GAIN}>زيادة وزن</option>
          <option value={NutritionGoal.FAT_LOSS}>تنشيف</option>
        </select>
      </div>

      {/* أزرار */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 rounded-lg"
        >
          حفظ
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-6 bg-zinc-800 text-gray-300 rounded-lg"
        >
          إلغاء
        </button>
      </div>
    </form>
  </div>
)}


      {/* ADD MEAL MODAL */}
      {/* ===== ADD MEAL MODAL (IMPROVED UI) ===== */}
{showMealForm && selectedTemplateId && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
    <form
      onSubmit={handleAddMeal}
      className="bg-gradient-to-b from-zinc-900 to-black
                 border border-zinc-800
                 rounded-3xl
                 w-full max-w-lg
                 p-6 space-y-6"
    >

      {/* Title */}
      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-white">
          إضافة وجبة
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          أدخل تفاصيل الوجبة والقيم الغذائية
        </p>
      </div>

      {/* Meal Name */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          اسم الوجبة
        </label>
        <input
          required
          placeholder="مثال: فطور صحي"
          className="w-full bg-zinc-950 border border-zinc-700
                     focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                     p-4 rounded-xl text-white outline-none"
          onChange={e =>
            setMealForm({ ...mealForm, name: e.target.value })
          }
        />
      </div>

      {/* Meal Time */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">
          وقت الوجبة
        </label>
        <select
          className="w-full bg-zinc-950 border border-zinc-700
                     focus:border-emerald-500
                     p-4 rounded-xl text-white outline-none"
          onChange={e =>
            setMealForm({ ...mealForm, time: e.target.value })
          }
        >
          <option value="">اختر الوقت</option>
          <option value="breakfast">فطور</option>
          <option value="lunch">غداء</option>
          <option value="dinner">عشاء</option>
          <option value="snack">سناك</option>
        </select>
      </div>

      {/* Nutrition Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Calories', unit: 'kcal', key: 'calories' },
          { label: 'Protein', unit: 'g', key: 'protein' },
          { label: 'Carbs', unit: 'g', key: 'carbs' },
          { label: 'Fats', unit: 'g', key: 'fats' }
        ].map(item => (
          <div
            key={item.key}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4"
          >
            <label className="block text-xs text-gray-400 mb-1">
              {item.label}
            </label>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                className="flex-1 bg-transparent text-white text-lg
                           outline-none placeholder-gray-600"
                placeholder="0"
                onChange={e =>
                  setMealForm({
                    ...mealForm,
                    [item.key]: +e.target.value
                  } as any)
                }
              />
              <span className="text-gray-500 text-sm">
                {item.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 hover:bg-emerald-500
                     text-black font-bold py-3 rounded-xl transition"
        >
          حفظ الوجبة
        </button>
        <button
          type="button"
          onClick={() => setShowMealForm(false)}
          className="px-6 bg-zinc-800 hover:bg-zinc-700
                     text-gray-300 rounded-xl"
        >
          إلغاء
        </button>
      </div>
    </form>
  </div>
)}

    </div>
  );
};

export default AdminNutritionTemplates;
