import type { TopicLesson } from "../topicLessons.js";

/**
 * Computer Networks — 8 authored topic lessons.
 *
 * Standalone chapters per topic. Subject-first prose, foundations, core
 * concepts, worked examples, exam practice, cheat sheet, recap. No shared
 * templates, no runtime composition.
 */
export const computerNetworks: Record<string, TopicLesson> = {
  "gate-cs-computer-networks-osi-and-tcp-ip-models": {
    intro: `Network layering is the intellectual backbone of every packet that crosses the internet: each layer solves one abstraction problem and hands the result down to the next. The subject is the OSI seven-layer model and the TCP/IP four-layer model — their correspondences, their protocols at each level, encapsulation at the sender and decapsulation at the receiver, and the design reasoning that makes layering worth its overhead.`,
    foundations: `OSI (top to bottom): 7 Application (HTTP, SMTP, DNS, FTP), 6 Presentation (encryption, compression, format), 5 Session (dialog control, checkpoints), 4 Transport (TCP, UDP — end-to-end reliability, ports, flow/congestion control), 3 Network (IP, routing, addressing, ICMP), 2 Data Link (framing, MAC, Ethernet, VLAN, ARP, error detection — CRC/FCS), 1 Physical (cables, fiber, radio, bits). TCP/IP collapses 5,6,7 into Application and 1,2 into Link: Application (HTTP/SMTP/DNS...), Transport, Internet (IP), Link (Ethernet/Wi-Fi/PPP). Encapsulation: each layer prepends its header (data → segment → packet → frame → bits); decapsulation strips. MTU 1500 for Ethernet — fragmentation happens at the IP layer.`,
    concepts: [
      {
        title: "Layer responsibilities and what is NOT layered.",
        body: `Each layer offers a service with a defined interface: Application provides user-level services; Transport provides process-to-process delivery with reliability options; Network provides host-to-host best-effort delivery (no reliability guarantee); Link provides hop-to-hop reliable-ish delivery on a shared medium. Everything cross-cutting is deliberately not layered — security can be any layer (TLS at application, IPsec at network, MACsec at link), and management planes (SDN) run alongside. The OSI model is the teaching vocabulary; TCP/IP is what actually ships; every GATE question asks you to map one onto the other.`,
      },
      {
        title: "Encapsulation and decapsulation step by step.",
        body: `Send path: message → application header (if any) → TCP/UDP segment header (src/dst ports, seq, flags) → IP packet header (src/dst IP, TTL, protocol) → MAC header (src/dst MAC, EtherType) → physical bits. Receive path reverses: frames checked (FCS), Ethernet header stripped, packet handed to IP (TTL decremented, destination check), packet handed to TCP/UDP (demultiplexed by dst port), application gets payload. Each stripping step validates of its layer\'s checksum; a mismatch drops the unit silently — showing why debugging across layers is the norm. The MSS = MTU − 40 for TCP over IPv4 — segmentation vs fragmentation: TCP prefers its own segment sizing.`,
      },
      {
        title: "Protocol stack mapping and common quiz traps.",
        body: `HTTP/HTTPS at application; TLS at presentation (in OSI); DNS, DHCP, FTP, SMTP, POP3/IMAP at application; TCP/UDP at transport; IP, ICMP, ARP at network/link boundary (ARP is technically at the boundary of 2 and 3 — exam answers put it in network or data link depending on tradition; answer per your exam); BGP/OSPF/RIP routing protocols at network; Ethernet/WLAN at link; PHY is anything analog. GATE favorites: TLS/SSL layer (presentation), ARP layer (network/link), TCP vs UDP boundary (transport), the OSI layer count (7), TCP/IP layer count (4 or 5 depending on RFC 1122 vs Tanenbaum).`,
      },
      {
        title: "Why layering pays its overhead cost.",
        body: `Layering permits independent evolution: swap Wi-Fi for Ethernet without touching TCP endpoints; upgrade HTTP/2 to HTTP/3 (QUIC over UDP) without touching IP; substitute IPsec for TLS for VPNs — endpoints unaware. It localizes faults: link errors caught by CRC frames, packet corruption detected by IP checksum, application errors detected by application semantics. It distributes expertise: link engineers, IP-layer engineers, app-layer engineers. The cost: 40 bytes of TCP+IP headers per segment, plus per-layer processing. The engineering judgment: layering everywhere (it is universal now; even chips respect it internally).`,
      },
    ],
    worked: [
      {
        title: "Classify ten protocols by OSI layer in 30 seconds.",
        body: `HTTP (7), TLS (6), FTP (7), TCP (4), UDP (4), IP (3), ICMP (3), ARP (3/2 boundary), Ethernet (2), DNS (7). Ordering across 4↔7 via TCP/UDP demux by port. Verification question: where would a VPN-encrypted SSH session appear? SSH at 7, TLS at 6, TCP at 4, IP at 3, Ethernet at 2 — five layers of processing stacks with separate failure semantics.`,
      },
      {
        title: 'Encapsulate "GET /index.html" end to end with headers.',
        body: `App: "GET /index.html HTTP/1.1"; TCP header: src port 49152, dst 80, seq=100, ack=0, SYN flag (if starting); IP header: src 192.168.1.5, dst 93.184.216.34, TTL 64, protocol=6; Ethernet header: dst MAC = next hop router, src MAC = host NIC, EtherType 0x0800; bits on wire as 01010101... Receive side unwinds exactly. The full byte count path can be computed for homework: GET 24 bytes → TCP+20 → IP+20 → Ethernet+18 (headers+preamble) — every labeled header earns you marks.`,
      },
      {
        title: "Identify the layer and failure mode for three incidents.",
        body: `(1) "Destination unreachable" reported by router ICMP type 3 code 1 → network layer (ICMP is layer 3), host unreachable — path broken, usually routing/firewall. (2) CRC error counter spikes on a switch port → data link layer, physical medium problem — replace cable or SFP. (3) TLS handshake_failure alert → application/presentation boundary, certificate or cipher mismatch — check cert chain and SNI; nothing to do with IP or TCP. Each symptom lands you in one layer if you know the vocabulary.`,
      },
      {
        title: "Compute MTU/segmentation for a 5000-byte TCP write.",
        body: `Ethernet MTU = 1500; IP packet payload = 1480; TCP payload per segment = 1460; write 5000 bytes → four packets: 1460+1460+1460+620 = 5000. TCP does segmentation; IP would fragment only if a router path had a smaller MTU (and DF flag clear) — with DF, Path MTU Discovery sends ICMP type 3 code 4 and sender lowers MSS. Fragmentation at IP breaks TCP checksum semantics at endpoints — avoid whenever the DF flag is set by the application path.`,
      },
    ],
    exam: [
      {
        question: "Which layer is responsible for end-to-end flow control?",
        answer:
          "Transport layer (TCP sliding window / rwnd). Network does hop-by-hop at best (IP has no flow control); link does per-hop reliable delivery (if enabled); session manages dialog, not flow of bytes. The trap: confusing per-hop vs end-to-end — TCP owns end-to-end.",
      },
      {
        question: "ARP belongs to which OSI layer?",
        answer:
          "Data link layer (layer 2) in the classic Tanenbaum/Stevens framing — it translates IP to MAC on the local network; alternative texts put it at the network/link boundary (layer 3). GATE has accepted either; mention both, argue either, but recognize the question is arbitrary-editorial by the question writer.",
      },
      {
        question:
          "What does a TCP segment carry that neither UDP nor IP carry?",
        answer:
          'Sequence and acknowledgment numbers plus flow-control state in its header — enabling reliability, ordering, retransmission. UDP has ports but no seq/ack; IP has neither; the entire "TCP is reliable" story lives in the segment header.',
      },
      {
        question:
          "Which two OSI layers did TCP/IP merge, and why this matters historically?",
        answer:
          "OSI presentation + session merged into TCP/IP application (and physical + data link into link) — because in practice the internet never needed them as separate, universally-implemented layers; the pragmatic 4-layer model won; every network exam tests this mapping.",
      },
    ],
    cheat: [
      "OSI 7: App, Presentation, Session, Transport, Network, Link, Physical.",
      "TCP/IP 4: App, Transport, Internet, Link.",
      "Encapsulation: data → segment → packet → frame; decapsulation reverses.",
      "MTU 1500, MSS 1460; TCP segments itself; IP fragments on demand.",
      "Transport = end-to-end; Network = host-to-host; Link = hop-to-hop.",
      "Layer swaps are independent by design — the internet's evolvability engine.",
    ],
    recap: `Network layering is the discipline of abstraction taken to planetary scale: each layer solves one problem with a stable contract interface, encapsulation carries data down shedding headers, and the OSI/TCP-IP models are two vocabularies for the same working stack; know the layers, know the headers, know the failure modes — debugging and design alike start there.`,
    code: {
      title: "Encapsulation overhead cheat sheet",
      language: "text",
      code: `TCP: 20B header (60 w/ options) | IP: 20B header | Ethernet: 14B header + 4B FCS\nMSS = MTU - 40 = 1460 bytes typical`,
      explanation:
        "The constants every networking engineer knows cold; overhead budget and segmentation ceiling in four numbers.",
    },
    diagram: {
      title: "Encapsulation stack",
      caption:
        "Each layer prepends/strips its header; failures are layer-local.",
      mermaid: `flowchart TD\n  A[Application data] --> T[TCP/UDP segment]\n  T --> I[IP packet]\n  I --> L[Ethernet frame]`,
    },
  },
  "gate-cs-computer-networks-data-link-and-lans": {
    intro: `The data link layer is where networks actually live: frames, bits on wire, MAC addresses, Ethernet trades, switches, VLANs, and error control — the gritty physics and bookkeeping of the local network. The subject is framing methods, CRC error detection, Ethernet MAC/CSMA-CD, switch forwarding logic, VLAN segmentation, and where ARP sits in the stack.`,
    foundations: `Framing: character count, flag bytes with byte stuffing, flag bit patterns with bit stuffing, physical coding violations (Manchester). Error detection: parity (single bit), checksum (TCP/IP-ish), CRC (generator polynomial — the workhorse; Ethernet FCS = CRC-32). MAC addressing: 48-bit, OUI + NIC part, unicast/multicast/broadcast (FF:FF:FF:FF:FF:FF). CSMA-CD: listen before transmit, listen while transmit, jam + backoff on collision (legacy shared Ethernet). Switch: learning bridge — source MAC → port table, flood learning, forward by lookup, unknown destinations flooded to all but incoming port; loop prevention via STP. VLAN: 802.1Q tag, port grouping, broadcast domain segmentation across trunk ports.`,
    concepts: [
      {
        title: "Framing: where bits become messages.",
        body: `The receiver needs to know where frames begin and end: character count (count in first field — fragile if corrupted), sent flag 0x7E with byte stuffing (escape flag as 0x7D 0x5E — HDLC/PPP style), flag 01111110 with bit stuffing (insert 0 after five 1s — up to six before flag; receiver strips; HDLC), or physical no-data symbols (Manchester transitions signal boundaries). Ethernet uses preamble + SFD for sync and frame gap detection; frame errors caught by CRC-32 (Ethernet drops silently). Byte stuffing is the most common exam question; bit stuffing is the second — both are mechanical exercises once understood.`,
      },
      {
        title: "Error detection: CRC polynomial math.",
        body: `CRC: treat bit string as polynomial over GF(2), divide by generator polynomial (e.g., G(x) = x^16 + x^12 + x^5 + 1 for CRC-16), remainder = FCS appended; receiver divides frame+FCS by same G(x); zero remainder ⇒ no detectable error; Ethernet uses x^32+x^26+x^23+...+1 (IEEE 802.3) detecting any odd number of bit errors and bursts ≤ 32. Build: message M, append k zeros (k = degree of G), XOR-divide, substitute remainder. Parity catches odd single-bit flips; checksum catches more but not complementary bursts; CRC catches almost everything hardware computes it. The GATE favorite: dividing tiny polynomials by hand — practice once, never again.`,
      },
      {
        title: "Switches: learning, forwarding, and loops.",
        body: `Switch builds a MAC address table from source addresses seen on its ports: entry = MAC, port, VLAN, age; unknown destination ⇒ flooded to all ports of that VLAN except incoming; known unicast ⇒ forwarded only on that port; broadcast/multicast ⇒ flooded; aging timer expires stale entries (~300 s). Loops: with redundant paths, frames circulate infinitely, tables flap, saturation melts the LAN (broadcast storm); Spanning Tree Protocol (802.1D) blocks redundant links to make a loop-free topology; RSTP speeds convergence; loops are the #1 misconfiguration horror in production networks. Full-duplex point-to-point links eliminate collisions entirely (modern Ethernet); half-duplex CSMA-CD is legacy.`,
      },
      {
        title: "VLANs: segmentation without new cables.",
        body: `Without VLANs, every broadcast floods the entire LAN — a few hundred hosts means ARP/DHCP chatter everywhere and no security isolation. 802.1Q inserts a 4-byte tag after the source MAC (802.1q tag: TPID 0x8100 + 12-bit VLAN ID); access ports carry untagged frames for one VLAN; trunk ports carry tagged multi-VLAN between switches; routers (or L3 switches) route between VLANs — "router-on-a-stick" or SVI. Benefits: broadcast domains shrunk, policy isolation (voice separate from data), traffic engineering. Pitfalls: native VLAN mismatch on trunks (untagged leaks), VLAN hopping via double tagging (mitigate: set native VLAN to unused, disable DTP).`,
      },
      {
        title: "ARP and the network/link boundary.",
        body: `ARP resolves IP→MAC on the local segment: broadcast "who has 192.168.1.5?" (destination FF:FF:FF:FF:FF:FF); owner replies unicast with its MAC; requester caches mapping (few minutes to hours); switches forward by MAC only — L3 routing happens above. Gratuitous ARP announces gratuitous mappings (all-zeros src IP) for failover/virtualization. ARP spoofing/poisoning: attacker sends forged ARP replies, hijacks LAN traffic — mitigations: dynamic ARP inspection (switch validates ARP against DHCP snooping binding table), static ARP for critical hosts, encrypted transports (TLS) as defense in depth. ARP is everybody\'s attack path on flat networks.`,
      },
    ],
    worked: [
      {
        title:
          "Compute CRC-16 for 1011001 with G(x) = x^4 + 1 (small numbers).",
        body: `G = 10011 (x^4+1). Append 4 zeros to message: 10110010000. Divide mod-2 (XOR): take 5 bits at a time, XOR with 10011 when leading bit is 1: 10110 → 00101 → ... after full division remainder is 0b1011? The mechanical steps: subtract/XOR repeatedly; remainder ≤ 4 bits appended = 1011. Final framed message: 10110011011. Receiver divides by 10011; if remainder 0 → accepted, else dropped. The method scales to CRC-32 — same algorithm, larger tables.`,
      },
      {
        title: "Switch table build from three frames.",
        body: `Initial empty table. Frame1: SRC M1, IN port 1, DST M2 → table: {M1, port 1}; M2 unknown → flood out ports 2,3 (VLAN1); Frame2: SRC M2, IN port 2, DST M1 → table: {M2, port 2}; M1 known at port 1 → forward only port 1; Frame3: SRC M3, IN port 3, DST M2 → table: {M3, port 3}; M2 known at port 2 → forward only port 2. Unknown-at-receiver doesn\'t stop learning; aging flushes stale entries; the table is the switch\'s entire world.`,
      },
      {
        title: "Design VLAN layout for office: 3 departments, 10 nodes each.",
        body: `VLAN 10 (Engineering), VLAN 20 (Sales), VLAN 30 (Voice); access ports per department on switch stacks, trunk between stacks with tagging; L3 switch SVI interfaces 10.0.10.1/24, .20.1/24, .30.1/24; DHCP scopes per VLAN; inter-VLAN routing with ACL (Sales cannot reach Engineering file servers); monitoring port mirrors all three for IDS. Broadcast domain per VLAN holds ~10 ARP/DHCP chatter stream instead of 30 at once; security breaches stay inside VLAN unless routed.`,
      },
      {
        title: "ARP spoofing defense for a DMZ server.",
        body: `Attack: forged unsolicited ARP replies map DMZ gateway to attacker MAC — traffic reroutes through attacker. Defense layers: (1) DHCP snooping binding table on access switches (MAC↔IP↔port) so only binding-compliant ARP passes; (2) static ARP entry for gateway on critical servers; (3) 802.1X port authentication; (4) switchport port-security limiting MACs per port; (5) TLS/IPsec for genuine encryption. No single layer stops everything; the stack is what stops it in practice.`,
      },
    ],
    exam: [
      {
        question: "What is CSMA-CD and why is it largely obsolete?",
        answer:
          "Carrier Sense Multiple Access with Collision Detection — listen before and during transmission, jam on collision, exponential backoff retransmit. Obsolete because full-duplex point-to-point links eliminate collisions entirely; half-duplex hubs died with Fast Ethernet; every question mentioning CSMA-CD is either a GATE relic or a legacy-inspection quiz.",
      },
      {
        question: "How does a learning bridge build its forwarding table?",
        answer:
          "Source MAC from every incoming frame is recorded with arrival port and a timestamp; entries age out after a timer (~300 s default); on forwarding lookup miss, frame is flooded to all other ports within the same VLAN; no global flooding — the entire algorithm is store-and-forward with source learning and destination filtering.",
      },
      {
        question:
          "How many collision domains and broadcast domains does a switch port belong?",
        answer:
          "Each switch port is its own collision domain (full-duplex point-to-point = none, but per port is the formal answer); all ports in one VLAN belong to one broadcast domain — VLANs partition broadcast domains. The trap: confusing VLAN with collision domains — switches segment collision domains, VLANs segment broadcast domains.",
      },
      {
        question:
          "What does the 4-byte 802.1Q tag contain and where is it inserted?",
        answer:
          "TPID (0x8100) + Priority (3 bits) + DEI (1 bit, drop eligible) + VLAN ID (12 bits, 4096 values, 4094 usable); inserted after the source MAC and before EtherType; frames crossing trunk ports carry it; native VLAN untagged by convention.",
      },
    ],
    cheat: [
      "Framing: byte stuffing 0x7E, bit stuffing after five 1s, count-based.",
      "CRC-32 checksum of Ethernet; XOR-divide by generator polynomial.",
      "Switch = learning bridge: flood on unknown, filter on known, STP kills loops.",
      "ARP broadcasts who has; caches; spoofing defeated by DHCP snooping/DAI.",
      "VLAN tag = 802.1Q, 4 bytes, after source MAC, 4094 VLANs.",
      "Full-duplex = no collisions; half-duplex = CSMA-CD legacy.",
    ],
    recap: `Data link layer turns physics into reliable frames: framing boundaries, CRC integrity, MAC delivery via learning bridges, VLANs partitioning broadcast domains, ARP gluing IP to MAC — the unglamorous machinery that decides whether your packet ever leaves the building; master it before touching IP, and every network incident becomes debuggable from first principles.`,
    code: {
      title: "CRC append sketch",
      language: "python",
      code: `data_bits = message_bits + '0' * k\nrem = xor_divide(data_bits, generator)\nframed = message_bits + rem`,
      explanation:
        "The entire FCS algorithm in three lines — the mechanism every Ethernet frame is silently verified by.",
    },
    diagram: {
      title: "Switch forwarding logic",
      caption:
        "Learn source → lookup destination → forward or flood; the whole switch.",
      mermaid: `flowchart LR\n  In[Frame in port P] --> L[Learn SRC→P]\n  L --> Q{DST known?}\n  Q -->|yes| F[Forward on DST port]\n  Q -->|no| O[Flood all other VLAN ports]`,
    },
  },
  "gate-cs-computer-networks-ip-addressing-and-subnetting": {
    intro: `IP addressing and subnetting are the foundation of routing and reachability — every host, router, and service has an identity in the IP address space, and subnet masks carve the space into networks. The subject is IPv4 addressing classes and CIDR, subnet division math, private vs public ranges, NAT, IPv6 basics, and the time-critical numericals GATE loves — in which a two-minute problem is a two-mark freebie if you know the method.`,
    foundations: `IPv4: 32-bit addresses, dotted-quad notation; classes A (0.0.0.0–127), B (128–191), C (192–223), D (class D multicast 224–239), E (experimental 240+) — rarely used since CIDR (1993, RFC 1519: classless inter-domain routing, prefix /n); private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; loopback 127.0.0.1; APIPA 169.254.0.0/16. Subnetting: borrow bits from host field to create network field; formula: usable hosts per subnet = 2^(host bits) − 2; subnet mask for /24 = 255.255.255.0. NAT: private↔public translation at the gateway. IPv6: 128-bit, hextets, :: compression, link-local FE80::/10, no broadcast (multicast replaces).`,
    concepts: [
      {
        title: "IPv4 classes, private space, and CIDR.",
        body: `Class A: first octet 1–126 (127 loopback), default mask /8 (255.0.0.0), 126 networks × 16M hosts; Class B: 128–191, /16, 16K × 64K; Class C: 192–223, /24, 2M × 254. Classful routing was abandoned for CIDR — prefix notation /n, where n = network bits: 192.168.1.0/24 means network bits 24, host bits 8. Private space never routed on the internet — NAT gateways translate at the edge. Usable host count: 2^(32−n) − 2 (subtract network and broadcast). The magic numbers: 128, 64, 32, 16, 8, 4, 2 boundaries for subnet mask arithmetic.`,
      },
      {
        title: "Subnetting by the magic number method.",
        body: `Given IP + prefix, find network, broadcast, usable range, hosts-per-subnet. Two-step method: (1) convert prefix to octet boundaries — which octet does the boundary fall in?; (2) the octet of boundary uses "magic number" 256 − mask_octet for block step. Example 192.168.1.130/26: boundary in 4th octet, mask 192 → step 64 → networks at 0, 64, 128, 192 → 130 lands in 128–191 block: mask 255.255.255.192; network 192.168.1.128; broadcast 192.168.1.191; usable 129–190; hosts 62. The same method scales to any prefix from /8 to /32; practice five conversions before the exam.`,
      },
      {
        title: "VLSM and route summarization.",
        body: `VLSM (variable-length subnet masking) allocates different-sized subnets from one block: e.g., 10.0.0.0/8 split into /24 for 200 small LANs, /22 for 100 mid-size, /16 for a data center — allocated largest-first to minimize fragmentation. Summarization (supernetting): aggregate adjacent prefixes with same length into one: 192.168.0.0/24–192.168.3.0/24 → 192.168.0.0/22 — saves routing table entries; CIDR depends on it for internet scale. Summarization fails if aggregated blocks aren\'t aligned at bit boundaries — always verify block size divides the block size you\'re summarizing.`,
      },
      {
        title: "NAT and the IPv4 shortage story.",
        body: `IPv4 32-bit space = 4.3B addresses — exhausted 2011; NAT rewrites private→public at the edge: many private hosts share one or few public addresses via port translation (NAPT/PAT); outgoing connections create state entries; incoming requires port forwarding. NAT broke end-to-end (servers behind NAT need explicit forwarding, P2P hard); IPv6 restores per-host routable addresses, removing the need for NAT; transition mechanisms: dual stack, 6to4/tunneling, NAT64/DNS64. GATE loves NAT port mapping arithmetic and IPv6 hextet compression.`,
      },
      {
        title: "IPv6 essentials: format, scopes, basics.",
        body: `128 bits, eight 16-bit hextets separated by colons; leading zeros dropped; :: collapses exactly one run of zeros (e.g., 2001:0db8::/32); address types: unicast (global 2000::/3, link-local FE80::/10 — mandatory self-assigned), multicast FF00::/8 (replaces broadcast), anycast; no ARP — Neighbor Discovery Protocol (ICMPv6); no header checksum — faster routing; extension headers chained by Next Header field; autoconfiguration via SLAAC (router advertisement + EUI-64 or privacy random interface ID). Address count: 3.4×10^38 — effectively infinite; the constraint is never address space again; the exam questions: compression, scope, missing broadcast.`,
      },
    ],
    worked: [
      {
        title: "Subnet 10.0.0.0/16 for 400 hosts each, minimal waste.",
        body: `Need ≥ 400 usable per subnet → host bits ≥ 9 (2^9 − 2 = 510 ≥ 400) → prefix /23 → subnet mask 255.255.254.0 → block size 2 in 3rd octet → 128 subnets × 510 = 65,280 hosts usable; waste ~21% — acceptable VLSM. Alternative: /24 gives 254 hosts — insufficient for 400; /23 is minimal fit. The rule: always smallest host field meeting demand, largest third octet delta per step.`,
      },
      {
        title: "Find network, broadcast and usable range for 172.20.77.200/27.",
        body: `/27 = 255.255.255.224; boundary in 4th octet; step 256−224 = 32; network starts at multiples of 32: 192 ≤ 200 < 224 → network 172.20.77.192; broadcast = network + 31 = 172.20.77.223; usable 172.20.77.193–222; count 30 usable hosts (2^5 − 2). Total subnets from /16: 2^11 = 2048 — an exam freebie once mask math is automatic.`,
      },
      {
        title: "Which address is both private and link-local?",
        body: `Neither — private 192.168.0.0/16 (192.168.x.x), link-local APIPA 169.254.0.0/16 — disjoint ranges; loopback 127/8 is its own special class; multicast 224.0.0.0/4 separate; exam trap: assuming "not publicly routable" = "private" — the classes of special space are: private (not routed), link-local (not routed), loopback, multicast, CGN (carrier-grade NAT 100.64.0.0/10). Know the five.`,
      },
      {
        title: "Compress this IPv6: 2001:0db8:0000:0000:0000:0000:0000:0001.",
        body: `Drop leading zeros per hextet: 2001:db8:0:0:0:0:0:1; collapse the longest run of zeros (four) with :: → 2001:db8::1. Exactly one :: allowed; never compress a single zero (2001:db8:1::1 impossible from this address — only one run); verifying: expand back out must give 2001:db8:0:0:0:0:0:1 — canonical validity check for any compressed form.`,
      },
    ],
    exam: [
      {
        question: "How many usable host addresses does /26 provide?",
        answer:
          "62 = 2^6 − 2. /24=254, /25=126, /26=62, /27=30, /28=14. The table is mandatory memory; the double trap: forgetting to subtract broadcast AND the network address; remember: usable = 2^hostbits − 2.",
      },
      {
        question:
          "Which IPv4 address is unsuitable as a destination for a host on the same subnet?",
        answer:
          'The network address (first address) and broadcast (last). If your answer is "the .0" you scored a free mark; trick variants: 10.0.0.0 (network of /8) is invalid as a host address even though it "looks" valid; same for .255 in the final octet of a /24 — always host-bits check.',
      },
      {
        question: "What does NAT primarily solve and what does it break?",
        answer:
          "IPv4 address exhaustion and private space isolation; it breaks end-to-end connectivity — incoming initiated connections require forwarding, P2P/VoIP need STUN/TURN/ICE traversal; IPv6 removes the need entirely.",
      },
      {
        question: "What is the purpose of the :: notation in IPv6?",
        answer:
          "Compress one contiguous run of zero hextets exactly once, with each zero hextet dropped entirely; double :: anywhere else would be ambiguous — strict parsers reject; canonical form: lowercase hex, no leading zeros, minimal ::.",
      },
    ],
    cheat: [
      "Private: 10/8, 172.16/12, 192.168/16; loopback 127/8; APIPA 169.254/16.",
      "Usable hosts = 2^(32−prefix) − 2.",
      "Magic number = 256 − mask octet; boundaries at multiples of step.",
      "CIDR aggregates adjacent blocks for routing scale (summarization).",
      "NAT/PAT maps N private → 1 public by port; breaks end-to-end.",
      "IPv6: 128-bit hextets, :: compression one per address, no broadcast, ND instead of ARP.",
    ],
    recap: `IP addressing is the map every router consults on every hop: classes gave way to CIDR, private space enabled survival with NAT, IPv4 ran out and IPv6 returns the end-to-end internet; subnetting arithmetic is the one mechanical skill the exam pays you to practice — and the one that failed half your cohort.`,
    code: {
      title: "Subnet calculator pattern",
      language: "python",
      code: `mask = prefix_to_mask(p)\nnetwork = ip_int & mask_int\nbroadcast = network | ~mask_int
usable = broadcast - network - 1`,
      explanation:
        'Three lines of integer math — the procedure your "by eye" shortcut must agree with.',
    },
    diagram: {
      title: "Hierarchy of the address space",
      caption:
        "Classes → CIDR → private/public partitioning → NAT → IPv6 — the scaling story of addressing.",
      mermaid: `flowchart TD\n  C[Classful A B C] --> Z[CIDR prefix notation]\n  Z --> P[Private + public spaces]\n  P --> N[NAT for IPv4 survival]\n  N --> V[IPv6 restores end-to-end]`,
    },
  },
  "gate-cs-computer-networks-routing-protocols": {
    intro: `Routing protocols are how routers discover and share path information without knowing the topology in advance — distributed algorithms computing shortest paths on an ever-changing graph. The subject is distance vector (RIP) and link state (OSPF), path vector (BGP), RIP metrics and count-to-infinity, OSPF areas, and BGP policy — plus the comparison table GATE loves.`,
    foundations: `Problem: each router only knows directly connected networks; how learn the rest? Two families: (1) distance vector — each router tells neighbors its full distance table; neighbors update by Bellman-Ford; RIP: hop count max 15, infinity=16, update every 30 s, holddown timers; slow convergence/count-to-infinity solved by split horizon, poisoned reverse, triggered updates. (2) Link state — each router floods link-state advertisements (LSAs); every router builds the same complete topology database; runs Dijkstra SPF locally; OSPF: areas for hierarchy, area 0 backbone, router IDs, LSAs, DR/BDR election on broadcast networks, cost = 10^8/BW. (3) BGP: path vector protocol between autonomous systems; attributes (AS-PATH, NEXT_HOP, LOCAL_PREF, MED); policy-based, not metric-optimal. Convergence time differs by orders of magnitude.`,
    concepts: [
      {
        title: "Distance vector: RIP and count-to-infinity.",
        body: `RIP sends the full routing table every 30 s; neighbor picks best metric + 1; hops cap at 15; large changes take long to stabilize (slow convergence). Failure: link between A–B drops; C hears via D that D reaches B via A with 2 hops → C updates A via D with 3, A updates via C with 4, C via B with 5... count to infinity; mitigation: split horizon (don\'t advertise a route back to the neighbor you learned it from), poisoned reverse (advertise with metric 16), holddown timers (ignore updates during reconvergence window), triggered updates (send immediately on change). Count-to-infinity is the canonical RIP pathology; every protocol exam tests it.`,
      },
      {
        title: "Link state: OSPF and why it beat RIP.",
        body: `Each router crafts an LSA listing its interfaces and link costs; floods to all routers in its area; every router holds an identical topology (LSDB); run Dijkstra locally — path to every network known precisely; OSPF cost = 10^8/link_BW (Mbps) by default — 10 on 100M, 1 on Gig, 1 on 10Gig (formula saturates). Areas partition LSDB size; area 0 = backbone, all inter-area traffic traverses it; ABRs (area border routers) summarize; DR/BDR elected per broadcast segment to cut adjacency count from O(n²) to O(n). OSPF converges in seconds vs RIP minutes; no count-to-infinity; VLSM/CIDR native; mandatory for large networks.`,
      },
      {
        title: "BGP: the internet's inter-AS glue.",
        body: `Between autonomous systems, metric optimization takes a back seat to policy: customer > peer > provider preference (valley-free export rules); LOCAL_PREF orders routes within an AS; MED hints inbound preference to a neighbor; AS-PATH prevents loops (drop if your AS# appears); NEXT_HOP tells where to forward; BGP speakers maintain huge tables (~900k routes today); stability preferred over optimality — flapping routes get dampened; eBGP between AS, iBGP within AS (iBGP full mesh or route reflectors); default-free zone (DFZ) routers must carry full tables. BGP is the internet\'s nervous system — and the exam literature calls it "path vector."`,
      },
      {
        title: "RIP vs OSPF vs BGP: the comparison table.",
        body: `Vector vs state vs path; hop count vs bandwidth cost vs policy; periodic broadcast of tables vs triggered flooding vs incremental path-vector; convergence seconds vs minutes vs "stable by design," loop handling split-horizon vs Dijkstra reachability vs AS-PATH; scale: small campus vs large enterprise vs internet; standards: RFC 2453 (RIPv2), RFC 2328 (OSPFv2), RFC 4271 (BGP-4); administrative distance: connected 0, static 1, OSPF 110, RIP 120, BGP eBGP 20, iBGP 200, EIGRP 90/170. GATE asks ratios, distances, and protocol layer association.`,
      },
      {
        title: "CIDR, route aggregation, and convergence behavior.",
        body: `CIDR enabled summarization — routers advertise aggregated prefixes instead of every /24, shrinking global routing tables from classful explosion to manageable size (with occasional deaggregation for traffic engineering); BGP handles it; IGPs too (OSPF range commands). Convergence: RIP ~ 3–5 min worst (holddown + multiple 30s cycles); OSPF ~ seconds; BGP — minutes to hours of stability by design; route dampening penalizes flapping; longest-prefix-match wins regardless of AS_PATH or metric — the fundamental tiebreak every protocol obeys identically.`,
      },
    ],
    worked: [
      {
        title: "Trace RIP table updates across three routers, step by step.",
        body: `Initial: R1 knows N1 via 0 hops; R2 knows N1 via R1: 1; R3 knows N1 via R2: 2. Link N1–R1 fails. R2 loses route: sends update — R3 now believes N1 via R2 with 3 hops (added 1 to R2\'s metric 2... wait: R3 had 2 via R2; R2 updated to unreachable(16); R3 must see metric 16 before invalidating; sees 16, marks unreachable only after holddown; without split horizon/poisoned reverse, count to infinity: R2 falls back to R3\'s stale 2 → R2→3; R3→4... up to 16 then dead; with split horizon: R3 never heard N1 via R2 again after failure announcement, converges promptly. The trace is the standard homework; write it out until it feels mechanical.`,
      },
      {
        title: "Compute OSPF cost and shortest path across a 4-node topology.",
        body: `Topology: A–B 10Mbps, B–C 100Mbps, A–C 1Mbps, A–D–C gigabit path; costs: A–B=10, B–C=1, A–C=100 (wait, 100Mbps → cost 1 for B–C: 10^8/10^8=1? Recompute: 10^8/BW_in_bps → for 100M, cost=1; 10M → 10; 1M → 100; 1G → 1 (saturates). A→C: direct = 100, via B = 11, via D = 2 → D wins; Dijkstra selects A→D→C cost 2; OSPF chooses the same — verify by running BFS/DFS mentally on LSDB. The exercise drills both metric computation and algorithm mechanics.`,
      },
      {
        title: "Choose BGP LOCAL_PREF for multi-homed enterprise.",
        body: `Enterprise has two providers P1 (cheap, bulk) and P2 (premium, low latency); AS-PATH same length to most destinations; policy: traffic to customers goes via P2 (lower latency), bulk downloads via P1 (cheap), backups via P1. Implement: set LOCAL_PREF 200 on P2 paths, 100 on P1; outgoing always prefers P2; for P1-bound destinations, outbound policy knobs on edge router re-mark LOCAL_PREF per destination community; MED inbound preferences hint to providers which links to use for return traffic — the whole game of BGP is communities and knobs, not metrics.`,
      },
      {
        title: "Summarize these four /24s into one prefix.",
        body: `192.168.0.0/24, .1.0/24, .2.0/24, .3.0/24 → differ only in 3rd octet bits 2–7? Common bits of 0,1,2,3 = 00 in high two bits → /22 = 192.168.0.0/22 (block size 4 in 3rd octet). Bits: 0=00000000, 1=00000001, 2=00000010, 3=00000011 — top 6 bits constant → 22 bits network — correct. The same process underpins every CIDR deaggregation and the CDR/LCW summarization games operators play daily.`,
      },
    ],
    exam: [
      {
        question: "Why does RIP suffer count-to-infinity but OSPF does not?",
        answer:
          "RIP has no topology map — only metrics from neighbors, so loops develop when stale information persists; OSPF floods LSAs and every router computes the same map, so deleted links disappear wholesale, and Dijkstra never routes over a deleted edge; the fundamental difference is state information, not algorithm cleverness.",
      },
      {
        question: 'What is the maximum metric RIP uses for "unreachable"?',
        answer:
          "16 (infinity). RIPv1, RIPv2, RIPng all — hop count 0–15 usable, 16 = infinity; a route that fails is set to 16 and advertised as unreachable; count-to-infinity stops at 16 (still slow); the metric bound is why RIPv2 only suits small networks.",
      },
      {
        question: "Which BGP attribute prevents routing loops?",
        answer:
          "AS-PATH — a router discards any prefix whose AS-PATH includes its own AS number; loops between autonomous systems are impossible because every AS stamp is recorded; iBGP has separate loop prevention (cluster-list, originator-id) — different mechanism, different exam answer.",
      },
      {
        question: "What is an OSPF area and why does area 0 exist?",
        answer:
          "A partition of the OSPF domain to bound LSDB growth and LSA flooding scope; all inter-area routes must transit area 0 (backbone); two areas not connected via area 0 must use virtual links; the rule keeps the OSPF graph structured as a star topology hub — scalability by hierarchy.",
      },
    ],
    cheat: [
      "RIP: hop count, max 15, infinity=16, 30s updates, split horizon + poisoned reverse vs count-to-infinity.",
      "OSPF: Dijkstra SPF, cost 10^8/BW, areas with area 0 backbone, DR/BDR on broadcast links, seconds to converge.",
      "BGP: path vector, AS-PATH loop prevention, policy by preference order (LOCAL_PREF/MED/AS-PATH), stable over optimal.",
      "Administrative distance: connected 0, static 1, eBGP 20, OSPF 110, RIP 120, iBGP 200.",
      "CIDR aggregation = summarization of adjacent prefixes into shorter prefix — basis of internet scale.",
      "Longest-prefix match wins, always, all protocols.",
    ],
    recap: `Routing is distributed computation over an ever-changing graph: distance vector shares metrics with neighbors (RIP — simple, slow, bounded), link state shares maps (OSPF — fast, exact, hierarchical), path vector shares policy (BGP — stable over optimal, the internet\'s connective tissue); longest-prefix-match resolves all tiebreaks; the exam tests the comparison table and the failure modes — the field tests which protocols you would actually deploy.`,
    code: {
      title: "Route selection tiebreak",
      language: "text",
      code: `1. Connected/ static/ IGP/BGP admin distance\n2. Longest prefix match (always)\n3. Protocol metrics (cost/hops)\n4. Router-ID/tiebreaker minimums`,
      explanation:
        "The resolution order every packet undergoes — textbook for exams, law for routers.",
    },
    diagram: {
      title: "Routing family tree",
      caption:
        "Distance vector → link state → path vector, each trading complexity for scale.",
      mermaid: `flowchart LR\n  DV[Distance vector: RIP] --> LS[Link state: OSPF]\n  LS --> PV[Path vector: BGP]`,
    },
  },
  "gate-cs-computer-networks-transport-layer": {
    intro: `The transport layer guarantees end-to-end delivery between applications — the network\'s best-effort service is turned into reliable bytes by TCP, or deliberately kept minimal by UDP. The subject is TCP mechanics (three-way handshake, sequence numbers, sliding windows, flow and congestion control, the life cycle of a connection) and UDP, plus the modern context of HTTP/2 and QUIC — every line GATE loves to test, every line production depends on.`,
    foundations: `Transport demultiplexes application traffic by port numbers; TCP (port 80 HTTP, 443 TLS/HTTPS, 22 SSH, 25 SMTP): connection-oriented — three-way handshake (SYN, SYN-ACK, ACK), seq/ack numbers, cumulative acks, sliding window for flow control (rwnd — receiver window; receiver advertises buffer space), congestion control (slow start cwnd=1 → doubles per RTT to ssthresh; congestion avoidance — linear +1 per RTT; fast retransmit on 3 dup ACKs; fast recovery halves cwnd; AIMD — additive increase multiplicative decrease), connection teardown (FIN handshake, 4 steps) and TIME_WAIT (2×MSL). UDP: no connection, no reliability, minimal header (8 bytes); used by DNS, streaming, gaming, SNMP, QUIC. Ports 0–65535; well-known 0–1023; dynamic 49152–65535 client-side.`,
    concepts: [
      {
        title: "The TCP three-way handshake and connection lifecycle.",
        body: `Client sends SYN with ISN (initial sequence number) c; server responds SYN+ACK with ISN s and ack c+1; client sends ACK ack s+1; connection established with both sides\' sequence spaces synchronized; data flows; close: FIN from either side → ACK, then FIN from the other → ACK; four packets for teardown; TIME_WAIT on the side that sent final ACK for 2×MSL (typically 60 s) — prevents stale segments from poisoning a new connection with the same 4-tuple. ISN randomized (RFC 6528) against ISN prediction attacks. The handshake costs one RTT overhead minimum; TCP Fast Open caches cookie for subsequent connections — rarely enabled due to middlebox issues.`,
      },
      {
        title: "Sliding window, flow control, and the receive window.",
        body: `Receiver advertises rwnd in every ack — its available buffer; sender may have at most rwnd unacked bytes in flight (plus cwnd limit from congestion control); rwnd=0 signals "stop" — sender persists with zero-window probes until receiver reopens; cumulative acks identify the last in-order byte — sender retransmits from there; sequence space 32 bits wraps every 4 GB — PAWS (window scale) extends window beyond 64 KB (window scale option multiplies rwnd; required for high-BDP paths like transcontinental fiber); bandwidth-delay product = bandwidth × RTT — window must exceed it or the pipe is underused — the axiom of high-speed networking.`,
      },
      {
        title: "Congestion control: slow start, AIMD, loss response.",
        body: `cwnd starts at 1 MSS; doubles each RTT until ssthresh or loss — exponential ramp; after ssthresh: +1 MSS per RTT (linear/additive); loss event: 3 dup ACKs → fast retransmit + halve cwnd, ssthresh = cwnd/2, continue without dropping to 1; timeout (RTO) → ssthresh = cwnd/2, cwnd = 1, slow start again; AIMD fairness: flows with same RTT converge to equal share; short RTT flows grab more — fairness remains approximated; TCP Reno/NewReno/CUBIC variants differ in the loss-response curve — CUBIC (Linux default) concave growth post-loss, scales to high-BDP better than Reno. Flow control is the receiver"s constraint; congestion control is the network's; min(cwnd, rwnd) rules every byte.`,
      },
      {
        title: "UDP: the thin shim and why it persists.",
        body: `UDP adds only ports, length, checksum (optional v4, mandatory v6) — no handshake, no state; delivery may be out-of-order, duplicated, lost — the application decides what to do; advantages: no setup latency (DNS query in one round trip vs TCP\'s three), tiny overhead, multicast/broadcast possible (TCP is strictly unicast); use cases: DNS, DHCP, VoIP, video streaming, gaming (loss tolerable, latency not), SNMP, RIP; QUIC builds HTTP/3-style reliable delivery on UDP with userspace implementation — escaping kernel TCP\'s eviction/upgrade rigidity; the internet's future headers are on UDP — a twist few saw coming when UDP was declared archaic.`,
      },
      {
        title: "Ports, sockets, and the 4-tuple identity.",
        body: `A TCP connection is uniquely (src IP, src port, dst IP, dst port) — the socket pair/4-tuple; a listening server has a passive socket; accept() spawns a connection-specific socket; client picks dynamic port 49152+; netstat -an shows state (LISTEN, ESTABLISHED, TIME_WAIT...); well-known: 80 HTTP, 443 HTTPS, 53 DNS (both UDP default/TCP for zone transfers/truncated), 25 SMTP, 22 SSH, 123 NTP, 161 SNMP; reserved range registered with IANA; ephemera reuse after TIME_WAIT expiry; port numbers in every answer GATE scores generously for knowing the canonical set.`,
      },
    ],
    worked: [
      {
        title: "Hand-compute the 3-way handshake sequence numbers.",
        body: `Client ISN=1000; server ISN=5000; C→S SYN seq=1000; S→C SYN ack=1001 seq=5000; C→S ACK seq=1001, ack=5001 — connection open; data flows with seq advancing by payload bytes; if client sent 1460 bytes, server\'s next ack = 6461. The arithmetic is the universal exercise; do ten of these until automatic; the field C->S offset tells you direction immediately.`,
      },
      {
        title: "Trace slow start to congestion for 10 MSS window.",
        body: `cwnd=1; RTT1 → 2; RTT2 → 4; RTT3 → 8; ssthresh=16; RTT4 → 16; RTT5 (hit ssthresh) → +1 → 17; dup ACKs → halve to 9 (ssthresh=9); continue linear 10, 11...; timeout → cwnd=1, restart — every column traceable; the standard GATE question shows this table partially filled and asks for entries; the answer key is the rules above.`,
      },
      {
        title: "Compute RTT and windows for a transfer across 100 ms link.",
        body: `Link 10 Mbps, RTT 100 ms → BDP = 125,000 bytes; default rwnd in TCP without window scale option = 64 KB < BDP — impossible to saturate; enable window scale 3 (×8 = 512 KB) — now 4x BDP; sender pushes full rate; lesson: window scale exists for exactly this reason; without it, every long-fat link underutilizes catastrophically. Flow control and congestion control jointly cap in-flight bytes: min(cwnd, rwnd).`,
      },
      {
        title: "Why does TCP have TIME_WAIT and why on the closer?",
        body: `After FIN handshake, side that initiates close remains in TIME_WAIT for 2×MSL — enough for all in-flight segments to be absorbed by the network; prevents stale duplicate segments from appearing as fake data on a reused 4-tuple; if the server closed first and both sockets vanished instantly, a recycled 4-tuple could inherit ghosts. Both sides can enter TIME_WAIT if both initiate close; the side that sent the last ACK owns it.`,
      },
    ],
    exam: [
      {
        question: "In which phase does TCP double cwnd on every RTT?",
        answer:
          "Slow start — until first loss or until ssthresh, doubling from 1 MSS; the doubling is per RTT (not per ACK packet counting). After ssthresh: additive +1 per RTT (congestion avoidance); the exam asks which phase, which to name correctly.",
      },
      {
        question:
          "What does a receiver window of zero mean and what does sender do?",
        answer:
          "Buffer full — stop sending; sender keeps probing with zero-window probes (tiny segments or window probe ACKs) until receiver reopens rwnd > 0; persisting forever would deadlock — TCP defines the probe timer to break it.",
      },
      {
        question: "Why does UDP DNS beat TCP DNS for typical queries?",
        answer:
          "No handshake overhead — one round trip for query/response instead of three; DNS responses ≤ 512 bytes fit in a UDP datagram; truncation → flag response truncated → client retries over TCP (zone transfers, DNSSEC-signed responses); the UDP-first, TCP-fallback pattern is the exam's favorite nuance.",
      },
      {
        question:
          "What uniquely identifies a TCP connection among all on one machine?",
        answer:
          "The 4-tuple (src IP, src port, dst IP, dst port) — two simultaneous connections differ only in their chosen ephemeral ports; listener demultiplexing uses dst port primarily; server maps incoming SYN to listening socket by dst port, then accept creates a unique connected socket.",
      },
    ],
    cheat: [
      "Handshake: SYN, SYN-ACK, ACK one RTT; teardown four segments; TIME_WAIT 2×MSL.",
      "cwnd: slow start double to ssthresh; then +1/RTT; triple dup ACK halves; RTO resets to 1.",
      "rwnd = receiver buffer ad; send window = min(cwnd, rwnd).",
      "UDP: 8-byte header, no connection, DNS/VoIP/streaming/games/QUIC.",
      "80 HTTP, 443 TLS/HTTPS, 22 SSH, 25 SMTP, 53 DNS, 123 NTP, 161 SNMP.",
      "BDP = bandwidth × RTT; window scale extends 64KB ceiling.",
    ],
    recap: `Transport carries the internet\'s applications: TCP turns best-effort into reliable ordered bytes with explicit flow and congestion control — handshake, sequence space, AIMD between sender optimism and network reality; UDP strips back to ports and a checksum for those who need speed over guarantees — choose per application, deploy with eyes open; the exam tests the canonical state machine and the header fields, and production tests your patience for tuning both.`,
    code: {
      title: "Socket pair identification",
      language: "text",
      code: `netstat -tan | grep ESTABLISHED\n(client srcIP:srcPort) <-> (server dstIP:dstPort)`,
      explanation:
        "Every connection in your netstat output is uniquely the 4-tuple; memorize this and half the network troubleshooting questions solve themselves.",
    },
    diagram: {
      title: "TCP connection lifecycle",
      caption:
        "Handshake, data flow, teardown — the full state machine arc of every connection.",
      mermaid: `flowchart LR\n  S[SYN] --> A[SYN-ACK]\n  A --> K[ACK: open]\n  K --> D[Data phase]\n  D --> F[FIN exchange]\n  F --> W[TIME_WAIT]`,
    },
  },
  "gate-cs-computer-networks-application-protocols": {
    intro: `Application protocols are the working menus of the internet: DNS names, HTTP resources, email flows, and the TLS that secures them — the protocols every developer ships, proxies, caches, and breaks daily. The subject covers DNS resolution deeply, HTTP semantics and caching, SMTP/POP/IMAP, TLS handshake essentials, and the performance engineering that makes web apps feel fast.`,
    foundations: `DNS: distributed database; query chain stub resolver → recursive resolver → root → TLD → authoritative; record types A, AAAA, CNAME, MX, NS, TXT, SRV, PTR; caching TTL; UDP port 53 (TCP for zone transfer/truncated); DNSSEC signs answers. HTTP: methods GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS; status 1xx info, 2xx ok, 3xx redirect (301 permanent, 302 temp, 304 not modified), 4xx client (400 bad request, 401, 403, 404, 429), 5xx server (500, 502, 503, 504); headers (Host — virtual hosting, mandatory HTTP/1.1; Content-Type; Cache-Control/Expires/ETag; Accept); HTTP/1.1 persistent connections; HTTP/2 multiplexing + server push (deprecated); HTTP/3 on QUIC. Email: SMTP (send, port 25/587 submission with STARTTLS, 465 implicit), POP3 (download), IMAP (sync/server-side folders), MIME. TLS: handshake with certificates, key exchange (ECDHE), symmetric session keys.`,
    concepts: [
      {
        title: "DNS resolution: from name to address.",
        body: `Stub resolver asks OS → cache (hosts file); OS asks configured recursive resolver (ISP or 1.1.1.1/8.8.8.8); resolver checks cache; else queries root (a.root-servers.net) → TLD server (com/net/org) → authoritative (162.159.x); answer cached by TTL at every level; iterative vs recursive queries — root/TLD/auth give referrals, resolver iterates; CNAME chains up to 10 hops; wildcard *.example.com; split-horizon DNS (internal vs external answers); DNS amplification attacks (small query → huge ANY response toward spoofed victim — mitigated by Response Rate Limiting, unicast replicate servers). GATE asks resolution order and record-type matching — memorize the sequence cold.`,
      },
      {
        title: "HTTP methods, status codes, and caching mechanics.",
        body: `Idempotency, safety: GET/HEAD/OPTIONS/PUT/DELETE idempotent; POST not. Cache semantics: Cache-Control (max-age, no-cache = revalidate before reuse, no-store = never cache, private/public), Expires (absolute date), ETag (validator — If-None-Match → 304), Last-Modified/If-Modified-Since → 304; validators carry version info; 200 with new body on change; the exam loves ETag/304 and the cache-busting fingerprint URL pattern. Content negotiation: Accept language/type/encoding → 200/206 partial content; Range requests for resumed downloads; conditional GET is the backbone of CDN freshness.`,
      },
      {
        title: "HTTP evolution: 1.1 → 2 → 3.",
        body: `HTTP/1.1: persistent connections per origin, pipelining deprecated by head-of-line blocking; 6 connections per origin typical hack; chunking. HTTP/2 (RFC 7540): binary framing layer, single TCP connection, multiplexed streams, HPACK header compression, stream prioritization implied; adoption rapid 2015–2019; drawback: TCP-level HOL — one lost packet stalls all streams. HTTP/3: same semantics over QUIC (UDP, userspace, per-stream reliability, 0-RTT handshakes, connection migration surviving IP changes); standardization 2022; solves TCP-HOL entirely — QUIC ACKs per-stream; packet loss no longer freezes unrelated requests; the web\'s next decade runs over UDP.`,
      },
      {
        title: "Email protocols: SMTP, POP3, IMAP done properly.",
        body: `SMTP sends: client initiates on 25 (relay), 587 (submission with auth + STARTTLS), 465 (implicit TLS); envelope (MAIL FROM, RCPT TO) separate from headers (From: — cosmetic, hence SPF/DKIM/DMARC); MX records locate recipient mail servers; POP3: download-and-(by default)-delete, offline-centric, two modes (delete-after-read or leave-on-server); IMAP: server-side folders sync across devices, flags (seen/answered), partial body fetch — the universal choice today; MIME wraps non-ASCII/binary in 7-bit SMTP (base64, quoted-printable); attachment encoding inflation ~33%; the three-protocol dance every client configures once and every troubleshooter faces weekly.`,
      },
      {
        title: "TLS: what the lock icon actually means.",
        body: `TLS handshake: ClientHello (cipher suites, SNI, ALPN) → server picks suite, sends certificate chain (SNI picks virtual host cert) → key exchange (ECDHE — forward secrecy) → session keys derived (symmetric AES-GCM) → Finished messages → encrypted application data; server auth via CA signature chain to a root store in the OS; client auth optional (mTLS — mutual TLS, zero-trust infra); TLS 1.2 (two round trips, legacy), TLS 1.3 (one round trip, 0-RTT resumption, no RSA key transport, static DH removed); forward secrecy = one session key compromise doesn\'t decrypt past sessions; HTTPS = HTTP inside TLS; HSTS forces TLS-only; mixed content blocked by browsers; cert errors (expired, CN mismatch, untrusted root) are the #1 user-facing security friction — and the source of half of your workday.`,
      },
    ],
    worked: [
      {
        title: "DNS query chain to resolve www.example.com, step by step.",
        body: `Browser cache miss → OS → recursive resolver (1.1.1.1): miss → resolver queries root servers → root refers .com TLD → resolver queries TLD → TLD refers example.com authoritative servers → resolver queries auth → returns A record 93.184.216.34 with TTL 3600 → resolver caches; user browser connects. Every step is an iterative referral; caches at four levels; at scale the resolver does 100% of this work so your clients don\'t — DNS is the internet\'s most successful caching layer.`,
      },
      {
        title: "Engineer a cache-friendly response with ETag.",
        body: `GET /api/feed HTTP/1.1 → 200 OK; ETag: "a1b2"; Cache-Control: private, max-age=300; subsequent GET with If-None-Match: "a1b2" → server checks feed version → 304 Not Modified, empty body; client reuses cached body; bandwidth saved; latency one RTT. The pattern is identical for CDNs with public assets — the only difference is max-age vs s-maxage and who stores it.`,
      },
      {
        title: "Configure SMTP relay vs MX for a small org mail system.",
        body: `Org owns mail.example.com. Steps: publish MX record mail.example.com priority 10; run Postfix on mail.example.com accepting from internal hosts, relaying to internet; authentication: SMTP AUTH on port 587 for mobile users; TLS via cert from Let\'s Encrypt; SPF (v=spf1 a mx ~all), DKIM signing, DMARC publishing; monitoring: queue depth alerts, blacklist checks (Spamhaus); delivery: outbound direct, inbound via MX; all four protocols in daily play — SMTP in, POP/IMAP out, DNS MX underneath, TLS above everything.`,
      },
      {
        title: "Walk through a TLS handshake; identify what the client proves.",
        body: `ClientHello (SNI mail.example.com, ALPN h2, cipher list) → ServerHello (chosen cipher AES_128_GCM_SHA256) + cert chain (example.com → intermediate CA → root) → client verifies chain to system root store + hostname match → both compute ephemeral ECDHE key → shared secret → symmetric session keys → Finished → data flows. What client proves: possession of no secrets — server authenticates only; if mTLS, client also presents cert proving its identity — the zero-trust pattern; for public websites, server auth only — the bazaar model.`,
      },
    ],
    exam: [
      {
        question:
          "What is the difference between an MX record and an A record?",
        answer:
          "MX maps a domain to a mail exchange server hostname (with priority) — email delivery target; A maps a hostname to an IPv4 address — generic host address; MX points at a name, which must itself resolve (its own MX records for inbound); the trap: answering MX points to IP.",
      },
      {
        question: "What does a 304 status code mean and who sends it?",
        answer:
          "Not Modified — server sends no body; client reuses its cached response; validators If-None-Match (ETag) / If-Modified-Since trigger it; bandwidth and latency saved; it is the mechanism behind conditional GET.",
      },
      {
        question:
          "Which record type points a domain to its authoritative nameservers?",
        answer:
          "NS record (name server); glue records (A/AAAA) for the nameservers themselves when in-bailiwick; every delegation includes NS at the parent; without glue, resolving www.example.com stalls at finding the nameservers' addresses — the resolver bootstraps from the root with these.",
      },
      {
        question: "What does the Lock icon guarantee and what does it not?",
        answer:
          "Encrypted transport + server identity verified by a CA the browser trusts + integrity of the bytes in transit; it does NOT guarantee the site is honest, virus-free, legal, or that your data at rest is safe; the lock is about the pipe, not the content — phishing sites use HTTPS too.",
      },
    ],
    cheat: [
      "DNS: stub → recursive → root → TLD → auth; TTL caches; UDP/53, TCP for transfer.",
      "HTTP: safe/idempotent methods; 301 permanent, 302 temp, 304 not modified, 4xx you, 5xx us.",
      "Caching: Cache-Control, ETag (304), Expires, Must-Revalidate, fingerprinted URLs.",
      "HTTP/2 multiplexed single TCP; HTTP/3 over QUIC cures TCP head-of-line blocking.",
      "Email: SMTP out (25/587/465), POP3/IMAP in; MX records; SPF/DKIM/DMARC for auth.",
      "TLS: cert chain to root CA, ECDHE forward secrecy, 1-RTT in TLS 1.3, mTLS for zero trust.",
    ],
    recap: `Application protocols are the internet\'s working surface: DNS name-to-address via iterative delegation; HTTP verbs and cache heuristics; email split across SMTP/POP/IMAP with MX on top; TLS wrapping it all in authenticated encryption; HTTP/3 closing the head-of-line chapter — these are the protocols you operate, debug, and are examined on, every day, forever.`,
    code: {
      title: "Resolver lookup pattern",
      language: "bash",
      code: `dig +trace www.example.com`,
      explanation:
        "Shows the full delegation chain — cache misses made visible; every network engineer runs this before blaming the app.",
    },
    diagram: {
      title: "DNS resolution chain",
      caption:
        "Iterative referrals from root to TLD to authoritative, cached at every hop.",
      mermaid: `flowchart LR\n  C[Client stub] --> R[Recursive resolver]\n  R --> Root[Root servers]\n  Root --> TLD[TLD servers]\n  TLD --> Auth[Authoritative]`,
    },
  },
  "gate-cs-computer-networks-network-security-and-cryptography-basics": {
    intro: `Network security and cryptography basics are the non-negotiable layer of modern nets: who proves what to whom, with which math, and what breaks when the math or the protocol is wrong. The subject covers symmetric and asymmetric encryption, hashing and digital signatures, certificate chains, and the security protocol landscape — SSL/TLS, IPsec, VPNs, firewalls, IDS — taught at the depth GATE asks and production needs.`,
    foundations: `Crypto properties: confidentiality (encryption), integrity (MAC/hash), authenticity (signatures/certs), non-repudiation. Symmetric (AES — same key, fast, bulk data) vs asymmetric (RSA/ECC — key pairs, slow, key exchange & signatures); hybrid = asymmetric to swap symmetric session key (every TLS connection). Hash functions (SHA-256): one-way, fixed output, collision resistance — password storage (salted), integrity, HMAC (keyed hash for message auth). Digital signatures: hash message → encrypt hash with private key → verify with public key; cert chains bind identities to keys via CA signatures (root → intermediate → leaf). Protocols: TLS (record layer + handshake), IPsec (AH/ESP, transport/tunnel — VPNs), SSH; firewalls (stateless ACLs, stateful, NGFW), IDS/IPS, VPNs (site-to-site, remote-access), NAT traversal.`,
    concepts: [
      {
        title: "Symmetric and asymmetric encryption, used together.",
        body: `AES (128/192/256-bit keys; GCM mode gives AEAD — encryption + auth in one pass) encrypts bulk data; RSA (2048/3072-bit) or ECDHE (25519 curve) for key exchange and signatures; hybrid always: asymmetric authenticates and bootstrap, symmetric carries payload — that is TLS. Key generation: asymmetric from large prime math, ECC from discrete log hardness on curves; symmetric keys from OS RNG (getrandom); compromise recovery: rotate TLS session keys every connection; forward secrecy = past sessions undecryptable if long-term key leaks — ECDHE gives this; static RSA key transport does not; that is why TLS 1.3 banned RSA transport.`,
      },
      {
        title: "Hashes, MACs, and digital signatures.",
        body: `SHA-256: 256 bits out; one-way; identical inputs identical hashes — avalanche effect; collisions: birthday bound ~ 2^128 work — SHA-256 fine, MD5/SHA-1 broken; password storage: PBKDF2/bcrypt/argon2 (slow by design), salted per user; HMAC: hash of key||message — authenticates origin and integrity, not encryption; MACs need shared secret — each peer needs the key, unlike signatures; digital signature: sign hash with private key via RSA/ECDSA, verify with public; CAs attest that public key belongs to subject — chain: root CA (self-signed, in OS store) → intermediate → server cert; OCSP/CRL revocation; leaf cert pinning for mobile apps.`,
      },
      {
        title: "PKI: certificates, chains, and trust stores.",
        body: `A cert = subject name + public key + issuer + validity + signature by issuer + extensions (SAN — subjectAltName, now mandatory; SANs let one cert cover many names). Verification: walk signature chain leaf → intermediate → root; check each signature; check names match SNI; check validity window; check revocation (CRL — big list, OCSP — per-cert query, stapling — server includes it). Root stores ship with OS/browser — ~150 trusted roots; private CAs for enterprises; mistakes: untrusted root, expired, CN mismatch, wrong SAN, missing intermediate — the everyday TLS failure modes; Let\'s Encrypt made it free and automated (90-day certs, ACME protocol).`,
      },
      {
        title: "TLS handshake and record layer.",
        body: `Records: header (type, version, length) + payload + tag (AEAD); handshake: ClientHello (versions, cipher list, key share, SNI, ALPN) → ServerHello (chosen suite) + Certificate or session ticket → key exchange → Finished; then encrypted app data; TLS 1.3 removes RSA transport, static DH, renegotiation; 1-RTT full, 0-RTT resumption; cipher suites like TLS_AES_128_GCM_SHA256 tell you everything: AEAD, hash for HKDF; handshake failures surface as handshake_failure alert or downgrade attempts — SNI-based cert selection is how shared hosts serve many domains.`,
      },
      {
        title: "Firewalls, IDS and VPNs in one pass.",
        body: `Stateless firewall: ACL rules by src/dst/port/proto — fast, cannot track state (return traffic needs explicit rules); stateful: tracks connections (SYN seen → allow matching SYN-ACK, drop the rest) — the modern baseline; NGFW: app-layer identity (detects SSH tunneling inside traffic); IDS: signature/anomaly detection (Snort) — alert only; IPS: inline blocking; ACL + NAT + screened subnet (DMZ) — classic architecture; VPNs: site-to-site (IPsec tunnel between gateways — encrypts everything between campuses), remote-access (OpenVPN/WireGuard/AnyConnect — clients into private LAN); split tunneling vs full tunnel; endpoint security still needed — a VPN extends trust, doesn\'t create it.`,
      },
    ],
    worked: [
      {
        title: "Trace hybrid encryption of a TLS session from scratch.",
        body: `Client generates ephemeral ECDHE key pair → sends public key share in ClientHello; server generates ITS ephemeral pair, replies in ServerHello/KeyShare; shared secret = ECDH(my_priv, their_pub) both sides compute identical value; HKDF derives client_write_key, server_write_key, IVs; from here all application data encrypted as AEAD records; no long-term secret ever encrypts bulk data — forward secrecy achieved; session keys die at connection end — everything after is symmetric speed with asymmetric trust.`,
      },
      {
        title: "Verify a certificate chain by hand.",
        body: `Received cert: leaf example.com; signature by intermediate CA1; fetch CA1 cert; check its signature by root CA0; CA0 in root store (browser preinstalled)? Check example.com match SNI; check notBefore/notAfter now; check SAN includes example.com; check revocation: OCSP staple says good; decision: trusted. If any fails: alert, block, show error — browsers do this every page load; the public web runs on this exact procedure, billion-fold daily.`,
      },
      {
        title: "Password storage for a web app without leaking.",
        body: `Registration: argon2id(password, random_salt_16B, params t=3,m=64MB,p=4) → store salt||hash. Login: recompute with stored salt → compare in constant time → lockout/rate limit. Never: MD5, SHA-1, plain SHA-256 without salt (rainbow tables), base64, reversible encryption — any of these is a breach waiting to be dumped. Algorithm choice matters more than salt length at this point in history; argon2 or bcrypt only.`,
      },
      {
        title: "Design a firewall policy for a public web tier.",
        body: `DMZ with only 80/443 inbound from internet; SSH (22) only from mgmt VLAN; database tier: only web tier source on 5432; egress: web tier may reach NTP, DNS, apt mirrors; deny all else; stateful inspection with connection tracking; IDS monitor DMZ; logging to SIEM; honeypot port for early detection; rate limiting at edge; the blueprint is standard, the exam knows it, the firewall configs confirm it — repeat until the layout is instinctive.`,
      },
    ],
    exam: [
      {
        question: "What does HMAC provide that plain hash does not?",
        answer:
          "Message authentication — proof the message came from someone holding the shared key and was not altered; plain hash only fingerprints content without binding to any key holder; HMAC = hash of key-concatenated message — the authentication code is the hash.",
      },
      {
        question: "Why is static RSA key transport deprecated in TLS 1.3?",
        answer:
          "No forward secrecy — compromising the server's long-term RSA key retroactively decrypts every recorded session; ECDHE generates per-session ephemeral keys that are destroyed — past sessions stay secret even after total server compromise; TLS 1.3 removed non-ephemeral key exchange entirely.",
      },
      {
        question: "What is the difference between a CRL and OCSP?",
        answer:
          "CRL: periodically published list of revoked cert serials — large, stale between updates; OCSP: real-time status query per cert — compact, current, at cost of responder availability; OCSP stapling: server fetches its own OCSP response and attaches it, clients needn't query CA — privacy + speed.",
      },
      {
        question:
          "Which protocol secures IP-layer traffic and how does it differ from TLS?",
        answer:
          "IPsec — operates at layer 3, protects all IP traffic between endpoints (site-to-site VPNs); TLS operates at layer 4-7 for application flows; IPsec encrypts everything including TCP headers (transport mode) or fully encapsulates (tunnel mode); TLS hides content but not connection metadata to the same degree; both provide authentication and integrity, IPsec is transparent to applications.",
      },
    ],
    cheat: [
      "Symmetric AES bulk; asymmetric RSA/ECDH exchange; hybrid always.",
      "Hash: SHA-256; HMAC = keyed hash; signatures: sign hash privately, verify publicly.",
      "Chain: root → intermediate → leaf; verify each signature + SANs + dates + revocation.",
      "TLS 1.3: 1-RTT, ECDHE only, no static RSA, forward secrecy mandatory.",
      "Passwords: argon2/bcrypt + salt + constant-time compare; never plain hash.",
      "Firewalls: stateless ACL vs stateful vs NGFW; IDS detects, IPS blocks; DMZ screens.",
    ],
    recap: `Security is layered math plus layered procedure: hybrid encryption binding bulk speed to asymmetric trust, hash-based integrity, PKI binding keys to names, TLS wrapping transports, IPsec tunnels between nets, firewalls enforcing posture — and the unceasing discipline of treating every byte as hostile; security engineering is paranoia industrialized, and your packets deserve it.`,
    code: {
      title: "TLS verification chain",
      language: "text",
      code: `openssl s_client -connect host:443 -showcerts`,
      explanation:
        "Shows the full chain, expiry, SANs, issuer — the first command every TLS incident starts with.",
    },
    diagram: {
      title: "Hybrid encryption flow",
      caption:
        "Asymmetric auth and key exchange, symmetric bulk encryption — every TLS session follows this arc.",
      mermaid: `flowchart LR\n  C[Client hello] --> K[ECDHE key share]\n  K --> S[Session keys derived]\n  S --> D[Data encrypted AEAD]`,
    },
  },
  "gate-cs-computer-networks-ipv6-and-next-generation-internet": {
    intro: `IPv6 and the transition story are the future the IPv4 world spent two decades avoiding and one decade faking — the address exhaustion problem, the protocol changes it forced, and the mechanisms that let old and new coexist. The subject covers IPv6 addressing, header differences from IPv4, transition technologies, and the operational reality of running both at once.`,
    foundations: `IPv6: 128-bit addresses, hextet notation, interior :: compression, no checksum in header (link/transport checksums handle errors), extension headers via Next Header chaining, no fragmentation by routers (source does Path MTU Discovery), no ARP (Neighbor Discovery via ICMPv6), multicast everywhere (no broadcast), link-local mandatory FE80::/10, global routing 2000::/3, anycast native. Header 40 bytes fixed vs IPv4 variable 20–60; Next Header replaces Protocol; Hop Limit replaces TTL; Traffic Class replaces ToS. Transition mechanisms: dual stack (both protocols native per host), tunneling (6in4, 6to4, Teredo — IPv6 inside IPv4 payload), translation (NAT64/DNS64 — IPv6-only hosts reaching IPv4-only services), dual-stack-lite. Address representation rules: lowercase hex, no leading zeros, maximal :: once.`,
    concepts: [
      {
        title: "IPv6 addressing rules and compression mechanics.",
        body: `128 bits, eight 16-bit groups separated by colons, hex digits per group; drop leading zeros per group (2001:0db8 → 2001:db8); compress one longest run of zero groups to :: (2001:db8:0:0:0:0:2:1 → 2001:db8::2:1 — only ONE :: allowed per address); IPv4-embedded addresses ::ffff:192.0.2.1 form exists for transition; the rules are algorithmic — apply in order: leading zeros, then longest zero run; validation check: expand :: to the count needed to reach 8 groups; the exam gives malformed candidates and asks which are canonical — order of operations catches everyone.`,
      },
      {
        title: "Header surgery: what IPv6 dropped and added.",
        body: `Dropped: header checksum (link FCS + transport checksums suffice — removes per-hop recompute cost), header length field (fixed 40 bytes), identification/flags/fragment offset (atomic fragmentation eliminated — Path MTU Discovery mandatory), options inline. Added/changed: Next Header (chaining to extension headers — Routing, Fragment, AH, ESP, Destination Options), Hop Limit (was TTL, same job), Traffic Class (QoS), Flow Label (pins flows to paths for QoS without deep inspection), 128-bit addresses, mandatory link-local, mandatory multicast scopes. Next Header chains let routers skip unknown extensions fast — processing time bounded by known headers only.`,
      },
      {
        title: "Address types: scope and purpose.",
        body: `Unicast: global (2000::/3 — routable internet), unique local fc00::/7 (private, RFC 4193), link-local fe80::/10 (auto-configured on every interface, mandatory, never routed beyond link); multicast ff00::/8 with flags/scope bits (ff02::1 all-nodes link-local, ff02::2 all-routers, ff05::2 site-scope); anycast (same address on multiple hosts, routing delivers to nearest); loopback ::1; unspecified ::; IPv4-mapped ::ffff:a.b.c.d. No broadcast exists — every formerly-broadcast use maps to ff02::1 within scope; link-local guarantees IPv6 works without any manual configuration — plug and play — unlike IPv4 DHCP dependence. The exam tests mapping broadcast-thought-patterns to multicast equivalents.`,
      },
      {
        title: "Neighbor Discovery and autoconfiguration (SLAAC).",
        body: `ND (ICMPv6) replaces ARP, ICMP redirect, and router discovery: Router Advertisement (RA) sent periodically or solicited (RS); host derives interface ID from MAC (EUI-64 — flip 7th bit, insert FFFE) or privacy extension (random rotating ID to stop tracking); prefix from RA → full global address; Duplicate Address Detection (DAD) — NS/NA before assigning; neighbor cache replaces ARP table; prefix discovery, renumbering (change RA, all hosts renumber seamlessly — impossible in IPv4 without DHCP renumbering nightmare); RA flags: A (autoconf), M (stateful DHCPv6), O (other config) — SLAAC is IPv6\'s plug-and-play core; DHCP optional for prefix/other options only.`,
      },
      {
        title: "Transition strategies and the coexistence reality.",
        body: `Dual stack: every device runs both, prefers IPv6 where available (Happy Eyeballs — race IPv4/IPv6 connection attempts, use first to succeed; prevents IPv6 breakage degrading UX); tunneling: 6in4 (manual), 6to4 (2002::/16 auto, deprecated), Teredo (UDP-encapsulated, NAT-traversal, largely dead), ISATAP; translation: NAT64 (stateful — IPv6 clients to IPv4 servers) + DNS64 (synthetic AAAA from A) — lets IPv6-only networks (mobile carriers) reach legacy IPv4; 464XLAT on Android/iOS; DS-Lite (carrier-grade NAT for IPv4 over IPv6-only access networks). The global reality: ~40% native IPv6 now, mobile-first, Google/Facebook/Cloudflare fully dual-stack; the exam\'s job is the mechanisms, the field\'s job is running both forever.`,
      },
    ],
    worked: [
      {
        title:
          "Compress this address: 2001:0db8:0000:0000:0100:0000:0000:0001.",
        body: `Steps: drop leading zeros per hextet: 2001:db8:0:0:100:0:0:1; find longest run of zero hextets: after 100 there are two consecutive zeros, and before 100 there are two — tie: pick the FIRST occurrence (RFC 5952 tie-break); :: → 2001:db8::100:0:0:1. Validation by expansion: 2001 db8 0 0 0100 0000 0000 0001 → 8 groups ✓. The two empty groups before 100 collapse into the same :: — one :: only.`,
      },
      {
        title: "Parse an ARP-like ND exchange on-link.",
        body: `Host A wants MAC for fe80::1 on the wire: A multicasts NS (ICMPv6 type 135, target fe80::1) to solicited-node multicast ff02::1:ff00:1; any host with that neighbor solicited-node address replies NA (type 136) with its MAC unicast to A; A caches in neighbor table with reachability state; later DAD for a new address happens the same way with the sender\'s own address as target — duplicate seen? Address abandoned; the entire mechanism replaces ARP broadcast with targeted multicast — quieter, scoped, authenticatable via SEND (Secure ND).`,
      },
      {
        title: "Trace Happy Eyeballs connection to an IPv6/IPv4 dual host.",
        body: `Browser resolves A and AAAA; starts IPv6 attempt (v6SYN) at t=0; if v6 doesn\'t connect within 250 ms, starts IPv4 attempt in parallel; first successful connection wins (IPv6 preference by small head start); user never knows — dual-stack hosts with broken v6 still work at v4 speed, broken v4 with working v6 likewise — the design that kept dual-stack from being a disaster; without it, broken v6 to 25% of users would have been catastrophic UX.`,
      },
      {
        title:
          "Which address type for a DNS server reachable from all internal VLANs?",
        body: `Unique local (fc00::/7) unicast — globally-unreachable private IPv6 space, routable internally; link-local alone won\'t cross routers; global would leak; anycast same address on two resolvers in different sites for HA — routing delivers to nearest — supported natively in IPv6 without any special config beyond assigning the same address to both. The question type: match requirement → scope — remember: private=fc00, link=fe80, global=2000, multicast=ff00, loop=::1.`,
      },
    ],
    exam: [
      {
        question:
          "How many times may a double-colon (::) appear in a valid IPv6 address?",
        answer:
          "Exactly once — at most once, and it must stand for at least one (possibly many) consecutive zero hextets; zero :: occurrences also legal (fully expanded form); :: appearing twice is parse error — the exam checks whether students remember exactly one.",
      },
      {
        question: "What replaced ARP in IPv6, and over what?",
        answer:
          "Neighbor Discovery Protocol over ICMPv6 — Neighbor Solicitation/Advertisement messages, replacing ARP request/reply and ICMP redirects; plus Router Solicitation/Advertisement for autoconfiguration; NDP also handles reachability detection and duplicate detection.",
      },
      {
        question:
          "What does an IPv6 link-local address guarantee that global addresses do not?",
        answer:
          "Automatic existence without any configuration — every interface gets one from its MAC or random ID via EUI-64/privacy extensions, allowing local segment communication before any network provisioning; global requires router advertisement with a prefix; without RA, only link-local works.",
      },
      {
        question: "Why does IPv6 have no broadcast address?",
        answer:
          "Broadcast interrupts every node on the segment wastefully; IPv6 solves the same problems with targeted multicast (ff02::1 all nodes, ff02::2 all routers) — a node not in the solicited-node multicast group drops the packet at the NIC without processing, saving CPU; the internet's IPv4 broadcast storms simply do not exist in IPv6.",
      },
    ],
    cheat: [
      "IPv6: 128 bits, hextets, :: once max, lowercase canonical, drop leading zeros.",
      "Scopes: global 2000::/3, ULA fc00::/7, link-local fe80::/10, multicast ff00::/8, loop ::1.",
      "Headers: Next Header chaining, Hop Limit, no checksum, no router fragmentation.",
      "ND (ICMPv6) replaces ARP/ICMP redirect; SLAAC via RA + EUI-64/privacy.",
      "Transition: dual stack + Happy Eyeballs; tunnels; NAT64/DNS64 translation.",
      "Multicast replaces broadcast everywhere; ff02::1 all nodes link-local.",
    ],
    recap: `IPv6 is the internet\'s second life: 128-bit sanity, autoconfiguration that truly plugs and plays, no broadcast, no fragmentation-by-router, ND instead of ARP, multicast instead of noise — deployed through Happy-Eyeballs-safe dual stack and NAT64 where v4 insists on surviving; the exam asks the format rules and the mechanism names; the field asks for teams who can run both for the foreseeable future.`,
    code: {
      title: "Address compression algorithm",
      language: "python",
      code: `s = addr.lower().replace(':', '/')\n# find longest zero run; collapse to ::; drop leading zeros`,
      explanation:
        "The four-line canonicalizer every IPv6 implementation carries inside it.",
    },
    diagram: {
      title: "Transition strategy map",
      caption:
        "Dual stack as baseline, tunnels for islands, translation for holdouts — three mechanisms, one internet.",
      mermaid: `flowchart LR\n  DS[Dual stack hosts] --> HE[Happy Eyeballs]\n  I6[IPv6-only nets] --> NAT64[NAT64 + DNS64]\n  T[IPv4 islands] --> Tun[6in4 / 6to4]`,
    },
  },
};
