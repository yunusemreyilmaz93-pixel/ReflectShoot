import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, ShieldCheck, MessageSquare, HelpCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatMessage, UserRole } from '../types';
import { collection, query, orderBy, onSnapshot, getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

interface ChatAreaProps {
  appId: string;
  theme?: 'dark' | 'light';
}

export const ChatArea: React.FC<ChatAreaProps> = ({ appId, theme = 'dark' }) => {
  const { currentUser, sendMessage } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const q = query(collection(db, "applications", appId, "messages"), orderBy("createdAt", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs: ChatMessage[] = [];
          snapshot.forEach(doc => msgs.push({ id: doc.id, ...doc.data() } as ChatMessage));
          setMessages(msgs);
      });
      return () => unsubscribe();
  }, [appId]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      await sendMessage(appId, newMessage);
      setNewMessage('');
  };

  // Theme Classes - Stripped of rounded logic
  const containerClass = theme === 'dark' 
    ? "bg-slate-950 border-slate-800" 
    : "bg-white border-slate-100 shadow-lg shadow-slate-200/50";
  
  const headerClass = theme === 'dark'
    ? "bg-slate-900 border-slate-800 text-white p-6"
    : "bg-white border-slate-50 text-slate-900 p-6";

  const messageBgMe = "bg-rose-600 text-white shadow-md shadow-rose-900/20";
  const messageBgAdmin = theme === 'dark'
    ? "bg-slate-800 text-white border border-rose-500/30"
    : "bg-white text-slate-800 border border-rose-100 shadow-sm ring-1 ring-rose-50";
  const messageBgOther = theme === 'dark'
    ? "bg-slate-800 text-slate-200"
    : "bg-slate-50 text-slate-600 border border-slate-100";

  const inputClass = theme === 'dark'
    ? "bg-slate-900 border-slate-800 text-white focus:border-rose-500 placeholder-slate-600"
    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 placeholder-slate-400";

  return (
    <div className={`flex flex-col h-[600px] border overflow-hidden ${containerClass}`}>
        {/* Header Section */}
        <div className={`flex items-center justify-between border-b ${headerClass}`}>
            <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                    Yönetim ile İletişim
                </h3>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Organizasyon ekibine doğrudan soru sorabilir ve süreçle ilgili bilgi alabilirsiniz.
                </p>
            </div>
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-rose-500' : 'bg-slate-50 border-slate-200 text-rose-600'}`}>
                <MessageSquare size={24} />
            </div>
        </div>

        {/* FAQ Banner */}
        <div className={`px-4 py-3 flex items-center justify-between text-xs font-medium border-b ${theme === 'dark' ? 'bg-blue-900/10 border-blue-900/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
            <div className="flex items-center gap-2">
                <HelpCircle size={16} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                <span>Sorunuzun cevabı hazır olabilir.</span>
            </div>
            <Link 
                to="/faq" 
                target="_blank"
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800'}`}
            >
                SSS'ye Git
            </Link>
        </div>
        
        {/* Messages Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-opacity-50">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-slate-900 text-slate-700' : 'bg-slate-50 text-slate-300'}`}>
                        <ShieldCheck size={32} />
                    </div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                        Merak ettiklerinizi buradan sorabilirsiniz.<br/>Ekibimiz en kısa sürede yanıtlayacaktır.
                    </p>
                </div>
            )}
            {messages.map(msg => {
                const isMe = msg.senderId === currentUser?.uid;
                const isAdmin = msg.senderRole === UserRole.ADMIN;
                
                let bubbleClass = isMe ? messageBgMe : (isAdmin ? messageBgAdmin : messageBgOther);

                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${bubbleClass} ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                            {!isMe && (
                                <div className="flex items-center gap-2 mb-1.5 opacity-80 text-[10px] font-bold uppercase tracking-wider">
                                    {isAdmin && <ShieldCheck size={12} className="text-rose-500" />}
                                    {msg.senderName}
                                </div>
                            )}
                            <p>{msg.text}</p>
                            <span className={`text-[9px] block text-right mt-2 font-medium ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Footer Input Section */}
        <form onSubmit={handleSend} className={`p-4 border-t flex gap-3 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
            <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..." 
                className={`flex-1 border rounded-xl px-5 py-4 text-sm outline-none transition-all shadow-sm ${inputClass}`}
            />
            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white p-4 rounded-xl transition-all shadow-lg shadow-rose-600/20 transform hover:-translate-y-0.5 active:translate-y-0">
                <Send size={20} />
            </button>
        </form>
    </div>
  );
};