import React, { useState } from 'react';

export function Tabs({ defaultValue, children, className = '' }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <div className={className}>
      {React.Children.map(children, c => React.cloneElement(c, { active, setActive }))}
    </div>
  );
}

export function TabsList({ children, className = '', active, setActive }) {
  return (
    <div className={`inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}>
      {React.Children.map(children, c => React.cloneElement(c, { active, setActive }))}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', active, setActive }) {
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'} ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '', active }) {
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
}
