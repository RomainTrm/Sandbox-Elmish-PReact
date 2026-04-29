import { match } from "ts-pattern"
import type { Dispatch } from "../elmish"
import type { Api, CustomerDto, CustomerId } from "./api"
import type { InternalCommand as EditSubCommand, Command as EditCommand, Effect as EditEffect, Model as EditModel } from "./edit/edit.app"
import { init as editFormInit, update as editFormUpdate, executeEffect as editFormExecuteEffect, translator as editTranslator } from "./edit/edit.app"

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
    | { kind: "EditCommand", subCommand: EditSubCommand }
    | { kind: "NotifySavingCustomer" }
    | { kind: "CancelEdit" }
    | { kind: "NotifyCustomerSaved" }
    | { kind: "NotifySaveFailed", error: string }

export type Effect =
    | { kind: "LoadCustomer", customerId: CustomerId }
    | { kind: "EditEffect", effect: EditEffect }

export const translator = editTranslator<Command>({
    onInternalCommand: (cmd) => ({ kind: "EditCommand", subCommand: cmd }),
    onCancelEdit: ({ kind: "CancelEdit" }),
    onSaveStarted: ({ kind: "NotifySavingCustomer" }),
    onCustomerSaved: ({ kind: "NotifyCustomerSaved" }),
    onSaveFailed: (error) => ({ kind: "NotifySaveFailed", error })
})

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
            const editEffects: Effect[] = result.effects.map(e => ({ kind: "EditEffect", effect: e }))
            return { model: newModel, effects: editEffects }
        })
        .with({ kind: "CancelEdit" }, _ => {
            const newModel: Model = {
                ...model,
                customerEdition: null,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "NotifySavingCustomer" }, _ => {
            const newModel: Model = { 
                ...model, 
                loading: true,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "NotifyCustomerSaved" }, () => {
            const newModel: Model = {
                ...model,
                customer: model.customerEdition,
                customerEdition: null,
                loading: false,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "NotifySaveFailed" }, ({ error }) => {
            const newModel : Model = { 
                ...model, 
                error, 
                loading: false,
            }
            return { model: newModel, effects: [] }
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
        .with({ kind: "EditEffect" }, ({ effect: editEffect }) => {
            const editDispatch = (cmd: EditCommand) => dispatch(translator(cmd))
            return editFormExecuteEffect(editEffect, editDispatch, api)
        })
        .exhaustive()
}
