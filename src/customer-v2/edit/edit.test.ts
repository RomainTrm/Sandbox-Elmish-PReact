import { describe, test, expect } from "vitest"
import { init, update } from "./edit.app"
import type { Command, Effect, Intent, Model } from "./edit.app"

function applyCommands(commands: Command[], initialModel: Model) : { model: Model, effects: Effect[], intents: Intent[] } {
    return commands.reduce((acc, command) => {
        const { model, effects, intents } : { model: Model, effects: Effect[], intents: Intent[] } = acc
        const { model: newModel, effects: newEffects , intents: newIntents } = update(command, model)
        return { model: newModel, effects: [...effects, ...newEffects], intents: [...intents, ...newIntents] }
    }, { model: initialModel, effects: Array.of<Effect>(), intents: Array.of<Intent>() })
}

describe("edit customer app", () => {
    const initialCustomer : Model = { id: 5, name: "oldName", premiumSubscription: false }

    test("init should initialize customer and request loading", () => {
        const result = init(initialCustomer)

        expect(result.model).toEqual<Model>(initialCustomer)
        expect(result.effects).toEqual<Effect[]>([])
    })

    describe("update should", () => {
        test.each<{ initialValue: boolean, newValue: boolean }>([
            { initialValue: false, newValue: true },
            { initialValue: true, newValue: true },
            { initialValue: true, newValue: false },
        ])("UpdatePremiumSubscription", ({initialValue, newValue}) => {
            const initialModel: Model = { id: 5, name: "name", premiumSubscription: initialValue }

            const result = applyCommands([
                { kind: "UpdatePremiumSubscription", value: newValue }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                premiumSubscription: newValue,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("CancelEdit", () => {
            const initialModel: Model = { id: 5, name: "new name", premiumSubscription: true }

            const result = applyCommands([
                { kind: "CancelEdit" }
            ], initialModel)

            expect(result.model).toEqual<Model>(initialModel)
            expect(result.effects).toEqual<Effect[]>([])
            expect(result.intents).toEqual<Intent[]>([
                { kind: "CancelEdit" }
            ])
        })

        test("SaveCustomer", () => {
            const initialModel: Model = { id: 5, name: "newName", premiumSubscription: true }
            
            const result = applyCommands([
                { kind: "SaveCustomer" }
            ], initialModel)

            expect(result.model).toEqual<Model>(initialModel)
            expect(result.effects).toEqual<Effect[]>([])
            expect(result.intents).toEqual<Intent[]>([
                { kind: "SaveCustomer", customer: initialModel }
            ])
        })
    })
})