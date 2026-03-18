import type { Dispatch } from "../elmish"
import { match } from 'ts-pattern';

export type Model = {
    value: number
}

export type Command = 
    | { kind: "Increment" }
    | { kind: "Decrement" }

export type Effect = never

export function init() : { model: Model, effects: Effect[] } {
    return {
        model: { value: 0 },
        effects: [],
    }
}

export function update(command: Command, model: Model) : { model: Model, effects: Effect[] } {
    return match(command)
        .with({ kind: "Decrement" }, _ => {
            const newModel: Model = { value: model.value - 1 }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "Increment" }, _ => {
            const newModel: Model = { value: model.value + 1 }
            return { model: newModel, effects: [] }
        })
        .exhaustive()
}

export function executeEffect(_effect: Effect, _dispatch: Dispatch<Command>) : Promise<void> {
    return Promise.resolve()
}
