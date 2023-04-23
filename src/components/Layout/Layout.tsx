type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1f42] to-[#20152e] text-white">
      <main>{children}</main>
    </div>
  );
}

export default Layout;
