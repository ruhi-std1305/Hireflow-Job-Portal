// ════════════════════════════════════════════════
// MOCK COMPANY DATA
// Eta GET /api/companies ar GET /api/companies/:id
// theke jeshob shape data ashbe, exactly sheishape e likha hoyeche.
// Backend ready hole companyService.js e shudhu fetch call change korte hobe,
// ei file ar component gulo touch korte hobe na.
// ════════════════════════════════════════════════
import brainstation23 from "../assets/logos/brainstation23.png";
import pathao from "../assets/logos/pathao.png";
import bkash from "../assets/logos/bkash.png";
import shopup from "../assets/logos/shopup.png";
import robi from "../assets/logos/robi.png";
import daraz from "../assets/logos/daraz.png";

export const mockCompanies = [
  {
    id: 'co1',
    name: 'Brain Station 23',
    industry: 'Software Development',
    location: 'Dhaka, Bangladesh',
    website: 'https://brainstation-23.com',
    description: 'Brain Station 23 is a leading software development company in Bangladesh, delivering enterprise software solutions globally.',
    logo: brainstation23, 
    initials: 'BS',
    color: '#1A5CFF',
  },
  {
    id: 'co2',
    name: 'Pathao',
    industry: 'Tech / Mobility',
    location: 'Dhaka, Bangladesh',
    website: 'https://pathao.com',
    description: 'Pathao is Bangladesh\'s leading super app offering ride-sharing, food delivery, and courier services.',
    logo: pathao,
    initials: 'PT',
    color: '#E3000F',
  },
  {
    id: 'co3',
    name: 'bKash',
    industry: 'Fintech',
    location: 'Dhaka, Bangladesh',
    website: 'https://bkash.com',
    description: 'bKash is Bangladesh\'s largest mobile financial service provider, enabling millions to send, receive, and pay digitally.',
    logo: bkash,
    initials: 'BK',
    color: '#E2136E',
  },
  {
    id: 'co4',
    name: 'ShopUp',
    industry: 'E-commerce / B2B',
    location: 'Dhaka, Bangladesh',
    website: 'https://shopup.com.bd',
    description: 'ShopUp is a B2B commerce platform empowering small businesses across Bangladesh with supply chain and financing solutions.',
    logo: shopup,
    initials: 'SU',
    color: '#F97316',
  },
  {
    id: 'co5',
    name: 'Robi Axiata',
    industry: 'Telecommunications',
    location: 'Dhaka, Bangladesh',
    website: 'https://robi.com.bd',
    description: 'Robi Axiata is one of Bangladesh\'s largest telecom operators, providing mobile, internet, and digital services nationwide.',
    logo: robi,
    initials: 'RA',
    color: '#E3000F',
  },
  {
    id: 'co6',
    name: 'Daraz',
    industry: 'E-commerce',
    location: 'Dhaka, Bangladesh',
    website: 'https://daraz.com.bd',
    description: 'Daraz is Bangladesh\'s largest e-commerce marketplace, connecting millions of buyers and sellers across the country.',
    logo: daraz,
    initials: 'DZ',
    color: '#F57224',
  },
];
