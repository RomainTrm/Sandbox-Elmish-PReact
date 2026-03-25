import type { Dispatch } from "../elmish";
import type { CustomerDto } from "./api";
import type { Command, Model } from "./customer.app";

function DisplayCustomerView({ customer, dispatch }: { customer: CustomerDto, dispatch: Dispatch<Command> }) {
    return <>
        <div>Name: {customer.name}</div>
        <div>Premium subscription: {customer.premiumSubscription ? "yes" : "no"}</div>
        <button onClick={_ => dispatch({ kind: "EditCustomer" })}>Edit</button>
    </>
}

function EditCustomerView({ customer, dispatch }: { customer: CustomerDto, dispatch: Dispatch<Command> }) {
    return <>
        <div>Name: {customer.name}</div>
        <div>
            <input id="premiumSubscription"
                type="checkbox"
                checked={customer.premiumSubscription}
                onChange={e => dispatch({ kind: "UpdatePremiumSubscription", value: e.currentTarget.checked })}/>
            <label for="premiumSubscription">
                Premium subscription
            </label>
        </div>
        <div>
            <button onClick={_ => dispatch({ kind: "SaveCustomer" })}>Save</button>
            <button onClick={_ => dispatch({ kind: "CancelEdit"})}>Cancel</button>
        </div>
    </>
}

export function View({ model, dispatch }: { model: Model, dispatch: Dispatch<Command> }) {
    if (model.loading)
        return <>Loading</>

    return <>
        {model.error && <>{`An error occured: ${model.error}`}</>}
        {model.customer && !model.customerEdition && 
            <DisplayCustomerView customer={model.customer} dispatch={dispatch} />
        }
        {model.customerEdition &&
            <EditCustomerView customer={model.customerEdition} dispatch={dispatch} />
        }
    </>
}