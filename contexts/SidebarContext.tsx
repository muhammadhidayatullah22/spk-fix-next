'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  isMobile: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      const wasMobile = isMobile;
      setIsMobile(mobile);

      // Only auto-close when switching from desktop to mobile
      // Don't interfere with manual toggle on mobile
      if (mobile && !wasMobile && isOpen) {
        setIsOpen(false);
      }
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, isOpen]);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-open');
    if (savedState !== null) {
      const isOpenSaved = JSON.parse(savedState);
      // Only apply saved state on desktop
      if (!isMobile) {
        setIsOpen(isOpenSaved);
      }
    }
  }, [isMobile]);

  // Save state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }
  }, [isOpen, isMobile]);

  const toggle = () => {
    console.log('Toggle sidebar called, current state:', isOpen, 'isMobile:', isMobile);
    setIsOpen(prev => !prev);
  };
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  const value: SidebarContextType = {
    isOpen,
    isMobile,
    toggle,
    open,
    close,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
