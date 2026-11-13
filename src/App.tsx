import { useState } from "react";
import Desktop from "./core/desktop";
import LoginScreen from "./core/login-screen";

function App() {
  const [username, setUsername] = useState<string | null>(null);

  if (!username) return <LoginScreen onLogin={setUsername} />;
  return <Desktop username={username} onLogout={() => setUsername(null)} />;
}

export default App
