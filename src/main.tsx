import { render } from 'preact'
import './index.css'
import { Counter } from './counter'
import Router, { Route } from 'preact-router'
import { Customer as CustomerV1 } from './customer-v1'
import { Customer as CustomerV2 } from './customer-v2'
import { Customer as CustomerV3 } from './customer-v3'

function Main() {
    return <Router>
        <Route path="/counter" component={Counter} />
        <Route path="/customer/:customerId" component={CustomerV1} />
        <Route path="/customer/v2/:customerId" component={CustomerV2} />
        <Route path="/customer/v3/:customerId" component={CustomerV3} />
    </Router>
}

render(<Main />, document.getElementById('app')!)
