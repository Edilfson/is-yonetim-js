import React from 'react';

export const Card: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className, children }) => {
  return <div className={`border rounded shadow p-4 ${className}`}>{children}</div>;
};

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="font-bold text-lg mb-2">{children}</div>;
};

export const CardTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <h3 className="text-xl font-semibold">{children}</h3>;
};

export const CardContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="text-gray-700">{children}</div>;
};