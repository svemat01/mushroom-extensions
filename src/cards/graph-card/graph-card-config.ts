import {
    assign,
    object,
    optional,
    string,
    boolean,
    Infer,
    array,
} from "superstruct";
import { actionsSharedConfigStruct } from "../../shared/config/actions-config";
import { entitySharedConfigStruct } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";

export const graphCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, actionsSharedConfigStruct),
    object({
        icon_color: optional(string()),
        extra_entities: optional(
            array(
                string()
                // object({
                //     entity: string(),
                //     color: optional(string()),
                // })
            )
        ),
    })
);

export type GraphCardConfig = Infer<typeof graphCardConfigStruct>;
