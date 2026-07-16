import React from 'react';
import { ChatArea } from '../../../components/ChatArea';
import { useDashboardUI } from '../DashboardUIContext';

export function DashboardChatTab() {
  const { currentApplication } = useDashboardUI();
  return (
    <div className="max-w-4xl mx-auto">
      <ChatArea appId={currentApplication.id} />
    </div>
  );
}
