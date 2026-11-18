# try harder firewall · command list
> lab only · only test machines you own

## the cast
- **Target** — the server we protect (example: 167.99.10.42)
- **Attacker** — our second machine that we scan from (example: 167.99.10.117)

## Target · who am i?
```bash
hostnamectl
ip -br a
ss -tuln | head
```

## Target · listen for knocks
```bash
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0' -n
```

## Target · install the helper tools
```bash
apt-get update && apt-get install -y python3-venv python3-pip
python3 -m venv .venv
source .venv/bin/activate
pip install scapy
```

## Target · if setup breaks
```bash
rm -rf .venv
apt-get install -y python3-venv python3-pip
python3 -m venv .venv && source .venv/bin/activate
```

## Target · start the script (needs admin powers)
```bash
sudo .venv/bin/python firewall_try_harder.py
```

## Attacker · knock on Target's doors
```bash
nmap -p21,22,25,80,443 167.99.10.42
```

## Attacker · read the secret message on the wire
```bash
tcpdump -i eth0 host 167.99.10.42 -A -c 40
```

## Target · check the block list
```bash
iptables -L INPUT -n -v | head
```

## Attacker · after getting blocked
```bash
nmap -Pn -p22,80 167.99.10.42
```

## reset the lab
```bash
iptables -D INPUT -s 167.99.10.117 -j DROP
# or wipe all custom rules (lab only):
iptables -F
```

## plain-English summary
1. listen for “knocks” (quick hello packets)
2. count knocks from each stranger
3. for the first few: pretend every door is open + say “try harder”
4. after too many knocks: put them on the block list for 10 minutes
