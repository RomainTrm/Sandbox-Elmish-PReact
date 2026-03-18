import type { Dispatch } from "../elmish";
import type { Command, Model } from "./counter.app";

export function View(props: { model: Model, dispatch: Dispatch<Command> }) {
    return <>
        <div>Counter value: {props.model.value}</div>
        <div>
            <button onClick={_ => props.dispatch({ kind: "Decrement" })}>-</button>
            <button onClick={_ => props.dispatch({ kind: "Increment" })}>+</button>
        </div>
    </>
}
