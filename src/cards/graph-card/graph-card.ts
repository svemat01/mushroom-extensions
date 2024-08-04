import {
    css,
    CSSResultGroup,
    html,
    LitElement,
    nothing,
    PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
    HomeAssistant,
    LovelaceCard,
    LovelaceCardConfig,
    LovelaceCardEditor,
    LovelaceLayoutOptions,
} from "../../ha";
import { registerCustomCard } from "../../utils/custom-cards";
import {
    GRAPH_CARD_EDITOR_NAME,
    GRAPH_CARD_NAME,
    SENSOR_ENTITY_DOMAINS,
} from "./const";
import { createCardElement } from "../../utils/card-helpers";
import { GraphCardConfig } from "./graph-card-config";
import { MushroomBaseCard } from "../../utils/base-card";

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
export class GraphCard extends MushroomBaseCard implements LovelaceCard {
    @state() protected _config?: GraphCardConfig;

    private hassResolve?: (...args: any[]) => void;

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

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
        if (changedProps.has("hass") && this.hass) {
            // if (this.templateCard) {
            //     this.templateCard.hass = this.hass;
            // } else {
            //     this.updateHeader();
            // }

            // if (this.graphCard) {
            //     this.graphCard.hass = this.hass;
            // } else {
            //     this.updateGraph();
            // }

            if (this.hassResolve) {
                this.hassResolve();
                this.hassResolve = undefined;
            }
        }
    }

    private templateCard?: LovelaceCard;
    private graphCard?: LovelaceCard;
    private verticalCard?: LovelaceCard;

    setConfig(config: GraphCardConfig): void {
        this._config = config;
        console.log("setting config", config);

        this.vivaLaUpdater();
    }

    protected async vivaLaUpdater() {
        console.log("updating", this._config, this.hass, this._stateObj);
        if (!this.hass) {
            console.log("no hass");
            await new Promise((resolve) => {
                this.hassResolve = resolve;
            });
            console.log("resolved");
        }

        if (!this._config || !this.hass || !this._config.entity) {
            return;
        }

        await this.updateHeader();
        await this.updateGraph();

        // console.log("creating vertical card");

        // this.verticalCard = await createCardElement({
        //     type: "vertical-stack",
        //     cards: [this.templateCard, this.graphCard],
        // });

        // this.verticalCard.hass = this.hass;

        this.requestUpdate();
    }

    protected render() {
        if (!this._config || !this.hass || !this._config.entity) {
            return nothing;
        }

        // console.log("rendering card", this._config, this.templateCard);

        return html`<ha-card>
            ${this.templateCard} ${this.graphCard}
        </ha-card>`;

        return html`<ha-card> ${this.verticalCard} </ha-card>`;
    }

    private async updateHeader() {
        console.log("updating header", this._config, this.hass, this._stateObj);
        if (!this.hass || !this._config) return;

        this.templateCard = await createCardElement({
            type: "custom:mushroom-template-card",
            entity: this._config.entity,
            primary:
                this._config.name || this._stateObj?.attributes.friendly_name,
            secondary: `{{ states('${this._config.entity}', rounded=True, with_unit=True) }}`,
            icon:
                this._config.icon ||
                this._stateObj?.attributes.icon ||
                "mdi:thermometer",
            card_mod: {
                style: `
                        ha-card {
                            box-shadow: none;
                            border: none;
                            border-radius: 0px;
                            background: transparent;
                            --ha-card-border-width: 0;
                        }
                    `,
            },
        });

        this.templateCard.hass = this.hass;
        this.templateCard.ontouchstart = (e) => {
            e.stopImmediatePropagation();
        };

        this.requestUpdate();
    }

    private async updateGraph() {
        console.log("updating graph", this._config, this.hass, this._stateObj);
        if (!this.hass || !this._config) return;

        this.graphCard = await createCardElement({
            type: "custom:mini-graph-card",
            entities: [
                {
                    entity: this._config.entity,
                    name: this._config.name,
                    color: this._config.icon_color,
                },
                ...(this._config.extra_entities?.map((entity) => {}) ?? []),
            ],
            hours_to_show: 24,
            line_width: 3,
            animate: true,
            show: {
                name: false,
                icon: false,
                state: false,
                legend: false,
                fill: "fade",
            },
            card_mod: {
                style: `
                    ha-card {
                        background: none;
                        box-shadow: none;
                        --ha-card-border-width: 0;
                        border-radius: var(--ha-card-border-radius, 12px) !important;
                    }
                    * {
                        min-height: 0;
                    }
                    :host {
                        min-height: 0;
                    }
                `,
            },
        });
        console.log("graph card", this.graphCard);

        this.graphCard.hass = this.hass;
        this.graphCard.ontouchstart = (e) => {
            e.stopImmediatePropagation();
        };

        // The shadow

        this.requestUpdate();

        await this.updateComplete;

        this.graphCard.shadowRoot
            ?.querySelector("svg")
            ?.setAttribute("preserveAspectRatio", "none");
    }

    public async getCardSize(): Promise<number> {
        if (!this.hass || !this._config) return 1;

        let size = 1;
        if (this.templateCard) {
            size += await this.templateCard.getCardSize();
        }
        if (this.graphCard) {
            size += await this.graphCard.getCardSize();
        }
        return size;
    }

    public getLayoutOptions(): LovelaceLayoutOptions {
        return {
            grid_rows: 2,
            grid_min_rows: 2,

            grid_columns: 2,
            grid_min_columns: 2,
        };
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-card {
                display: flex;
                flex-direction: column;
                gap: 0 !important;
                height: 100%;

                justify-content: space-between;
            }
        `;
    }
}
