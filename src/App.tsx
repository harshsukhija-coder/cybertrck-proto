import { useEffect, useState } from "react";
import Desktop from "./core/desktop";
import FoundersPage from "./core/founders-page";
import LoginScreen from "./core/login-screen";

const TEAM_ROUTES = new Set(["#/team", "#/founders"]);

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [route, setRoute] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (TEAM_ROUTES.has(route)) return <FoundersPage />;
  if (!username) return <LoginScreen onLogin={setUsername} />;
  return <Desktop username={username} onLogout={() => setUsername(null)} />;
}

export default App
