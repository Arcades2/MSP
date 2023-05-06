type LayoutProps = {
  children: React.ReactNode;
};

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#34334D] text-white">
      <main>{children}</main>
    </div>
  );
}

export default Layout;
