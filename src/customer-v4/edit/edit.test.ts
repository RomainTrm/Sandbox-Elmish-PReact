import { describe, test, expect, vi } from "vitest"
import { executeEffect, init, translator, update } from "./edit.app"
import type { Command, Effect, InternalCommand, Model, TranslationDictionary } from "./edit.app"
import type { Api } from "../api"

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
            const result = update({ kind: "UpdatePremiumSubscription", value: newValue }, initialModel)
            
            expect(result.model).toEqual<Model>({
                ...initialModel,
                premiumSubscription: newValue,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("SaveCustomer", () => {
            const initialModel: Model = { id: 5, name: "newName", premiumSubscription: true }
            const result = update({ kind: "SaveCustomer" }, initialModel)

            expect(result.model).toEqual<Model>(initialModel)
            expect(result.effects).toEqual<Effect[]>([
                { kind: "SaveCustomer", customer: initialModel }
            ])
        })
    })

    describe("translator should", () => {
        const defaultTranslatorDict: TranslationDictionary<string> = {
            onInternalCommand: (internalCommand: InternalCommand) => internalCommand.kind,
            onCancelEdit: "onCancelEdit",
            onSaveStarted: "onSaveStarted",
            onCustomerSaved: "onCustomerSaved",
            onSaveFailed: (error: string) => error,
        }

        test.each<{ case: String, command: Command, expectedResult: string }>([
            { 
                case: "CancelEdit",
                command: { kind: "ForParent", parentsCommand: { kind: "CancelEdit" } },
                expectedResult: defaultTranslatorDict.onCancelEdit,
            },
            { 
                case: "SaveStarted",
                command: { kind: "ForParent", parentsCommand: { kind: "SaveStarted" } },
                expectedResult: defaultTranslatorDict.onSaveStarted,
            },
            { 
                case: "CustomerSaved",
                command: { kind: "ForParent", parentsCommand: { kind: "CustomerSaved" } },
                expectedResult: defaultTranslatorDict.onCustomerSaved,
            },
            { 
                case: "SaveFailed",
                command: { kind: "ForParent", parentsCommand: { kind: "SaveFailed", error: "my error" } },
                expectedResult: "my error",
            },
            { 
                case: "UpdatePremiumSubscription",
                command: { kind: "ForSelf", internalCommand: { kind: "UpdatePremiumSubscription", value: true } },
                expectedResult: "UpdatePremiumSubscription",
            },
            { 
                case: "SaveCustomer",
                command: { kind: "ForSelf", internalCommand: { kind: "SaveCustomer" } },
                expectedResult: "SaveCustomer",
            },
        ])("translate command correctly - $case", ({ command, expectedResult }) => {
            const result = translator(defaultTranslatorDict)(command)
            expect(result).toEqual(expectedResult)
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
            const expectedCommand: Command = { kind: "ForParent", parentsCommand: { kind: "CustomerSaved" }}
            expect(dispatch).toHaveBeenCalledWith(expectedCommand)
        })

        test("save customer and send NotifySaveFailed on failure", async () => {
            const saveCustomer = vi.fn().mockReturnValue(Promise.reject(new Error("Some error")))
            const dispatch = vi.fn()

            const customer = { id: 5, name: "newName", premiumSubscription: true }
            await executeEffect({ kind: "SaveCustomer", customer }, dispatch, { ...fakeApi, saveCustomer })

            expect(saveCustomer).toHaveBeenCalledWith(customer)
            const expectedCommand: Command = { kind: "ForParent", parentsCommand: { kind: "SaveFailed", error: "Error while saving customer" } }
            expect(dispatch).toHaveBeenCalledWith(expectedCommand)
        })
    })
})