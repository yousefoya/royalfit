import React, { useEffect, useState } from 'react';
import { Challenge, User } from '../types';

interface MemberDashboardProps {
  currentUser: User;
}

type Submission = {
  day: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submitted_at: string;
};

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] =
    useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  /* ✅ ملفات ومعاينات لكل يوم */
  const [selectedFiles, setSelectedFiles] =
    useState<Record<number, File>>({});
  const [previewUrls, setPreviewUrls] =
    useState<Record<number, string>>({});

  /* ===== DASHBOARD STATS ===== */
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    challenges: 0,
    points: 0
  });

  /* ================= FETCH CHALLENGES ================= */
  const fetchChallenges = async () => {
    const res = await fetch('https://royalfitness.fit/royal_api/get_challenges.php');
    const data = await res.json();
    setChallenges(Array.isArray(data) ? data : []);
  };

  const fetchJoined = async () => {
    const res = await fetch(
      `https://royalfitness.fit/royal_api/get_member_challenge_overview.php?userId=${currentUser.id}`
    );
    const data = await res.json();
    setJoinedIds(data?.joinedChallengeIds || []);
  };

  /* ================= FETCH STATS ================= */
  const fetchStats = async () => {
    const res = await fetch(
      `https://royalfitness.fit/royal_api/get_member_dashboard_stats.php?userId=${currentUser.id}`
    );
    const data = await res.json();
    setStats(data);
  };

  useEffect(() => {
    fetchChallenges();
    fetchJoined();
    fetchStats();
  }, []);

  /* ================= JOIN ================= */
  const joinChallenge = async (challenge: Challenge) => {
  // تحديث فوري
  setJoinedIds(prev => [...prev, challenge.id]);

  await fetch('https://royalfitness.fit/royal_api/join_challenge.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      challengeId: challenge.id
    })
  });

  fetchStats();
  setSelectedChallenge(challenge);
};


  /* ================= PROGRESS ================= */
  const fetchProgress = async (challengeId: string) => {
    const res = await fetch(
      `https://royalfitness.fit/royal_api/get_my_challenge_progress.php?userId=${currentUser.id}&challengeId=${challengeId}`
    );
    const data = await res.json();
    setSubmissions(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (selectedChallenge) {
      fetchProgress(selectedChallenge.id);
    }
  }, [selectedChallenge]);

  const submissionForDay = (day: number) =>
    submissions.find(s => Number(s.day) === day);


  const canOpenDay = (day: number) => {
    if (day === 1) return true;
    const prev = submissionForDay(day - 1);
    if (!prev) return false;
    return Date.now() - new Date(prev.submitted_at).getTime() >= 86400000;
  };

  /* ================= UPLOAD ================= */
  const upload = async (day: number) => {
    const file = selectedFiles[day];
    if (!file || !selectedChallenge) return;

    const form = new FormData();
    form.append('video', file);
    form.append('userId', currentUser.id);
    form.append('challengeId', selectedChallenge.id);
    form.append('day', String(day));

    const res = await fetch(
      'https://royalfitness.fit/royal_api/upload_challenge_video.php',
      { method: 'POST', body: form }
    );

    const data = await res.json();
    if (!data.success) {
      alert(data.error || 'فشل الرفع');
      return;
    }

    // تنظيف المعاينة
    if (previewUrls[day]) {
      URL.revokeObjectURL(previewUrls[day]);
    }

    setSelectedFiles(prev => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });

    setPreviewUrls(prev => {
      const copy = { ...prev };
      delete copy[day];
      return copy;
    });

    fetchProgress(selectedChallenge.id);
    fetchStats();
  };

  /* ================= RENDER ================= */
  return (
    <div className="space-y-10">

      {/* ===== DASHBOARD STATS ===== */}
      <div className="flex justify-start">
        <div className="bg-emerald-600/90 rounded-3xl px-8 py-6 flex gap-12 items-center shadow-lg">

          {/* النقاط */}
          <div className="text-center">
            <div className="text-sm text-emerald-100 mb-1">⭐ النقاط</div>
            <div className="text-3xl font-black text-white">
              {stats.points}
            </div>
          </div>

          {/* فاصل */}
          <div className="w-px h-12 bg-emerald-300/40" />

          {/* التحديات */}
          <div className="text-center">
            <div className="text-sm text-emerald-100 mb-1">🏆 التحديات</div>
            <div className="text-3xl font-black text-white">
              {stats.challenges}
            </div>
          </div>

        </div>
      </div>


      {/* ===== CHALLENGES LIST ===== */}
      <h3 className="text-2xl font-black">🏆 التحديات</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {challenges.map(c => {
          const joined = joinedIds.includes(c.id);

          return (
            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6"
            >
              <h4 className="font-bold">{c.title}</h4>
              <p className="text-sm text-gray-400">{c.description}</p>

              <p className="text-xs text-gray-400 mt-2">
                ⏱ {c.durationDays} أيام — ⭐ {c.totalPoints}
              </p>

              <button
                onClick={() =>
                  joined ? setSelectedChallenge(c) : joinChallenge(c)
                }
                className="mt-4 w-full py-3 bg-emerald-500 text-black font-bold rounded-xl"
              >
                {joined ? 'متابعة التحدي' : 'انضم للتحدي'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ===== MODAL ===== */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-start p-4">
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl p-6">

            <div className="flex justify-between mb-6">
              <h3 className="font-black text-xl">
                {selectedChallenge.title}
              </h3>
              <button onClick={() => setSelectedChallenge(null)}>✕</button>
            </div>

            {Array.from(
              { length: selectedChallenge.durationDays },
              (_, i) => i + 1
            ).map(day => {
              const sub = submissionForDay(day);
              const open = canOpenDay(day);

              return (
                <div
                  key={day}
                  className="flex flex-col border border-zinc-800 rounded-xl p-4 mb-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span>اليوم {day}</span>

                    {sub && (
                      <span
                        className={
                          sub.status === 'APPROVED'
                            ? 'text-emerald-500 font-bold'
                            : sub.status === 'REJECTED'
                            ? 'text-red-500 font-bold'
                            : 'text-yellow-400 font-bold'
                        }
                      >
                        {sub.status === 'APPROVED' && '✅ مقبول'}
                        {sub.status === 'REJECTED' && '❌ مرفوض'}
                        {sub.status === 'PENDING' && '⏳ قيد المراجعة'}
                      </span>
                    )}
                  </div>

                  {!sub && open && (
                    <>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept={
                            selectedChallenge.type === 'IMAGE'
                              ? 'image/*'
                              : 'video/*'
                          }
                          className="hidden"
                          id={`file-${day}`}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            setSelectedFiles(prev => ({
                              ...prev,
                              [day]: file
                            }));
                            setPreviewUrls(prev => ({
                              ...prev,
                              [day]: URL.createObjectURL(file)
                            }));
                          }}
                        />

                        <label
                          htmlFor={`file-${day}`}
                          className="bg-zinc-800 px-3 py-2 rounded cursor-pointer"
                        >
                          اختيار ملف
                        </label>

                        <button
                          onClick={() => upload(day)}
                          disabled={!selectedFiles[day]}
                          className={`px-4 py-2 rounded font-bold ${
                            selectedFiles[day]
                              ? 'bg-emerald-500 text-black'
                              : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          إرسال
                        </button>

                      </div>

                      {previewUrls[day] && (
                        <video
                          src={previewUrls[day]}
                          controls
                          className="mt-3 rounded-lg w-full max-h-48"
                        />
                      )}
                    </>
                  )}

                  {!sub && !open && (
                    <span className="text-gray-500">🔒 مغلق</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
