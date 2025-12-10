
import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatMessage, UserRole } from '../types';
import { collection, query, orderBy, onSnapshot, getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';

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

  // Theme Classes
  const containerClass = theme === 'dark' 
    ? "bg-slate-950 border-slate-800" 
    : "bg-white border-gray-100 shadow-lg rounded-3xl";
  
  const headerClass = theme === 'dark'
    ? "bg-slate-900 border-slate-800 text-white"
    : "bg-white border-gray-100 text-slate-900 rounded-t-3xl";

  const messageBgMe = "bg-rose-600 text-white";
  const messageBgAdmin = theme === 'dark'
    ? "bg-slate-800 text-white border border-rose-500/30"
    : "bg-white text-slate-800 border border-rose-200 shadow-sm";
  const messageBgOther = theme === 'dark'
    ? "bg-slate-800 text-slate-200"
    : "bg-gray-100 text-slate-700";

  const inputClass = theme === 'dark'
    ? "bg-slate-950 border-slate-800 text-white focus:border-rose-500"
    : "bg-gray-50 border-gray-200 text-slate-900 focus:border-rose-500 focus:bg-white";

  return (
    <div className={`flex flex-col h-[400px] border overflow-hidden ${containerClass}`}>
        <div className={`p-4 border-b flex items-center justify-between ${headerClass}`}>
            <h3 className="text-sm font-black flex items-center gap-2">
                <ShieldCheck size={16} className="text-teal-500"/> Yönetim ile Mesajlaşma
            </h3>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
                <div className={`text-center text-xs py-10 italic ${theme === 'dark' ? 'text-slate-600' : 'text-gray-400'}`}>
                    Henüz mesaj yok. Bir soru sorabilirsiniz.
                </div>
            )}
            {messages.map(msg => {
                const isMe = msg.senderId === currentUser?.uid;
                const isAdmin = msg.senderRole === UserRole.ADMIN;
                
                let bubbleClass = isMe ? messageBgMe : (isAdmin ? messageBgAdmin : messageBgOther);

                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${bubbleClass} ${isMe ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                            <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase">
                                {isAdmin && <ShieldCheck size={10} />}
                                {msg.senderName}
                            </div>
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className="text-[9px] opacity-50 block text-right mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>

        <form onSubmit={handleSend} className={`p-3 border-t flex gap-2 ${headerClass} ${theme === 'light' ? 'rounded-b-3xl' : ''}`}>
            <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..." 
                className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${inputClass}`}
            />
            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-xl transition-colors shadow-md">
                <Send size={18} />
            </button>
        </form>
    </div>
  );
};
