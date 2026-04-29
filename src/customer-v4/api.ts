export type CustomerId = number
export type CustomerDto = {
    id: CustomerId
    name: string
    premiumSubscription: boolean
}

export interface Api {
    loadCustomer: (id: CustomerId) => Promise<CustomerDto>
    saveCustomer: (customer: CustomerDto) => Promise<void>
}

const customers : CustomerDto[] = [
    { id: 1, name: "Alice", premiumSubscription: true },
    { id: 2, name: "Bob", premiumSubscription: false },
    { id: 3, name: "John", premiumSubscription: true },
]

export const fakeApi: Api = {
    loadCustomer: (id: CustomerId) => {
        return new Promise((resolve, reject) => setTimeout(() => {
            const customer = customers.find(c => c.id === id)
            if (customer === undefined) {
                reject(new Error(`Unknown customer, id: ${id}`))
            }
            else {
                resolve(customer)
            }
        }, 1000))
    },
    saveCustomer: (customer: CustomerDto) => {
        return new Promise((resolve, reject) => setTimeout(() => {
            const customerIndex = customers.findIndex(c => c.id === customer.id)
            if (customerIndex === -1) {
                reject(new Error("Failed to save"))
            } else {
                customers[customerIndex] = customer
                resolve()
            }
        }, 1000))
    },
}
