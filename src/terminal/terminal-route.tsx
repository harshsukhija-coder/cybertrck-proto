import { Suspense, lazy } from "react";
import { useIsMobile } from "../core/use-media";

const TerminalPage = lazy(() => import("./terminal-page"));

type Props = {
  username: string | null;
  onLogin: (username: string) => void;
  onLogout: () => void;
};

const BiggerScreen = ({ signedIn }: { signedIn: boolean }) => (
  <div className="flex min-h-dvh items-center justify-center bg-[#07080a] p-6 font-jetbrains text-[14px] leading-relaxed text-white/80">
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-5">
      <p>
        <span className="text-[#3ddc84]">~</span>
        <span className="text-white/40">$</span> terminal
      </p>
      <p className="mt-2 text-[#ff6b81]">screen too small.</p>
      <p className="mt-3 text-white/60">
        the terminal is made for typing, so it only opens on a tablet, laptop or desktop. open offtrck on a bigger screen and you&apos;ll find it there.
      </p>
      <p className="mt-3 text-white/60">on your phone, the feed has the same courses, games and badges.</p>
      <a href={signedIn ? "#/feed" : "#/"} className="mt-5 block rounded-xl bg-white/10 px-4 py-3 text-center font-semibold text-white hover:bg-white/15">
        {signedIn ? "open the feed →" : "log in →"}
      </a>
    </div>
  </div>
);

/** The terminal is for big screens only; phones get a short note instead */
const TerminalRoute = ({ username, onLogin, onLogout }: Props) => {
  const isMobile = useIsMobile();
  if (isMobile) return <BiggerScreen signedIn={!!username} />;
  return (
    <Suspense fallback={<div className="h-full bg-[#07080a]" />}>
      <TerminalPage username={username} onLogin={onLogin} onLogout={onLogout} />
    </Suspense>
  );
};

export default TerminalRoute;
