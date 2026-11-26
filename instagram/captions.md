# offtrck · Instagram posts

32 posts in three series. Images are in `posts/` (1080×1350, Instagram's 4:5 portrait size).

- **01–13:** offtrck academy launch.
- **14–23:** what's new: terminal mode, the live feed, and paths (skill check + roadmaps).
- **24–32:** 6 new games, and games popping up in the feed. Captions are at the end of this file.

## Series 1 · offtrck academy launch

13 posts, in posting order.

**Story arc:** tease (01–02) → reveal (03) → how it works (04) → each feature in the order a learner meets it (05–12) → launch (13).

**Suggested schedule:** one post a day. Post 01 and 02 before launch, 03 on launch day, then 04–12 daily, and finish with 13. If you want it faster, post 04–12 in the morning and evening of the same days.

**To edit a post:** change the text in `posts.html`, then run `./render.sh` to export fresh PNGs. Open `posts.html` in a browser to see all posts side by side.

---

## 01 · teaser: something is coming
**Image:** `posts/01.png`

**Caption**
```
ping… no reply. 👀

something is coming to offtrck.
it's been in the works for a while, and it's almost ready.

one hint: if you've ever wondered how your phone actually reaches a website, you're going to like this.

turn on post notifications so you don't miss it 🔔

#comingsoon #networking #learntech #techeducation #ciscopackettracer
```
**Alt text:** A terminal pinging offtrck.academy with three "Request timed out" replies, and the words "something is coming."

---

## 02 · teaser: can you read this?
**Image:** `posts/02.png`

**Caption**
```
quick test 👇

192.168.1.10/24

can you tell which part is the network and which part is the device?
drop your answer in the comments. no googling 😄

if this looks like random numbers right now, that's completely fine.
very soon, it won't.

coming soon on offtrck.

#networking #ipaddress #subnetting #ccna #learnnetworking #comingsoon
```
**Alt text:** The IP address 192.168.1.10/24 with three blurred boxes labelled network, host and mask.

---

## 03 · reveal
**Image:** `posts/03.png`

**Caption**
```
introducing offtrck academy 🛰️

a free networking course that takes you from zero to pro.

📖 6 modules
✍️ 14 short blogs
🛠 6 hands-on labs in Cisco Packet Tracer
🏅 1 "network pro" badge to show off

no experience needed. learn at your own pace, on your phone or laptop.

over the next few posts we'll show you exactly how it works, step by step. follow along 👀

#offtrckacademy #networking #ccna #ciscopackettracer #learnnetworking #freecourse #techeducation
```
**Alt text:** "networking, from zero to pro." with four stat boxes: 6 modules, 14 blogs, 6 labs, 1 badge.

---

## 04 · how it works
**Image:** `posts/04.png`

**Caption**
```
how offtrck academy works, in 4 steps:

1️⃣ read and play: short blogs with animations you can tap through
2️⃣ prove it: a quiz after every module (70% to pass)
3️⃣ build it for real: solve a problem in Cisco Packet Tracer and upload your file
4️⃣ earn the badge: finish the course and unlock "network pro"

that's the whole thing. no lectures, no 3-hour videos.

next up: the blogs 👉

#offtrckacademy #networking #learnbydoing #ccna #ciscopackettracer
```
**Alt text:** Four numbered steps: read and play, prove it, build it for real, earn the badge.

---

## 05 · the blogs
**Image:** `posts/05.png`

**Caption**
```
step 1: read 📖

14 blogs, each 5 to 8 minutes long. written in plain, easy words. no boring textbook talk.

a few favourites:
→ what really happens when you open a website
→ ip addresses, explained like a postcode
→ subnetting without tears
→ dhcp: the address vending machine
→ acls: the bouncer at the door

each blog has quick "check yourself" questions in between, so you know you got it before moving on.

which one would you read first? 👇

#offtrckacademy #networking #subnetting #ipaddress #dhcp #learnnetworking
```
**Alt text:** A list of five blog titles from the course, and a tip about subnet masks.

---

## 06 · the animations
**Image:** `posts/06.png`

**Caption**
```
step 1, part 2: play 🎮

reading about a packet is one thing. watching it move is another.

the blogs have 12 interactive animations. tap through them at your own speed:
⚡ a packet's trip from your laptop to a website
🤝 the TCP handshake
📣 ARP and DHCP
🔎 DNS lookups
🔢 binary and a live subnet calculator
🧱 VLANs, routing and firewall rules

hard ideas click much faster when you can see them.

#offtrckacademy #networking #interactivelearning #ccna #tcpip #learnnetworking
```
**Alt text:** An animation panel showing a packet moving from a laptop to a switch, router and website, with next and back buttons.

---

## 07 · the quizzes
**Image:** `posts/07.png`

**Caption**
```
step 2: prove it ✅

every module ends with a quiz. score 70% to pass.

every answer comes with a short "why", so even wrong answers teach you something. and you can retake it as many times as you want.

try this one from module 2:
PC A is 192.168.1.10/24 and PC B is 192.168.2.10/24.
can they talk without a router? 🤔

(answer's in the picture 😉)

#offtrckacademy #networkingquiz #ccna #subnetting #learnnetworking
```
**Alt text:** A quiz question about two PCs on different networks, with the correct answer "no, different networks" ticked and an explanation underneath.

---

## 08 · the Packet Tracer labs
**Image:** `posts/08.png`

**Caption**
```
step 3: build it for real 🛠

this is where it gets fun.

every module has a hands-on lab in Cisco Packet Tracer (Cisco's free network simulator). you get:
🎯 a clear goal
🗺 a network diagram
📋 an addressing table
🪜 step-by-step hints if you get stuck

example: lab 4 asks you to connect two offices with two routers, add the routes, and get PC-A to ping PC-B.

when it works, save the .pkt file. then comes the best part 👉

#offtrckacademy #ciscopackettracer #packettracer #ccna #networkinglab #routing
```
**Alt text:** Lab card "connect two offices" with a diagram of two routers, two PCs and two networks, and three tasks.

---

## 09 · instant grading
**Image:** `posts/09.png`

**Caption**
```
step 3, part 2: get graded ⚡

drag your .pkt file onto the page and you get your result in seconds.

the site opens your file and checks your actual network:
✓ are the IP addresses right?
✓ are the interfaces turned on?
✓ do the routes exist?
✓ can the PCs really ping each other?

score 80% or more and it's a PASS. no waiting for a teacher to mark it.

#offtrckacademy #ciscopackettracer #ccna #networking #learnbydoing
```
**Alt text:** A .pkt file being uploaded, followed by a result card showing 100 and a PASS stamp, with three checks ticked.

---

## 10 · failing teaches you
**Image:** `posts/10.png`

**Caption**
```
step 3, part 3: fix it 🔧

didn't pass? good news: you'll know exactly why.

every check shows what went wrong and gives you a hint.

in this example, R2 had no route back to the first office. the ping reached PC-B, but the reply got lost on the way home. a super common real-world mistake.

fix it in Packet Tracer, upload again, and your best score is the one that counts.

have you ever forgotten a return route? be honest 😅

#offtrckacademy #networking #troubleshooting #ccna #staticrouting #packettracer
```
**Alt text:** A FAIL result at 65 out of 100. One check is ticked; two are crossed out with reasons and a hint showing the missing route command.

---

## 11 · the full course
**Image:** `posts/11.png`

**Caption**
```
the full course, in order 🗺

01 how networks actually work → lab: hello, packet tracer
02 ip addresses and subnetting → lab: your first office LAN
03 switching and vlans → lab: split the office with vlans
04 routing → lab: connect two offices
05 dhcp and dns → lab: automatic addresses with dhcp
06 security basics → lab: harden the router

every module follows the same rhythm: blogs → quiz → lab.
about 4 hours in total. beginner friendly.

save this post so you can follow along 📌

#offtrckacademy #networking #ccna #vlan #routing #dhcp #networksecurity
```
**Alt text:** Six colour-coded module cards, each with its title and lab name.

---

## 12 · the badge
**Image:** `posts/12.png`

**Caption**
```
step 4: earn the badge 🛰️

pass all 6 quizzes and all 6 labs, and the final challenge unlocks.
20 questions, 75% to pass.

pass it and you unlock the "network pro" badge. we make a share image with your name on it and write the caption for you. post it on instagram, linkedin, x or whatsapp in one tap.

and it's not the only one. there are 15 badges to collect across offtrck 🏅

tag someone who'd flex this badge 👇

#offtrckacademy #offtrck #networking #ccna #careerintech #learnnetworking
```
**Alt text:** A sample "network pro" badge share image for Riya Sharma, next to the apps you can share it on, and three ticked requirements below it.

---

## 13 · it's live
**Image:** `posts/13.png`

**Caption**
```
ping… reply! 🟢

offtrck academy is live.

✅ 14 blogs + 12 animations
✅ 6 quizzes
✅ 6 Cisco Packet Tracer labs, graded instantly
✅ a network pro badge to share

it's free. start today. link in bio 🔗

if you finish it, share your badge and tag us. we'll repost it 🎉

#offtrckacademy #networking #ccna #ciscopackettracer #freecourse #learnnetworking #techeducation
```
**Alt text:** A terminal now getting replies from offtrck.academy, with the words "it's live", a checklist of features and a "start free" button.

---

## Series 2 · what's new on offtrck

10 posts, in posting order: an intro (14), terminal mode (15–16), the live feed (17–18), paths (19–22), and a recap (23).

**Suggested schedule:** one post a day. If you'd rather post fewer, the shortest version is 14, 15, 17, 19, 20 and 23.

---

## 14 · 3 new things
**Image:** `posts/14.png`

**Caption**
```
we've been busy 👀

3 new ways to learn on offtrck:

>_ terminal mode: the whole app, typed like a hacker
● a live feed: fresh posts from the web, picked by what you're into
⇄ paths: a 1-minute skill check, then a roadmap made for you

over the next few posts we'll show you each one. all of it is free.

which one are you trying first? 👇

#offtrck #learntech #techeducation #newfeature #learnbydoing
```
**Alt text:** "3 new ways to learn" with three cards: terminal mode, a live feed and paths.

---

## 15 · terminal mode
**Image:** `posts/15.png`

**Caption**
```
>_ new: terminal mode

everything on offtrck now works in a terminal too.
read your feed, finish a lesson, play a game, do a lab, collect badges. all with commands.

don't know the commands? no problem. every option can be tapped, so you can learn them as you go.

built for laptops and tablets. on your phone, the normal app is still right there.

would you learn like this? 👇

#offtrck #terminal #commandline #linux #learntocode #hackerlife #techeducation
```
**Alt text:** A terminal where Riya types "feed" and sees a lesson, then types "play port-rush", answers "b" and gets "correct +10".

---

## 16 · the cheat sheet
**Image:** `posts/16.png`

**Caption**
```
save this one 📌 your terminal mode cheat sheet:

feed → your feed, live posts included
stories → today's facts and your path
learn → read a chapter, card by card
play → 16 mini games
academy → blogs, quizzes and labs
lab 4 → drop your Packet Tracer file, get graded
missions → hacking story missions
path → your roadmap and next steps
badges → see them, then share them
help → when you're stuck

bonus tips:
⇥ tab finishes the command for you
↑ brings back the last one

it also opens as a window on the classic desktop. 🖥

#offtrck #terminal #cheatsheet #commandline #linux #ciscopackettracer
```
**Alt text:** A cheat sheet of ten terminal commands with a short description of each.

---

## 17 · the live feed
**Image:** `posts/17.png`

**Caption**
```
● new: your feed is now live

your offtrck feed now pulls in real posts from around the web: dev articles, tech news, top questions from Q&A sites, new open-source projects, game deals and more.

they sit in between our own lessons, games and polls. so you learn something, then see how it's used in the real world, then learn something else.

every live post links back to where it came from, so you can read the full thing and join the comments.

#offtrck #techfeed #technews #devcommunity #learntech #stayupdated
```
**Alt text:** A feed with one offtrck lesson, then a live post from dev.to marked "live · 2h ago", then an offtrck poll.

---

## 18 · picked by your interests
**Image:** `posts/18.png`

**Caption**
```
your feed ≠ everyone else's feed. 🎯

when you join, you pick what you're into. the live feed only fetches posts for those interests:

🔴 hacking & security → hacker news, infosec Q&A, github
🔵 gaming & lag → today's game deals, dev.to
🟢 money & investing → biggest crypto moves, personal finance Q&A
🟠 streaming & video → shows out today, hacker news
🟣 databases & data → stack overflow, github

it refreshes on its own. new posts wait behind a "↑ new posts" button, so your feed never jumps while you're reading. posts you've already seen move to the back.

which interests did you pick? 👇

#offtrck #personalised #techfeed #cybersecurity #gaming #investing
```
**Alt text:** Five interests, each with an arrow to the websites its posts come from, and a bar saying "37 live posts, mixed with ours" with a "4 new posts" button.

---

## 19 · the skill check
**Image:** `posts/19.png`

**Caption**
```
⇄ new: paths

how much do you really know? let's find out in a minute. ⏱

first, tell us how much you think you know. then answer a few quick questions:
✅ get one right → the next one is harder
❌ miss one → the next one is easier
🤷 not sure? tap "no idea yet". no guessing needed

5 questions at most. every answer comes with a one-line "why".

try this one: a video call keeps going even when a few packets get lost. does it use tcp or udp? 👇

#offtrck #skillcheck #networking #learnnetworking #ccna #quiz
```
**Alt text:** A skill check question about video calls, with "udp" marked correct, a dashed "no idea yet" option, and progress dots for five levels.

---

## 20 · your result
**Image:** `posts/20.png`

**Caption**
```
your result isn't a grade. it's a starting point. 📍

the skill check shows:
→ how many stages you already know (we skip them)
→ where you are on the path
→ your next 3 steps, with one button each

steps can be our lessons, games and labs, or the best free courses online. lessons tick themselves when you finish them. tick the rest yourself, and your path moves forward.

no more "where do i even start?" 🙌

#offtrck #roadmap #learningpath #networking #studytips #learnbydoing
```
**Alt text:** A result of 2 out of 5, a line of five stages with "you" on stage 3 (hands-on), and three next steps: tcp vs udp, ports and port rush.

---

## 21 · 6 roadmaps
**Image:** `posts/21.png`

**Caption**
```
6 roadmaps. 5 stages each. 🗺

⇄ networking → network engineer
! cybersecurity → penetration tester
db data → data analyst
₹ money → financial planner
Σ accounting → accountant
# marketing → social media manager

every path goes curious → basics → hands-on → builder → pro.
each stage tells you what you'll be able to do when it's done, and every path ends with the jobs it can lead to.

you'll see the paths that match the interests you picked. tag someone who needs a roadmap 👇

#offtrck #careerintech #roadmap #cybersecurity #dataanalytics #digitalmarketing
```
**Alt text:** Six roadmap cards (networking, cybersecurity, data, money, accounting, marketing), each with five stage dots and an example job.

---

## 22 · your next step, in stories
**Image:** `posts/22.png`

**Caption**
```
your next step now shows up in your stories. 📲

tap your path bubble and you'll see:
📍 where you are on the path
👣 your next 3 steps, each with a "start now" button
🧠 a question from your next level, to see if you're ready

finish a step and the story changes with you.

one small step a day is all it takes. 🔁

#offtrck #dailylearning #habits #learningpath #stories #learntech
```
**Alt text:** A story screen showing "next step 1 of 3: read: tcp vs udp" with a "start now" button, next to story bubbles for networking and security.

---

## 23 · all new, all free
**Image:** `posts/23.png`

**Caption**
```
all new. all free. 🟢

✅ terminal mode for laptops and tablets
✅ a live feed, picked by your interests
✅ 6 roadmaps with a 1-minute skill check
✅ your next step, right in your stories

take the skill check today and see where you land. then share your stage in the comments 👇

link in bio 🔗

#offtrck #learntech #techeducation #freecourse #roadmap #terminal
```
**Alt text:** A terminal running "path check security" with the result "you already know 3/5 stages", the words "all new. all free.", a checklist of the four new features and a "try it now" button.

---

## Series 3 · new games

9 posts, in posting order: an intro (24), one post per game (25–30), games in the feed (31), and a recap (32).

**Suggested schedule:** one post a day. If you'd rather post fewer, the shortest version is 24, 25, 28, 31 and 32. Posts 25–30 work well as a carousel too.

---

## 24 · 6 new games
**Image:** `posts/24.png`

**Caption**
```
6 new games just dropped. 🎮

🧐 myth or fact? swipe on tech myths
🔓 crack it? would a hacker guess this password?
🔥🧱 emoji decode: read tech in emoji
⚡ lag test: is it your wifi, or is it you?
🤖 binary blitz: flip bits against the clock
💸 money time machine: guess what your money grows into

every game starts with a 30-second refresher, so you're never lost. that's 16 games in total now.

which one are you playing first? 👇

#offtrck #learnbyplaying #edtech #techgames #cybersecurity #moneytips
```
**Alt text:** Six game cards with photos: myth or fact, crack it, emoji decode, lag test, binary blitz and money time machine.

---

## 25 · myth or fact?
**Image:** `posts/25.png`

**Caption**
```
"incognito mode hides what i do from the wifi owner."

myth. ❌

incognito only stops your own device from saving history. the wifi owner, your school or your office can still see which sites you visit.

myth or fact? is a new swipe game with 10 tech claims you've definitely heard before:
📶 more bars = faster internet?
🔒 the padlock means a site is safe?
🍎 macs can't get viruses?

swipe left for myth, right for fact. every card tells you why.

tag the friend who still believes one of these 👇

#offtrck #mythbusting #techmyths #privacy #internetsafety #didyouknow
```
**Alt text:** A swipe card saying "incognito mode hides your browsing from the wifi owner", stamped "myth", with an explanation underneath.

---

## 26 · crack it?
**Image:** `posts/26.png`

**Caption**
```
P@ssw0rd! looks clever. a cracking tool guesses it in under a second. 🔓

crack it? is a new swipe game: would a hacker crack this password, or not?

what you'll learn:
❌ names + birth years are the first thing attackers try
❌ swapping letters for symbols doesn't fool anyone
❌ one password on 20 sites = one leak unlocks all 20
✅ 4 random words beat 8 "clever" characters

be honest, how many of your passwords are weak? 👀

#offtrck #passwords #cybersecurity #staysafeonline #infosec #securityawareness
```
**Alt text:** A swipe card with the password "P@ssw0rd!" stamped "weak", and a note saying four random words are stronger.

---

## 27 · emoji decode
**Image:** `posts/27.png`

**Caption**
```
🐴🎁 = ?

if you said trojan, you speak fluent tech. 🧠

emoji decode is a new game: you see a few emojis, and you pick the tech or money word they spell out. 10 rounds. keep your streak alive. 🔥

try these in the comments:
🎣📧
🐂📈
🦄🚀

drop your answers 👇 (no googling)

#offtrck #emojichallenge #emojiquiz #techwords #cybersecurity #funlearning
```
**Alt text:** The emojis horse and gift, with four answers (firewall, trojan, cookie, phishing). Trojan is marked correct.

---

## 28 · lag test
**Image:** `posts/28.png`

**Caption**
```
blaming the wifi again? 🎮

lag test is a new game: wait for the screen to turn green, then tap as fast as you can. 5 tries.

then we compare you to ping:
📶 good wifi ping: around 20–50 ms
🧠 a human reaction: around 200–300 ms

so most of the "lag" is… your brain. 😄 (sorry.)

along the way you'll learn what ping actually is, and why it matters in online games.

post your score 👇 under 200 ms and you're a pro.

#offtrck #gaming #reactiontime #ping #lag #gamers
```
**Alt text:** A big green "tap!" button, with bars comparing a 248 ms reaction time to a 30 ms wifi ping.

---

## 29 · binary blitz
**Image:** `posts/29.png`

**Caption**
```
computers only know 0 and 1. can you think like one for 45 seconds? 🤖

binary blitz is a new game:
1️⃣ you see a number, like 42
2️⃣ flip the bits so they add up to it (32 + 8 + 2 ✓)
3️⃣ match as many as you can before time runs out

each bit is worth 128, 64, 32, 16, 8, 4, 2 or 1. that's it, that's binary.

fun fact: every ip address is just four of these. 192 = 11000000.

what's your score? 👇

#offtrck #binary #learntocode #computerscience #networking #brainteaser
```
**Alt text:** The number 42 with eight bit tiles below it. The tiles worth 32, 8 and 2 are switched on, and they add up to 42.

---

## 30 · money time machine
**Image:** `posts/30.png`

**Caption**
```
you invest ₹10,000 at 12% a year. what is it worth after 20 years? 💸

a) ₹34,000
b) ₹96,500
c) ₹67,500
d) ₹1,54,000

answer: b. most people guess a. 😅

₹34,000 is what you'd get without compounding. with compounding you earn interest on your interest, and it adds up fast.

quick trick, the rule of 72: divide 72 by the rate to see how many years it takes to double. 12% → about 6 years.

money time machine is a new game with 8 rounds like this. what did you guess? 👇

#offtrck #compoundinterest #personalfinance #investing #moneytips #financialliteracy
```
**Alt text:** A question asking what ₹10,000 at 12% for 20 years grows to, with ₹96,500 marked correct and a note about the rule of 72.

---

## 31 · games in your feed
**Image:** `posts/31.png`

**Caption**
```
games now pop up right in your feed. 🎯

scroll and you'll find:
⚡ quick play posts: answer one question right there in the post
🎮 full games, ready to play

they land in a different spot every visit, so your feed never feels the same. picked "learn by playing"? you'll see them more often.

got one right? tap "another one ↻". want more? "play the full game →".

#offtrck #learnbyplaying #feed #microlearning #edtech #studygram
```
**Alt text:** A feed post called "quick play · crack it?" asking whether "iloveyou" would be cracked, with "weak" marked correct and buttons for another question or the full game.

---

## 32 · play more
**Image:** `posts/32.png`

**Caption**
```
play more. 🟢

✅ 6 new games, 16 in total
✅ quick play right in your feed
✅ every game works in terminal mode too
✅ a 30-second refresher before each one

pick a game, beat your best score, then come back and flex it in the comments 👇

link in bio 🔗

#offtrck #learnbyplaying #techgames #edtech #learntech #funlearning
```
**Alt text:** A terminal solving binary blitz (00101010 = 42), the words "play more.", a checklist of what's new and a "play now" button.
