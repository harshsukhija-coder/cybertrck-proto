# How hackers map your entire network

[ ] Gaming Mode kind of a thing with cool and suspense music.
[ ] How to create a cool looking network
[ ] Cool looking tables

## Theory

### Introduction

* Every network reveals secrets if you know how to listen

### Problem Statement

* There is a employee `Friday`
* Working in a startup
* In his network there are handful of devices
* Every device on the network leaves a trace
  * Its Ip Address
  * Open ports / doors
  * Services + Version (software it runs)
  * Operating System
* Network is not a myesty, its an open map

### Starting

* * There is a ethical hacker named `Ramesh` who is an ethical hacker

## Characters

### Friday

* 23, junior developer at `chaibyte`, a 12-person startup (and one very tired coffee machine)
* Officially writes code. Unofficially "the IT guy", because he once fixed the wifi by restarting the router
* Curious, a bit panicky, knows nothing about networks. He asks the questions the learner would ask
* Intro meme: IT Crowd "have you tried turning it off and on again?" (`turn-it-off-and-on.gif`)

### Ramesh

* 27, Friday's college senior, ethical hacker
* Companies pay him to break into their systems legally, so the bad guys can't
* Calm, funny, explains things with simple real-life examples (network = street, device = house)
* Intro meme: kid hacking on a toy laptop (`toy-laptop-hacker.gif`), "how ramesh thinks he looks while hacking"

## Storyline

### Chapter 1: The unknown device

1. Intro: "every network reveals secrets, if you know how to listen"
2. Meet Friday, the accidental IT guy
3. The problem: the boss asks why the wifi is slow and who `DESKTOP-X7Q` is. Nobody knows that device
4. Friday calls Ramesh. Ramesh explains what an ethical hacker is
5. Ramesh explains that every device leaves a trace: IP address, open ports, services + version, operating system
6. Friday realises anyone on the wifi can see all of this
7. Ending: "a network is not a mystery, it's an open map. nmap is how we read it." Goal: find out who `DESKTOP-X7Q` is

8. Quiz: 10 questions on chapter 1. 90% (9/10) is needed to unlock chapter 2. Below that: `retry` the quiz or `restart` the chapter
9. On passing: glitch transition into chapter 2

### Chapter 2: Your first scan (in progress)

* Opening written: Ramesh explains what `192.168.1.0/24` means (256 addresses on one street)
* Next: the learner runs their first scan with Ramesh's help, and finds `DESKTOP-X7Q` in the results

## Practical

* How to map this tutorial interactive and give credits on completing this course
  * We can make them submit the full scan
  * We need to analyse the full scan and make them answer questions based on that scan (questions can be static but answer need to be dynamic)
  * We need to make a parser
    * For this we need learning scan files and how they differ version to version (Hardest part of the tutorial)
