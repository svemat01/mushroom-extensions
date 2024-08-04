import { assign, object, optional, string, boolean, Infer } from "superstruct";
import { actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export const graphCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, actionsSharedConfigStruct),
    object({
        icon_color: optional(string()),
    })
);

export type GraphCardConfig = Infer<typeof graphCardConfigStruct>;
