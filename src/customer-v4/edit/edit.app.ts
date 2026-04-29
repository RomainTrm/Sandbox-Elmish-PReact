import { match } from "ts-pattern"
import type { Dispatch } from "../../elmish"
import type { Api, CustomerDto } from "../api"

export type Model = CustomerDto

export type InternalCommand =
    | { kind: "SaveCustomer" }
    | { kind: "UpdatePremiumSubscription", value: boolean }

export type ExternalCommand =
    | { kind: "SaveStarted" }
    | { kind: "CustomerSaved" }
    | { kind: "SaveFailed", error: string }
    | { kind: "CancelEdit" }

export type Command =
    | { kind: "ForSelf", internalCommand: InternalCommand }
    | { kind: "ForParent", parentsCommand: ExternalCommand }

export type TranslationDictionary<TParentCommand> = {
    onInternalCommand: (internalCommand: InternalCommand) => TParentCommand
    onCancelEdit: TParentCommand
    onSaveStarted: TParentCommand
    onCustomerSaved: TParentCommand
    onSaveFailed: (error: string) => TParentCommand
}

export type Translator<TParentCommand> = (msg: Command) => TParentCommand
export function translator<TParentCommand>(dict: TranslationDictionary<TParentCommand>) : Translator<TParentCommand> {
    return (cmd: Command) => {
        return match(cmd)
            .with({ kind: "ForSelf" }, ({ internalCommand }) => {
                return dict.onInternalCommand(internalCommand)
            })
            .with({ kind: "ForParent" }, ({ parentsCommand }) => {
                return match(parentsCommand)
                    .with({ kind: "SaveStarted" }, (_): TParentCommand => dict.onSaveStarted)
                    .with({ kind: "CancelEdit" }, _ => dict.onCancelEdit)
                    .with({ kind: "CustomerSaved" }, _ => dict.onCustomerSaved)
                    .with({ kind: "SaveFailed" }, ({ error }) => dict.onSaveFailed(error))
                    .exhaustive()
            })
            .exhaustive()
    }
}

export type Effect = { kind: "SaveCustomer", customer: CustomerDto }

export function init(customer: CustomerDto) : { model: Model, effects: Effect[] } {
    return {
        model: customer,
        effects: [],
    }
}

export function update(command: InternalCommand, model: Model) : { model: Model, effects: Effect[] } {
    return match(command)
        .returnType<{ model: Model, effects: Effect[] }>()
        .with({ kind: "UpdatePremiumSubscription" }, ({ value }) => {
            const newModel: Model = {
                ...model,
                premiumSubscription: value,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "SaveCustomer" }, () => {
            const effects: Effect[] = [{ kind: "SaveCustomer", customer: model }]
            return { model, effects }
        })
        .exhaustive()
}

export function forSelf(dispatch: Dispatch<Command>, cmd: InternalCommand) {
    dispatch({ kind: "ForSelf", internalCommand: cmd })
}

export function forParent(dispatch: Dispatch<Command>, cmd: ExternalCommand) {
    dispatch({ kind: "ForParent", parentsCommand: cmd })
}

export function executeEffect(effect: Effect, dispatch: Dispatch<Command>, api: Api) : Promise<void> {
    return match(effect)
        .returnType<Promise<void>>()
        .with({ kind: "SaveCustomer" }, ({ customer }) => {
            return api.saveCustomer(customer)
                .then(() => forParent(dispatch, { kind: "CustomerSaved" }))
                .catch((_error: unknown) => 
                    forParent(dispatch, { kind: "SaveFailed", error: "Error while saving customer" })
                )
        })
        .exhaustive()
}
