import { css, CSSResultGroup, LitElement, PropertyValues } from "lit";
import { property } from "lit/decorators.js";
import { atLeastHaVersion, HomeAssistant } from "../ha";

// import { animations } from "../utils/entity-styles";
// import { defaultColorCss, defaultDarkColorCss } from "./colors";
// import { themeClorCss, themeVariables } from "./theme";

export function computeDarkMode(hass?: HomeAssistant): boolean {
    if (!hass) return false;
    return (hass.themes as any).darkMode as boolean;
}
export class MushroomBaseElement extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;
    // private _hass!: HomeAssistant;

    // set hass(hass: HomeAssistant) {
    //     this._hass = hass;
    //     this.hassUpdated(hass);
    // }

    // get hass(): HomeAssistant {
    //     return this._hass;
    // }

    // protected hassUpdated(hass: HomeAssistant): void {
    //     return;
    // }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        // console.log("first updated");
        this.toggleAttribute(
            "pre-2024-8",
            !atLeastHaVersion(this.hass.config.version, 2024, 8)
        );
    }

    protected updated(changedProps: PropertyValues): void {
        super.updated(changedProps);
    }

    // static get styles(): CSSResultGroup {
    //   return [
    //     animations,
    //     css`
    //       :host {
    //         ${defaultColorCss}
    //       }
    //       :host([dark-mode]) {
    //         ${defaultDarkColorCss}
    //       }
    //       :host {
    //         ${themeColorCss}
    //         ${themeVariables}
    //       }
    //       :host([pre-2024-8]) {
    //         --spacing: var(--mush-spacing, 12px);
    //         --control-height: var(--mush-control-height, 40px);
    //         --control-spacing: var(--mush-spacing, 12px);
    //         --icon-size: var(--mush-icon-size, 40px);
    //       }
    //     `,
    //   ];
    // }
}
