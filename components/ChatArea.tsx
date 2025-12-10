
import React, { useState, useEffect, useRef } from 'react';
import { Send, UserCircle, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ChatMessage, UserRole } from '../types';
import { collection, query, orderBy, onSnapshot, getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ChatAreaProps {
  appId: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ appId }) => {
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

  return (
    <div className="flex flex-col h-[400px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-900 p-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={14} className="text-teal-500"/> Yönetim ile Mesajlaşma
            </h3>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
                <div className="text-center text-slate-600 text-xs py-10 italic">
                    Henüz mesaj yok. Bir soru sorabilirsiniz.
                </div>
            )}
            {messages.map(msg => {
                const isMe = msg.senderId === currentUser?.uid;
                const isAdmin = msg.senderRole === UserRole.ADMIN;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                            isMe 
                            ? 'bg-rose-600 text-white rounded-br-none' 
                            : isAdmin 
                                ? 'bg-slate-800 text-white border border-rose-500/30 rounded-bl-none' 
                                : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase">
                                {isAdmin && <ShieldCheck size={10} />}
                                {msg.senderName}
                            </div>
                            <p>{msg.text}</p>
                            <span className="text-[9px] opacity-50 block text-right mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>

        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..." 
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:border-rose-500 outline-none"
            />
            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-lg transition-colors">
                <Send size={18} />
            </button>
        </form>
    </div>
  );
};
