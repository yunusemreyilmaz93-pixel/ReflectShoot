import React from 'react';
import { Globe, List } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const AdminLogs: React.FC = () => {
  const { auditLogs } = useAppContext();

  if (!auditLogs.length) {
    return (
      <div className="bg-slate-800 rounded-2xl border border-dashed border-slate-700 p-12 text-center animate-fadeIn">
        <List size={32} className="mx-auto text-slate-600 mb-3" />
        <p className="text-slate-300 font-bold mb-1">Henüz denetim kaydı yok</p>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Durum güncelleme, belge onayı ve sistem işlemleri burada listelenir. İşlem yaptıkça kayıtlar
          otomatik dolar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4">Zaman</th>
              <th className="p-4">İşlem</th>
              <th className="p-4">Detay</th>
              <th className="p-4">Yapan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-700/20">
                <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('tr-TR')}
                </td>
                <td className="p-4">
                  <span className="bg-slate-900 text-white text-xs px-2 py-1 rounded border border-slate-700 font-bold whitespace-nowrap">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-300 min-w-[200px]">
                  {log.details}
                  {log.metadata && (
                    <div className="mt-1 text-[10px] text-slate-500 font-mono bg-slate-900/50 p-1 rounded">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </td>
                <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                  <div className="font-bold text-slate-200">{log.performedBy}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                    <Globe size={10} className="text-slate-600" /> {log.ip || 'N/A'}
                    <span className="opacity-30">|</span>
                    <span
                      className="truncate max-w-[120px]"
                      title={log.userAgent}
                    >
                      {log.userAgent?.split(') ')[1] || log.userAgent?.split(' ')[0] || 'N/A'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
