import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
} from "../../ha";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    GRAPH_CARD_EDITOR_NAME,
    GRAPH_CARD_NAME,
    SENSOR_ENTITY_DOMAINS,
} from "./const";
import { createCardElement } from "../../utils/card-helpers";
import { GraphCardConfig } from "./graph-card-config";

// type: custom:decluttering-template
// template: mushroom_sensor_graph
// card:
//   type: custom:stack-in-card
//   cards:
//     - type: custom:mushroom-template-card
//       entity: '[[entity]]'
//       primary: '[[name]]'
//       secondary: |
//         {{ states('[[entity]]') | round(0) }}°C
//       icon: '[[icon]]'
//       icon_color: '[[icon_color]]'
//       tap_action:
//         action: more-info
//     - type: custom:mini-graph-card
//       entities:
//         - entity: '[[entity]]'
//           name: '[[name]]'
//           color: '[[color]]'
//       hours_to_show: 24
//       line_width: 3
//       animate: true
//       show:
//         name: false
//         icon: false
//         state: false
//         legend: false
//         fill: fade
//       card_mod:
//         style: |
//           ha-card {
//             background: none;
//             box-shadow: none;
//             --ha-card-border-width: 0;
//           }
// default:
//   - icon: mdi:thermometer
//   - icon_color: blue
//   - color: var(--blue-color)

registerCustomCard({
    type: GRAPH_CARD_NAME,
    name: "Mushroom Extension - Graph Card",
    description: "A custom card for displaying graphs",
});

@customElement(GRAPH_CARD_NAME)
export class GraphCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./graph-card-editor");

        return document.createElement(
            GRAPH_CARD_EDITOR_NAME
        ) as LovelaceCardEditor;
    }

    public static async getStubConfig(
        hass: HomeAssistant
    ): Promise<GraphCardConfig> {
        const entities = Object.keys(hass.states);

        const firstSensor = entities.find(
            (e) =>
                SENSOR_ENTITY_DOMAINS.includes(e.split(".")[0]) &&
                hass.states[e].attributes.state_class === "measurement"
        );
        return {
            type: `custom:${GRAPH_CARD_NAME}`,
            entity: firstSensor,
        };
    }

    private _hass?: HomeAssistant;

    set hass(hass: HomeAssistant) {
        this._hass = hass;

        if (this.templateCard) this.templateCard.hass = hass;
    }

    @state() private _config?: GraphCardConfig;

    @state() private trigger = 0;

    private templateCard?: LovelaceCard;

    getCardSize(): number {
        return 1;
    }

    setConfig(config: GraphCardConfig): void {
        this._config = config;
        this.updateHeader();
    }

    protected render() {
        if (!this._hass || !this._config) {
            return nothing;
        }

        console.log("rendering card", this._config, this.templateCard);

        return html`<ha-card> ${this.templateCard} </ha-card>`;
    }

    private async updateHeader() {
        if (!this._hass || !this._config) return;

        this.templateCard = await createCardElement({
            type: "custom:mushroom-template-card",
            entity: this._config.entity,
            primary: this._config.name || "",
            secondary: `{{ states('${this._config.entity}', rounded=True, with_unit=True) }}`,
            icon: this._config.icon,
        });

        this.templateCard.hass = this._hass;
        this.templateCard.ontouchstart = (e) => {
            e.stopImmediatePropagation();
        };

        this.requestUpdate();
    }
}
