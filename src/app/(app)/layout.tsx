import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:pl-[17rem]">
        <main id="main" className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
}
