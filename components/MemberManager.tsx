import React, { useState, useEffect } from "react";
import { AuthState } from "../types";

const API_BASE = "https://royalfitness.fit/royal_api/";

const MemberManager: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  const [members, setMembers] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    coachId: "",
    password: ""
  });

  // ✅ تحميل بيانات المستخدم الحالي من localStorage
  useEffect(() => {
    const stored = localStorage.getItem("royal_auth");
    if (stored) {
      setAuth({
        isAuthenticated: true,
        user: JSON.parse(stored)
      });
    }

    fetchUsers();
  }, []);

  // =============================
  // تحميل المستخدمين
  // =============================
  const fetchUsers = async () => {
    try {
      const res = await fetch(API_BASE + "get_users.php");
      const data = await res.json();

      const membersOnly = data.filter((u: any) => u.role === "member");
      const trainersOnly = data.filter((u: any) => u.role === "trainer");

      setMembers(membersOnly);
      setCoaches(trainersOnly);
    } catch (err) {
      console.error("Failed loading users", err);
    }
  };

  // =============================
  // إضافة عضو جديد
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.user) {
      alert("لا يوجد مستخدم مسجل دخول");
      return;
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    try {
      const response = await fetch(API_BASE + "save_user.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          role: "member",
          password: formData.password,
          trainerId: formData.coachId,
          subscriptionEndDate: expiryDate.toISOString(),
          creatorRole: auth.user.role // ✅ الآن معرف صح
        })
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ تم إضافة المشترك بنجاح");
        fetchUsers();
      } else {
        alert(result.error || "حدث خطأ");
      }

      setFormData({
        name: "",
        phone: "",
        coachId: "",
        password: ""
      });

    } catch (err) {
      console.error(err);
      alert("فشل الاتصال بالسيرفر");
    }
  };

  // =============================
  // حذف مستخدم
  // =============================
  const deleteUser = async (userId: number) => {
    if (!auth.user) return;

    if (!window.confirm("هل أنت متأكد من حذف المستخدم؟")) return;

    try {
      await fetch(API_BASE + "delete_user.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminId: auth.user.id, // ✅ مش رقم ثابت
          userId: userId
        })
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-24 pb-12 px-6 bg-[#0a0a0a] gap-12">

      {/* نموذج الإضافة */}
      <div className="w-full max-w-[500px] bg-[#121214] rounded-[28px] p-10 border border-[#1e1e1e] shadow-2xl">
        <h2 className="text-3xl font-black text-white mb-6 text-right">
          إضافة مشترك جديد
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            type="text"
            placeholder="الاسم الكامل"
            className="w-full bg-black border border-[#1e1e1e] rounded-xl px-5 py-4 text-right text-white"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            type="text"
            placeholder="رقم الهاتف"
            className="w-full bg-black border border-[#1e1e1e] rounded-xl px-5 py-4 text-right text-white"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <select
            className="w-full bg-black border border-[#1e1e1e] rounded-xl px-5 py-4 text-right text-white"
            value={formData.coachId}
            onChange={(e) =>
              setFormData({ ...formData, coachId: e.target.value })
            }
            required
          >
            <option value="">اختيار المدرب</option>
            {coaches.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="password"
            placeholder="كلمة المرور"
            className="w-full bg-black border border-[#1e1e1e] rounded-xl px-5 py-4 text-right text-white"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button
            type="submit"
            className="w-full bg-[#00a676] text-white py-4 rounded-2xl font-bold"
          >
            تأكيد الإضافة
          </button>
        </form>
      </div>

      {/* جدول المشتركين */}
      <div className="w-full max-w-6xl">
        <h3 className="text-2xl font-black text-white mb-6 text-right">
          قائمة المشتركين
        </h3>

        <div className="bg-[#121214] rounded-[28px] border border-[#1e1e1e] overflow-hidden shadow-xl">
          <table className="w-full text-right">
            <thead className="bg-black/40 text-gray-400 text-sm">
              <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">الهاتف</th>
                <th className="px-6 py-4">المدرب</th>
                <th className="px-6 py-4">انتهاء الاشتراك</th>
                <th className="px-6 py-4">إجراء</th>
              </tr>
            </thead>

            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-t border-[#1e1e1e]">
                  <td className="px-6 py-4 text-white">{m.name}</td>
                  <td className="px-6 py-4 text-gray-400">{m.phone}</td>
                  <td className="px-6 py-4 text-white">
                    {coaches.find(c => c.id == m.trainerId)?.name || "غير محدد"}
                  </td>
                  <td className="px-6 py-4 text-emerald-400">
                    {m.subscriptionEndDate}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(m.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberManager;
