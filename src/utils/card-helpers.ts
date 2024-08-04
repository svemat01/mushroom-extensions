import { LovelaceCard, LovelaceCardConfig } from "../ha";

let _cardHelpers: {
    createCardElement: (...args: any[]) => any;
};

export const createCardElement = async <
    Config extends LovelaceCardConfig = LovelaceCardConfig,
    Element extends LovelaceCard = LovelaceCard
>(
    config: Config
): Promise<Element> => {
    if (!_cardHelpers) {
        _cardHelpers = await (window as any).loadCardHelpers();
    }

    return _cardHelpers.createCardElement(config);
};
