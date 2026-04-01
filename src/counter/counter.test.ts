import { describe, test, expect } from "vitest"
import { init, update } from "./counter.app"
import type { Command, Effect, Model } from "./counter.app"

function applyCommands(commands: Command[], initialModel: Model) : { model: Model, effects: Effect[] } {
    return commands.reduce((acc, command) => {
        const { model, effects } : { model: Model, effects: Effect[] } = acc
        const { model: newModel, effects: newEffects } = update(command, model)
        return { model: newModel, effects: [...effects, ...newEffects] }
    }, { model: initialModel, effects: [] })
}

describe("counter app", () => {
    test("init should initialize counter without effect", () => {
        const result = init()

        expect(result.model).toEqual<Model>({ 
            value: 0,
            canDecrement: false,
            canIncrement: true,
        })
        expect(result.effects).toEqual<Effect[]>([])
    })

    describe("commands", () => {
        describe("Increment should", () => {
            const { model: initialModel } = init()

            test("increment counter and allow decrement", () => {
                const result = applyCommands([
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                ], initialModel)

                expect(result.model).toEqual<Model>({
                    value: 3,
                    canDecrement: true,
                    canIncrement: true,
                })
                expect(result.effects).toEqual<Effect[]>([])
            })

            test("increment counter and disallow new increment when counter reach maximum value", () => {
                const result = applyCommands([
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                ], initialModel)

                expect(result.model).toEqual<Model>({
                    value: 5,
                    canDecrement: true,
                    canIncrement: false,
                })
                expect(result.effects).toEqual<Effect[]>([])
            })

            test("do nothing when counter maximum value is already reached", () => {
                const { model } = applyCommands([
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                    { kind: "Increment" },
                ], initialModel)

                const result = update({ kind: "Increment" }, model)

                expect(result.model).toEqual<Model>(model)
                expect(result.effects).toEqual<Effect[]>([])
            })
        })

        describe("Decrement should", () => {
            const { model: initialModel } = applyCommands([
                { kind: "Increment" },
                { kind: "Increment" },
                { kind: "Increment" },
                { kind: "Increment" },
                { kind: "Increment" },
            ], init().model)

            test("decrement counter and allow increment", () => {
                const result = applyCommands([
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                ], initialModel)

                expect(result.model).toEqual<Model>({
                    value: 3,
                    canDecrement: true,
                    canIncrement: true,
                })
                expect(result.effects).toEqual<Effect[]>([])
            })

            test("decrement counter and disallow new decrement when counter reach minimum value", () => {
                const result = applyCommands([
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                ], initialModel)

                expect(result.model).toEqual<Model>({
                    value: 0,
                    canDecrement: false,
                    canIncrement: true,
                })
                expect(result.effects).toEqual<Effect[]>([])
            })

            test("do nothing when counter minimum value is already reached", () => {
                const { model } = applyCommands([
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                    { kind: "Decrement" },
                ], initialModel)

                const result = update({ kind: "Decrement" }, model)

                expect(result.model).toEqual<Model>(model)
                expect(result.effects).toEqual<Effect[]>([])
            })
        })
    })
})