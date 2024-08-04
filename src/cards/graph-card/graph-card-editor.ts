import { css, CSSResultGroup, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { fireEvent, HomeAssistant, LovelaceCardEditor } from "../../ha";
import { GRAPH_CARD_EDITOR_NAME, SENSOR_ENTITY_DOMAINS } from "./const";
import { GraphCardConfig, graphCardConfigStruct } from "./graph-card-config";
import { HaFormSchema } from "../../utils/form/ha-form";
import { computeActionsFormSchema } from "../../shared/config/actions-config";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { loadHaComponents } from "../../utils/loader";
import { assert } from "superstruct";
import { MushroomBaseElement } from "../../utils/base-element";
import { mdiPlusBox } from "@mdi/js";

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
    {
        name: "extra_entities",
        selector: {
            entity: {
                multiple: true,
                domain: SENSOR_ENTITY_DOMAINS,
            },
        },
    },
    ...computeActionsFormSchema(),
];

// const EXTRA_SCHEMA: HaFormSchema[] = [
//     {
//         type: "grid",
//         name: "",
//         schema: [
//             {
//                 name: "entity",
//                 selector: {
//                     entity: {
//                         domain: SENSOR_ENTITY_DOMAINS,
//                     },
//                 },
//             },
//             { name: "color", selector: { mush_color: {} } },
//         ],
//     },
// ];

@customElement(GRAPH_CARD_EDITOR_NAME)
export class GraphCardEditor
    extends MushroomBaseElement
    implements LovelaceCardEditor
{
    @state() private _config?: GraphCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: GraphCardConfig): void {
        console.log("setting config", config);
        assert(config, graphCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        return this.hass!.localize(
            `ui.panel.lovelace.editor.card.generic.${schema.name}`
        );
    };

    @property() protected _selectedCard = 0;
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
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;

        const selected = this._selectedCard!;

        // return html`
        //     <div class="card-config">
        //         <ha-form
        //             .hass=${this.hass}
        //             .data=${this._config}
        //             .schema=${SCHEMA}
        //             .computeLabel=${this._computeLabel}
        //             @value-changed=${this._valueChanged}
        //         ></ha-form>
        //         <div class="extra-entities">
        //             ${this._config.extra_entities?.map(
        //                 (entity, idx) => html`
        //                     <ha-form
        //                         .hass=${this.hass}
        //                         .data=${entity}
        //                         .schema=${EXTRA_SCHEMA}
        //                         .computeLabel=${this._computeLabel}
        //                         @value-changed=${(ev: CustomEvent) =>
        //                             this._extraEntityValueChanged(ev, idx)}
        //                     ></ha-form>
        //                 `
        //             )}
        //         </div>
        //         <ha-button
        //             .label=${"Add extra entity"}
        //             @click=${this._handleAddExtraEntity}
        //             class="add-extra-entity"
        //         >
        //             <ha-svg-icon
        //                 style="margin-left: 8px;"
        //                 .path=${mdiPlusBox}
        //             ></ha-svg-icon>
        //         </ha-button>
        //     </div>
        // `;
    }

    // protected _handleAddExtraEntity() {
    //     if (!this._config) {
    //         return;
    //     }

    //     this._config.extra_entities = [
    //         ...(this._config.extra_entities ?? []),
    //         { entity: "" },
    //     ];
    // }

    private _valueChanged(ev: CustomEvent): void {
        console.log("value changed", ev.detail.value);
        fireEvent(this, "config-changed", { config: ev.detail.value as any });
    }

    public static get styles(): CSSResultGroup {
        return css`
            .card-config {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .extra-entities {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }
        `;
    }
}
