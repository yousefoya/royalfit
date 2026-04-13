import React, { useState, useEffect, useRef } from 'react';
import { AuthState, UserRole, User, Message, ScheduleStatus, Meal, NutritionTemplate } from './types';
import { MOCK_USERS, WORKOUT_DB, MUSCLE_IMAGES} from './constants'; 
import { Layout, RoyalLogo } from './components/Layout';
import { AICoach } from './components/AICoach';
import NutritionCard from './components/NutritionCard';
import AdminNutritionTemplates from './components/AdminNutritionTemplates';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { CheckCircle, Users, Activity, Lock, ArrowLeft, Star, Dumbbell, Edit, Save, X, Calendar, Settings, Plus, ChevronDown, ListFilter, Trash2, Search, UserPlus, Phone, MessageSquare, Send, Filter, AlertCircle, Share2, Maximize2, ArrowRight, AlertTriangle, FileClock, Clock3, Facebook, Instagram, Utensils } from 'lucide-react';
import WeeklyIntegratedView from './components/WeeklyIntegratedView';
import ChallengesModule from './components/ChallengesModule';
import AdminExercisesManager from './components/AdminExercisesManager';

const isMuscleCovered = (scheduleText: string, exercises: string[]) => {
  return exercises.some(ex =>
    scheduleText.toLowerCase().includes(ex.toLowerCase())
  );
};



export default function App() {
  //const API_BASE = 'http://localhost/royal_api';
  const API_BASE = 'https://royalfitness.fit/royal_api/';
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  
  const MemberNutritionPage: React.FC<{
  auth: AuthState;
  nutritionPlans: Record<string, string>;
  setNutritionPlans: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}> = ({ auth, nutritionPlans, setNutritionPlans }) => {


  const templateId = nutritionPlans[String(auth.user?.id)] || 'bulk-pro';
    const template =
    nutritionTemplates
.find(t => t.id === templateId) ||
    nutritionTemplates
[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">
        جدول التغذية
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {template.meals.map(meal => (
          <NutritionCard
            key={meal.id}
            meal={meal}
            onClick={() => setSelectedMeal(meal)}
          />
        ))}
      </div>
      {selectedMeal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl animate-in zoom-in duration-200">

      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-zinc-800">
        <h3 className="text-xl font-bold text-white">
          {selectedMeal.name}
        </h3>
        <button
          onClick={() => setSelectedMeal(null)}
          className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <div className="flex justify-between text-sm text-gray-400">
          <span>⏰ {selectedMeal.time}</span>
          <span className="text-emerald-400 font-bold">
            ⚡ {selectedMeal.calories} سعرة
          </span>
        </div>

        <div className="space-y-2">
          {selectedMeal.ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="flex justify-between bg-black/40 p-3 rounded-lg border border-zinc-800 text-sm"
            >
              <span className="text-white">{ing.name}</span>
              <span className="text-gray-400">{ing.amount}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800 text-center">
          <div>
            <p className="text-xs text-gray-500">بروتين</p>
            <p className="text-white font-bold">{selectedMeal.protein}g</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">كارب</p>
            <p className="text-white font-bold">{selectedMeal.carbs}g</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">دهون</p>
            <p className="text-white font-bold">{selectedMeal.fats}g</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

  const loadMessages = async (userId: string, otherUserId: string) => {
  if (!userId || !otherUserId) return;
  try { 
    const res = await fetch(
      `${API_BASE}/get_messages.php?user_id=${userId}&other_id=${otherUserId}`
    );
    if (!res.ok) throw new Error('فشل تحميل الرسائل');

    const data = await res.json();
    setChatMessages(
      data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    );

  } catch (err) {
    console.error('Error loading messages:', err);
    setChatMessages([]);
  }
};

  const [currentPage, setCurrentPage] = useState('home');
  const [showForm, setShowForm] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  // ===== NUTRITION STATE =====
  
const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
const [nutritionPlans, setNutritionPlans] = useState<Record<string, string>>({}); // memberId → templateId
const [nutritionTemplates, setNutritionTemplates] = useState<NutritionTemplate[]>([]);
const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
const getSafeTemplate = (templateId?: string) => {
  if (nutritionTemplates.length === 0) return null;

  return (
    nutritionTemplates.find(t => t.id === templateId) ||
    nutritionTemplates[0]
  );
};

useEffect(() => {
  if (nutritionTemplates.length > 0 && !previewTemplateId) {
    setPreviewTemplateId(nutritionTemplates[0].id);
  }
}, [nutritionTemplates]);

const [editingClientIdForNutrition, setEditingClientIdForNutrition] = useState<string | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('royal_auth');

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        setAuth({
          isAuthenticated: true,
          user
        });

        setCurrentPage('dashboard');
      } catch {
        localStorage.removeItem('royal_auth');
      }
    }
  }, []);

useEffect(() => {
  fetch(`${API_BASE}/get_nutrition_templates.php`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setNutritionTemplates(
          data.templates.map((t: any) => ({
            ...t,
            id: String(t.id),
            goal: t.goal.toUpperCase(), // 🔥 الحل
            meals: t.meals ?? []        // 🔥 تأكيد
          }))
        );
      }
    })
    .catch(err => {
      console.error('❌ Failed to load nutrition templates:', err);
    });
}, []);
useEffect(() => {
  fetch(`${API_BASE}/get_exercises.php`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const grouped: Record<string, string[]> = {};

        data.exercises.forEach((ex: any) => {
          if (!grouped[ex.muscle]) {
            grouped[ex.muscle] = [];
          }
          grouped[ex.muscle].push(ex.name);
        });

        setWorkoutLibrary(grouped);
      }
    })
    .catch(err => {
      console.error("Failed to load exercises", err);
    });
}, []);




  const [loginTab, setLoginTab] = useState<UserRole>(UserRole.MEMBER);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);  
  const renderWeeklyIntegratedView = () => <WeeklyIntegratedView />;
  const handleDeleteUser = async (userId: string) => {
  if (!auth.user || auth.user.role !== UserRole.ADMIN) return;

  if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

  try {
    const res = await fetch(`${API_BASE}/delete_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: auth.user.id,
        userId
      })
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    // ✅ تحديث الواجهة بعد نجاح السيرفر فقط
    setUsers(prev => prev.filter(u => u.id !== userId));

  } catch (err) {
    alert('❌ فشل حذف المستخدم');
    console.error(err);
  }
};

  useEffect(() => {
  fetch(`${API_BASE}/get_users.php`)
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(err => console.error('Failed to load users:', err));
}, []);
useEffect(() => {
  if (!auth.user) return;

  const loadAllSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE}/get_schedules.php`);
      if (!res.ok) throw new Error('Failed to load schedules');

      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error('❌ Failed to load schedules', err);
      setSchedules({});
    }
  };

  loadAllSchedules();
}, [auth.user]);




  const [schedules, setSchedules] = useState<
    Record<string, { text: string; updatedAt: string }>
  >({});

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState<'all' | ScheduleStatus>('all');
  
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [tempSchedule, setTempSchedule] = useState('');
  
  const [selectedMuscle, setSelectedMuscle] = useState<string>(Object.keys(WORKOUT_DB)[0]);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [workoutLibrary, setWorkoutLibrary] = useState<Record<string, string[]>>({});

  
  const [selectedMemberMuscle, setSelectedMemberMuscle] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ password: '', avatar: '' });

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '', role: UserRole.MEMBER,   trainerId: null as number | null, password: '' });
  const [subscriptionDuration, setSubscriptionDuration] = useState('1'); 
  const [customEndDate, setCustomEndDate] = useState('');

  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  
const isExerciseAdded = (exercise: string) => {
  return tempSchedule
    .toLowerCase()
    .includes(exercise.toLowerCase());
};
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen, activeChatUserId]);

  const getUserScheduleStatus = (user: User): ScheduleStatus => {
    const scheduleObj = schedules[String(user.id)];
    const text = scheduleObj?.text || '';
    let status = computeScheduleStatusFromText(text);

    // 🔥 استخدم updatedAt من schedules وليس user
    if (
      status === ScheduleStatus.COMPLETED &&
      scheduleObj?.updatedAt
    ) {
      const last = new Date(scheduleObj.updatedAt);
      const now = new Date();
      const diffDays =
        (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 21) {
        return ScheduleStatus.NEED_UPDATE;
      }
    }

    return status;
  };

const computeScheduleStatusFromText = (scheduleText: string): ScheduleStatus => {
  if (!scheduleText || scheduleText.trim() === '') {
    return ScheduleStatus.PENDING;
  }

  const muscleGroups = Object.values(
    Object.keys(workoutLibrary).length > 0
      ? workoutLibrary
      : WORKOUT_DB
  );

  let coveredCount = 0;

  for (const exercises of muscleGroups) {
    if (isMuscleCovered(scheduleText, exercises)) {
      coveredCount++;
    }
  }

  // ❌ ممنوع مكتمل إذا ناقص ولا عضلة
  if (coveredCount < muscleGroups.length) {
    return ScheduleStatus.IN_PROGRESS;
  }

  return ScheduleStatus.COMPLETED;
};

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError('');

  try {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginPhone, password: loginPassword })
    });

    const data = await res.json();
    if (data.success && data.user) {
      setAuth({ isAuthenticated: true, user: data.user });
      localStorage.setItem('royal_auth', JSON.stringify(data.user));
      setCurrentPage('dashboard');
    }else {
      setLoginError(data.error || 'فشل في تسجيل الدخول');
    }
  } catch (err) {
    setLoginError('خطأ في الاتصال بالخادم');
    console.error(err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('royal_auth');
    setAuth({ isAuthenticated: false, user: null });
    setCurrentPage('home');
    setSearchQuery('');
    setRoleFilter('all');
    setScheduleStatusFilter('all');
    setIsChatOpen(false);
    setLoginError('');
  };


const handleSaveSchedule = async () => {
  if (!editingClientId || tempSchedule === null) return;

  try {
    // 🔥 Critical: Use clientId (matches DB column `client_id`)
    const res = await fetch(`${API_BASE}/save_schedule.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: editingClientId,
      trainerId: auth.user.id,
      scheduleText: tempSchedule
    })
  });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'فشل في الحفظ');
    }

    // ✅ Optimistic + DB sync
    setSchedules(prev => ({
    ...prev,
    [editingClientId]: {
      text: tempSchedule,
      updatedAt: new Date().toISOString()
    }
  }));
    const newStatus = computeScheduleStatusFromText(tempSchedule);


    setEditingClientId(null);
    if (currentPage === 'trainer-schedule') {
      setCurrentPage('dashboard');
    }

  } catch (err: any) {
    const msg = err.message || 'فشل الاتصال بالخادم. تأكد من تشغيل XAMPP ووجود الملف.';
    alert('❌ فشل الحفظ: ' + msg);
    console.error('[Save Schedule Error]', err);
  }
};


  const openScheduleEditor = (clientId: string) => {
    setEditingClientId(clientId);
    setTempSchedule(schedules[clientId]?.text || '');    setSelectedMuscle(Object.keys(WORKOUT_DB)[0]);
    setSelectedExercises([]);

    setUsers(prevUsers => prevUsers.map(u => {
      if (u.id === clientId) {
        return {
          ...u,
          scheduleStatus: ScheduleStatus.IN_PROGRESS
        };
      }
      return u;
    }));

    setCurrentPage('trainer-schedule');
  };

  const toggleExerciseSelection = (ex: string) => {
    setSelectedExercises(prev => 
      prev.includes(ex) 
        ? prev.filter(item => item !== ex)
        : [...prev, ex]
    );
  };

  const handleAddExercisesToSchedule = () => {
    if (selectedExercises.length > 0) {
      const exercisesString = selectedExercises.map(ex => `[${selectedMuscle}] - ${ex}`).join('\n');
      setTempSchedule(prev => prev ? `${prev}\n${exercisesString}` : exercisesString);
      setSelectedExercises([]); 
    }
  };

  const handleOpenProfileModal = () => {
    if (auth.user) {
      setProfileForm({
        password: '',
        avatar: auth.user.avatar || ''
      });
      setIsProfileModalOpen(true);
    }
  };

  const formatPhoneForWhatsapp = (phone: string) => {
    let formatted = phone;
    if (formatted.startsWith('0')) {
      formatted = '962' + formatted.substring(1);
    }
    return formatted;
  };

  const handleSaveProfile = async () => {
  if (!auth.user || !profileForm.password) return;

  try {
    const res = await fetch(`${API_BASE}/update_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: auth.user.id,
        password: profileForm.password
      })
    });

    const text = await res.text();
    console.log('RAW RESPONSE:', text);

    const result = JSON.parse(text);

    if (!result.success) {
      throw new Error(result.error);
    }

    alert('✅ تم تحديث كلمة المرور بنجاح');
    setIsProfileModalOpen(false);

  } catch (err) {
    console.error(err);
    alert('❌ فشل تحديث كلمة المرور');
  }
};
const handleDeleteNutritionTemplate = async (templateId: string) => {
  if (!auth.user || auth.user.role !== UserRole.ADMIN) return;

  if (!confirm('هل أنت متأكد من حذف نموذج التغذية؟')) return;

  try {
    const res = await fetch(`${API_BASE}/delete_nutrition_template.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: auth.user.id,
        templateId
      })
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Delete failed');
    }

    // ✅ تحديث الواجهة مباشرة
    setNutritionTemplates(prev =>
      prev.filter(t => t.id !== templateId)
    );

  } catch (err) {
    console.error(err);
    alert('❌ فشل حذف نموذج التغذية');
  }
};

const handleSaveEditUser = async () => {
  if (!editUser || !auth.user) return;

  try {
    // 1️⃣ حفظ بيانات المستخدم العادية (الاسم / الهاتف / الدور / المدرب ...)
    const res = await fetch(`${API_BASE}/update_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editUser)
    });

    const result = await res.json();
    if (!result.success) {
      alert('❌ فشل تحديث بيانات المستخدم');
      return;
    }

    // 2️⃣ 🔐 إذا الأدمن كتب كلمة مرور جديدة
    if (adminNewPassword && auth.user.role === UserRole.ADMIN) {
      const passRes = await fetch(`${API_BASE}/admin_reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: auth.user.id,
          userId: editUser.id,
          password: adminNewPassword
        })
      });

      const passResult = await passRes.json();
      if (!passResult.success) {
        alert('❌ فشل تغيير كلمة المرور');
        return;
      }
    }

    // 3️⃣ تحديث الواجهة
    setUsers(prev =>
      prev.map(u => (u.id === editUser.id ? editUser : u))
    );

    setAdminNewPassword('');
    setIsEditUserModalOpen(false);
    alert('✅ تم حفظ التغييرات بنجاح');

  } catch (err) {
    console.error(err);
    alert('❌ خطأ في الاتصال بالخادم');
  }
};


  const calculateSubscriptionEndDate = (): string | undefined => {
    if (newUser.role !== UserRole.MEMBER) return undefined;
    const date = new Date();
    if (subscriptionDuration === 'custom' && customEndDate) {
      return new Date(customEndDate).toISOString();
    }
    const months = parseInt(subscriptionDuration);
    if (!isNaN(months)) {
      date.setMonth(date.getMonth() + months);
      return date.toISOString();
    }
    return undefined;
  };

  const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();

  const subEndDate = calculateSubscriptionEndDate();

  const payload = {
    name: newUser.name,
    phone: newUser.phone,
    role: newUser.role,
    password: newUser.password,
    trainerId: newUser.role === UserRole.MEMBER ? newUser.trainerId : undefined,
    subscriptionEndDate: subEndDate,
    creatorRole: auth.user?.role   // 🔥 مهم جداً
  };


  try {
    const res = await fetch(`${API_BASE}/save_user.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

if (result.success) {
  setUsers(prev => [
    ...prev,
    {
      id: String(result.id),
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      trainerId: newUser.trainerId ? String(newUser.trainerId) : null,
      avatar: 'https://i.pinimg.com/1200x/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg',
      subscriptionEndDate: calculateSubscriptionEndDate(),
      scheduleStatus: null,
      scheduleLastUpdated: null
    }
  ]);
}

    // WhatsApp message (keep this)
    if (newUser.phone) {
      const msg = `مرحباً ${newUser.name} في رويال فتنس! 👑\nتم إنشاء حسابك بنجاح.\nاسم المستخدم: ${newUser.phone}\nكلمة المرور: ${newUser.password}\nنتمنى لك رحلة رياضية ممتعة!`;
      window.open(`https://wa.me/${formatPhoneForWhatsapp(newUser.phone)}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    // Close modal
    setIsAddUserModalOpen(false);
setNewUser({ 
  name: '', 
  phone: '', 
  role: UserRole.MEMBER, 
  trainerId: null, 
  password: '' 
});
    setSubscriptionDuration('1');
    setCustomEndDate('');

  } catch (err) {
    console.error(err);
    alert('❌ خطأ في الاتصال بالخادم.');
  }
};
const handleSendMessage = async () => {
  if (!chatInput.trim() || !auth.user || !activeChatUserId) return;

  const tempId = crypto.randomUUID();

  const newMessage: Message = {
    id: tempId,
    senderId: auth.user.id,
    receiverId: activeChatUserId,
    text: chatInput,
    timestamp: new Date()
  };

  setChatMessages(prev => [...prev, newMessage]);
  setChatInput('');

  try {
    const res = await fetch(`${API_BASE}/send_message.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        text: newMessage.text
      })
    });

    const result = await res.json();

    if (!result.success) {
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
      alert('فشل إرسال الرسالة.');
      return;
    }

    // ✅ استبدال الرسالة المؤقتة بالنهائية
    setChatMessages(prev =>
      prev.map(m =>
        m.id === tempId
          ? {
              ...m,
              id: result.id,
              timestamp: new Date(result.timestamp)
            }
          : m
      )
    );

  } catch (err) {
    setChatMessages(prev => prev.filter(m => m.id !== tempId));
    alert('خطأ في الاتصال.');
  }
};

const openChat = (targetUserId: string) => {
  if (!auth.user) return;
  setCurrentPage('dashboard');
  setActiveChatUserId(targetUserId);
  setIsChatOpen(true);
  loadMessages(auth.user.id, targetUserId);
};
  const getChatMessages = () => {
  if (!auth.user || !activeChatUserId) return [];

  return chatMessages
    .filter(m =>
      (m.senderId === auth.user.id && m.receiverId === activeChatUserId) ||
      (m.senderId === activeChatUserId && m.receiverId === auth.user.id)
    )
    .sort((a, b) =>
      new Date(a.timestamp ?? 0).getTime() -
      new Date(b.timestamp ?? 0).getTime()
    );

};


  const getTrainerName = (trainerId?: string) => {
    if (!trainerId) return '-';
    const trainer = users.find(u => u.id === trainerId);
    return trainer ? trainer.name : 'غير محدد';
  };

  const sendWhatsAppNotification = (user: User) => {
    if (!user.phone) return;
    const msg = `مرحباً ${user.name}، نود إعلامك بأن اشتراكك في رويال فتنس قد انتهى أو شارف على الانتهاء. يرجى تجديد الاشتراك للاستمرار في الاستفادة من خدماتنا والوصول إلى مرافق النادي. شكراً لك!`;
    const url = `https://wa.me/${formatPhoneForWhatsapp(user.phone)}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const isSubscriptionExpired = (dateString?: string) => {
    if (!dateString) return false;
    const expiry = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    expiry.setHours(0,0,0,0);
    return today > expiry;
  };

  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            u.phone.includes(searchQuery);
      const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
      let matchesStatus = true;
      if (scheduleStatusFilter !== 'all') {
        if (u.role === UserRole.MEMBER) {
          const actualStatus = getUserScheduleStatus(u);
          matchesStatus = actualStatus === scheduleStatusFilter;
        } else {
           matchesStatus = true;
        }
      }
      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const getFilteredMembersForTrainer = () => {
  if (!auth.user) return [];

  return users.filter(u =>
    u.role === UserRole.MEMBER &&
    String(u.trainerId) === String(auth.user.id) && // 🔐 مهم
    (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
    )
  );
};


  const renderStatusBadge = (user: User) => {
    const status = getUserScheduleStatus(user);
    switch (status) {
      case ScheduleStatus.PENDING:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-[10px] border border-yellow-900/50 font-bold whitespace-nowrap"><Clock3 size={10} /> قيد الانتظار</span>;
      case ScheduleStatus.IN_PROGRESS:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-[10px] border border-green-900/50 font-bold whitespace-nowrap"><Edit size={10} /> في تَقَدم</span>;
      case ScheduleStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-[10px] border border-blue-900/50 font-bold whitespace-nowrap"><CheckCircle size={10} /> مكتمل</span>;
      case ScheduleStatus.NEED_UPDATE:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-[10px] border border-red-900/50 font-bold whitespace-nowrap"><AlertTriangle size={10} /> يحتاج تحديث</span>;
      default: return null;
    }
  };
const renderTrainerDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1. القسم العلوي الجديد: معلومات المدرب بدلاً من "مرحبا" */}
      <div className="w-full bg-emerald-600 rounded-3xl p-6 mb-8 flex items-center gap-6 shadow-2xl relative overflow-hidden">
        {/* خلفية جمالية خفيفة */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-6 w-full">
          <img 
            src={auth.user?.avatar || 'https://via.placeholder.com/150'} 
            className="w-24 h-24 rounded-full border-4 border-white/20 shadow-xl object-cover" 
            alt="Trainer" 
          />
          <div className="flex-1">
            <h1 className="text-3xl font-black text-white mb-1">
              {auth.user?.name}
            </h1>
            <div className="flex items-center gap-3 text-white/80">
              <Phone size={18} />
              <span className="font-mono text-lg">{auth.user?.phone}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
              <p className="text-xs text-white/60 uppercase tracking-widest font-bold">رتبة الحساب</p>
              <p className="text-white font-bold italic">PRO TRAINER</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. قسم المشتركين: أصبح بعرض الشاشة الكامل */}
      <div className="w-full space-y-6">
      {/* 🔍 Search Bar */}
      <div className="flex justify-between items-center gap-4 px-2">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            type="text"
            placeholder="ابحث باسم المشترك أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-2xl pr-11 pl-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>

        <div className="text-sm text-zinc-400 font-bold">
          {getFilteredMembersForTrainer().length} مشترك
        </div>
      </div>

        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-emerald-500" size={28} />
            المشتركين عندي {/* تغيير المسمى من متدربين إلى مشتركين */}
          </h2>
          <div className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-sm font-bold border border-zinc-700">
            {getFilteredMembersForTrainer().length} مشترك نشط
          </div>
        </div>

        {/* المربع الكبير الذي يمتد على كامل عرض الشاشة */}
        <div className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-8 shadow-2xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredMembersForTrainer().length > 0 ? (
              getFilteredMembersForTrainer().map(user => (
                <div 
                  key={user.id}
                  className="bg-black/40 border border-zinc-800 rounded-3xl p-5 hover:border-emerald-500/50 hover:bg-zinc-800/50 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={user.avatar || 'https://via.placeholder.com/150'} 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-800 group-hover:border-emerald-500 transition-colors" 
                      alt={user.name} 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{user.name}</h3>
                      <p className="text-gray-500 text-xs font-mono">{user.phone}</p>
                      <div className="mt-2">
                        {renderStatusBadge(user)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openChat(user.id)}
                      className="flex-1 bg-emerald-600/10 text-emerald-500 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white transition-all font-bold text-sm"
                    >
                      <MessageSquare size={18} />
                      دردشة
                    </button>
                    <button 
                      onClick={() => openScheduleEditor(user.id)}
                      className="p-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-all"
                      title="تعديل البرنامج"
                    >
                      <Edit size={18} />
                    </button>
                      <button 
                        onClick={() => {
                        setEditingClientIdForNutrition(user.id);
                        setCurrentPage('trainer-nutrition');
                      }}
                      className="p-3 bg-amber-900/20 text-amber-500 hover:bg-amber-600 hover:text-white rounded-xl transition-colors"
                      title="تعيين خطة تغذية"
                    >
                      <Utensils size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Users size={48} className="mx-auto text-zinc-700 mb-4" />
                <p className="text-zinc-500 font-bold">لا يوجد مشتركين مسجلين حالياً بهذا الاسم</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
  const renderSquareStatus = (user: User) => {
const status = getUserScheduleStatus(user);
    const styles = {
      [ScheduleStatus.PENDING]: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-500',
      [ScheduleStatus.IN_PROGRESS]: 'bg-green-900/30 border-green-700/50 text-green-500',
      [ScheduleStatus.COMPLETED]: 'bg-blue-900/30 border-blue-700/50 text-blue-500',
      [ScheduleStatus.NEED_UPDATE]: 'bg-red-900/30 border-red-700/50 text-red-500'
    };
    const labels = {
      [ScheduleStatus.PENDING]: 'قيد الانتظار',
      [ScheduleStatus.IN_PROGRESS]: 'في تَقَدم',
      [ScheduleStatus.COMPLETED]: 'مكتمل',
      [ScheduleStatus.NEED_UPDATE]: 'تحديث'
    };
    const icons = {
      [ScheduleStatus.PENDING]: Clock3,
      [ScheduleStatus.IN_PROGRESS]: Edit,
      [ScheduleStatus.COMPLETED]: CheckCircle,
      [ScheduleStatus.NEED_UPDATE]: AlertTriangle
    };
    const Icon = icons[status];

    return (
      <div className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all shadow-inner ${styles[status]}`}>
        <Icon size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">{labels[status]}</span>
      </div>
    );
  };

  const renderScheduleEditorPage = () => {
     const client = users.find(u => u.id === editingClientId);
     if (!client) return null;

     return (
       <div className="container mx-auto px-4 py-8 min-h-screen">
         <div className="flex items-center justify-between mb-8">
           <div>
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
              >
                <ArrowRight size={18} />
                <span>إلغاء وعودة</span>
              </button>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit className="text-royal-500" />
                تعديل البرنامج التدريبي
              </h1>
              <p className="text-gray-400 mt-1">المشترك: <span className="text-white font-bold">{client.name}</span></p>
           </div>
           
           <button 
             onClick={handleSaveSchedule}
             className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20"
           >
             <Save size={20} />
             حفظ البرنامج
           </button>
         </div>

         <div className="grid lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-6">
             <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 h-full flex flex-col">
               <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                 <ListFilter size={20} className="text-royal-500" />
                 اختيار التمارين
               </h3>
               
               <div className="flex-1 flex flex-col gap-4">
                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {(Object.keys(workoutLibrary).length > 0
                    ? Object.keys(workoutLibrary)
                    : Object.keys(WORKOUT_DB)
                  ).map(muscle => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscle(muscle)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-bold transition-all ${
                        selectedMuscle === muscle
                          ? 'bg-royal-600 text-white'
                          : 'bg-black border border-zinc-700 text-gray-400 hover:bg-zinc-800'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>


                 {selectedMuscle && (
                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 border-t border-zinc-800 pt-4">
                      {(workoutLibrary[selectedMuscle] || []).map((ex, idx) => (
                       <div
                        key={idx}
                        onClick={() => toggleExerciseSelection(ex)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          flex items-center justify-between

                          ${
                            isExerciseAdded(ex)
                              ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                              : selectedExercises.includes(ex)
                                ? 'bg-royal-900/40 border-royal-500 text-white'
                                : 'bg-zinc-950 border-zinc-800 text-gray-400 hover:border-zinc-600'
                          }
                        `}
                      >
                        <span className="text-sm">{ex}</span>

                        {isExerciseAdded(ex) && (
                          <span className="text-emerald-400 font-bold text-xs">✓ مضاف</span>
                        )}
                      </div>

                     ))}
                   </div>
                 )}

                 <button 
                   onClick={handleAddExercisesToSchedule}
                   disabled={selectedExercises.length === 0}
                   className="mt-auto w-full bg-zinc-800 hover:bg-royal-600 disabled:opacity-50 disabled:hover:bg-zinc-800 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                 >
                   <Plus size={18} />
                   إضافة للمخطط ({selectedExercises.length})
                 </button>
               </div>
             </div>
           </div>

           <div className="lg:col-span-2">
             <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 h-full flex flex-col">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-white flex items-center gap-2">
                   <FileClock size={20} className="text-royal-500" />
                   مخطط الأسبوع
                 </h3>
                 <span className="text-xs text-gray-500">يمكنك تعديل النص يدوياً</span>
               </div>
               
               <textarea 
                 value={tempSchedule}
                 onChange={(e) => setTempSchedule(e.target.value)}
                 className="flex-1 w-full bg-black border border-zinc-700 rounded-xl p-4 text-white font-mono leading-relaxed focus:ring-2 focus:ring-royal-500 outline-none resize-none"
                 placeholder="قم باختيار التمارين من القائمة الجانبية أو اكتب هنا مباشرة..."
                 style={{ minHeight: '500px' }}
               />
             </div>
           </div>
         </div>
       </div>
     );
  };

  const renderMemberSchedulePage = () => {
    const rawSchedule =
      schedules[String(auth.user?.id)]?.text || '';
    const muscleGroupsInSchedule: Record<string, string[]> = {};
    const lines = rawSchedule.split('\n').filter(l => l.trim().length > 0) || [];

    lines.forEach(line => {
      let matched = false;

      // 1️⃣ أولوية: العضلة المكتوبة بين []
      const muscleMatch = line.match(/^\[(.+?)\]/);
      if (muscleMatch) {
        const muscle = muscleMatch[1];

        if (!muscleGroupsInSchedule[muscle]) {
          muscleGroupsInSchedule[muscle] = [];
        }

        muscleGroupsInSchedule[muscle].push(
          line.replace(/^\[.+?\]\s*/, '')
        );

        matched = true;
      }

      // 2️⃣ fallback قديم (للتمارين القديمة بدون [])
      if (!matched) {
        for (const [muscle, exercises] of Object.entries(WORKOUT_DB)) {
          if (exercises.some(ex => line.includes(ex))) {
            if (!muscleGroupsInSchedule[muscle]) {
              muscleGroupsInSchedule[muscle] = [];
            }
            muscleGroupsInSchedule[muscle].push(line);
            matched = true;
            break;
          }
        }
      }

      // 3️⃣ إذا ما انعرفت → توجيهات عامة
      if (!matched) {
        if (!muscleGroupsInSchedule['توجيهات عامة']) {
          muscleGroupsInSchedule['توجيهات عامة'] = [];
        }
        muscleGroupsInSchedule['توجيهات عامة'].push(line);
      }
    });


    const activeMuscles = Object.keys(muscleGroupsInSchedule).filter(k => k !== 'توجيهات عامة' && muscleGroupsInSchedule[k].length > 0);
    const hasGeneralInstructions = muscleGroupsInSchedule['توجيهات عامة']?.length > 0;

        return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors shadow-lg"
          >
            <ArrowRight size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">جدول التمارين</h1>
            <p className="text-gray-400 mt-1">اضغط على العضلة لعرض التمارين المخصصة لك</p>
          </div>
        </div>

        {/* Workout Cards */}
        {lines.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeMuscles.map((muscle) => (
              <div
                key={muscle}
                onClick={() => setSelectedMemberMuscle(muscle)}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:border-royal-500 hover:scale-[1.02] transition-all group relative"
              >
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all z-10"></div>
                  <img
                    src={MUSCLE_IMAGES[muscle] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop'}
                    alt={muscle}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 right-4 z-20">
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{muscle}</h3>
                    <p className="text-xs text-royal-400 font-bold">
                      {muscleGroupsInSchedule[muscle].length} تمارين
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {hasGeneralInstructions && (
              <div
                onClick={() => setSelectedMemberMuscle('توجيهات عامة')}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden cursor-pointer hover:border-royal-500 hover:scale-[1.02] transition-all p-6 flex flex-col items-center justify-center text-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-royal-600 transition-colors">
                  <FileClock size={32} className="text-gray-400 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">توجيهات عامة</h3>
                  <p className="text-gray-400 text-sm mt-1">ملاحظات وإرشادات إضافية</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <Calendar size={64} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">لا يوجد جدول حالياً</h3>
            <p className="text-gray-400">بانتظار المدرب لتحديث خطتك التدريبية</p>
          </div>
        )}

        {/* Modal for selected muscle */}
        {selectedMemberMuscle && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
              <div className="relative h-32 bg-royal-900">
                {MUSCLE_IMAGES[selectedMemberMuscle] && (
                  <img
                    src={MUSCLE_IMAGES[selectedMemberMuscle]}
                    className="w-full h-full object-cover opacity-50"
                    alt={selectedMemberMuscle}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                <div className="absolute bottom-4 right-6">
                  <h3 className="text-2xl font-bold text-white">{selectedMemberMuscle}</h3>
                </div>
                <button
                  onClick={() => setSelectedMemberMuscle(null)}
                  className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {muscleGroupsInSchedule[selectedMemberMuscle]?.map((line, idx) => (
                    <div key={idx} className="bg-black border border-zinc-800 p-4 rounded-xl flex items-start gap-3">
                      <CheckCircle className="text-royal-500 mt-1 flex-shrink-0" size={18} />
                      <p className="text-gray-200 font-medium leading-relaxed">{line}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-center">
                <button
                  onClick={() => setSelectedMemberMuscle(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
    const renderMemberNutritionPage = () => {
      
const template = getSafeTemplate(
  nutritionPlans[String(auth.user?.id)]
);

if (!template) {
  return (
    <div className="text-center text-gray-400 py-20">
      ⏳ جاري تحميل خطة التغذية...
    </div>
  );
}

  const meals = template.meals;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white transition-colors shadow-lg"
        >
          <ArrowRight size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">جدول التغذية</h1>
          <p className="text-gray-400 mt-1">خطة: {template.name}</p>
        </div>
      </div>
      {/* Nutrition Template Switcher */}
      <div className="flex bg-zinc-900/50 p-2 rounded-2xl gap-2 overflow-x-auto border border-zinc-800 mb-8 no-scrollbar">
        {nutritionTemplates
.map(t => (
          <button
            key={t.id}
            onClick={() =>
              setNutritionPlans(prev => ({
                ...prev,
                [String(auth.user?.id)]: t.id
              }))
            }
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
              (nutritionPlans[String(auth.user?.id)] || nutritionTemplates
[0].id) === t.id
                ? 'bg-royal-600 text-white'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Meals Grid */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
        {meals.map(meal => (
          <NutritionCard key={meal.id} meal={meal} onClick={() => setSelectedMeal(meal)} />
        ))}
      </div>
    </div>
  );
};
const renderTrainerNutritionPage = () => {
  const client = users.find(u => u.id === editingClientIdForNutrition);
  if (!client) return null;

  const handleAssignNutrition = () => {
    setNutritionPlans(prev => ({ ...prev, [editingClientIdForNutrition!]: previewTemplateId }));
    alert('✅ تم تعيين خطة التغذية بنجاح');
    setCurrentPage('dashboard');
  };

  const currentTemplate = getSafeTemplate(previewTemplateId);

    if (!currentTemplate) {
      return (
        <div className="text-center text-gray-400 py-20">
          ⏳ جاري تحميل نماذج التغذية...
        </div>
      );
    }


  const previewMeals = currentTemplate?.meals ?? [];


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-2"
          >
            <ArrowRight size={18} /> العودة
          </button>
          <h1 className="text-2xl font-bold text-white">تعيين خطة تغذية</h1>
          <p className="text-gray-400">للمشترك: <span className="text-white font-bold">{client.name}</span></p>
        </div>
      </div>

      {/* Template Library */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {nutritionTemplates
.map(temp => (
          <button
            key={temp.id}
            onClick={() => setPreviewTemplateId(temp.id)}
            className={`p-6 rounded-2xl border text-right h-full flex flex-col ${
              previewTemplateId === temp.id 
                ? 'border-royal-500 bg-royal-900/20' 
                : 'border-zinc-800 bg-zinc-900'
            }`}
          >
            {nutritionPlans[editingClientIdForNutrition!] === temp.id && (
              <span className="text-xs bg-royal-600 text-white px-2 py-1 rounded-full mb-2 w-fit">مفعل</span>
            )}
            <h3 className="font-bold text-white mb-2">{temp.name}</h3>
            <p className="text-gray-400 text-sm flex-grow">{temp.description}</p>
          </button>
        ))}
      </div>

      {/* Preview */}
          <div className="mb-8">
            <h3 className="font-bold text-white mb-4">معاينة: اليوم الأول</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {previewMeals.map(meal => (
                <NutritionCard key={meal.id} meal={meal} />
              ))}
            </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-6 py-3 bg-zinc-800 text-white rounded-lg"
        >
          إلغاء
        </button>
        <button
          onClick={handleAssignNutrition}
          className="px-6 py-3 bg-royal-600 hover:bg-royal-500 text-white rounded-lg font-bold"
        >
          تعيين الخطة
        </button>
      </div>
    </div>
  );
};
  const HomePage = () => (
    <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
          alt="Gym Hero" 
          className="w-full h-full object-cover grayscale opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
      </div>

      <div className="relative z-10 text-center container px-4 animate-in fade-in zoom-in duration-1000">
        <div className="mb-12 flex flex-col items-center justify-center gap-4">
           <div className="bg-royal-600 p-4 rounded-3xl shadow-2xl shadow-royal-900/50 group hover:rotate-3 transition-transform duration-500">
             <RoyalLogo className="text-white w-24 h-24 md:w-32 md:h-32" color="white" />
           </div>
        </div>

        <h1 className="text-7xl md:text-9xl font-black mb-16 text-white tracking-tighter drop-shadow-2xl">ROYAL <span className="text-royal-500">FITNESS</span></h1>
        
        <div className="flex flex-wrap justify-center">
          <button 
            onClick={() => setCurrentPage('login')}
            className="group relative bg-royal-600 hover:bg-royal-500 text-white px-12 py-5 rounded-full text-xl font-black transition-all transform hover:scale-110 shadow-2xl shadow-royal-900/60 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-3">
             تسجيل الدخول
              <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center z-10">
         <p className="text-[10px] text-zinc-600 uppercase tracking-[0.5em] font-bold">Premium Club Experience | 062229948</p>
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-black p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
         <img 
           src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" 
           className="w-full h-full object-cover opacity-20 blur-sm grayscale"
           alt="background"
         />
      </div>

      <div className="bg-zinc-900 w-full max-w-md p-10 rounded-3xl shadow-2xl border border-zinc-800 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-10">
          <div className="inline-block p-4 rounded-3xl bg-royal-900/20 mb-4 border border-royal-500/20">
             <Lock className="w-10 h-10 text-royal-500" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h2>
          <p className="text-gray-500 text-sm">أهلاً بك في ركن الأبطال</p>
        </div>

        

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 pr-1 uppercase tracking-widest">
              رقم الهاتف المسجل
            </label>
            <div className="relative">
               <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
               <input
                type="text"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white rounded-2xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all font-mono text-lg"
                placeholder="07XXXXXXXX"
                dir="ltr"
              />
            </div>
            <label className="block text-xs font-bold text-gray-500 pr-1 uppercase tracking-widest">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-black border border-zinc-700 text-white rounded-2xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:border-transparent transition-all font-mono text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          {loginError && (
            <div className="bg-red-900/20 border border-red-900/30 text-red-400 text-sm p-4 rounded-2xl flex items-center gap-3 animate-pulse">
              <AlertCircle size={20} />
              <span className="font-bold">{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-royal-600 hover:bg-royal-500 text-white font-black py-4.5 rounded-2xl transition-all transform hover:scale-[1.02] shadow-xl shadow-royal-900/30 flex items-center justify-center gap-3"
          >
            <span className="text-lg"> تسجيل دخول</span>
            <ArrowLeft size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  const renderAdminUsersPage = () => (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <button 
             onClick={() => setCurrentPage('dashboard')}
             className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
           >
             <ArrowRight size={18} />
             <span>عودة للوحة التحكم</span>
           </button>
           <h1 className="text-2xl font-bold text-white">إدارة المستخدمين</h1>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950/50">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="بحث بالاسم أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-lg pr-10 pl-4 py-2.5 text-white focus:ring-1 focus:ring-royal-500 outline-none"
            />
          </div>
          <div className="relative">
             <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <select 
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value as any)}
               className="w-full bg-black border border-zinc-700 rounded-lg pr-10 pl-4 py-2.5 text-white focus:ring-1 focus:ring-royal-500 outline-none appearance-none"
             >
               <option value="all">جميع الأدوار</option>
               <option value={UserRole.MEMBER}>مشتركين</option>
               <option value={UserRole.TRAINER}>مدربين</option>
               <option value={UserRole.ADMIN}>إداريين</option>
             </select>
             <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
          <div className="relative">
             <Activity className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
             <select 
               value={scheduleStatusFilter}
               onChange={(e) => setScheduleStatusFilter(e.target.value as any)}
               className="w-full bg-black border border-zinc-700 rounded-lg pr-10 pl-4 py-2.5 text-white focus:ring-1 focus:ring-royal-500 outline-none appearance-none"
               disabled={roleFilter === UserRole.TRAINER || roleFilter === UserRole.ADMIN}
             >
               <option value="all">حالة الجدول</option>
               <option value={ScheduleStatus.PENDING}>قيد الانتظار</option>
               <option value={ScheduleStatus.IN_PROGRESS}>في تَقَدم</option>
               <option value={ScheduleStatus.COMPLETED}>مكتمل</option>
               <option value={ScheduleStatus.NEED_UPDATE}>يحتاج تحديث</option>
             </select>
             <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-zinc-950 text-gray-400 font-medium">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4 text-center">حالة الاشتراك</th>
                <th className="p-4 text-center">حالة الجدول</th>
                <th className="p-4 text-center">المدرب</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {getFilteredUsers().map(user => {
                 const isExpired = user.role === UserRole.MEMBER && isSubscriptionExpired(user.subscriptionEndDate);
const trainerObj =
  user.role === UserRole.MEMBER
    ? users.find(u => String(u.id) === String(user.trainerId))
    : null;
                 
                 return (
                  <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-zinc-700" />
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            user.role === UserRole.ADMIN ? 'bg-red-900/30 text-red-400' :
                            user.role === UserRole.TRAINER ? 'bg-blue-900/30 text-blue-400' :
                            user.role === UserRole.RECEPTION ? 'bg-purple-900/30 text-purple-400' :
                            'bg-zinc-800 text-gray-300'
                          }`}>
                            {user.role === UserRole.ADMIN ? 'مدير' :
                            user.role === UserRole.TRAINER ? 'مدرب' :
                            user.role === UserRole.RECEPTION ? 'استقبال' :
                            'مشترك'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 dir-ltr font-mono">{user.phone}</td>
                    <td className="p-4 text-center">
                      {user.role === UserRole.MEMBER ? (
                         <div className="flex flex-col items-center gap-1">
                             {isExpired ? (
                               <span className="text-red-500 flex items-center gap-1 text-[10px] font-bold bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">
                                 <AlertCircle size={10} /> منتهي
                               </span>
                             ) : (
                               <span className="text-green-500 flex items-center gap-1 text-[10px] font-bold bg-green-950/30 px-2 py-0.5 rounded border border-red-900/50">
                                 <CheckCircle size={10} /> نشط
                               </span>
                             )}
                             <span className="text-[10px] text-gray-500 font-mono">
                               {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : '-'}
                             </span>
                         </div>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-center">
                       {user.role === UserRole.MEMBER ? renderStatusBadge(user) : '-'}
                    </td>
                    <td className="p-4 text-center">
                       {user.role === UserRole.MEMBER ? (
                         <div className="flex items-center justify-center gap-2">
                           <span className="text-xs text-gray-300">{trainerObj?.name || '-'}</span>
                           {user.trainerId && (
                             <button 
                               onClick={() => openChat(user.trainerId!)}
                               className="p-1.5 bg-royal-600/20 hover:bg-royal-600 text-royal-500 hover:text-white rounded transition-colors"
                               title="مراسلة مدرب المشترك"
                             >
                               <MessageSquare size={12} />
                             </button>
                           )}
                         </div>
                       ) : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {user.role === UserRole.TRAINER && (
                           <button 
                             onClick={() => openChat(user.id)}
                             className="p-2 bg-royal-600/20 hover:bg-royal-600 text-royal-500 hover:text-white rounded-lg transition-colors"
                             title="تواصل مع المدرب"
                           >
                             <MessageSquare size={16} />
                           </button>
                         )}
                         {user.role === UserRole.MEMBER && isExpired && (
                           <button 
                             onClick={() => sendWhatsAppNotification(user)}
                             className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                             title="إرسال تذكير تجديد"
                           >
                             <Share2 size={16} />
                           </button>
                         )}
                        <button
                          onClick={() => {
                            setCurrentPage('dashboard'); 
                            setEditUser(user);
                            setIsEditUserModalOpen(true);
                          }}
                          className="p-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>


                         <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 bg-zinc-800 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>
                  </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!auth.user) return null;

    return (
      <div className="container mx-auto px-4 py-8">
        {auth.user.role === UserRole.TRAINER && (
        <div className="w-full">
          {renderTrainerDashboard()}
        </div>
      )}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <div className="bg-zinc-900 rounded-xl shadow-sm border border-zinc-800 p-6 text-center sticky top-24 relative group">
              <button 
                onClick={handleOpenProfileModal}
                className="absolute top-4 left-4 p-2 bg-zinc-800 rounded-full text-gray-400 hover:text-white hover:bg-royal-600 transition-all border border-zinc-700 hover:border-royal-500"
                title="تعديل الملف الشخصي"
              >
                <Settings size={18} />
              </button>

              <div className="relative inline-block">
                <img 
                  src={auth.user.avatar} 
                  alt={auth.user.name} 
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-royal-600 object-cover"
                />
              </div>
              
              <h2 className="text-xl font-bold text-white">{auth.user.name}</h2>
              <span className="block text-gray-400 text-sm mt-1 dir-ltr">{auth.user.phone}</span>
              <span className="inline-block mt-2 px-3 py-1 bg-royal-900/50 text-royal-400 text-xs font-bold rounded-full uppercase border border-royal-900">
                {auth.user.role === 'admin' ? 'مدير النظام' : auth.user.role === 'trainer' ? 'مدرب معتمد' : 'مشترك'}
              </span>
              
              {auth.user.role === UserRole.MEMBER && auth.user.subscriptionEndDate && (
                <div className="mt-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                   <p className="text-xs text-gray-400 mb-1">تاريخ انتهاء الاشتراك</p>
                   <p className="text-sm font-bold text-white font-mono dir-ltr">
                     {new Date(auth.user.subscriptionEndDate).toLocaleDateString()}
                   </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-zinc-800 text-right space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>رقم العضوية</span>
                  <span className="font-mono font-bold text-white">#ROY-{String(auth.user.id).padStart(4, '0')}</span>
                </div>
              </div>
            </div>
            
            {auth.user.role === UserRole.MEMBER && (
              <div className="mt-4">
                 <button
                   onClick={() => {
                     const targetTrainerId = auth.user?.trainerId || users.find(u => u.role === UserRole.TRAINER)?.id;
                     if (targetTrainerId) openChat(targetTrainerId);
                   }}
                   className="w-full bg-royal-600 hover:bg-royal-500 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-transform hover:scale-105"
                 >
                   <MessageSquare size={20} />
                   محادثة المدرب
                 </button>
              </div>
            )}

            {/* Added for Trainer: Chat with Admin button in dashboard sidebar */}
            {auth.user.role === UserRole.TRAINER && (
              <div className="mt-4">
                 <button
                   onClick={() => {
                     const admin = users.find(u => u.role === UserRole.ADMIN);
                     if (admin) openChat(admin.id);
                   }}
                   className="w-full bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-transform hover:scale-105 border border-zinc-800"
                 >
                   <Lock size={20} className="text-royal-500" />
                   تواصل مع الإدارة
                 </button>
              </div>
            )}
          </div>

          <div className="w-full md:w-3/4 space-y-6">
            <div className="bg-royal-600 rounded-xl p-8 text-white relative overflow-hidden shadow-lg shadow-royal-900/20">
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-2">مرحباً، {auth.user.name} 👋</h1>
                <p className="text-royal-100">أتمنى لك يوماً مليئاً بالنشاط والطاقة!</p>
              </div>
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-royal-400 w-32 h-32 opacity-20" />
            </div>

            {(auth.user.role === UserRole.ADMIN || auth.user.role === UserRole.RECEPTION) && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: 'إجمالي الأعضاء', val: users.filter(u => u.role === UserRole.MEMBER).length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-900/20', border: 'border-blue-900/30' },
                    { label: 'المدربين', val: users.filter(u => u.role === UserRole.TRAINER).length, icon: Star, color: 'text-orange-400', bg: 'bg-orange-900/20', border: 'border-orange-900/30' },
                  ].map((stat, i) => (
                    <div key={i} className={`bg-zinc-900 p-6 rounded-xl shadow-sm border ${stat.border || 'border-zinc-800'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                          <h3 className="text-2xl font-bold text-white">{stat.val}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                          <stat.icon size={20} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                  <div className="p-6 border-b border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white">إدارة المستخدمين</h3>
                      <button 
                        onClick={() => setCurrentPage('admin-users')}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-colors border border-zinc-700"
                        title="عرض بملء الشاشة"
                      >
                         <Maximize2 size={16} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="bg-royal-600 hover:bg-royal-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors"
                    >
                        <UserPlus size={14} />
                        إضافة مستخدم
                    </button>
                  </div>
                  <div className="p-4 bg-zinc-950/50">
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">
                        * يمكنك كآدمن مراسلة المدربين فقط. لمتابعة مشترك، يمكنك مراسلة مدربه الخاص من قائمة المستخدمين.
                      </p>
                      <button 
                        onClick={() => setCurrentPage('admin-users')}
                        className="w-full py-2 bg-zinc-900 border border-zinc-800 text-royal-500 text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        عرض الكل وإدارة التفاصيل والرسائل...
                      </button>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('admin-nutrition-templates')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg transition-all"
                >
                  🥗 إدارة نماذج التغذية
                </button>
                <button
                  onClick={() => setCurrentPage('admin-exercises')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all"
                >
                  💪 إدارة مكتبة التمارين
                </button>

                
                <button
                  onClick={() => setCurrentPage('admin-challenges')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl font-bold"
                >
                  🏆 إدارة التحديات
                </button>
                
                <button
                  onClick={() => setCurrentPage('admin-analytics')}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all"
                >
                  📊 لوحة التحليلات الذكية
                </button>
              </div>
            )}


           {auth.user.role === UserRole.MEMBER && (
  <div className="space-y-6">
    {/* 👉 Main Content Grid: Schedule + Activity | AI Coach */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Workout Schedule Card */}
        <div 
          onClick={() => setCurrentPage('member-schedule')}
          className="bg-gradient-to-br from-royal-900 to-black border border-royal-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden cursor-pointer hover:shadow-royal-900/40 hover:scale-[1.01] transition-all group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Dumbbell size={100} />
          </div>
          <h3 className="font-bold text-lg mb-4 text-royal-500 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            جدول التمارين اليومي
          </h3>
          {schedules[String(auth.user.id)] ? (
            <div className="space-y-3 relative z-10">
              {schedules[String(auth.user.id)]
                ?.text.split('\n')
                .slice(0, 3)
                .map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-black/40 p-3 rounded-lg border border-white/5">
                    <CheckCircle size={18} className="text-royal-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-200 line-clamp-1">{line}</span>
                  </div>
                ))}
              {schedules[String(auth.user.id)]?.text.split('\n').length > 3 && (
                <p className="text-xs text-center text-royal-400 font-bold mt-2">
                  + {schedules[String(auth.user.id)]?.text.split('\n').length - 3} تمارين إضافية... اضغط للعرض
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 bg-black/20 rounded-lg border border-dashed border-zinc-700">
              <p>لم يقم المدرب بتحديد جدول لك بعد.</p>
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-400 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>المدرب: {getTrainerName(auth.user.trainerId)}</span>
              {auth.user.trainerId && (
                <button 
                  onClick={(e) => { e.stopPropagation(); openChat(auth.user!.trainerId!); }}
                  className="p-1.5 bg-royal-600/20 text-royal-500 rounded hover:bg-royal-600 hover:text-white transition-colors"
                  title="تحدث مع مدربك"
                >
                  <MessageSquare size={12} />
                </button>
              )}
            </div>
            <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px]">عرض الجدول الكامل</span>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        {/* ✅ جدول التغذية — نفس نمط الصورة المُرفقة */}
        <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-xl overflow-hidden">
          <div className="p-4 bg-emerald-900/20 border-b border-emerald-900/40 flex items-center justify-between">
            <h3 className="text-xl font-bold text-emerald-300 flex items-center gap-2">
              <Utensils size={20} />
              جدول التغذية اليومي
            </h3>
            <span className="bg-black/50 border border-emerald-900/30 text-emerald-300 text-sm px-3 py-1.5 rounded font-bold">
              {(() => {
                const template = getSafeTemplate(
                  nutritionPlans[String(auth.user?.id)]
                );
                return template ? template.name : 'جاري التحميل...';
              })()}
            </span>


          </div>

          <div className="p-4 space-y-3">
            {(() => {
              const template = getSafeTemplate(
              nutritionPlans[String(auth.user?.id)]
              );

              if (!template) {
                return (
                  <div className="text-center text-gray-400 py-20">
                    ⏳ جاري تحميل خطة التغذية...
                  </div>
                );
              }


              return template.meals.slice(0, 3).map(meal => (
                <div
                  key={meal.id}
                  className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-emerald-900/20"
                >
                  <CheckCircle className="text-emerald-500 mt-0.5" size={18} />
                  <div>
                    <p className="font-bold text-white">{meal.name}</p>
                    <p className="text-xs text-gray-400">{meal.calories} سعرة حرارية</p>
                  </div>
                </div>
              ));
            })()}

          </div>

              <div className="p-3 bg-black/30 border-t border-emerald-900/20 text-right text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>- المدرب: {getTrainerName(auth.user?.trainerId)}</span>
                  <button
                    onClick={() => setCurrentPage('member-nutrition')}
                    className="text-emerald-500 hover:text-emerald-300 underline"
                  >
                    عرض الجدول الكامل
                  </button>
                </div>
              </div>
            </div>
              </div>

              {/* AI Coach */}
            <AICoach />
            <button
              onClick={() => setCurrentPage('challenges')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg transition-all"
            >
              🏆 التحديات والإنجازات
            </button>

            </div>

            {/* 👇 PERFECT SPOT: Nutrition Button (Full Width Below Everything) */}
            <button
              onClick={() => setCurrentPage('weekly-integrated')}
              className="w-full bg-gradient-to-r from-royal-600 to-emerald-600 hover:from-royal-500 hover:to-emerald-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg transition-all"
            >
              <Calendar size={20} />
              الأسبوع المتكامل (تمارين + تغذية)
            </button>
          </div>
        )}
          </div>
        </div>

        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-zinc-900 w-full max-w-md p-8 rounded-2xl border border-zinc-800 shadow-2xl animate-in zoom-in duration-200">
                <h3 className="text-xl font-bold text-white mb-6">تعديل الملف الشخصي</h3>
                <div className="space-y-4">
                   <div className="flex flex-col items-center mb-4">
                     <img src={profileForm.avatar} className="w-20 h-20 rounded-full border-2 border-royal-600 mb-2 object-cover" />
                   </div>
                   <input 
                     type="password" 
                     placeholder="كلمة المرور الجديدة"
                     className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white outline-none focus:ring-1 focus:ring-royal-500"
                     value={profileForm.password}
                     onChange={e => setProfileForm({...profileForm, password: e.target.value})}
                   />
                </div>
                <div className="flex gap-2 mt-8">
                   <button onClick={handleSaveProfile} className="flex-1 bg-royal-600 text-white py-3 rounded-lg font-bold">حفظ التغييرات</button>
                   <button onClick={() => setIsProfileModalOpen(false)} className="px-6 bg-zinc-800 text-gray-400 py-3 rounded-lg">إلغاء</button>
                </div>
             </div>
          </div>
        )}

        {isAddUserModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-zinc-900 w-full max-w-lg p-8 rounded-2xl border border-zinc-800 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-bold text-white mb-6">إضافة مستخدم جديد</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                   <div className="grid md:grid-cols-2 gap-4">
                     <input required placeholder="الاسم الكامل" className="bg-black border border-zinc-700 p-3 rounded-lg text-white" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                     <input required placeholder="رقم الهاتف" className="bg-black border border-zinc-700 p-3 rounded-lg text-white dir-ltr text-right" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
                   </div>
                   <select className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                     <option value={UserRole.MEMBER}>مشترك</option>
                     <option value={UserRole.TRAINER}>مدرب</option>
                     <option value={UserRole.ADMIN}>مدير</option>
                     <option value={UserRole.RECEPTION}>استقبال</option>
                   </select>
                   {newUser.role === UserRole.MEMBER && (
                     <div className="space-y-4 pt-2">
                        <select className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" value={newUser.trainerId} onChange={e =>
                          setNewUser({
                            ...newUser,
                            trainerId: e.target.value ? Number(e.target.value) : null
                          })
                        }
                        >
                          <option value="">اختيار المدرب</option>
                          {users.filter(u => u.role === UserRole.TRAINER).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" value={subscriptionDuration} onChange={e => setSubscriptionDuration(e.target.value)}>
                          <option value="1">اشتراك شهر واحد</option>
                          <option value="2">اشتراك شهرين</option>
                          <option value="3">اشتراك 3 شهور</option>
                          <option value="5">اشتراك 5 شهور</option>
                          <option value="6">اشتراك 6 شهور</option>
                          <option value="12">اشتراك سنة</option>
                          <option value="custom">تاريخ مخصص</option>
                        </select>
                        {/* ✅ Custom date picker — only show if "custom" is selected */}
                        {subscriptionDuration === 'custom' && (
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-gray-500 pr-1">
                              اختر تاريخ الانتهاء
                            </label>
                            <input
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white focus:ring-1 focus:ring-royal-500 outline-none"
                              min={new Date().toISOString().split('T')[0]} // Prevent past dates
                            />
                          </div>
                        )}
                      </div>
                    )}
                   <input required type="password" placeholder="تعيين كلمة مرور أولية" className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                   <div className="flex gap-2 pt-6">
                     <button type="submit" className="flex-1 bg-royal-600 text-white py-4 rounded-xl font-bold">تأكيد الإضافة</button>
                     <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-8 bg-zinc-800 text-gray-400 py-4 rounded-xl">إلغاء</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        {isChatOpen && activeChatUserId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-zinc-900 w-full max-w-lg h-[600px] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col animate-in zoom-in duration-200">
               <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950 rounded-t-2xl">
                 <div className="flex items-center gap-3">
                   <img 
                     src={users.find(u => u.id === activeChatUserId)?.avatar} 
                     className="w-10 h-10 rounded-full border-2 border-royal-600 object-cover" 
                   />
                   <div>
                     <p className="font-bold text-white text-sm">{users.find(u => u.id === activeChatUserId)?.name}</p>
                     <p className="text-xs text-royal-500 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-royal-500 animate-pulse"></span>
                       متصل الآن
                     </p>
                   </div>
                 </div>
                 <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-zinc-800 rounded-full text-gray-400 hover:text-white transition-colors">
                   <X size={20} />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50 custom-scrollbar">
             {chatMessages.length > 0 ? (
                  chatMessages.map(msg => {
                    const isMe = msg.senderId === auth.user?.id;
                    return (
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? 'bg-royal-600 text-white rounded-bl-none'
                              : 'bg-zinc-800 text-gray-200 rounded-br-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p
                            className={`text-[10px] mt-1 text-right ${
                              isMe ? 'text-royal-200' : 'text-gray-500'
                            }`}
                          >
                            {msg.timestamp instanceof Date
                              ? msg.timestamp.toLocaleTimeString()
                              : ''}
                          </p>
                        </div>
                      </div>
                    );

                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                    <MessageSquare size={40} className="opacity-20" />
                    <p>لا توجد رسائل سابقة. ابدأ المحادثة الآن!</p>
                  </div>
                )}
                 <div ref={chatEndRef}></div>
               </div>

               <div className="p-4 border-t border-zinc-800 bg-zinc-900 rounded-b-2xl">
                 <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                   <input
                     type="text"
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     placeholder="اكتب رسالتك هنا..."
                     className="flex-1 bg-zinc-950 border border-zinc-700 text-white rounded-full px-4 py-3 focus:ring-2 focus:ring-royal-500 outline-none text-sm"
                   />
                   <button type="submit" disabled={!chatInput.trim()} className="bg-royal-600 hover:bg-royal-500 disabled:bg-zinc-800 disabled:text-gray-600 text-white p-3 rounded-full transition-colors">
                     <Send size={18} />
                   </button>
                 </form>
               </div>
             </div>
          </div>
        )}
        {isEditUserModalOpen && editUser && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-zinc-900 w-full max-w-lg p-6 rounded-2xl border border-zinc-800 shadow-2xl">
      
      <h3 className="text-xl font-bold text-white mb-6">
        تعديل المستخدم
      </h3>

      <div className="space-y-4">
        <input
          className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
          placeholder="الاسم"
          value={editUser.name}
          onChange={e => setEditUser({ ...editUser, name: e.target.value })}
        />

        <input
          className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
          placeholder="رقم الهاتف"
          value={editUser.phone}
          onChange={e => setEditUser({ ...editUser, phone: e.target.value })}
        />

        <select
          className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
          value={editUser.role}
          onChange={e => setEditUser({ ...editUser, role: e.target.value })}
        >
          <option value="member">مشترك</option>
          <option value="trainer">مدرب</option>
          <option value="admin">مدير</option>
        </select>

        {editUser.role === 'member' && (
          <>
            <select
              className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
              value={editUser.trainerId || ''}
              onChange={e =>
                setEditUser({ ...editUser, trainerId: e.target.value })
              }
            >
              <option value="">بدون مدرب</option>
              {users.filter(u => u.role === 'trainer').map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
              value={
                editUser.subscriptionEndDate
                  ? editUser.subscriptionEndDate.split(' ')[0]
                  : ''
              }
              onChange={e =>
                setEditUser({
                  ...editUser,
                  subscriptionEndDate: e.target.value
                })
              }

            />
          </>
        )}
      </div>
{auth.user?.role === UserRole.ADMIN && (
  <div className="mt-4">
    <label className="block text-xs text-gray-400 mb-1">
      كلمة مرور جديدة (اختياري)
    </label>
    <input
      type="password"
      placeholder="اتركه فارغاً إذا لا تريد التغيير"
      className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white"
      value={adminNewPassword}
      onChange={e => setAdminNewPassword(e.target.value)}
    />
  </div>
)}

      <div className="flex gap-2 mt-8">
              <button
        onClick={handleSaveEditUser}
        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold"
      >
        حفظ التغييرات
      </button>

        <button
          onClick={() => setIsEditUserModalOpen(false)}
          className="px-6 bg-zinc-800 text-gray-400 py-3 rounded-lg"
        >
          إلغاء
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    );
  };

  return (
    <Layout 
      auth={auth} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
    {currentPage === 'home' && <HomePage />}
    {currentPage === 'login' && renderLoginPage()}
    {currentPage === 'dashboard' && renderDashboard()}
    {currentPage === 'admin-users' && renderAdminUsersPage()}
    {currentPage === 'trainer-schedule' && renderScheduleEditorPage()}
    {currentPage === 'member-schedule' && renderMemberSchedulePage()}
    {currentPage === 'member-nutrition' && auth.user && (
      <MemberNutritionPage
        auth={auth}
        nutritionPlans={nutritionPlans}
        setNutritionPlans={setNutritionPlans}
      />
    )}
    {currentPage === 'trainer-nutrition' && renderTrainerNutritionPage()}
    {currentPage === 'weekly-integrated' && renderWeeklyIntegratedView()}
    {currentPage === 'challenges' && auth.user && (<ChallengesModule currentUser={auth.user} />)}
    {currentPage === 'admin-challenges' && auth.user?.role === UserRole.ADMIN && (<ChallengesModule currentUser={auth.user} />)}
    {currentPage === 'admin-nutrition-templates' && auth.user?.role === UserRole.ADMIN && (
      <AdminNutritionTemplates
        templates={nutritionTemplates}
        setTemplates={setNutritionTemplates}
        onDeleteTemplate={handleDeleteNutritionTemplate}

      />
    )}
    {currentPage === 'admin-analytics' && auth.user?.role === UserRole.ADMIN && (
      <AnalyticsDashboard />
    )}
  {currentPage === 'admin-exercises' && auth.user?.role === UserRole.ADMIN && (
    <AdminExercisesManager />
  )}

  </Layout>
  );
}
