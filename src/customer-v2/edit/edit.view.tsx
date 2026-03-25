import type { Dispatch } from "../../elmish";
import type { Command, Model } from "./edit.app";

export function View({ model, dispatch }: { model: Model, dispatch: Dispatch<Command> }) {
    return <>
        <div>Name: {model.name}</div>
        <div>
            <input id="premiumSubscription"
                type="checkbox"
                checked={model.premiumSubscription}
                onChange={e => dispatch({ kind: "UpdatePremiumSubscription", value: e.currentTarget.checked })}/>
            <label for="premiumSubscription">
                Premium subscription
            </label>
        </div>
        <div>
            <button onClick={_ => dispatch({ kind: "SaveCustomer" })}>Save</button>
            <button onClick={_ => dispatch({ kind: "CancelEdit" })}>Cancel</button>
        </div>
    </>
}