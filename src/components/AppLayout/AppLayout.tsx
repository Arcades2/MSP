import React from "react";

export type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-[700px] border-x border-neutral-400 border-opacity-25">
      {children}
    </div>
  );
}
