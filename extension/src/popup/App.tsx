import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BookmarkProvider } from "./context/BookmarkContext";
import LoginPage from "./pages/LoginPage";
import SetPasscodePage from "./pages/SetPasscodePage";
import PasscodePage from "./pages/PasscodePage";
import DashboardPage from "./pages/DashboardPage";
import BookmarkPage from "./pages/BookmarkPage";
import SettingsPage from "./pages/SettingsPage";

type AppPage = "dashboard" | "bookmark" | "settings";

const Inner: React.FC = () => {
  const { screen } = useAuth();
  const [page, setPage] = React.useState<AppPage>("dashboard");

  if (screen === "loading") {
    return (
      <div className="flex h-full min-h-[560px] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (screen === "login") return <LoginPage />;
  if (screen === "set-passcode") return <SetPasscodePage />;
  if (screen === "passcode") return <PasscodePage />;

  return (
    <BookmarkProvider>
      {page === "dashboard" && <DashboardPage onNavigate={setPage} />}
      {page === "bookmark" && (
        <BookmarkPage onBack={() => setPage("dashboard")} />
      )}
      {page === "settings" && (
        <SettingsPage onBack={() => setPage("dashboard")} />
      )}
    </BookmarkProvider>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <Inner />
  </AuthProvider>
);

export default App;
