import type { Dispatch } from "../../elmish";
import { forParent, forSelf, type Command, type Model } from "./edit.app";

export function View({ model, dispatch }: { model: Model, dispatch: Dispatch<Command> }) {
    return <>
        <div>Name: {model.name}</div>
        <div>
            <input id="premiumSubscription"
                type="checkbox"
                checked={model.premiumSubscription}
                onChange={e => forSelf(dispatch, { kind: "UpdatePremiumSubscription", value: e.currentTarget.checked })}/>
            <label for="premiumSubscription">
                Premium subscription
            </label>
        </div>
        <div>
            <button onClick={_ => {
                forParent(dispatch, { kind: "SaveStarted" })
                forSelf(dispatch, { kind: "SaveCustomer" })
            }}>Save</button>
            <button onClick={_ => forParent(dispatch, { kind: "CancelEdit" })}>Cancel</button>
        </div>
    </>
}