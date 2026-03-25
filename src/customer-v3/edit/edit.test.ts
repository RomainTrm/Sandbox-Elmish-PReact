import { describe, test, expect, vi } from "vitest"
import { executeEffect, init, update } from "./edit.app"
import type { Command, Effect, Intent, Model } from "./edit.app"
import type { Api } from "../api"

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
            expect(result.effects).toEqual<Effect[]>([
                { kind: "SaveCustomer", customer: initialModel }
            ])
            expect(result.intents).toEqual<Intent[]>([
                { kind: "SaveStarted" }
            ])
        })

        test("NotifySaveSucceeded", () => {
            const initialModel: Model = { id: 5, name: "newName", premiumSubscription: true }

            const result = applyCommands([
                { kind: "NotifySaveSucceeded" }
            ], initialModel)

            expect(result.model).toEqual<Model>(initialModel)
            expect(result.effects).toEqual<Effect[]>([])
            expect(result.intents).toEqual<Intent[]>([
                { kind: "CustomerSaved" }
            ])
        })

        test("NotifySaveFailed", () => {
            const initialModel: Model = { id: 5, name: "newName", premiumSubscription: true }

            const result = applyCommands([
                { kind: "NotifySaveFailed", error: "some error" }
            ], initialModel)

            expect(result.model).toEqual<Model>(initialModel)
            expect(result.effects).toEqual<Effect[]>([])
            expect(result.intents).toEqual<Intent[]>([
                { kind: "SaveFailed", error: "some error" }
            ])
        })
    })

    describe("effects should", () => {
        const fakeApi: Api = {
            loadCustomer: _ => { throw new Error("Not implemented") },
            saveCustomer: _ => { throw new Error("Not implemented") },
        }

        test("save customer and send NotifySaveSucceeded on success", async () => {
            const saveCustomer = vi.fn().mockReturnValue(Promise.resolve())
            const dispatch = vi.fn()

            const customer = { id: 5, name: "newName", premiumSubscription: true }
            await executeEffect({ kind: "SaveCustomer", customer }, dispatch, { ...fakeApi, saveCustomer })

            expect(saveCustomer).toHaveBeenCalledWith(customer)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifySaveSucceeded" })
        })

        test("save customer and send NotifySaveFailed on failure", async () => {
            const saveCustomer = vi.fn().mockReturnValue(Promise.reject(new Error("Some error")))
            const dispatch = vi.fn()

            const customer = { id: 5, name: "newName", premiumSubscription: true }
            await executeEffect({ kind: "SaveCustomer", customer }, dispatch, { ...fakeApi, saveCustomer })

            expect(saveCustomer).toHaveBeenCalledWith(customer)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifySaveFailed", error: "Error while saving customer" })
        })
    })
})