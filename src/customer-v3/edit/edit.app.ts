import { match } from "ts-pattern"
import type { Dispatch } from "../../elmish"
import type { Api, CustomerDto } from "../api"

export type Model = CustomerDto

export type Command =
    | { kind: "UpdatePremiumSubscription", value: boolean }
    | { kind: "SaveCustomer" }
    | { kind: "NotifySaveSucceeded" }
    | { kind: "NotifySaveFailed", error: string }
    | { kind: "CancelEdit" }

export type Effect = { kind: "SaveCustomer", customer: CustomerDto }

export type Intent =
    | { kind: "SaveStarted" }
    | { kind: "CustomerSaved" }
    | { kind: "SaveFailed", error: string }
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
            const effects: Effect[] = [{ kind: "SaveCustomer", customer: model }]
            const intents: Intent[] = [{ kind: "SaveStarted" }]
            return { model, effects, intents }
        })
        .with({ kind: "NotifySaveSucceeded" }, () => {
            const intents: Intent[] = [{ kind: "CustomerSaved" }]
            return { model, effects: [], intents }
        })
        .with({ kind: "NotifySaveFailed" }, ({ error }) => {
            const intents: Intent[] = [{ kind: "SaveFailed", error }]
            return { model, effects: [], intents }
        })
        .exhaustive()
}

export function executeEffect(effect: Effect, dispatch: Dispatch<Command>, api: Api) : Promise<void> {
    return match(effect)
        .returnType<Promise<void>>()
        .with({ kind: "SaveCustomer" }, ({ customer }) => {
            return api.saveCustomer(customer)
                .then(() =>
                    dispatch({ kind: "NotifySaveSucceeded" })
                )
                .catch((_error: unknown) =>
                    dispatch({ kind: "NotifySaveFailed", error: "Error while saving customer" })
                )
        })
        .exhaustive()
}
