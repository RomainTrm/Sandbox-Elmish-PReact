import type { Dispatch } from "../elmish"
import { match } from 'ts-pattern';

export type Model = {
    value: number
    canIncrement: boolean
    canDecrement: boolean
}

export type Command = 
    | { kind: "Increment" }
    | { kind: "Decrement" }

export type Effect = never

export function init() : { model: Model, effects: Effect[] } {
    return {
        model: {
            value: 0,
            canIncrement: true,
            canDecrement: false,
        },
        effects: [],
    }
}

export function update(command: Command, model: Model) : { model: Model, effects: Effect[] } {
    return match(command)
        .with({ kind: "Decrement" }, _ => {
            if (model.value <= 0) return { model, effects: [] }

            const newValue = model.value - 1;
            const newModel: Model = {
                value: newValue,
                canDecrement: newValue > 0,
                canIncrement: true,
            }
            return { model: newModel, effects: [] }
        })
        .with({ kind: "Increment" }, _ => {
            if (model.value >= 5) return { model, effects: [] }

            const newValue = model.value + 1;
            const newModel: Model = {
                value: newValue,
                canDecrement: true,
                canIncrement: newValue < 5
            }
            return { model: newModel, effects: [] }
        })
        .exhaustive()
}

export function executeEffect(_effect: Effect, _dispatch: Dispatch<Command>) : Promise<void> {
    return Promise.resolve()
}
