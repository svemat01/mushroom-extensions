import { HassEntity } from "home-assistant-js-websocket";
import { html, nothing, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
    computeRTL,
    computeStateDisplay,
    HomeAssistant,
    isActive,
    isAvailable,
    LovelaceLayoutOptions,
} from "../ha";
import {
    Appearance,
    AppearanceSharedConfig,
} from "../shared/config/appearance-config";
import { EntitySharedConfig } from "../shared/config/entity-config";
import { computeAppearance } from "./appearance";
import { MushroomBaseElement } from "./base-element";
import { computeInfoDisplay } from "./info";

type BaseConfig = EntitySharedConfig & AppearanceSharedConfig;

export function computeDarkMode(hass?: HomeAssistant): boolean {
    if (!hass) return false;
    return (hass.themes as any).darkMode as boolean;
}
export class MushroomBaseCard<
    T extends BaseConfig = BaseConfig,
    E extends HassEntity = HassEntity
> extends MushroomBaseElement {
    @state() protected _config?: T;

    @property({ reflect: true, type: String })
    public layout: string | undefined;

    protected get _stateObj(): E | undefined {
        if (!this._config || !this.hass || !this._config.entity)
            return undefined;

        const entityId = this._config.entity;
        return this.hass.states[entityId] as E;
    }

    protected get hasControls(): boolean {
        return false;
    }

    setConfig(config: T): void {
        // console.log("setting config base card", config);
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    public getCardSize(): number | Promise<number> {
        // console.log("getting card size");
        let height = 1;
        if (!this._config) return height;
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            height += 1;
        }
        if (
            appearance?.layout !== "horizontal" &&
            this.hasControls &&
            !(
                "collapsible_controls" in this._config &&
                this._config?.collapsible_controls
            )
        ) {
            height += 1;
        }
        return height;
    }

    public getLayoutOptions(): LovelaceLayoutOptions {
        const options = {
            grid_columns: 2,
            grid_rows: 1,
        };
        if (!this._config) return options;
        const appearance = computeAppearance(this._config);
        if (appearance.layout === "vertical") {
            options.grid_rows += 1;
        }
        if (appearance.layout === "horizontal") {
            options.grid_columns = 4;
        }
        if (appearance?.layout !== "horizontal" && this.hasControls) {
            options.grid_rows += 1;
        }
        return options;
    }

    protected renderPicture(picture: string): TemplateResult {
        // console.log("rendering picture", picture);
        return html`
            <mushroom-shape-avatar
                slot="icon"
                .picture_url=${(this.hass as any).hassUrl(picture)}
            ></mushroom-shape-avatar>
        `;
    }

    protected renderNotFound(config: BaseConfig): TemplateResult {
        // console.log("rendering not found", config);
        const appearance = computeAppearance(config);
        const rtl = computeRTL(this.hass);

        return html`
            <ha-card
                class=${classMap({
                    "fill-container": appearance.fill_container,
                })}
            >
                <mushroom-card .appearance=${appearance} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .appearance=${appearance}
                        disabled
                    >
                        <mushroom-shape-icon slot="icon" disabled>
                            <ha-icon icon="mdi:help"></ha-icon>
                        </mushroom-shape-icon>
                        <mushroom-badge-icon
                            slot="badge"
                            class="not-found"
                            icon="mdi:exclamation-thick"
                        ></mushroom-badge-icon>
                        <mushroom-state-info
                            slot="info"
                            .primary=${config.entity}
                            .secondary=${"Entity not found"}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                </mushroom-card>
            </ha-card>
        `;
    }

    protected renderIcon(stateObj: HassEntity, icon?: string): TemplateResult {
        // console.log("rendering icon", stateObj, icon);
        const active = isActive(stateObj);
        return html`
            <mushroom-shape-icon slot="icon" .disabled=${!active}>
                <ha-state-icon
                    .hass=${this.hass}
                    .stateObj=${stateObj}
                    .icon=${icon}
                ></ha-state-icon
            ></mushroom-shape-icon>
        `;
    }

    protected renderBadge(stateObj: HassEntity) {
        // console.log("rendering badge", stateObj);
        const unavailable = !isAvailable(stateObj);
        return unavailable
            ? html`
                  <mushroom-badge-icon
                      class="unavailable"
                      slot="badge"
                      icon="mdi:help"
                  ></mushroom-badge-icon>
              `
            : nothing;
    }

    protected renderStateInfo(
        stateObj: HassEntity,
        appearance: Appearance,
        name: string,
        state?: string
    ): TemplateResult | null {
        // console.log("rendering state info", stateObj, appearance, name, state);
        const defaultState = this.hass.formatEntityState
            ? this.hass.formatEntityState(stateObj)
            : computeStateDisplay(
                  this.hass.localize,
                  stateObj,
                  this.hass.locale,
                  this.hass.config,
                  this.hass.entities
              );
        const displayState = state ?? defaultState;

        const primary = computeInfoDisplay(
            appearance.primary_info,
            name,
            displayState,
            stateObj,
            this.hass
        );

        const secondary = computeInfoDisplay(
            appearance.secondary_info,
            name,
            displayState,
            stateObj,
            this.hass
        );

        return html`
            <mushroom-state-info
                slot="info"
                .primary=${primary}
                .secondary=${secondary}
            ></mushroom-state-info>
        `;
    }
}
