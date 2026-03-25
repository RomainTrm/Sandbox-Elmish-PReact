import { render } from 'preact'
import './index.css'
import { Counter } from './counter'
import Router, { Route } from 'preact-router'
import { Customer } from './customer'

function Main() {
    return <Router>
        <Route path="/counter" component={Counter} />
        <Route path="/customer/:customerId" component={Customer} />
    </Router>
}

render(<Main />, document.getElementById('app')!)
