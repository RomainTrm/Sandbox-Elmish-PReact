import { describe, test, expect } from "vitest"
import { init, update } from "./counter.app"
import type { Command, Effect, Model } from "./counter.app"

function applyCommands(commands: Command[]) : { model: Model, effects: Effect[] } {
    return commands.reduce((acc, command) => {
        const { model, effects } : { model: Model, effects: Effect[] } = acc
        const { model: newModel, effects: newEffects } = update(command, model)
        return { model: newModel, effects: [...effects, ...newEffects] }
    }, init())
}

describe("counter app", () => {
    test("init should initialize counter without effect", () => {
        const result = init()

        expect(result.model).toEqual<Model>({ value: 0 })
        expect(result.effects).toEqual<Effect[]>([])
    })

    describe("commands should", () => {
        test("increment counter", () => {
            const result = applyCommands([
                { kind: "Increment" },
                { kind: "Increment" },
                { kind: "Increment" },
            ])
            
            expect(result.model).toEqual<Model>({ value: 3 })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("decrement counter", () => {
            const result = applyCommands([
                { kind: "Decrement" },
                { kind: "Decrement" },
            ])
            
            expect(result.model).toEqual<Model>({ value: -2 })
            expect(result.effects).toEqual<Effect[]>([])
        })
    })
})