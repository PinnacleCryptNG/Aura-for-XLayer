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
      text: `Hello, I'm AURA. You can ask me anything about what this transaction does, what permissions it grants, or why it received a ${facts.riskLevel} risk score.`,
    },
  ]);

  const quickQuestions = [
    'Why is this risky?',
    'Can they take my OKB?',
    'What happens if I approve this?',
    'What should I change?',
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
        { sender: 'aura', text: data.answer || 'AURA reviewed the transaction facts and recommends limiting permissions.' },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'aura',
          text: `Based on verified facts: This transaction grants permissions to ${facts.contractName}. Limit the approval to avoid exposing your full balance.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-semibold text-zinc-200">AURA Questions & Insights</h4>
        </div>
        <span className="text-[10px] text-zinc-400">Grounded in verified facts</span>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="py-2 flex flex-wrap gap-1.5 border-b border-zinc-800/60">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(q)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors text-left"
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
              className={`max-w-[90%] text-xs rounded-xl p-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'bg-zinc-950/80 text-zinc-200 border border-zinc-800/90 shadow-sm'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-zinc-500 mt-0.5 px-1 uppercase font-mono">
              {m.sender === 'user' ? 'You' : 'AURA'}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-zinc-400 text-xs py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Analyzing verified transaction facts...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="mt-2 flex items-center space-x-2 pt-2 border-t border-zinc-800"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask e.g. 'Can they take my funds?'"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium flex items-center space-x-1 transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
