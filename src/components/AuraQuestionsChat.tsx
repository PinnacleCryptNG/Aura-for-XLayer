import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Send, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { DeterministicFacts } from '../types';

interface AuraQuestionsChatProps {
  facts: DeterministicFacts;
}

export const AuraQuestionsChat: React.FC<AuraQuestionsChatProps> = ({ facts }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'aura'; text: string }>>([
    {
      sender: 'aura',
      text: `Hello! I am AURA. You can ask me any question in simple words about what this transaction does or whether it is safe.`,
    },
  ]);

  const quickQuestions = [
    'Is this safe?',
    'Can they take my coins?',
    'What should I do?',
    'Why is it risky?',
  ];

  const handleAsk = async (qText: string) => {
    if (!qText.trim() || loading) return;

    const userMessage = qText.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ask-aura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, facts }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'aura', text: data.answer || 'AURA recommends keeping your permissions limited so only the exact amount is spent.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'aura',
          text: `AURA suggests: Always limit permissions to small amounts (like 1 USDT) so no website can touch your full balance.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#10172a] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">Ask AURA in Simple Words</h4>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Helper AI</span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="py-2.5 flex flex-wrap gap-1.5 border-b border-slate-800">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            disabled={loading}
            className="text-xs px-3 py-1 rounded-full bg-[#0b1222] hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors text-left cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 py-3 max-h-56 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] text-xs sm:text-sm rounded-2xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-[#0b1222] text-slate-200 border border-slate-800 shadow-sm'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 px-1 uppercase font-mono">
              {m.sender === 'user' ? 'You' : 'AURA'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Checking details for you...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="mt-2 flex items-center space-x-2 pt-2.5 border-t border-slate-800"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask e.g. 'Is this safe?'"
          className="flex-1 bg-[#0b1222] border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
