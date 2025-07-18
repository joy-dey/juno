# @joydey/juno

> 💬 A lightweight, customizable chat widget web component built with Stencil. Easily drop it into any site or app and connect via WebSockets.

## ✨ Features

- 🔌 Real-time chat over WebSockets
- 🧩 Framework-agnostic: use with React, Angular, Vue, or plain HTML
- ⚙️ Simple API via web components
- 🧱 Fully encapsulated styles with Shadow DOM
- 🌍 Easily embeddable anywhere

---

## 🚀 Installation

Install via npm:

```bash
npm install @joydey/juno
```

---

## 🧠 Usage

### In Plain HTML

No extra setup required:

```html
<chat-widget socket-url="wss://your-chat-backend.example.com/socket" agent="Juno" button-background="#212529" />
```

If bundling manually, also include:

```js
import '@joydey/juno';
```

---

### In React / Next.js

Web components should be registered using `defineCustomElements`, and DOM attributes set after mount using `useEffect`.

#### Example:

```tsx
import { useEffect, useRef } from 'react';
import { defineCustomElements } from '@joydey/juno/loader';
import '@joydey/juno';

// Register web components
defineCustomElements();

function App() {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.setAttribute('socket-url', 'wss://your-chat.example.com/socket');
      chatRef.current.setAttribute('agent', 'Juno');
      chatRef.current.setAttribute('button-background', '#212529');
    }
  }, []);

  return <chat-widget ref={chatRef}></chat-widget>;
}
```

---

### In Angular

1. Install:

```bash
npm install @joydey/juno
```

2. In `main.ts`:

```ts
import { defineCustomElements } from '@joydey/juno/loader';

defineCustomElements();
```

3. In `app.module.ts`, allow custom elements:

```ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  declarations: [...],
  imports: [...],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
```

4. In your component:

```html
<chat-widget #chat></chat-widget>
```

5. In your component class:

```ts
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

export class AppComponent implements AfterViewInit {
  @ViewChild('chat', { static: false }) chatEl!: ElementRef;

  ngAfterViewInit() {
    this.chatEl.nativeElement.setAttribute('socket-url', 'wss://your-chat.example.com/socket');
    this.chatEl.nativeElement.setAttribute('agent', 'Juno');
    this.chatEl.nativeElement.setAttribute('button-background', '#212529');
  }
}
```

---

## ⚙️ Component API

### Properties

| Property               | Attribute                | Description | Type      | Default                                                                                                         |
| ---------------------- | ------------------------ | ----------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `agent`                | `agent`                  |             | `string`  | `'Juno'`                                                                                                        |
| `allowNotifications`   | `allow-notifications`    |             | `boolean` | `false`                                                                                                         |
| `buttonBackground`     | `button-background`      |             | `string`  | `'oklch(0.491 0.27 292.581)'`                                                                                   |
| `disclaimerText`       | `disclaimer-text`        |             | `string`  | `"I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date."` |
| `maxReconnectAttempts` | `max-reconnect-attempts` |             | `number`  | `5`                                                                                                             |
| `socketURL`            | `socket-u-r-l`           |             | `string`  | `''`                                                                                                            |

---

## 📦 Build & Development

To develop or customize the component locally:

```bash
git clone https://github.com/joy-dey/juno.git
cd juno
npm install
npm start
```

This starts the Stencil development server with hot-reload.

---

## 📄 License

MIT © [joydey](https://github.com/joy-dey)

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

- Open issues on [GitHub](https://github.com/joy-dey/juno/issues)
- Submit pull requests
- Or start a discussion if you have ideas!

---

## 📬 Support

If you run into any issues or have questions, feel free to open an issue or reach out.
