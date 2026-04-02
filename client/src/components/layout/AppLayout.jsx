import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppLayout({ children, title }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Q-Gen System`;
    } else {
      document.title = "Q-Gen System";
    }
  }, [title]);

  return (
    <div className="min-h-screen bg-background font-sans flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header title={title} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50/50 dark:bg-background/50">
          <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>);

}