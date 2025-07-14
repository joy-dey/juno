# chat-area



<!-- Auto Generated Below -->


## Properties

| Property                 | Attribute                  | Description | Type                                                               | Default                                                                                                         |
| ------------------------ | -------------------------- | ----------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `botName`                | `bot-name`                 |             | `string`                                                           | `''`                                                                                                            |
| `disclaimerText`         | `disclaimer-text`          |             | `string`                                                           | `"I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date."` |
| `isBotTyping`            | `is-bot-typing`            |             | `boolean`                                                          | `false`                                                                                                         |
| `isSocketConnected`      | `is-socket-connected`      |             | `boolean`                                                          | `false`                                                                                                         |
| `messages`               | `messages`                 |             | `{ type: "user" \| "bot"; message: string; timestamp: string; }[]` | `undefined`                                                                                                     |
| `socketConnectionStatus` | `socket-connection-status` |             | `"offline" \| "online" \| "reconnecting"`                          | `'offline'`                                                                                                     |


## Events

| Event                       | Description | Type                  |
| --------------------------- | ----------- | --------------------- |
| `requestClose`              |             | `CustomEvent<void>`   |
| `requestSocketReconnection` |             | `CustomEvent<void>`   |
| `sentMessage`               |             | `CustomEvent<string>` |


## Dependencies

### Used by

 - [chat-widget](../chat-widget)

### Depends on

- [chat-bubble](../chat-bubble)

### Graph
```mermaid
graph TD;
  chat-area --> chat-bubble
  chat-widget --> chat-area
  style chat-area fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
