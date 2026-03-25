import { describe, test, expect, vi } from "vitest"
import { executeEffect, init, update } from "./customer.app"
import type { Command, Effect, Model } from "./customer.app"
import type { Api, CustomerDto } from "./api"

function applyCommands(commands: Command[], initialModel: Model) : { model: Model, effects: Effect[] } {
    return commands.reduce((acc, command) => {
        const { model, effects } : { model: Model, effects: Effect[] } = acc
        const { model: newModel, effects: newEffects } = update(command, model)
        return { model: newModel, effects: [...effects, ...newEffects] }
    }, { model: initialModel, effects: Array.of<Effect>() })
}

describe("customer app", () => {
    test("init should initialize customer and request loading", () => {
        const result = init(5)

        expect(result.model).toEqual<Model>({ 
            customerId: 5,
            error: null,
            loading: true,
            customer: null,
            customerEdition: null,
        })
        expect(result.effects).toEqual<Effect[]>([
            { kind: "LoadCustomer", customerId: 5 }
        ])
    })

    describe("update should", () => {
        test("NotifyCustomerLoaded", () => {
            const { model: initialModel } = init(5)
            const customer : CustomerDto = {
                id: 5,
                name: "Alice",
                premiumSubscription: true,
            }

            const result = applyCommands([
                { kind: "NotifyCustomerLoaded", customer }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                customerId: 5,
                customer,
                customerEdition: null,
                error: null,
                loading: false,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("NotifyLoadingError", () => {
            const { model: initialModel } = init(5)

            const result = applyCommands([
                { kind: "NotifyLoadingError", error: "Some error message" }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                customerId: 5,
                customer: null,
                customerEdition: null,
                error: "Some error message",
                loading: false,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("EditCustomer", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "name", premiumSubscription: false },
                customerEdition: null,
                error: "",
                loading: false,
            }

            const result = applyCommands([
                { kind: "EditCustomer" }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                customerEdition: { id: 5, name: "name", premiumSubscription: false },
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("EditCommand - edit", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "name", premiumSubscription: false },
                customerEdition: { id: 5, name: "name", premiumSubscription: false },
                error: "",
                loading: false,
            }

            const result = applyCommands([
                { kind: "EditCommand", subCommand: { kind: "UpdatePremiumSubscription", value: true } }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                customerEdition: { id: 5, name: "name", premiumSubscription: true },
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("EditCommand - Save", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "name", premiumSubscription: false },
                customerEdition: { id: 5, name: "name", premiumSubscription: true },
                error: "",
                loading: false,
            }

            const result = applyCommands([
                { kind: "EditCommand", subCommand: { kind: "SaveCustomer" } }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                loading: true,
            })
            expect(result.effects).toEqual<Effect[]>([
                { kind: "SaveCustomer", customer: { id: 5, name: "name", premiumSubscription: true } }
            ])
        })

        test("EditCommand - Cancel", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "name", premiumSubscription: false },
                customerEdition: { id: 5, name: "name", premiumSubscription: true },
                error: "",
                loading: false,
            }

            const result = applyCommands([
                { kind: "EditCommand", subCommand: { kind: "CancelEdit" } }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                customerEdition: null,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("NotifySaveSucceeded", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "oldName", premiumSubscription: false },
                customerEdition: { id: 5, name: "newName", premiumSubscription: true },
                error: null,
                loading: true,
            }
            
            const result = applyCommands([
                { kind: "NotifySaveSucceeded" }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                customer: initialModel.customerEdition,
                customerEdition: null,
                loading: false,
            })
            expect(result.effects).toEqual<Effect[]>([])
        })

        test("NotifySaveSucceeded", () => {
            const initialModel: Model = {
                customerId: 5,
                customer: { id: 5, name: "oldName", premiumSubscription: false },
                customerEdition: { id: 5, name: "newName", premiumSubscription: true },
                error: null,
                loading: true,
            }
            
            const result = applyCommands([
                { kind: "NotifySaveFailed", error: "error message" }
            ], initialModel)

            expect(result.model).toEqual<Model>({
                ...initialModel,
                loading: false,
                error: "error message",
            })
            expect(result.effects).toEqual<Effect[]>([])
        })
    })

    describe("effects should", () => {
        const fakeApi: Api = {
            loadCustomer: _ => { throw (new Error("Not implemented")) },
            saveCustomer: _ => { throw (new Error("Not implemented")) },
        }

        test("get customer and send NotifyCustomerLoaded on success", async () => {
            const customer : CustomerDto = {
                id: 5,
                name: "Alice",
                premiumSubscription: true,
            }

            const loadCustomer = vi.fn().mockReturnValue(Promise.resolve(customer))
            const dispatch = vi.fn()

            await executeEffect({ kind: "LoadCustomer", customerId: 5 }, dispatch, { ...fakeApi, loadCustomer })

            expect(loadCustomer).toHaveBeenCalledWith(5)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifyCustomerLoaded", customer })
        })

        test("get customer and send NotifyLoadingError on failure", async () => {
            const loadCustomer = vi.fn().mockReturnValue(Promise.reject<CustomerDto>(new Error("Some error")))
            const dispatch = vi.fn()

            await executeEffect({ kind: "LoadCustomer", customerId: 5 }, dispatch, { ...fakeApi, loadCustomer })

            expect(loadCustomer).toHaveBeenCalledWith(5)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifyLoadingError", error: "Error while loading customer" })
        })

        test("save customer and send NotifySaveSucceeded on success", async () => {
            const saveCustomer = vi.fn().mockReturnValue(Promise.resolve())
            const dispatch = vi.fn()

            const customer: CustomerDto = { id: 5, name: "John", premiumSubscription: true }
            await executeEffect({ kind: "SaveCustomer", customer }, dispatch, { ...fakeApi, saveCustomer })

            expect(saveCustomer).toHaveBeenCalledWith(customer)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifySaveSucceeded" })
        })

        test("save customer and send NotifySaveFailed on failure", async () => {
            const saveCustomer = vi.fn().mockReturnValue(Promise.reject<CustomerDto>(new Error("Some error")))
            const dispatch = vi.fn()

            const customer: CustomerDto = { id: 5, name: "John", premiumSubscription: true }
            await executeEffect({ kind: "SaveCustomer", customer }, dispatch, { ...fakeApi, saveCustomer })

            expect(saveCustomer).toHaveBeenCalledWith(customer)
            expect(dispatch).toHaveBeenCalledWith({ kind: "NotifySaveFailed", error: "Error while saving customer" })
        })
    })
})