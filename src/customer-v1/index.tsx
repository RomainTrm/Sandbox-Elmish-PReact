import { ElmishView, type Dispatch } from "../elmish";
import * as customerApp from "./customer.app"
import { fakeApi } from "./api";
import { View } from "./customer.view";

export function Customer({ customerId } : { customerId: string }) {
    function executeEffect(effect: customerApp.Effect, dispatch: Dispatch<customerApp.Command>) {
        return customerApp.executeEffect(effect, dispatch, fakeApi)
    }

    return <ElmishView
        init={customerApp.init(parseInt(customerId))}
        update={customerApp.update}
        executeEffect={executeEffect}
        view={(model: customerApp.Model, dispatch: Dispatch<customerApp.Command>) => 
            <View model={model} dispatch={dispatch} />
        }
    />
}