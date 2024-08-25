"use client";
import './globals.css';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen bg-gray-100">
        <header className="p-4 bg-gray-800 text-white">
          <h1 className="text-2xl">Interactive Map</h1>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
};

export default Layout;
