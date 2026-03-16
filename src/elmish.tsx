import {Component, type VNode} from "preact";
import isQuickDeepEqual from "react-fast-compare";

export type Dispatch<TCommand> = (cmd: TCommand) => void
type ElmishViewProps<TModel, TCommand, TEffect> = {
    init: { model: TModel, effects: TEffect[] }
    update: (cmd: TCommand, model: TModel) => { model: TModel, effects: TEffect[] }
    view: (model: TModel, dispatch: Dispatch<TCommand>) => VNode
    executeEffect: (effect: TEffect, dispatch: Dispatch<TCommand>) => Promise<void>
}

export class ElmishView<TModel, TCommand, TEffect> extends Component<ElmishViewProps<TModel, TCommand, TEffect>, TModel> {
    private readonly startProgram: () => void
    private readonly dispatch: Dispatch<TCommand>

    constructor(props: ElmishViewProps<TModel, TCommand, TEffect>) {
        super(props);
        const { start, dispatch } = createProgram(
            props, 
            (model: TModel) => this.setState(model),
            (error: string, ex: unknown) => console.error(error, ex),
        )
        this.dispatch = dispatch
        this.startProgram = start
    }

    override componentDidMount() : void {
        this.startProgram()
    }

    override shouldComponentUpdate(
        _nextProps: Readonly<ElmishViewProps<TModel, TCommand, TEffect>>, 
        nextState: Readonly<TModel>, 
        _nextContext: unknown,
    ) : boolean {
        return !isQuickDeepEqual(this.state, nextState)
    }

    override render() : VNode {
        if (this.state === null || Object.keys(this.state).length === 0) return (<>Failed to load Elmish view.</>);
        return this.props.view(this.state, this.dispatch)
    }
}

function createProgram<TModel, TCommand, TEffect>(
    props: ElmishViewProps<TModel, TCommand, TEffect>,
    onModelUpdate: (model: TModel) => void,
    onError: (error: string, ex: unknown) => void,
) : { start: () => void, dispatch: Dispatch<TCommand> } {
    const { model: initialModel, effects: initialEffects } = props.init

    const cmdsBuffer: TCommand[] = []
    let processingCmd = false
    let model: TModel = initialModel

    const dispatch = (cmd: TCommand) => {
        cmdsBuffer.push(cmd)
        if (!processingCmd) {
            processingCmd = true
            processCmds()
            processingCmd = false
        }
    }

    const processCmds = () : void => {
        let nextCmd : TCommand | undefined = cmdsBuffer.shift()
        while (nextCmd !== undefined) {
            const cmd : TCommand = nextCmd

            try {
                const { model: newModel, effects: newEffects } = props.update(cmd, model)
                onModelUpdate(newModel)
                model = newModel
                executeEffects(
                    newEffects, 
                    (effect: TEffect, ex: unknown) => { 
                        onError(`Error handling effect: ${String(effect)}, raised by command: ${String(cmd)}`, ex) 
                    }, 
                )
            } catch (ex) {
                onError(`Unable to process the command: ${String(cmd)}`, ex)
            }

            nextCmd = cmdsBuffer.shift()
        }
    }

    const executeEffects = (
        effects: TEffect[], 
        onError: (effect: TEffect, ex: unknown) => void,
    ) : void => {
        effects.forEach((effect: TEffect) => {
            try {
                props
                    .executeEffect(effect, dispatch)
                    .catch(err => onError(effect, err))
            } catch (ex) {
                onError(effect, ex)
            }
        })
    }

    const start = () => {
        processingCmd = true
        onModelUpdate(initialModel)
        executeEffects(initialEffects, (ex: unknown) => onError(`Error initializing:`, ex))
        processCmds()
        processingCmd = false
    }

    return { start, dispatch }
}
