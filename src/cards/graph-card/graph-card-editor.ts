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
import { EditorTarget } from "../../utils/editor";

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
    // {
    //     name: "extra_entities",
    //     selector: {
    //         entity: {
    //             multiple: true,
    //             domain: SENSOR_ENTITY_DOMAINS,
    //         },
    //     },
    // },
    ...computeActionsFormSchema(),
];

const EXTRA_SCHEMA: HaFormSchema[] = [
    {
        type: "grid",
        name: "",
        schema: [
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
            { name: "color", selector: { mush_color: {} } },
        ],
    },
];

export interface SubElementEditorConfig {
    index?: number;
    elementConfig?: any;
    type: string;
}

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
        // console.log("setting config", config);
        assert(config, graphCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        return this.hass!.localize(
            `ui.panel.lovelace.editor.card.generic.${schema.name}`
        );
    };

    @state() private _subElementEditorConfig?: SubElementEditorConfig;

    @property() protected _selectedCard = 0;
    protected render() {
        if (!this.hass || !this._config) {
            return nothing;
        }

        // return html`
        //     <ha-form
        //         .hass=${this.hass}
        //         .data=${this._config}
        //         .schema=${SCHEMA}
        //         .computeLabel=${this._computeLabel}
        //         @value-changed=${this._valueChanged}
        //     ></ha-form>
        // `;

        const selected = this._selectedCard!;

        return html`
            <div class="card-config">
                <ha-form
                    .hass=${this.hass}
                    .data=${this._config}
                    .schema=${SCHEMA}
                    .computeLabel=${this._computeLabel}
                    @value-changed=${this._valueChanged}
                ></ha-form>
                <div class="extra-entities">
                    ${this._config.extra_entities?.map(
                        (entity, idx) => html`
                            <div class="extra-entity">
                                <div class="extra-entity-label">
                                    <p>Extra Entity ${idx + 1}</p>
                                    <ha-icon-button
                                        .label=${"Remove Enitity"}
                                        class="remove-icon"
                                        .index=${idx}
                                        @click=${this._removeChip}
                                    >
                                        <ha-icon icon="mdi:close"></ha-icon>
                                    </ha-icon-button>
                                </div>
                                <ha-form
                                    .hass=${this.hass}
                                    .data=${entity}
                                    .schema=${EXTRA_SCHEMA}
                                    .computeLabel=${this._computeLabel}
                                    .configValue=${"extra_entities"}
                                    .index=${idx}
                                    @value-changed=${this._valueChanged}
                                ></ha-form>
                            </div>
                        `
                    )}
                </div>
                <ha-button
                    .label=${"Add extra entity"}
                    @click=${this._handleAddExtraEntity}
                    class="add-extra-entity"
                >
                    <ha-svg-icon
                        style="margin-left: 8px;"
                        .path=${mdiPlusBox}
                    ></ha-svg-icon>
                </ha-button>
            </div>
        `;
    }

    protected _handleAddExtraEntity() {
        if (!this._config) {
            return;
        }

        if (!this._config.extra_entities) {
            this._config.extra_entities = [];
        }

        this._config.extra_entities.push({ entity: "" });
    }

    private _valueChanged(ev: CustomEvent): void {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target! as EditorTarget;
        const configValue =
            target.configValue || this._subElementEditorConfig?.type;
        const value = target.checked ?? ev.detail.value ?? target.value;

        if (configValue === "extra_entities") {
            const index = (ev.currentTarget as any).index;
            const newExtraEntities =
                this._config.extra_entities?.concat() || [];
            newExtraEntities[index] = value;
            this._config.extra_entities = newExtraEntities;
        } else {
            this._config = {
                ...this._config,
                ...value,
            };
        }

        // console.log("viva la value changed", value, configValue);
        fireEvent(this, "config-changed", { config: this._config as any });
    }

    private _removeChip(ev: CustomEvent): void {
        if (!this._config) return;

        const index = (ev.currentTarget as any).index;

        this._config.extra_entities?.splice(index, 1);

        fireEvent(this, "config-changed", { config: this._config as any });
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

            .extra-entity-label {
                display: flex;
                align-items: center;
                flex-direction: row;
                gap: 8px;
            }

            .remove-icon,
            .edit-icon {
                --mdc-icon-button-size: 36px;
                color: var(--secondary-text-color);
            }

            .remove-icon ha-icon {
                display: flex;
            }
        `;
    }
}
