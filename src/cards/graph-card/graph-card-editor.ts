import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "../../ha";
import { GRAPH_CARD_EDITOR_NAME, SENSOR_ENTITY_DOMAINS } from "./const";
import { GraphCardConfig, graphCardConfigStruct } from "./graph-card-config";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { loadHaComponents } from "../../utils/loader";
import { assert } from "superstruct";

const SCHEMA: HaFormSchema[] = [
    {
        name: "entity",
        selector: {
            entity: {
                domain: SENSOR_ENTITY_DOMAINS,
            },
        },
    },
    {
        name: "name",
        selector: {
            text: {},
        },
    },
    {
        type: "grid",
        name: "",
        schema: [
            {
                name: "icon",
                selector: { icon: {} },
                context: { icon_entity: "entity" },
            },
            { name: "icon_color", selector: { mush_color: {} } },
        ],
    },
    ...computeActionsFormSchema(),
];

@customElement(GRAPH_CARD_EDITOR_NAME)
export class GraphCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: GraphCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: GraphCardConfig): void {
        assert(config, graphCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        return this.hass!.localize(
            `ui.panel.lovelace.editor.card.generic.${schema.name}`
        );
    };

    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                .computeLabel=${this._computeLabel}
            ></ha-form>
        `;
    }
}
