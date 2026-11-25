import { useEffect, useState } from "react";
import AcademyPage from "./courses/academy/academy-page";
import CoursesPage from "./courses/courses-page";
import FeedApp from "./courses/feed-page";
import { LessonReader } from "./courses/lesson-reader";
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
  if (route.startsWith("#/courses")) return <CoursesPage route={route} />;
  if (route.startsWith("#/academy")) return <AcademyPage route={route} />;
  if (route.startsWith("#/learn/")) {
    const [courseId = "", chapterId = ""] = route.slice("#/learn/".length).split("/");
    return <LessonReader key={route} courseId={courseId} chapterId={chapterId} />;
  }
  if (!username) return <LoginScreen onLogin={login} />;
  if (route.startsWith("#/feed")) return <FeedApp route={route} username={username} onLogout={logout} />;
  return <Desktop username={username} onLogout={logout} />;
}

export default App
