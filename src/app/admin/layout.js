import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import Link from "next/link";
import { LayoutDashboard, Users, MessageSquare, LogOut } from "lucide-react";

export default async function AdminLayout({ children }) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">OneCard Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Overview
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Users className="w-5 h-5 mr-3" />
            Users
          </Link>
          <Link
            href="/admin/chat"
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare className="w-5 h-5 mr-3" />
            Support Chat
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center px-4 py-2 text-sm text-gray-500">
            <span className="truncate">{session.user.email}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
