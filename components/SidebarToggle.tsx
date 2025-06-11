'use client';

import React from 'react';
import { useSidebar } from '@/contexts/SidebarContext';

const SidebarToggle: React.FC = () => {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={() => {
        console.log('Toggle button clicked');
        toggle();
      }}
      className="toggle-button p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle sidebar"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export default SidebarToggle;
