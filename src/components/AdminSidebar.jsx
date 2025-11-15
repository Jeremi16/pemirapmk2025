import React from "react";
import { Users, BarChart2, PieChart, LogOut } from "lucide-react";

const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="w-64 min-h-screen bg-card border-r p-4 hidden md:block">
      <div className="mb-8">
        <a href="/" className="flex items-center space-x-2 mb-2">
          <div className="rounded-xl">
            <img
              src="/public/Logo Utama.png"
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col leading-none">
            <div className="text-xl text-primary leading-none">PEMIRA</div>
            <span className="text-sm font-semibold text-[hsl(var(--brand-orange))] -mt-1">
              PMK ITERA 2025
            </span>
          </div>
        </a>
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">Dashboard</p>
      </div>

      <nav className="space-y-2">
        <button
          onClick={() => setActiveTab("candidates")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "candidates"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/10"
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          Perolehan Suara
        </button>

        <button
          onClick={() => setActiveTab("participation")}
          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md ${
            activeTab === "participation"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted/10"
          }`}
        >
          <PieChart className="w-5 h-5" />
          Partisipasi
        </button>
      </nav>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
