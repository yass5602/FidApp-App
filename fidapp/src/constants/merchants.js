// constants/merchants.js — données DEMO issues de fidelia-ui.jsx

export const APP_NAME = "FidApp";

export const DEMO_MERCHANTS = [
  {
    id: 1,
    name: "Boulangerie Paul",
    category: "Boulangerie",
    color1: "#FF5C3A",
    color2: "#FFB347",
    maxPoints: 10,
    reward: "Une baguette offerte",
    logo: "B",
    clients: 127,
    scans: 843,
    rewards: 89,
  },
  {
    id: 2,
    name: "Café Moka",
    category: "Café",
    color1: "#1B2340",
    color2: "#2ECC9A",
    maxPoints: 5,
    reward: "Un café offert",
    logo: "M",
    clients: 94,
    scans: 521,
    rewards: 63,
  },
  {
    id: 3,
    name: "Librairie Plume",
    category: "Librairie",
    color1: "#6366F1",
    color2: "#2ECC9A",
    maxPoints: 8,
    reward: "10% de réduction",
    logo: "P",
    clients: 58,
    scans: 319,
    rewards: 41,
  },
  {
    id: 4,
    name: "Épicerie Verde",
    category: "Épicerie",
    color1: "#2ECC9A",
    color2: "#FFB347",
    maxPoints: 12,
    reward: "Panier surprise offert",
    logo: "V",
    clients: 42,
    scans: 218,
    rewards: 28,
  },
  {
    id: 5,
    name: "Fromagerie Martin",
    category: "Épicerie",
    color1: "#E91E8C",
    color2: "#FF9800",
    maxPoints: 6,
    reward: "200g de fromage offert",
    logo: "F",
    clients: 33,
    scans: 177,
    rewards: 19,
  },
];

export const DEMO_CLIENT_CARDS = [
  { merchant: DEMO_MERCHANTS[0], points: 7 },
  { merchant: DEMO_MERCHANTS[1], points: 3 },
  { merchant: DEMO_MERCHANTS[2], points: 9 },
];

export const DEMO_NOTIF_HISTORY = [
  {
    target: "Tous les clients",
    msg: "Nouveau menu de printemps dès ce matin !",
    time: "Il y a 2j",
    count: 127,
    opened: 89,
  },
  {
    target: "Clients fidèles",
    msg: "Merci pour votre fidélité, surprise cette semaine !",
    time: "Il y a 5j",
    count: 43,
    opened: 38,
  },
  {
    target: "Clients inactifs",
    msg: "Ça fait longtemps, on vous offre un café !",
    time: "Il y a 12j",
    count: 31,
    opened: 21,
  },
];

export const INVITE_CODES = [
  "FIDELE-CAFE-0001",
  "FIDELE-BIO-0002",
  "FIDELE-BOUL-0003",
  "FIDELE-DEMO-9999",
];
