import React, { useEffect, useState } from 'react';
import {
  Challenge,
  Submission,
  ChallengeType,
  SubmissionStatus
} from '../types';

type Participant = {
  id: string;
  name: string;
  total_points: number;
  approved_days: number;
  rejected_days: number;
};

export const AdminDashboard: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] =
    useState<'MANAGEMENT' | 'REVIEW'>('MANAGEMENT');

  const [showModal, setShowModal] = useState(false);

  /* ===== DETAILS MODAL ===== */
  const [showDetails, setShowDetails] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedChallengeTitle, setSelectedChallengeTitle] = useState('');

  /* ================= FORM STATE ================= */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ChallengeType>(ChallengeType.VIDEO);
  const [durationDays, setDurationDays] = useState(7);
  const [totalPoints, setTotalPoints] = useState(140);
  const [startDate, setStartDate] = useState('');

  /* ================= FETCH ================= */
  const fetchChallenges = async () => {
    const res = await fetch('https://royalfitness.fit/royal_api/get_challenges.php');
    const data = await res.json();
    setChallenges(Array.isArray(data) ? data : []);
  };

  const fetchSubmissions = async () => {
    const res = await fetch(
      'https://royalfitness.fit/royal_api/get_pending_submissions.php'
    );
    const data = await res.json();
    setSubmissions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchChallenges();
    fetchSubmissions();
  }, []);

  const pendingSubmissions = submissions.filter(
    s => s.status === SubmissionStatus.PENDING
  );

  /* ================= ACTIONS ================= */
  const addChallenge = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(
      'https://royalfitness.fit/royal_api/add_challenge.php',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          durationDays,
          totalPoints,
          startDate
        })
      }
    );

    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'فشل الحفظ');
      return;
    }

    setShowModal(false);
    setTitle('');
    setDescription('');
    setDurationDays(7);
    setTotalPoints(140);
    setStartDate('');

    fetchChallenges();
  };

  const updateSubmissionStatus = async (
    id: string,
    status: SubmissionStatus
  ) => {
    await fetch(
      'https://royalfitness.fit/royal_api/update_submission_status.php',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      }
    );
    fetchSubmissions();
  };

  const deleteChallenge = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف التحدي؟')) return;

    let res = await fetch(
      `https://royalfitness.fit/royal_api/delete_challenge.php?id=${id}`
    );

    let data = await res.json();

    // 👇 في حال وجود مشاركات
    if (!data.success && data.error === 'challenge_has_submissions') {
      const confirmForce = confirm(
        `⚠️ هذا التحدي يحتوي على ${data.count} مشاركات.\n\nهل تريد الحذف النهائي؟`
      );

      if (!confirmForce) return;

      // 🔥 Force delete
      res = await fetch(
        `https://royalfitness.fit/royal_api/delete_challenge.php?id=${id}&force=1`
      );
      data = await res.json();
    }

    if (!data.success) {
      alert('❌ فشل حذف التحدي');
      return;
    }

    fetchChallenges();
  };


  /* ===== OPEN DETAILS ===== */
  const openChallengeDetails = async (challenge: Challenge) => {
    setSelectedChallengeTitle(challenge.title);

    const res = await fetch(
      `https://royalfitness.fit/royal_api/get_challenge_participants.php?challenge_id=${challenge.id}`
    );

    const data = await res.json();
    setParticipants(Array.isArray(data) ? data : []);
    setShowDetails(true);
  };

  /* ================= RENDER ================= */
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">

      {/* HEADER */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h1 className="text-2xl font-black text-white">🏆 إدارة التحديات</h1>
        <p className="text-gray-400 text-sm">
          إنشاء التحديات ومراجعة مشاركات الأعضاء
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('MANAGEMENT')}
          className={activeTab === 'MANAGEMENT'
            ? 'text-emerald-500 font-bold'
            : 'text-gray-400'}
        >
          إدارة التحديات
        </button>

        <button
          onClick={() => setActiveTab('REVIEW')}
          className={activeTab === 'REVIEW'
            ? 'text-emerald-500 font-bold'
            : 'text-gray-400'}
        >
          مراجعة المشاركات ({pendingSubmissions.length})
        </button>
      </div>

      {/* ================= MANAGEMENT ================= */}
      {activeTab === 'MANAGEMENT' && (
        <>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold"
          >
            + إضافة تحدي جديد
          </button>

          <div className="grid md:grid-cols-3 gap-6">
            {challenges.map(c => (
              <div
                key={c.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                <h3 className="font-bold text-white">{c.title}</h3>
                <p className="text-sm text-gray-400">{c.description}</p>

                <p className="text-xs text-gray-500 mt-2">
                  ⏱ {c.durationDays} أيام — ⭐ {c.totalPoints} نقطة
                </p>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openChallengeDetails(c)}
                    className="text-emerald-400 font-bold"
                  >
                    تفاصيل
                  </button>

                  <button
                    onClick={() => deleteChallenge(c.id)}
                    className="text-red-400 font-bold"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    {/* ================= ADD CHALLENGE MODAL ================= */}
{showModal && (
  <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <form
      onSubmit={addChallenge}
      className="bg-zinc-900 w-full max-w-lg p-6 rounded-3xl border border-zinc-800 space-y-4"
    >
      <h3 className="text-xl font-black text-white">
        ➕ إضافة تحدي جديد
      </h3>

      <div className="space-y-1">
        <div className="relative bg-black border border-zinc-800 rounded-xl px-4 pt-5 pb-3">
          <label className="absolute top-2 right-4 text-xs text-gray-500">
            العنوان
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
            required
          />
        </div>
      </div>



      <div className="space-y-1">
        <div className="relative bg-black border border-zinc-800 rounded-xl px-4 pt-5 pb-3">
          <label className="absolute top-2 right-4 text-xs text-gray-500">
            الوصف
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-transparent text-white outline-none resize-none"
            rows={3}
            required
          />
        </div>
      </div>



      <div className="space-y-1">
        <div className="relative bg-black border border-zinc-800 rounded-xl px-4 pt-5 pb-3">
          <label className="absolute top-2 right-4 text-xs text-gray-500">
            عدد أيام التحدي
          </label>
          <input
            type="number"
            value={durationDays}
            onChange={e => setDurationDays(+e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 px-2">
          مثال: 7 أيام
        </p>
      </div>



      <div className="space-y-1">
        <div className="relative bg-black border border-zinc-800 rounded-xl px-4 pt-5 pb-3">
          <label className="absolute top-2 right-4 text-xs text-gray-500">
            مجموع النقاط
          </label>
          <input
            type="number"
            value={totalPoints}
            onChange={e => setTotalPoints(+e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>
        <p className="text-xs text-gray-500 px-2">
          سيتم توزيع النقاط على أيام التحدي
        </p>
      </div>



      <div className="space-y-1">
        <div className="relative bg-black border border-zinc-800 rounded-xl px-4 pt-5 pb-3">
          <label className="absolute top-2 right-4 text-xs text-gray-500">
            تاريخ البداية
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-transparent text-white outline-none"
          />
        </div>
      </div>



      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-emerald-500 text-black py-3 rounded-xl font-bold"
        >
          حفظ
        </button>

        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="flex-1 bg-zinc-800 text-gray-300 py-3 rounded-xl font-bold"
        >
          إلغاء
        </button>
      </div>
    </form>
  </div>
)}

      {/* ================= DETAILS MODAL ================= */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-zinc-900 w-full max-w-2xl p-6 rounded-3xl border border-zinc-800">
            <h3 className="text-xl font-black text-white mb-4">
              👥 المشاركون في {selectedChallengeTitle}
            </h3>

            {participants.length === 0 && (
              <div className="text-gray-500 text-center">
                لا يوجد مشاركون بعد
              </div>
            )}

            <div className="space-y-3">
              {participants.map(p => (
                <div
                  key={p.id}
                  className="bg-black border border-zinc-800 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="text-white font-bold">{p.name}</div>
                    <div className="text-sm text-gray-400">
                      ✅ {p.approved_days} — ❌ {p.rejected_days}
                    </div>
                  </div>

                  <div className="text-emerald-400 font-black">
                    ⭐ {p.total_points}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowDetails(false)}
              className="mt-6 w-full bg-zinc-800 text-gray-300 py-3 rounded-xl font-bold"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
