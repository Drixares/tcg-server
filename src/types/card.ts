export const CARD_TYPES = ["LEADER", "CHARACTER", "EVENT", "STAGE"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_RARITIES = [
    "L",
    "C",
    "UC",
    "R",
    "SR",
    "SEC",
    "SP CARD",
    "P",
    "TR",
] as const;
export type CardRarity = (typeof CARD_RARITIES)[number];

export const CARD_COLORS = [
    "Red",
    "Blue",
    "Green",
    "Purple",
    "Black",
    "Yellow",
    "Red/Green",
    "Red/Blue",
    "Red/Black",
    "Red/Purple",
    "Red/Yellow",
    "Blue/Black",
    "Blue/Purple",
    "Blue/Yellow",
    "Green/Blue",
    "Green/Black",
    "Green/Purple",
    "Green/Yellow",
    "Purple/Black",
    "Purple/Yellow",
    "Black/Yellow",
] as const;
export type CardColor = (typeof CARD_COLORS)[number];

export const CARD_ATTRIBUTES = [
    "Strike",
    "Slash",
    "Ranged",
    "Special",
    "Wisdom",
    "Strike/Ranged",
    "Strike/Special",
    "Strike/Wisdom",
    "Slash/Special",
    "Slash/Strike",
    "Slash / Wisdom",
] as const;
export type CardAttribute = (typeof CARD_ATTRIBUTES)[number];

export interface CardImages {
    small: string;
    large: string;
}

export interface CardAttributeInfo {
    name: string;
    image: string;
}

export interface CardNote {
    name: string;
    url: string;
}

export interface ApiCard {
    id: string;
    code: string;
    rarity: string;
    type: CardType;
    name: string;
    images: CardImages;
    cost: number | null;
    attribute: CardAttributeInfo | null;
    power: number | null;
    counter: string;
    color: string;
    family: string;
    ability: string;
    trigger: string;
    set: { name: string };
    notes: CardNote[];
}

export interface ApiPaginatedResponse<T> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: T[];
}
