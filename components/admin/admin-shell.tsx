"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const LS_KEY = "myanhealth.admin.sidebar";
const COLLAPSED_W = 68;
const EXPANDED_W = 256;

type CtxType = {
  collapsed: boolean;
  toggle: () => void;
  width: number;
};

const Ctx = createContext<CtxType>({ collapsed: true, toggle: () => {}, width: COLLAPSED_W });

export function useAdminSidebar() {
  return useContext(Ctx);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY);
    setCollapsed(stored !== "expanded");
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(LS_KEY, next ? "collapsed" : "expanded");
      return next;
    });
  }, []);

  const width = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <Ctx.Provider value={{ collapsed, toggle, width }}>
      <div
        className="min-h-dvh bg-background lg:flex"
        style={ready ? { "--sidebar-w": `${width}px` } as React.CSSProperties : undefined}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function AdminSidebarRail({ children }: { children: React.ReactNode }) {
  const { width } = useAdminSidebar();
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 lg:flex"
      style={{ width: `${width}px` }}
    >
      {children}
    </aside>
  );
}

export function AdminMain({ children }: { children: React.ReactNode }) {
  const { width } = useAdminSidebar();
  return (
    <main
      id="main"
      className="min-w-0 flex-1 px-4 py-6 transition-[margin] duration-300 md:px-8 lg:px-10 lg:py-10"
      style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 1024 ? `${width}px` : undefined }}
    >
      {children}
    </main>
  );
}
