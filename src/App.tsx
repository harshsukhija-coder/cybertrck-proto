import { Suspense, lazy, useEffect, useState } from "react";
import AcademyPage from "./courses/academy/academy-page";
import CoursesPage from "./courses/courses-page";
import FeedApp from "./courses/feed-page";
import { LessonReader } from "./courses/lesson-reader";
import Desktop from "./core/desktop";
import FoundersPage from "./core/founders-page";
import LoginScreen, { type Space } from "./core/login-screen";

const TerminalPage = lazy(() => import("./terminal/terminal-page"));

const TERMINAL_ROUTES = new Set(["#/term", "#/terminal"]);
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

  const signIn = (name: string) => {
    setUsername(name);
    sessionStorage.setItem(SESSION_KEY, name);
  };

  const login = (name: string, space: Space) => {
    signIn(name);
    window.location.hash = space === "feed" ? "#/feed" : space === "terminal" ? "#/term" : "#/";
  };

  const logout = () => {
    setUsername(null);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.hash = "";
  };

  if (TEAM_ROUTES.has(route)) return <FoundersPage />;
  if (TERMINAL_ROUTES.has(route)) {
    return (
      <Suspense fallback={<div className="h-full bg-[#07080a]" />}>
        <TerminalPage username={username} onLogin={signIn} onLogout={logout} />
      </Suspense>
    );
  }
  if (route.startsWith("#/learn/")) {
    const [courseId = "", chapterId = ""] = route.slice("#/learn/".length).split("/");
    return <LessonReader key={route} courseId={courseId} chapterId={chapterId} />;
  }
  // Signed-in people get courses and the academy inside the app, with the same menu everywhere
  if (route.startsWith("#/courses")) {
    if (!username) return <CoursesPage route={route} />;
    return <FeedApp route={route.replace("#/courses", "#/feed/courses")} username={username} onLogout={logout} />;
  }
  if (route.startsWith("#/academy")) {
    if (!username) return <AcademyPage route={route} />;
    return <FeedApp route={route} username={username} onLogout={logout} />;
  }
  if (!username) return <LoginScreen onLogin={login} />;
  if (route.startsWith("#/feed")) return <FeedApp route={route} username={username} onLogout={logout} />;
  return <Desktop username={username} onLogout={logout} />;
}

export default App
