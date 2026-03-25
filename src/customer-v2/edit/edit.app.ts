import { match } from "ts-pattern"
import type { Dispatch } from "../../elmish"
import type { CustomerDto } from "../api"

export type Model = CustomerDto

export type Command = 
    | { kind: "UpdatePremiumSubscription", value: boolean }
    | { kind: "SaveCustomer" }
    | { kind: "CancelEdit" }

export type Effect = never

export type Intent = 
    | { kind: "SaveCustomer", customer: CustomerDto }
    | { kind: "CancelEdit" }

export function init(customer: CustomerDto) : { model: Model, effects: Effect[] } {
    return {
        model: customer,
        effects: [],
    }
}

export function update(command: Command, model: Model) : { model: Model, effects: Effect[], intents: Intent[] } {
    return match(command)
        .returnType<{ model: Model, effects: Effect[], intents: Intent[] }>()
        .with({ kind: "UpdatePremiumSubscription" }, ({ value }) => {
            const newModel: Model = {
                ...model,
                premiumSubscription: value,
            }
            return { model: newModel, effects: [], intents: [] }
        })
        .with({ kind: "CancelEdit" }, () => {
            const intents: Intent[] = [
                { kind: "CancelEdit" }
            ]
            return { model: model, effects: [], intents: intents }
        })
        .with({ kind: "SaveCustomer" }, () => {
            const intents: Intent[] = [
                { kind: "SaveCustomer", customer: model }
            ]
            return { model: model, effects: [], intents }
        })
        .exhaustive()
}

export function executeEffect(_effect: Effect, _dispatch: Dispatch<Command>) : Promise<void> {
    return Promise.resolve()
}
