import { View } from "./counter.view"
import * as counterApp from "./counter.app"
import { ElmishView, type Dispatch } from "../elmish"

export function Counter() {
    return (
        <ElmishView
			init={counterApp.init()}
            update={counterApp.update}
            executeEffect={counterApp.executeEffect}
            view={(model: counterApp.Model, dispatch: Dispatch<counterApp.Command>) => 
                <View model={model} dispatch={dispatch} />
            }
        />
    )
}