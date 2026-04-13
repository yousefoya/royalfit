import React, { useState } from 'react';
import { Send, Bot, Loader2, User as UserIcon } from 'lucide-react';

type Message = {
  role: 'user' | 'model';
  text: string;
};

export const AICoach: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'أهلاً بك في رويال فتنس! أنا مدربك الذكي 💪 كيف أقدر أساعدك اليوم؟',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const API_BASE = 'https://royalfitness.fit/royal_api/';
      //const API_BASE = 'https://localhost/royal_api/';

      const res = await fetch(`${API_BASE}/ai_coach.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      // ✅ parsing آمن
      const rawText = await res.text();
      const data = JSON.parse(rawText);

      if (data.success && data.response) {
        setMessages(prev => [
          ...prev,
          { role: 'model', text: data.response },
        ]);
      } else {
        throw new Error(data.error || 'رد غير صالح من السيرفر');
      }
    } catch (error) {
      console.error('AI Coach Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: 'عذراً، حدث خطأ أثناء الاتصال بالمدرب الذكي. حاول مرة أخرى لاحقاً.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 overflow-hidden h-[500px] flex flex-col">
      {/* Header */}
      <div className="bg-royal-600 p-4 flex items-center gap-2 text-white">
        <Bot className="w-6 h-6" />
        <h3 className="font-bold text-lg">المدرب الذكي (AI)</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`flex gap-2 max-w-[80%] ${
                msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 text-gray-300'
                    : 'bg-royal-900 text-royal-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <UserIcon size={16} />
                ) : (
                  <Bot size={16} className="text-royal-500" />
                )}
              </div>

              <div
                className={`p-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 border border-zinc-700 text-gray-200'
                    : 'bg-royal-600 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-end">
            <div className="bg-zinc-900 p-3 rounded-2xl flex items-center gap-2 text-royal-500 border border-zinc-800">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">جاري الكتابة...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن تمرين، نظام غذائي، أو نصيحة..."
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-royal-500 placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-royal-600 hover:bg-royal-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:bg-zinc-700"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
