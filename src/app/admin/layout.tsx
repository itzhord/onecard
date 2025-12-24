import { ModeToggle } from "@/components/mode-toggle";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold ml-12 lg:ml-0">Overview</h1>
          </div>
          <ModeToggle />
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
