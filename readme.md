# Elmish

Experimental implementation of the [Elm architecture](https://guide.elm-lang.org/architecture/) in [PReact](https://preactjs.com/) inspired by [Elmish](https://elmish.github.io/). This code is also described in a [blog post series](https://berthon.dev/posts/using-the-elm-architecture-part-1/) I wrote.

## In this repository

- [counter](./src/counter/): First implementation to introduce the *MVU* pattern, no use of side effects.
- [customer-v1](./src/customer-v1/): Introduce side effects with `Effect`.
- [customer-v2](./src/customer-v2/): Extract a subcomponent with `Command` wrapping and `Intent` pattern, all `Effect` are raised by the main component.
- [customer-v3](./src/customer-v3/): Alternative implementation of v2 with `Effect` raised by the subcomponent.

## Additional Resources

If you're looking for more content about this architecture, have a look to:  

- [Elm patterns](https://sporto.github.io/elm-patterns/)
- [Elmish Book](https://zaid-ajaj.github.io/the-elmish-book/)

## Commands

Initialize and run project:

```bash
pnpm install
pnpm dev
```

Run tests watch:  

```bash
pnpm vitest
```
