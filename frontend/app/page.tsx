'use client';

import React from 'react';
import InteractiveMap from '../components/InteractiveMap';
import ChatbotSidebar from '../components/ChatbotSidebar';
import BackendParameters from '../components/BackendParameters';  

export default function SimulationDashboard() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-slate-50">
      
      <ChatbotSidebar />
      <InteractiveMap />
      <BackendParameters />
      

    </main>
  );
}