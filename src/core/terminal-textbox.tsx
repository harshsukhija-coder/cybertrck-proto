import { useEffect, useRef } from "react";
import { CommandIcon } from "../icons/CommandIcon";

const TerminalTextBox = () => {

  const ref = useRef(null);

  // Disable the default behaviour of tab while input is auto highlighted
  const handleTabDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      event.preventDefault();
    }
  }

  // Auto increase the textarea when content is exceeding

  useEffect(() => {
    window.addEventListener('keydown', handleTabDown);
    return () => window.removeEventListener('keydown', handleTabDown);
  }, []);

  return (
    <div className="border-t border-slate-700 px-2 py-2 font-jetbrains">
      <div className="border border-slate-700 w-fit px-1.5 rounded-lg flex items-center bg-black/20 gap-1 mb-2 cursor-pointer">
        <CommandIcon /> <span className="text-sm">~</span>
      </div>
      <div className="my-2 w-full *:outline-none">
        <textarea ref={ref} className="text-sm font-medium caret-[#00ff00] w-full " autoFocus={true} />
      </div>
    </div>
  );
}

export default TerminalTextBox;
