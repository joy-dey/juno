# chat-area



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description | Type     | Default |
| -------- | --------- | ----------- | -------- | ------- |
| `agent`  | `agent`   |             | `string` | `''`    |


## Events

| Event                       | Description | Type                  |
| --------------------------- | ----------- | --------------------- |
| `requestSocketReconnection` |             | `CustomEvent<void>`   |
| `sentMessage`               |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [chat-widget](../chat-widget)

### Depends on

- [chat-bubble](../chat-bubble)
- [typing-indicator](../typing-indicator)

### Graph
```mermaid
graph TD;
  chat-area --> chat-bubble
  chat-area --> typing-indicator
  chat-widget --> chat-area
  style chat-area fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
