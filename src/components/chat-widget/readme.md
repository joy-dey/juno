# chat-widget



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type     | Default                       |
| ------------------ | ------------------- | ----------- | -------- | ----------------------------- |
| `agent`            | `agent`             |             | `string` | `'Juno'`                      |
| `buttonBackground` | `button-background` |             | `string` | `'oklch(0.491 0.27 292.581)'` |
| `socketURL`        | `socket-u-r-l`      |             | `string` | `''`                          |


## Dependencies

### Depends on

- [chat-area](../chat-area)

### Graph
```mermaid
graph TD;
  chat-widget --> chat-area
  chat-area --> chat-bubble
  chat-area --> typing-indicator
  style chat-widget fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
