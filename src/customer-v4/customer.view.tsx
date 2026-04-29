import type { Dispatch } from "../elmish";
import type { CustomerDto } from "./api";
import { translator, type Command, type Model } from "./customer.app";
import { View as EditCustomerView } from "./edit/edit.view";

function DisplayCustomerView({ customer, dispatch }: { customer: CustomerDto, dispatch: Dispatch<Command> }) {
    return <>
        <div>Name: {customer.name}</div>
        <div>Premium subscription: {customer.premiumSubscription ? "yes" : "no"}</div>
        <button onClick={_ => dispatch({ kind: "EditCustomer" })}>Edit</button>
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
            <EditCustomerView 
                model={model.customerEdition} 
                dispatch={(cmd) => dispatch(translator(cmd))} 
            />
        }
    </>
}