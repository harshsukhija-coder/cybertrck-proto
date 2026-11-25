import { useEffect, useState } from "react";
import CoursesPage from "./courses/courses-page";
import FeedApp from "./courses/feed-page";
import Desktop from "./core/desktop";
import FoundersPage from "./core/founders-page";
import LoginScreen, { type Space } from "./core/login-screen";

const TEAM_ROUTES = new Set(["#/team", "#/founders"]);

const SESSION_KEY = "offtrck.session.user";

const readRoute = () => {
  if (window.location.pathname.startsWith("/courses")) {
    window.history.replaceState(null, "", `/#${window.location.pathname}`);
  }
  return window.location.hash;
};

function App() {
  const [username, setUsername] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const login = (name: string, space: Space) => {
    setUsername(name);
    sessionStorage.setItem(SESSION_KEY, name);
    window.location.hash = space === "feed" ? "#/feed" : "#/";
  };

  const logout = () => {
    setUsername(null);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.hash = "";
  };

  if (TEAM_ROUTES.has(route)) return <FoundersPage />;
  if (route.startsWith("#/courses")) return <CoursesPage />;
  if (!username) return <LoginScreen onLogin={login} />;
  if (route.startsWith("#/feed")) return <FeedApp route={route} username={username} onLogout={logout} />;
  return <Desktop username={username} onLogout={logout} />;
}

export default App
