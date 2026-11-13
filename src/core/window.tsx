import { useRef } from "react";
import { useAsciiText } from 'react-ascii-text';
import Draggable from "react-draggable";
import confusedMeme from "../assets/memes/confused.gif";
import TerminalTextBox from "./terminal-textbox";

const Window = ({ title }: { title: string }) => {
  const windowRef = useRef(null);

  const asciiTextRef = useAsciiText({
    text: "nmap",
    isAnimated: false
  });

  const storyLine = [
    {
      "label": "system",
      "line": "every network reveals secrets if you know how to listen"
    },
    {
      "label": "story",
      "line": "there is a employee satyam"
    },
    {
      "label": "story",
      "line": "working in a startup"
    },
    {
      "label": "story",
      "line": "in his network there are handful of devices"
    },
    {
      "label": "info",
      "line": "every device on the network leaves a trace"
    },
    {
      "label": "info",
      "line": "its ip Address (xx.xx.xx.xx)"
    },
    {
      "label": "info",
      "line": "open ports / doors"
    },
    {
      "label": "info",
      "line": "services + version (software it runs)"
    },
    {
      "label": "info",
      "line": "operating System"
    },
    {
      "label": "story",
      "line": "network is not a mystery, its an open map"
    }
  ];

  const storyPoints = [
    "Network is not a mystery, its an open map"
  ];

  return (
    <Draggable nodeRef={windowRef}>
      <div className="w-3xl" ref={windowRef}>
        {/* Header */}
        <div className="flex h-[4vh] items-center justify-between px-2 py-1 bg-white/20 rounded-t-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px] border-t border-white/30">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-700"></div>
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          </div>
          <div>{title}</div>
          <div>192.0.0.1</div>
        </div>
        {/* Body */}
        <div className="w-full h-[70vh] bg-black/20 rounded-b-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[5px] border-b border-black/30 border flex justify-end flex-col">
          {/*<div className="px-2 py-1">
            <pre ref={asciiTextRef}></pre>
          </div>*/}
          {/*{storyLine && storyLine.length > 0 && storyLine.map(story => (
            <div className="tracking-wide flex" key={story.line}>
              <span className="text-[#77DB89]">{story.label}&nbsp;:&nbsp;</span>
              <input type="name" value={story.line} className="grow" disabled />
            </div>
          ))}*/}
          {/*<img src={confusedMeme} width={200} height={200} alt="loading..." />*/}
          <TerminalTextBox />
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
