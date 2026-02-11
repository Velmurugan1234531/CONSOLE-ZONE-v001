export interface MarketplaceSettings {
    tradeInRate: number; // Percentage of shelf price paid in cash (e.g., 0.4)
    creditBonus: number; // Percentage bonus for store credit (e.g., 0.2)
    payoutTiers: {
        credit: number; // hours
        bank: number; // hours
        upi: number; // hours
    };
}

const DEFAULT_SETTINGS: MarketplaceSettings = {
    tradeInRate: 0.4,
    creditBonus: 0.2,
    payoutTiers: {
        credit: 12,
        bank: 24,
        upi: 48
    }
};

export const getMarketplaceSettings = (): MarketplaceSettings => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const saved = localStorage.getItem('marketplace_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveMarketplaceSettings = (settings: MarketplaceSettings) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('marketplace_settings', JSON.stringify(settings));
    }
};

export const resetMarketplaceSettings = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('marketplace_settings');
    }
};
