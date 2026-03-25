import { match } from "ts-pattern"
import type { Dispatch } from "../elmish"
import type { Api, CustomerDto, CustomerId } from "./api"
import type { Command as EditCommand, Model as EditModel, Intent as EditIntent } from "./edit/edit.app"
import { init as editFormInit, update as editFormUpdate } from "./edit/edit.app"

export type Model = {
    customerId: CustomerId
    loading: boolean
    error: string | null
    customer: CustomerDto | null
    customerEdition: EditModel | null
}

export type Command = 
    | { kind: "NotifyCustomerLoaded", customer: CustomerDto }
    | { kind: "NotifyLoadingError", error: string }
    | { kind: "EditCustomer" }
    | { kind: "EditCommand", subCommand: EditCommand }
    | { kind: "NotifySaveSucceeded" }
    | { kind: "NotifySaveFailed", error: string }

export type Effect = 
    | { kind: "LoadCustomer", customerId: CustomerId }
    | { kind: "SaveCustomer", customer: CustomerDto }

export function init(customerId: CustomerId) : { model: Model, effects: Effect[] } {
    return {
        model: { 
            customerId: customerId,
            customer: null,
            customerEdition: null,
            error: null,
            loading: true,
        },
        effects: [
            { kind: "LoadCustomer", customerId }
        ],
    }
}

export function update(command: Command, model: Model) : { model: Model, effects: Effect[] } {
    return match(command)
        .returnType<{ model: Model, effects: Effect[] }>()
        .with({ kind: "NotifyCustomerLoaded" }, ({ customer }) => {
            const newModel: Model = {
                ...model,
                customer,
                loading: false,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "NotifyLoadingError" }, ({ error }) => {
            const newModel: Model = {
                ...model,
                error,
                loading: false,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "EditCustomer" }, () => {
            if (model.customer === null) return { model, effects:[] }
            
            const { model: customerEdition } = editFormInit(model.customer)
            const newModel: Model = {
                ...model,
                customerEdition,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "EditCommand" }, ({ subCommand }) => {
            if (!model.customerEdition) return { model, effects: [] }

            const result = editFormUpdate(subCommand, model.customerEdition)
            const newModel: Model = { 
                ...model, 
                customerEdition: result.model,
            }

            return result.intents.reduce(
                applyIntent,
                { model: newModel, effects: [] }
            )
        })
        .with({ kind: "NotifySaveSucceeded" }, () => {
            const newModel: Model = {
                ...model,
                customer: model.customerEdition,
                customerEdition: null,
                loading: false,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "NotifySaveFailed" }, ({ error }) => {
            const newModel: Model = {
                ...model,
                error,
                loading: false,
            }
            return { model: newModel, effects: [] }
        })
        .exhaustive()
}

function applyIntent(state: { model: Model, effects: Effect[] }, intent: EditIntent) : { model: Model, effects: Effect[] } {
    return match(intent)
        .returnType<{ model: Model, effects: Effect[] }>()
        .with({ kind: "SaveCustomer" }, ({ customer }) => {
            const newModel: Model = {
                ...state.model,
                loading: true,
            }
            const newEffects: Effect[] = [
                ...state.effects,
                { kind: "SaveCustomer", customer },
            ]
            return { model: newModel, effects: newEffects }
        })
        .with({ kind: "CancelEdit" }, () => {
            const newModel: Model = {
                ...state.model,
                customerEdition: null,
            }
            return { model: newModel, effects: state.effects }
        })
        .exhaustive()
}

export function executeEffect(effect: Effect, dispatch: Dispatch<Command>, api: Api) : Promise<void> {
    return match(effect)
        .returnType<Promise<void>>()
        .with({ kind: "LoadCustomer" }, ({ customerId }) => {
            return api.loadCustomer(customerId)
                .then(customer => 
                    dispatch({ kind: "NotifyCustomerLoaded", customer })
                )
                .catch((_error: unknown) => 
                    dispatch({ kind: "NotifyLoadingError", error: "Error while loading customer" })
                )
        })
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
