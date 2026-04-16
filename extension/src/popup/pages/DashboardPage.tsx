import React from "react";
import { Bookmark, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

type AppPage = "dashboard" | "bookmark" | "settings";

interface Props {
  onNavigate: (page: AppPage) => void;
}

interface FeatureCard {
  id: AppPage;
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
}

const DashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const features: FeatureCard[] = [
    {
      id: "bookmark",
      icon: <Bookmark size={28} />,
      label: "Bookmarks",
      description: "Manage your saved pages",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      id: "settings",
      icon: <Settings size={28} />,
      label: "Settings",
      description: "Passcode & sync options",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="flex min-h-[560px] flex-col px-4 py-5">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Personal Assistant</h1>
          <p className="text-sm text-indigo-300">
            Welcome back,{" "}
            <span className="font-semibold text-white">
              {user?.name ?? "User"}
            </span>
          </p>
        </div>
        <button
          onClick={() => logout()}
          title="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3">
        {features.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-center transition hover:border-white/20 hover:bg-white/10 active:scale-95"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} text-white shadow-lg transition group-hover:shadow-xl`}
            >
              {f.icon}
            </div>
            <div>
              <p className="font-semibold text-white">{f.label}</p>
              <p className="text-xs text-slate-400">{f.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 text-center text-xs text-slate-600">
        Personal Assistant v1.0
      </div>
    </div>
  );
};

export default DashboardPage;
