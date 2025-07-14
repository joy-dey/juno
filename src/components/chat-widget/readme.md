# chat-widget



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute           | Description | Type     | Default     |
| ------------------ | ------------------- | ----------- | -------- | ----------- |
| `botName`          | `bot-name`          |             | `string` | `'Juno'`    |
| `buttonBackground` | `button-background` |             | `string` | `'#c9ff07'` |
| `socketURL`        | `socket-u-r-l`      |             | `string` | `''`        |


## Events

| Event                | Description | Type                   |
| -------------------- | ----------- | ---------------------- |
| `socketChangeStatus` |             | `CustomEvent<boolean>` |


## Dependencies

### Depends on

- [chat-area](../chat-area)
- [typing-indicator](../typing-indicator)

### Graph
```mermaid
graph TD;
  chat-widget --> chat-area
  chat-widget --> typing-indicator
  chat-area --> chat-bubble
  style chat-widget fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
