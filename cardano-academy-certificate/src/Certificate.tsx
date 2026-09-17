import {
  Template,
  type ThemeSettings,
  type UVerifyCertificate,
  type UVerifyCertificateExtraData,
  type UVerifyMetadata,
} from '@uverify/core';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, JSX, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';

type BadgeContent = {
  name: string;
  description: string;
  skills: string;
  earningCriteria: string;
};

// Badge texts live here, not on-chain. A certificate only carries the catalog
// key, which keeps the metadata at roughly 140 bytes per badge.
const BADGE_CATALOG: Record<string, BadgeContent> = {
  BLOCKCHAIN_FUNDAMENTALS: {
    name: "Blockchain Fundamentals",
    description: "This introductory course assumes no knowledge of blockchain and is for those who want to learn what it is, how it works, and its use cases. It covers blockchain fundamentals, DLT, hashing, public key cryptography, and consensus mechanisms. It explains Byzantine Fault Tolerance, Bitcoin, Ethereum, scalability, and forks. It also explores blockchain generations, Cardano’s staking, smart contracts, and NFTs. Real-world applications like DeFi, gaming, and supply chain are discussed.",
    skills: "Blockchain, Blockchain Use Cases, Consensus Mechanisms, DLT, Public Key Cryptography, Smart Contracts",
    earningCriteria: "Complete the Blockchain Fundamentals course.",
  },
  CBCA_COURSE: {
    name: "Cardano Blockchain Certified Associate (CBCA)",
    description: "This course is for learners who understand blockchain basics and want to expand their knowledge. It starts with blockchain fundamentals, including consensus algorithms and security. It then covers transaction models, block structures, and scaling solutions. The focus shifts to Cardano, exploring its genesis, consensus mechanism, and governance. The course concludes with using ADA, staking, and creating assets. It prepares learners for the Cardano Blockchain Certified Associate exam.",
    skills: "Blockchain, Cardano, Consensus Algorithms, Cryptography, Decentralized Applications (DApps), Smart Contracts",
    earningCriteria: "Complete the Cardano Blockchain Certified Associate (CBCA) course.",
  },
  CBCA_CERTIFICATION: {
    name: "Cardano Blockchain Certified Associate (CBCA) Certification",
    description: "The earner of this badge has a comprehensive understanding of blockchain technology, with a focus on the Cardano blockchain. They grasp fundamental blockchain concepts and cryptographic methods, and are knowledgeable about transaction models, security mechanisms, and scalability solutions. They understand Cardano's origins, its blockchain structure, consensus algorithm, and governance processes. Additionally, they possess practical skills in handling ada, staking, and creating DApps.",
    skills: "Blockchain, Cardano, Consensus Algorithms, Cryptography, Decentralized Applications (DApps), Smart Contracts",
    earningCriteria: "Receive a passing score on the Cardano Blockchain Certified Associate (CBCA) exam.",
  },
  CARDANO_BLOCKCHAIN_ASSOCIATE: {
    name: "Cardano Blockchain Associate",
    description: "Demonstrates the necessary qualifications and competency to pursue the Cardano Blockchain Certified Associate (CBCA) certification. The CBCA curriculum develops skills in blockchain systems and Cardano’s architecture, including transaction models, consensus mechanisms, security and scalability principles, and practical application in decentralized software systems.This badge showcases successful completion of the CBCA training and supports professional preparation for skilled work in blockchain.",
    skills: "Collaboration, Distributed Systems, Professional Communication, Professional Development, Professionalism, Professional Services, Scalability, Security, Security Strategies, Software Systems, Vulnerability Management",
    earningCriteria: "Demonstrates the necessary qualifications and competency to pursue the Cardano Blockchain Certified Associate (CBCA) certification. The CBCA curriculum develops skills in blockchain systems and Cardano’s architecture, including transaction models, consensus mechanisms, security and scalability principles, and practical application in decentralized software systems.This badge showcases successful completion of the CBCA training and supports professional preparation for skilled work in blockchain.",
  },
  CASE_STUDY_BLOCKCHAIN_FOR_AI: {
    name: "Case Study: Blockchain for AI",
    description: "The Case Study: Blockchain for AI badge, issued by the Cardano Academy, recognizes an individual's understanding of the strategic intersection between artificial intelligence and blockchain technology. This credential verifies that the earner can identify the critical obstacles facing modern AI—such as transparency, accountability, and the \"black box\" problem—and explain how blockchain infrastructure provides the necessary solutions.",
    skills: "Artificial General Intelligence, Artificial Intelligence (AI), Blockchain, Confidentiality, Ethereum, Honesty, Intelligence, Personal Responsibility",
    earningCriteria: "The Case Study: Blockchain for AI is a concise, 17-minute on-demand e-learning course developed by the Cardano Academy. It is specifically designed for enterprise decision-makers, innovation leaders, and technology pioneers who need to understand the strategic intersection of artificial intelligence and blockchain technology.",
  },
  CASE_STUDY_BLOCKCHAIN_FOR_RWA: {
    name: "Case Study: Blockchain for Real-World Assets",
    description: "The Case Study: Blockchain for Real-World Assets badge, issued by the Cardano Academy, recognizes an individual's understanding of the strategic intersection between real-world assets and blockchain technology. This credential verifies that the earner can identify the critical obstacles to global mobility and liquidity of physical assets—such as capital inertia, geographic isolation, and administrative bloat—and explain how blockchain infrastructure provides the necessary solutions.",
    skills: "Blockchain, Decision Making, Ethereum, Global Mobility, Innovation, Innovation Leadership, Institutional Finance, Liquidity, Liquidity Risk, Physical Assets, Real-World Assets, Strategic Decision Making, Tokenization",
    earningCriteria: "The Case Study: Blockchain for Real-World Assets is a concise, 17-minute on-demand e-learning course developed by the Cardano Academy. It is specifically designed for enterprise decision-makers, innovation leaders, and technology pioneers who need to understand the strategic intersection of physical assets, institutional finance, and blockchain technology.",
  },
  BLOCKCHAIN_AND_SUSTAINABILITY: {
    name: "Blockchain and Sustainability",
    description: "The earner of this badge has successfully participated in a comprehensive masterclass about blockchain technology and its current and future impacts on sustainability. They have mastered foundational blockchain principles, the evolution of the technology, and explored multiple case studies with a focus on sustainability. This badge attests to their ability to discuss blockchain implementations and assess its feasibility for real-world use cases.",
    skills: "Blockchain, Blockchain Generations, Blockchain Industry Analysis, Blockchain Use Cases, Consensus Algorithms, Sustainability",
    earningCriteria: "Complete the Decentralizing Sustainability: Blockchain’s Pivotal Role Masterclass.",
  },
  BLOCKCHAIN_AND_HEALTHCARE: {
    name: "Blockchain and Healthcare",
    description: "The earner of this badge has mastered the fundamentals of blockchain and its strategic applications in healthcare. They have gained critical insight from live case studies, equipping them to assess real-world implementations and guide their organization's future vision. This signifies their commitment to leading the healthcare industry's digital transformation and innovate strategically in their space.",
    skills: "Blockchain, Cardano, Compliance, Cybersecurity, Digital Transformation, Healthcare, Innovation",
    earningCriteria: "Complete a Blockchain and Healthcare Masterclass",
  },
  STAKING_REWARDS_AND_CALCULATION: {
    name: "Staking Rewards & Calculation",
    description: "This micro course is for learners who want to understand Cardano's staking rewards & calculation. It starts with staking concepts, including the Chimeric Ledger supporting Account-based and eUTxO models. It then explains the open-sourcing of the rewards calculation and key findings. The course concludes with guidance on accessing detailed information on Cardano Foundation's GitHub, including test reports and the roadmap.",
    skills: "Blockchain, Cardano, eUTXO, Monetary Policy, Proof Of Stake (PoS), Rewards Calculations, Staking, Tokenomics",
    earningCriteria: "Complete the Cardano Staking and Rewards course.",
  },
  WHAT_IS_OPEN_SOURCE: {
    name: "What Is Open Source?",
    description: "This course introduces the philosophy and strategy of open source in decentralized technology. Learners explore its principles, licenses, and governance models while understanding how open collaboration drives transparency and innovation. The course concludes with practical guidance on contributing to open-source projects and aligning with the Cardano Foundation’s mission of open, community-driven development.",
    skills: "Blockchain, Governance, Open Source, Sustainability",
    earningCriteria: "Complete the What Is Open Source course.",
  },
  AIKEN_SMART_CONTRACTS: {
    name: "Aiken: eUTxO Smart Contracts on Cardano",
    description: "This course is for learners who want to learn more about writing smart contracts on Cardano using Aiken. It starts with the evolution of smart contracts on Bitcoin, Ethereum, and Cardano, comparing their architectures. It then covers the scripting layer and account models. The course concludes with hands-on coding of basic Aiken validators, exploring built-in primitives, libraries, and resources for mastering Aiken. It is recommended for those familiar with the CBCA course.",
    skills: "Account-based Models, Account Models, Aiken, Cardano Smart Contracts, eUTXO, Plutus",
    earningCriteria: "Complete the Aiken: eUTxO Smart Contracts on Cardano course.",
  },
  DIGITAL_IDENTITY_AND_KERI: {
    name: "The Future of Digital Identity and KERI",
    description: "This badge indicates that a learner has gain familiarity with the direction digital identity is headed and the potential impact of KERI on this future.",
    skills: "Authentication Protocols, Digital Identity, Digital Literacy, Digital Rights Management, Enterprise Integration, Key Management",
    earningCriteria: "This course introduces Autonomic Trust, a model where identity is self-certifying, portable, and mathematically verifiable without intermediaries. Across 18 focused units, learners gain a working understanding of the Key Event Receipt Infrastructure (KERI) protocol and how the Veridian platform makes these capabilities accessible and enterprise-ready.",
  },
  TRUST_AND_DIGITAL_IDENTITY: {
    name: "Trust & Digital Identity: Future-Proof Your Enterprise",
    description: "The Trust & Digital Identity badge, issued by the Cardano Academy, recognizes an individual's understanding of decentralized identity solutions and self-sovereign trust frameworks. This credential verifies that the earner can identify key vulnerabilities in centralized identity systems—such as data breaches, SSO risks, and AI fraud—and explain how platforms like Veridian enable secure, interoperable, and post-quantum identity verification.",
    skills: "Artificial Intelligence (AI), Blockchain, Digital Identity, Enterprise use cases, Identity Verification, Quantum Computing, Self-Sovereign Identity, SSO, Trust",
    earningCriteria: "To earn this badge, learners must complete the 35-minute, on-demand, e-learning course on the Cardano Academy called Trust & Digital Identity: Future-Proof Your Enterprise.",
  },
  INTRO_TO_CARDANO_GOVERNANCE: {
    name: "Intro to Cardano Governance",
    description: "This badge is awarded to individuals who have successfully completed the Cardano Governance course series. Earners have demonstrated a comprehensive understanding of Cardano’s decentralized governance model, specifically focusing on the Voltaire era and the CIP-1694 framework. The recipient has explored the history, processes, and mechanisms driving community-led decision-making. They can identify the roles of key governance actors and navigate the tools necessary for active participation.",
    skills: "Active Learning, Civic Engagement, Community Development, Community Leadership, Community Management, Decision Making, Governance, Proactivity",
    earningCriteria: "To earn this badge, the recipient must complete the Cardano Governance Theory course.",
  },
  CARDANO_GOVERNANCE_APPLIED: {
    name: "Cardano Governance: Applied",
    description: "This badge is awarded to individuals who completed the Cardano Governance: Applied course. Earners have demonstrated practical expertise in CIP-1694 governance under Constitution v2.4. The recipient gained hands-on experience using GovTool on Preview testnet to register as a DRep, host CIP-108 metadata, and submit governance actions on-chain. They can navigate delegation, vote with rationale, and trace actions to mainnet enactment.",
    skills: "Governance, Institutional",
    earningCriteria: "Complete the Cardano Governance: Applied course on the Cardano Academy platform.",
  },
  AI_AND_BLOCKCHAIN_FOR_BUSINESS_LEADERS: {
    name: "AI & Blockchain for Business Leaders: Cardano Edition",
    description: "This course explores the transformative potential of combining AI and blockchain technology in the Web3 era. It covers the evolution of the internet and explains the Web3-AI stack. Learners examine the opportunities and challenges of this technological convergence, with a curriculum backed by the Blockchain Research Institute's research, enhanced with case studies and real-world applications within the Cardano ecosystem for an overall focus on next-generation solutions.",
    skills: "Agentic AI, AI, Blockchain, Blockchain Use Cases, Cardano, GenAI, Generative AI, Web3",
    earningCriteria: "Complete the AI & Blockchain for Business Leaders: Cardano Edition course.",
  },
  CF_TECHNICAL_ONBOARDING: {
    name: "Cardano Foundation Technical Onboarding",
    description: "Awarded to participants who completed the Cardano Foundation Technical Onboarding, a hands-on program for institutional professionals integrating Cardano. The program covers the eUTxO model, transaction lifecycles, wallet custody, native assets, and smart contracts. Through exercises in Python (PyCardano) and TypeScript, participants build real industrial use cases while learning key distinctions between protocol verification and external governance.",
    skills: "Blockchain, Cardano, CIP-10, CIP-1852, CIP-25, CIP-30, CIP Standards, eUTxO Model, Evolution SDK, Industrial Blockchain Integration, Native Assets, On-Chain Evidence Anchoring, PyCardano, Smart Contracts, TypeScript, Wallet Custody Architecture",
    earningCriteria: "To earn this badge, the recipient must have participated in an official Cardano Foundation Technical Onboarding event. It requires the completion of all three days of the in-person workshop, delivered in partnership with an accredited institutional partner, including hands-on exercises executed in a Cardano pre-production environment, confirmed by facilitator sign-off.",
  },
  VENTURE_HUB_2025_COHORT_1: {
    name: "Venture Hub - 2025 Cohort 1",
    description: "This badge recognizes participation in the Cardano Foundation’s Venture Hub program. Participants benefited from: (1) a technical assessment by Cardano Foundation experts, accompanied by tailored 1:1 technical training; (2) hands-on workshops with ecosystem partners to refine business strategy and operations; (3) three months of direct mentorship with Cardano Foundation leadership; and (4) access to the Cardano Foundation’s extensive network.",
    skills: "Blockchain, Business Operations, Fundraising, Go-to-Market Strategy, Growth, Strategy",
    earningCriteria: "Successfully complete a series of workshops and present their pitch in front of selected investor audience at the Demo Day.",
  },
};

// Catalog keys used by certificates issued before the enum-style IDs.
const LEGACY_BADGE_IDS: Record<string, string> = {
  'blockchain-fundamentals': 'BLOCKCHAIN_FUNDAMENTALS',
  'cardano-blockchain-certified-associate-cbca': 'CBCA_COURSE',
  'cardano-blockchain-certified-associate-cbca-certification': 'CBCA_CERTIFICATION',
  'cardano-blockchain-associate': 'CARDANO_BLOCKCHAIN_ASSOCIATE',
  'case-study-blockchain-for-ai': 'CASE_STUDY_BLOCKCHAIN_FOR_AI',
  'case-study-blockchain-for-real-world-assets': 'CASE_STUDY_BLOCKCHAIN_FOR_RWA',
  'blockchain-and-sustainability': 'BLOCKCHAIN_AND_SUSTAINABILITY',
  'blockchain-and-healthcare': 'BLOCKCHAIN_AND_HEALTHCARE',
  'staking-rewards-and-calculation': 'STAKING_REWARDS_AND_CALCULATION',
  'what-is-open-source': 'WHAT_IS_OPEN_SOURCE',
  'aiken-eutxo-smart-contracts-on-cardano': 'AIKEN_SMART_CONTRACTS',
  'the-future-of-digital-identity-and-keri': 'DIGITAL_IDENTITY_AND_KERI',
  'intro-to-cardano-governance': 'INTRO_TO_CARDANO_GOVERNANCE',
  'ai-and-blockchain-for-business-leaders-cardano-edition': 'AI_AND_BLOCKCHAIN_FOR_BUSINESS_LEADERS',
  'venture-hub-2025-cohort-1': 'VENTURE_HUB_2025_COHORT_1',
};

function resolveBadge(badgeId: string): BadgeContent | undefined {
  return BADGE_CATALOG[badgeId] ?? BADGE_CATALOG[LEGACY_BADGE_IDS[badgeId] ?? ''];
}

const ISSUER = {
  name: 'Cardano Foundation',
  url: 'https://cardanofoundation.org',
  academyUrl: 'https://cardanofoundation.org/en/academy',
};

const SHA256_HEX = /^[0-9a-f]{64}$/i;

const C = {
  pageBg: '#f5f6fa',
  white: '#ffffff',
  headerBorder: 'rgba(229,231,235,0.7)',
  text: '#0d0d0d',
  textMuted: '#4a4f68',
  textLight: '#7a7f99',
  blue: '#0084ff',
  blueMid: '#3399ff',
  blueLight: '#e6f3ff',
  link: '#0084ff',
  border: '#dde1ef',
  tagBorder: '#b8c0da',
  tagText: '#1a2040',
  ribbonBlue: '#0084ff',
  ribbonBlueDark: '#0068cc',
  badgeLogoDark: '#0084ff',
  badgeLogoMid: '#3399ff',
  green: '#00be7a',
  greenDark: '#00a068',
  earnBtnBg: '#0057b3',
  earnBtnHover: '#004494',
};

const BASE62 =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Must stay in sync with uverify-ui/src/utils/shortCode.ts and
// io.uverify.backend.util.ShortCode (top 59 bits of the hash, base62, 10 chars).
function shortCodeFromHash(hexHash: string): string {
  let value = BigInt('0x' + hexHash.slice(0, 16)) >> 5n;
  let code = '';
  for (let i = 0; i < 10; i++) {
    code = BASE62[Number(value % 62n)] + code;
    value /= 62n;
  }
  return code;
}

function buildLinkedInAddToProfileUrl(input: {
  name: string;
  organizationName: string;
  issueYear: number;
  issueMonth: number;
  certUrl: string;
  certId: string;
}): string {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: input.name,
    organizationName: input.organizationName,
    issueYear: String(input.issueYear),
    issueMonth: String(input.issueMonth),
    certUrl: input.certUrl,
    certId: input.certId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

type SocialShareLinks = {
  x: string;
  bluesky: string;
  whatsapp: string;
  facebook: string;
  email: string;
};

function buildSocialShareUrls(url: string, text: string): SocialShareLinks {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTextWithUrl = encodeURIComponent(`${text} ${url}`);
  return {
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    bluesky: `https://bsky.app/intent/compose?text=${encodedTextWithUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTextWithUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodedText}&body=${encodedTextWithUrl}`,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmbedSnippet(url: string, imageUrl: string, title: string): string {
  return [
    `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">`,
    `  <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" width="300" style="border-radius:12px" />`,
    `</a>`,
  ].join('\n');
}

const SOCIAL_BUTTONS: { key: keyof SocialShareLinks; label: string; color: string; icon: JSX.Element }[] = [
  {
    key: 'x',
    label: 'Share on X',
    color: '#0f1419',
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
  {
    key: 'bluesky',
    label: 'Share on Bluesky',
    color: '#0085ff',
    icon: (
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
    ),
  },
  {
    key: 'whatsapp',
    label: 'Share on WhatsApp',
    color: '#25d366',
    icon: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    ),
  },
  {
    key: 'facebook',
    label: 'Share on Facebook',
    color: '#1877f2',
    icon: (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    ),
  },
  {
    key: 'email',
    label: 'Share via email',
    color: '#4a4f68',
    icon: (
      <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908z" />
    ),
  },
];

const headerIconButtonStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  padding: 0,
  background: 'transparent',
  border: `1.5px solid ${C.border}`,
  borderRadius: '24px',
  color: C.textMuted,
  cursor: 'pointer',
};

function hoverBlue(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = C.blue;
  e.currentTarget.style.color = C.blue;
}

function hoverReset(e: MouseEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = C.border;
  e.currentTarget.style.color = C.textMuted;
}

function DownloadPdfButton({ filename }: { filename: string }): JSX.Element {
  const handleDownload = () => {
    const previousTitle = document.title;
    document.title = filename;
    window.print();
    document.title = previousTitle;
  };

  return (
    <button
      onClick={handleDownload}
      aria-label="Download PDF"
      title="Download PDF"
      style={headerIconButtonStyle}
      onMouseEnter={hoverBlue}
      onMouseLeave={hoverReset}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    </button>
  );
}

function ShareBadgeButton({
  hash,
  badgeName,
  issuerName,
  issuedDate,
}: {
  hash: string;
  badgeName: string;
  issuerName: string;
  issuedDate: Date;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<'link' | 'embed' | 'failed' | null>(null);
  const resetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeout.current) clearTimeout(resetTimeout.current);
    };
  }, []);

  const copy = async (text: string, marker: 'link' | 'embed') => {
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(marker);
    } catch {
      setCopied('failed');
    }
    resetTimeout.current = setTimeout(() => setCopied(null), 2000);
  };

  const shareUrl = `${window.location.origin}/verify/${hash}${window.location.search}`;
  const linkedInUrl = buildLinkedInAddToProfileUrl({
    name: badgeName,
    organizationName: issuerName,
    issueYear: issuedDate.getFullYear(),
    issueMonth: issuedDate.getMonth() + 1,
    certUrl: shareUrl,
    certId: shortCodeFromHash(hash),
  });
  const socialLinks = buildSocialShareUrls(
    shareUrl,
    `${badgeName} — verified on-chain by ${issuerName}`,
  );
  const embedSnippet = buildEmbedSnippet(
    shareUrl,
    `${window.location.origin}/og/cardano-academy-certificate.png`,
    badgeName,
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share badge"
        title="Share"
        style={headerIconButtonStyle}
        onMouseEnter={hoverBlue}
        onMouseLeave={hoverReset}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 10.7 6.8-3.9" />
          <path d="m8.6 13.3 6.8 3.9" />
        </svg>
      </button>

      {/* Portal to body — the blurred header is a containing block for
          position: fixed, which would clip the overlay to the header strip. */}
      {open && createPortal(
        <div
          className="ca-print-hide"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(13, 20, 40, 0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 24px 64px rgba(13, 20, 40, 0.25)',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 700, color: C.text }}>
              Share this badge
            </h2>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '12px',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            >
              <QRCode value={shareUrl} size={144} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  minWidth: 0,
                  border: `1px solid ${C.border}`,
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '13px',
                  color: C.textMuted,
                }}
              />
              <button
                onClick={() => copy(shareUrl, 'link')}
                style={{
                  padding: '8px 14px',
                  background: C.blue,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied === 'link' ? 'Copied' : copied === 'failed' ? 'Copy failed' : 'Copy'}
              </button>
            </div>

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginBottom: '12px',
                padding: '9px',
                background: '#0a66c2',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Add to LinkedIn profile
            </a>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
              {SOCIAL_BUTTONS.map((social) => (
                <a
                  key={social.key}
                  href={socialLinks[social.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={social.color} aria-hidden="true">
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>

            <button
              onClick={() => copy(embedSnippet, 'embed')}
              style={{
                width: '100%',
                padding: '8px',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: C.textMuted,
                cursor: 'pointer',
              }}
            >
              {copied === 'embed' ? 'Embed code copied' : copied === 'failed' ? 'Copy failed' : 'Copy embed code'}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

function PrintQr({ url }: { url: string }): JSX.Element {
  return (
    <div
      className="ca-print-qr"
      style={{
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        width: '220px',
      }}
    >
      <QRCode value={url} size={96} />
      <span style={{ fontSize: '10px', color: C.text, wordBreak: 'break-all', textAlign: 'center' }}>
        {url}
      </span>
    </div>
  );
}

function AvatarIcon({ name }: { name: string }): JSX.Element {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="22" fill={C.blue} />
      <text
        x="22"
        y="27"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fontFamily="Inter, Helvetica Neue, Arial, sans-serif"
        fill="white"
      >
        {initials || '?'}
      </text>
    </svg>
  );
}

const ADA_PATHS = [
  "M74.49,124.64A18.34,18.34,0,0,0,91.73,144l1,0a18.3,18.3,0,1,0-18.29-19.35Z",
  "M6.25,120a5.91,5.91,0,1,0,5.57,6.24A5.9,5.9,0,0,0,6.25,120Z",
  "M73.33,18.43a5.92,5.92,0,1,0-8-2.62A5.93,5.93,0,0,0,73.33,18.43Z",
  "M91.9,50.81a9.14,9.14,0,1,0-12.28-4.05A9.14,9.14,0,0,0,91.9,50.81Z",
  "M29.41,73.08a7.53,7.53,0,1,0-2.16-10.42A7.53,7.53,0,0,0,29.41,73.08Z",
  "M40.54,116.67a9.14,9.14,0,1,0,8.61,9.65A9.15,9.15,0,0,0,40.54,116.67Z",
  "M30.41,178.12a7.53,7.53,0,1,0,10.12,3.33A7.53,7.53,0,0,0,30.41,178.12Z",
  "M65.94,97.78a10.76,10.76,0,1,0-3.1-14.9A10.75,10.75,0,0,0,65.94,97.78Z",
  "M178.66,50.09A9.15,9.15,0,1,0,176,37.42,9.14,9.14,0,0,0,178.66,50.09Z",
  "M197.42,17.81a5.92,5.92,0,1,0-1.71-8.19A5.92,5.92,0,0,0,197.42,17.81Z",
  "M180.1,107.22A18.3,18.3,0,1,0,178,143.77c.35,0,.71,0,1.06,0a18.3,18.3,0,0,0,13.64-30.49A18.08,18.08,0,0,0,180.1,107.22Z",
  "M97.91,96.51a18.23,18.23,0,0,0,16.36,10.07A18.31,18.31,0,0,0,130.61,80,18.24,18.24,0,0,0,114.25,70,18.31,18.31,0,0,0,97.91,96.51Z",
  "M241.41,73.06a7.53,7.53,0,1,0-10.12-3.34A7.54,7.54,0,0,0,241.41,73.06Z",
  "M195,78.89a10.76,10.76,0,1,0,14.45,4.77A10.75,10.75,0,0,0,195,78.89Z",
  "M135.22,15.05a7.53,7.53,0,1,0-7.09-7.94A7.53,7.53,0,0,0,135.22,15.05Z",
  "M135.14,62.44A10.76,10.76,0,1,0,125,51.08,10.77,10.77,0,0,0,135.14,62.44Z",
  "M76.84,172.28a10.76,10.76,0,1,0-14.45-4.76A10.76,10.76,0,0,0,76.84,172.28Z",
  "M142.09,78.14a18.3,18.3,0,1,0,15.33-8.27A18.32,18.32,0,0,0,142.09,78.14Z",
  "M173.91,154.67a18.3,18.3,0,1,0-16.34,26.54,18.5,18.5,0,0,0,8.24-2A18.31,18.31,0,0,0,173.91,154.67Z",
  "M205.89,153.39a10.76,10.76,0,1,0,3.09,14.9A10.78,10.78,0,0,0,205.89,153.39Z",
  "M240.93,125.9a9.14,9.14,0,1,0-9.65,8.61A9.15,9.15,0,0,0,240.93,125.9Z",
  "M266.25,119.39a5.92,5.92,0,1,0,5.57,6.25A5.93,5.93,0,0,0,266.25,119.39Z",
  "M242.41,178.09a7.53,7.53,0,1,0,2.17,10.43A7.53,7.53,0,0,0,242.41,178.09Z",
  "M74.41,233.36a5.92,5.92,0,1,0,1.7,8.2A5.92,5.92,0,0,0,74.41,233.36Z",
  "M198.49,232.74a5.92,5.92,0,1,0,7.95,2.62A5.91,5.91,0,0,0,198.49,232.74Z",
  "M129.73,173a18.3,18.3,0,1,0-15.32,8.27A18.21,18.21,0,0,0,129.73,173Z",
  "M93.16,201.09a9.14,9.14,0,1,0,2.64,12.66A9.15,9.15,0,0,0,93.16,201.09Z",
  "M135.83,236.12a7.53,7.53,0,1,0,7.09,7.95A7.53,7.53,0,0,0,135.83,236.12Z",
  "M135.91,188.74A10.76,10.76,0,1,0,146,200.09,10.75,10.75,0,0,0,135.91,188.74Z",
  "M179.92,200.36a9.15,9.15,0,1,0,12.29,4A9.13,9.13,0,0,0,179.92,200.36Z",
];

function AdaBubbleLogo({ size, fill }: { size: number; fill: string }): JSX.Element {
  const scale = size / 251.17;
  return (
    <svg width={272 * scale} height={size} viewBox="0 0 272 251.17" xmlns="http://www.w3.org/2000/svg">
      <g fill={fill}>
        {ADA_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

function CardanoAcademyLogo(): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <AdaBubbleLogo size={36} fill={C.blue} />
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: C.text, letterSpacing: '0.6px', fontFamily: 'Arial, sans-serif' }}>CARDANO</div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: C.blue, letterSpacing: '0.6px', fontFamily: 'Arial, sans-serif', marginTop: '3px' }}>ACADEMY</div>
      </div>
    </div>
  );
}

function CheckCircleIcon(): JSX.Element {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill={C.green} />
      <path d="M5 10.5L8.5 14L15 7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function DocumentIcon(): JSX.Element {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '2px' }}>
      <rect x="2" y="1" width="14" height="16" rx="2" fill="none" stroke="#555" strokeWidth="1.5" />
      <line x1="5" y1="6" x2="13" y2="6" stroke="#555" strokeWidth="1.2" />
      <line x1="5" y1="9" x2="13" y2="9" stroke="#555" strokeWidth="1.2" />
      <line x1="5" y1="12" x2="10" y2="12" stroke="#555" strokeWidth="1.2" />
    </svg>
  );
}

// Greedy word wrap for the badge title. The disc is widest in the middle, so
// the line budget widens towards the center and narrows again below it.
function wrapBadgeTitle(title: string, lineBudgets: number[]): string[] {
  const words = title.split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const budget = lineBudgets[Math.min(lines.length, lineBudgets.length - 1)];
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= budget || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > lineBudgets.length) {
    const kept = lines.slice(0, lineBudgets.length);
    const last = kept[kept.length - 1];
    const budget = lineBudgets[lineBudgets.length - 1];
    kept[kept.length - 1] = last.length > budget - 1 ? `${last.slice(0, budget - 2).trimEnd()}…` : `${last}…`;
    return kept;
  }
  return lines;
}

function CardanoAcademyBadge({ badgeName }: { badgeName: string }): JSX.Element {
  const lines = wrapBadgeTitle(badgeName, [20, 22, 20]);
  const fontSize = lines.some((line) => line.length > 18) ? 9.5 : 10.5;
  const lineHeight = fontSize + 3.5;
  const firstBaseline = 118 - ((lines.length - 1) * lineHeight) / 2;

  return (
    <svg viewBox="0 0 200 200" width="220" height="220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${badgeName} badge`}>
      <defs>
        <linearGradient id="ca-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3399ff" />
          <stop offset="100%" stopColor="#0057b3" />
        </linearGradient>
        <linearGradient id="ca-ribbon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0068cc" />
          <stop offset="100%" stopColor="#004494" />
        </linearGradient>
        <filter id="ca-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="rgba(0,87,179,0.28)" />
        </filter>
        <filter id="ca-ribbon-shadow" x="-10%" y="-40%" width="120%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* Medal: gradient ring, engraved tick ring, white disc with a fine inner rule */}
      <circle cx="100" cy="98" r="92" fill="url(#ca-ring)" filter="url(#ca-shadow)" />
      <circle cx="100" cy="98" r="86.5" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.2" strokeDasharray="1.5 2.6" />
      <circle cx="100" cy="98" r="80" fill="white" />
      <circle cx="100" cy="98" r="75" fill="none" stroke="#dde1ef" strokeWidth="1" />

      <g transform="translate(86.5, 35) scale(0.1)" fill={C.blue}>
        {ADA_PATHS.map((d, i) => <path key={i} d={d} />)}
      </g>

      <text x="100" y="74" textAnchor="middle" fontSize="6.5" fontFamily="Arial, sans-serif" fill={C.blue} fontWeight="700" letterSpacing="2">
        CARDANO ACADEMY
      </text>
      <line x1="74" y1="81" x2="126" y2="81" stroke="#dde1ef" strokeWidth="1" />

      {lines.map((line, index) => (
        <text
          key={index}
          x="100"
          y={firstBaseline + index * lineHeight}
          textAnchor="middle"
          fontSize={fontSize}
          fontFamily="Arial, sans-serif"
          fill={C.tagText}
          fontWeight="700"
        >
          {line}
        </text>
      ))}

      {/* Ribbon with notched tails, folded behind the disc edge */}
      <g filter="url(#ca-ribbon-shadow)">
        <path d="M 20,150 H 62 V 178 H 20 L 29,164 Z" fill="#003a7a" />
        <path d="M 180,150 H 138 V 178 H 180 L 171,164 Z" fill="#003a7a" />
        <path d="M 40,146 H 160 L 166,164 L 160,182 H 40 L 34,164 Z" fill="url(#ca-ribbon)" />
      </g>
      <path d="M 70,164 L 75,169 L 84,159" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="113" y="167.5" textAnchor="middle" fontSize="8" fontFamily="Arial, sans-serif" fill="white" fontWeight="700" letterSpacing="1.8">
        VERIFIED
      </text>
    </svg>
  );
}

type IssuerCredential = {
  authHash: string;
  credentialType: string;
  keriAid: string;
  txHash: string;
  active: boolean;
  keriVerified: boolean;
  acdc: Record<string, unknown> | null;
};

// Resolves the IdentityAuth credential the issuing wallet registered on-chain
// (GET /api/v1/credential/{paymentCredential}?type=identity). Returns null
// until the wallet has bound its KERI AID / vLEI, so badges issued before the
// binding keep working unchanged.
function useIssuerCredential(issuerPaymentCredential?: string, backendUrl?: string): IssuerCredential | null {
  const [credential, setCredential] = useState<IssuerCredential | null>(null);

  useEffect(() => {
    if (!issuerPaymentCredential || !backendUrl) return;
    let cancelled = false;
    fetch(`${backendUrl}/api/v1/credential/${issuerPaymentCredential}?type=identity`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: IssuerCredential | null) => {
        if (!cancelled) setCredential(data && data.active ? data : null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [issuerPaymentCredential, backendUrl]);

  return credential;
}

function identityCertificateUrl(credential: IssuerCredential): string {
  return `/verify/${credential.authHash}`;
}

// "Issued by Cardano Foundation" links to the identity certificate once the
// issuing wallet is bound to its vLEI, and to the website before that.
function IssuedBy({
  issuerPaymentCredential,
  backendUrl,
}: {
  issuerPaymentCredential?: string;
  backendUrl?: string;
}): JSX.Element {
  const credential = useIssuerCredential(issuerPaymentCredential, backendUrl);
  const href = credential ? identityCertificateUrl(credential) : ISSUER.url;
  const linkTitle = credential
    ? 'Open the on-chain identity certificate of the issuing wallet'
    : ISSUER.url;

  return (
    <p
      style={{
        margin: '0 0 22px',
        fontSize: '15px',
        color: C.textMuted,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '4px 10px',
      }}
    >
      <span>
        Issued by{' '}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={linkTitle}
          style={{ color: C.link, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          {ISSUER.name}
        </a>
      </span>
      {credential && <IssuerIdentityBadge credential={credential} />}
    </p>
  );
}

function IssuerIdentityBadge({ credential }: { credential: IssuerCredential }): JSX.Element {
  const legalName = credential.acdc?.legalName ?? credential.acdc?.entityName;
  const lei = credential.acdc?.LEI;
  const label = credential.keriVerified ? 'Verified issuer identity' : 'Issuer identity registered';
  const color = credential.keriVerified ? C.greenDark : '#b45309';
  const background = credential.keriVerified ? 'rgba(0,190,122,0.12)' : 'rgba(245,158,11,0.12)';
  const title = credential.keriVerified
    ? `${legalName ? `${legalName} · ` : ''}${lei ? `LEI ${lei} · ` : ''}KERI AID ${credential.keriAid} verified through the vLEI verifier`
    : `KERI AID ${credential.keriAid} is bound to this wallet but has not been verified by the vLEI verifier yet`;

  return (
    <a
      href={identityCertificateUrl(credential)}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px 3px 8px',
        borderRadius: '999px',
        border: `1px solid ${color}`,
        background,
        fontSize: '12px',
        fontWeight: 600,
        color,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.5" stroke={color} strokeWidth="1" />
        {credential.keriVerified ? (
          <path d="M3.5 6l2 2 3-3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 3.5v3M6 8.5v.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
        )}
      </svg>
      {legalName ? String(legalName) : label}
    </a>
  );
}

function parseIssuedAt(value: string): Date | undefined {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatIssuedAt(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
}

class CardanoAcademyCertificate extends Template {
  public name = 'Cardano Academy Badge';
  public theme: Partial<ThemeSettings> = {
    background: 'bg-white',
    footer: { hide: true },
  };

  // Uncomment once the issuing wallet has registered its IdentityAuth
  // credential: badges from wallets without an active identity credential then
  // fall back to the default template instead of rendering as Academy badges.
  // public requiredCredentials = ['identity'];

  public layoutMetadata = {
    uv_url_name: 'Full name of the badge recipient (stored as a SHA-256 hash, revealed through the ?name= URL parameter)',
    badgeId: 'Badge catalog ID (e.g. BLOCKCHAIN_FUNDAMENTALS, CBCA_CERTIFICATION, AIKEN_SMART_CONTRACTS)',
    issuedAt: 'Issue date as YYYY-MM-DD',
  };

  public render(
    hash: string,
    metadata: UVerifyMetadata,
    certificate: UVerifyCertificate | undefined,
    _pagination: JSX.Element,
    extra: UVerifyCertificateExtraData,
  ): JSX.Element {
    // The UI replaces the on-chain hash with the plain name when the ?name=
    // URL parameter matches. Anything still looking like a hash stays hidden.
    const rawName = String(metadata['uv_url_name'] ?? metadata['uv_url_recipientName'] ?? '').trim();
    const recipientName = rawName && !SHA256_HEX.test(rawName) ? rawName : undefined;
    const badge = resolveBadge(String(metadata.badgeId ?? ''));
    const badgeName = String(badge?.name || metadata.badgeName || 'Cardano Academy Badge');
    const issuedDate =
      parseIssuedAt(String(metadata.issuedAt ?? '')) ??
      (certificate ? new Date(certificate.creationTime) : new Date());
    const issuedAt = formatIssuedAt(issuedDate);
    const issuerName = ISSUER.name;
    const description = String(badge?.description || metadata.description || '');
    const skillsRaw = String(badge?.skills || metadata.skills || '');
    const skills = skillsRaw.split(',').map((s) => s.trim()).filter(Boolean);
    const learningUrl = String(metadata['uv_url_learningUrl'] || ISSUER.academyUrl);
    const earningCriteriaText = String(badge?.earningCriteria || metadata.earningCriteriaText || '');
    const issuerPaymentCredential = extra.issuer || certificate?.issuer;

    const txUrl = certificate
      ? `https://cardanoscan.io/transaction/${certificate.transactionHash}`
      : undefined;

    const pdfFilename = recipientName ? `${badgeName} - ${recipientName}` : badgeName;
    const shareUrl = `${window.location.origin}/verify/${hash}${window.location.search}`;

    const shortenHash = (h: string) =>
      h.length > 20 ? `${h.slice(0, 8)}…${h.slice(-8)}` : h;

    return (
      <div
        className="ca-print-root"
        style={{
          minHeight: '100vh',
          width: '100%',
          backgroundColor: C.pageBg,
          backgroundImage: 'radial-gradient(#c6c6c6 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
          color: C.text,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          .ca-print-qr { display: none; }
          @media print {
            @page { size: A4 landscape; margin: 0; }
            html, body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .ca-print-root {
              height: 100vh;
              overflow: hidden;
            }
            .ca-print-hide { display: none !important; }
            .ca-print-qr { display: flex !important; }
          }
          @media (max-width: 640px) {
            .ca-header {
              flex-direction: column;
              justify-content: center;
              padding: 16px 20px !important;
              gap: 14px !important;
            }
            .ca-header-identity {
              flex-direction: column;
              gap: 12px !important;
              text-align: center;
            }
            .ca-header-identity > div:last-child {
              flex-direction: column;
              text-align: center;
            }
            .ca-header-divider { display: none; }
            .ca-header-actions { justify-content: center; }
            .ca-main {
              flex-direction: column;
              align-items: center !important;
              gap: 36px !important;
              padding: 36px 20px 56px !important;
            }
            .ca-details { width: 100%; min-width: 0 !important; }
            .ca-title { font-size: 24px !important; }
          }
        `}</style>
        {/* ── Header bar ── */}
        <header
          className="ca-header"
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(245,246,250,0.5)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: `1px solid ${C.headerBorder}`,
            borderBottom: `1px solid ${C.headerBorder}`,
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            flexShrink: 0,
            minHeight: '96px',
          }}
        >
          {/* Left: CA logo + divider + recipient info */}
          <div className="ca-header-identity" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <CardanoAcademyLogo />
            <div className="ca-header-divider" style={{ width: '1px', height: '32px', background: C.headerBorder }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AvatarIcon name={recipientName ?? ''} />
              <div>
                <p style={{ margin: 0, fontSize: '13px', color: C.textMuted }}>
                  Issued to{' '}
                  {recipientName ? (
                    <span style={{ color: C.text, fontWeight: 600 }}>{recipientName}</span>
                  ) : (
                    <span
                      style={{ color: C.textLight, fontStyle: 'italic' }}
                      title="The recipient name is only revealed through the link shared with the recipient."
                    >
                      privacy-protected recipient
                    </span>
                  )}
                </p>
                {issuedAt && (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: C.textLight }}>
                    {issuedAt}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: document actions + Verify */}
          <div className="ca-print-hide ca-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <DownloadPdfButton filename={pdfFilename} />
              <ShareBadgeButton
                hash={hash}
                badgeName={badgeName}
                issuerName={issuerName}
                issuedDate={issuedDate}
              />
            </div>
            <a
              href={txUrl ?? '#'}
              target={txUrl ? '_blank' : undefined}
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                fontWeight: 600,
                color: C.green,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              <CheckCircleIcon />
              Verify
            </a>
          </div>
        </header>

        {/* ── Main content ── */}
        <main
          className="ca-main"
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1040px',
            margin: '0 auto',
            padding: '52px 32px 72px',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            gap: '56px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            backgroundColor: C.pageBg,
            backgroundImage: 'radial-gradient(#c6c6c6 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Left column: badge image + earn button */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              flexShrink: 0,
            }}
          >
            <CardanoAcademyBadge badgeName={badgeName} />

            <a
              href={learningUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ca-print-hide"
              style={{
                display: 'block',
                padding: '11px 28px',
                background: C.earnBtnBg,
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
                width: '220px',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.earnBtnHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.earnBtnBg)}
            >
              Earn this badge
            </a>

            {/* Blockchain verification — sits directly under the badge */}
            {certificate && (
              <div
                style={{
                  width: '220px',
                  padding: '14px 16px',
                  background: C.blueLight,
                  border: `1px solid ${C.tagBorder}`,
                  borderLeft: `3px solid ${C.blue}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxSizing: 'border-box',
                }}
              >
                <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '11px', color: C.blue, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Blockchain Verification
                </p>
                <p style={{ margin: '0 0 5px', color: C.textMuted }}>
                  Hash:{' '}
                  <span style={{ fontFamily: 'monospace', color: C.text }}>
                    {shortenHash(hash)}
                  </span>
                </p>
                <p style={{ margin: '0 0 5px', color: C.textMuted }}>
                  Tx:{' '}
                  <span style={{ fontFamily: 'monospace', color: C.text }}>
                    {shortenHash(certificate.transactionHash)}
                  </span>
                </p>
                <p style={{ margin: '0 0 10px', color: C.textMuted }}>
                  Block <span style={{ color: C.text }}>#{certificate.blockNumber.toLocaleString()}</span>
                </p>
                <a
                  href={txUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ca-print-hide"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: C.blue,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  View in explorer →
                </a>
              </div>
            )}

            <PrintQr url={shareUrl} />
          </div>

          {/* Right column: credential details */}
          <div className="ca-details" style={{ flex: 1, minWidth: '280px' }}>
            {/* Loading / error */}
            {extra.isLoading && (
              <p style={{ fontSize: '15px', color: C.textMuted }}>Loading certificate data…</p>
            )}
            {extra.serverError && (
              <p style={{ fontSize: '15px', color: '#cc0000' }}>
                Certificate not found or unavailable.
              </p>
            )}

            {/* Badge title */}
            <h1
              className="ca-title"
              style={{
                margin: '0 0 10px',
                fontSize: '28px',
                fontWeight: 700,
                color: C.text,
                lineHeight: 1.25,
              }}
            >
              {badgeName}
            </h1>

            <IssuedBy
              issuerPaymentCredential={issuerPaymentCredential}
              backendUrl={this.uverifyConfig?.backendUrl}
            />

            {/* Description */}
            {description && (
              <p style={{ margin: '0 0 10px', fontSize: '15px', color: C.text, lineHeight: 1.7 }}>
                {description}
              </p>
            )}

            {/* Learn more link */}
            <p style={{ margin: '0 0 36px' }}>
              <a
                href={learningUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '14px', color: C.link, textDecoration: 'underline' }}
              >
                Learn more
              </a>
            </p>

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: 700, color: C.text }}>
                  Skills
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: '6px 14px',
                        border: `1.5px solid ${C.tagBorder}`,
                        borderRadius: '20px',
                        fontSize: '13px',
                        color: C.blue,
                        background: C.blueLight,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Earning Criteria */}
            {earningCriteriaText && (
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: 700, color: C.text }}>
                  Earning Criteria
                </h2>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <DocumentIcon />
                  <a
                    href={learningUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '14px', color: C.link, textDecoration: 'underline', lineHeight: 1.6 }}
                  >
                    {earningCriteriaText}
                  </a>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }
}

export default CardanoAcademyCertificate;
