import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'chat-widget',
  styleUrl: 'chat-widget.css',
  shadow: true,
})
export class ChatWidget {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts = 5;
  private responseTimeout: any = null;

  @Prop() socketURL: string = '';
  @Prop() botName: string = 'Juno';
  @Prop() buttonBackground: string = '#c9ff07';

  @State() messages: { type: 'user' | 'bot'; message: string; timestamp: string }[] = [];
  @State() isMinimized: boolean = true;
  @State() isBotTyping: boolean = false;
  @State() isSocketConnected: boolean = false;
  @State() socketConnectionStatus: 'online' | 'offline' | 'reconnecting' = 'offline';

  @Event() socketChangeStatus: EventEmitter<boolean>;

  chatbotGreetingMessages = [
    'Hi there! How can I help you today?',
    'Hello! What can I do for you?',
    'Hey! Need any assistance?',
    "Hi! I'm here if you need anything.",
    'Hello! How can I assist you today?',
    'Welcome! What would you like help with?',
    'Hey there! What brings you here today?',
    "Hi! Got a question? I've got answers.",
    'Hello! Let me know how I can support you.',
    'Hi! How can I make your day easier?',
    'Hey! What can I help you find?',
    "Hello! I'm ready when you are.",
    'Hi! Looking for something specific?',
    'Hey there! Need help with something?',
    "Hi! I'm here to assist — ask away!",
    'Welcome! How can I help you get started?',
    "Hey! Let me know what you're looking for.",
    'Hi there! Anything I can help you with?',
    "Hello! How's your day going? Need a hand?",
    "Hi! I'm ready to help whenever you are.",
    'Hey! Want to explore something together?',
    "Hi! I'm your assistant — how can I help?",
    'Hello there! Need support with anything?',
    "Hey! Tell me what you're looking for.",
    "Hi! Let's get started — how can I help?",
  ];

  chatbotConnectionErrors = [
    "Oops! I'm having trouble connecting right now. Could you try again shortly?",
    "Hmm... I couldn't reach the server. Want to try that again?",
    "Looks like something went wrong on my end. Let's give it another shot.",
    "Sorry! I'm a bit disconnected at the moment. Please try again in a bit.",
    'I tried reaching out, but got no response. Maybe try once more?',
    "Uh-oh, the server didn't answer. Let's try again in a moment.",
    'I hit a little snag while fetching your response. Please try again.',
    "It seems the connection isn't working right now. Can you try again soon?",
    "I'm having a temporary hiccup. Could you give it another go?",
    'Something went wrong while I was trying to talk to the server.',
    'Whoops! No response from the server. Want to try again?',
    "I'm stuck waiting on a reply. Let's try that again in a second.",
    'Sorry, I lost the connection. Could you retry that for me?',
    "I couldn't get through. Let's wait a moment and try again.",
    'Hmm, the response is taking longer than usual. Want to try again?',
    "Looks like I'm offline at the moment. Check your connection and try again.",
    "I'm not getting any response from the server. Let's retry shortly.",
    'I hit a timeout while waiting for a reply. Want to give it another go?',
    'I ran into a temporary issue reaching the server. Can you try again?',
    "It seems I'm unable to connect right now. Try refreshing or coming back later.",
    'Yikes! Something went sideways. A quick retry might fix it.',
    "My wires are crossed... couldn't connect. Try again?",
    'I knocked, but no one answered. Want to retry?',
    "I'm still waiting on a response. Let's try again soon.",
    "Unfortunately, I couldn't connect this time. Try again?",
    'Sorry about that! Something broke along the way. Please try again.',
    "Server's being a little shy. Let's try again in a sec.",
    'No luck connecting just now. Can we try once more?',
    'Apologies — I hit a bump reaching the server. Want to retry?',
    'Connection dropped! Mind giving that another shot?',
  ];

  connectedCallback() {
    console.log('%cInitialized%c Juno initialized', 'color: white; font-size: 10px; background: #762fff; padding: .25rem .5rem; border-radius: .35rem', '');
  }

  componentWillLoad() {
    if (this.socketURL) {
      this.connectWebSocket();
    }

    const randomMessage = this.chatbotGreetingMessages[Math.floor(Math.random() * this.chatbotGreetingMessages.length)];

    this.messages = [
      ...this.messages,
      {
        type: 'bot',
        message: randomMessage,
        timestamp: this.formatDateIntl(new Date()),
      },
    ];
  }

  private connectWebSocket() {
    this.socket = new WebSocket(this.socketURL);

    this.socket.onopen = event => {
      this.isSocketConnected = true;
      this.socketConnectionStatus = 'online';
      this.isBotTyping = false;
      console.log(
        `%c[WebSocket]%c Connected: ${event.type}`,
        'color: #000; font-weight: medium; font-size: 10px; background: #c9ff07; padding: .25rem .5rem; border-radius: .35rem',
        '',
      );
    };

    this.socket.onmessage = event => {
      this.isBotTyping = false;
      clearTimeout(this.responseTimeout);
      this.notify(event.data);
      this.messages = [...this.messages, { type: 'bot', message: event.data, timestamp: this.formatDateIntl(new Date()) }];
    };

    this.socket.onclose = event => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      this.isSocketConnected = false;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.socketConnectionStatus = 'reconnecting';
        const retryIn = 1000 * this.reconnectAttempts;

        setTimeout(() => this.connectWebSocket(), retryIn);
      } else {
        console.error('Max reconnect attempts reached.');
        this.socketConnectionStatus = 'offline';
        const randomMessage = this.chatbotConnectionErrors[Math.floor(Math.random() * this.chatbotConnectionErrors.length)];
        this.messages = [...this.messages, { type: 'bot', message: randomMessage, timestamp: this.formatDateIntl(new Date()) }];
      }
    };

    this.socket.onerror = event => {
      this.isSocketConnected = false;
      this.socketConnectionStatus = 'offline';

      console.log('[WebSocket] Error:', event);
    };
  }

  handleClick() {
    this.isMinimized = !this.isMinimized;
    console.log('%cClicked%c Juno triggered', 'color: white; font-size: 10px; background: #212529; padding: .25rem .5rem; border-radius: .35rem', '');
  }

  sendMessage(message: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      this.isBotTyping = true;
      this.messages = [...this.messages, { type: 'user', message: message, timestamp: this.formatDateIntl(new Date()) }];
      this.setResponseTimeout();
    }
  }

  formatDateIntl(date) {
    const formatted = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);

    return `(${formatted.replace(',', '')})`;
  }

  private setResponseTimeout() {
    clearTimeout(this.responseTimeout);

    this.responseTimeout = setTimeout(() => {
      this.isBotTyping = false;
      this.messages = [
        ...this.messages,
        {
          type: 'bot',
          message: 'Something went wrong! Please retry',
          timestamp: this.formatDateIntl(new Date()),
        },
      ];
    }, 180000);
  }

  notify(message: string) {
    if (!('Notification' in window)) {
      console.warn('Notification not supported by browser');
    } else if (Notification.permission === 'granted') {
      new Notification('New Message', {
        body: message,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('New Message', {
            body: message,
          });
        }
      });
    }
  }

  render() {
    return (
      <Host>
        {!this.isMinimized && (
          <chat-area
            botName={this.botName}
            messages={this.messages}
            onSentMessage={event => this.sendMessage(event.detail)}
            isSocketConnected={this.isSocketConnected}
            isBotTyping={this.isBotTyping}
            socketConnectionStatus={this.socketConnectionStatus}
            onRequestClose={() => (this.isMinimized = true)}
            onRequestSocketReconnection={() => {
              this.reconnectAttempts = 0;
              this.connectWebSocket();
            }}
          >
            {this.isBotTyping && <typing-indicator></typing-indicator>}
          </chat-area>
        )}
        <button class="juno-fab" style={{ background: this.buttonBackground }} onClick={() => this.handleClick()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM20 11C20.6986 11 21.3694 10.8806 21.9929 10.6611C21.9976 10.7735 22 10.8865 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3H14C14.1135 3 14.2265 3.00237 14.3389 3.00705C14.1194 3.63061 14 4.30136 14 5C14 8.31371 16.6863 11 20 11Z"></path>
          </svg>
        </button>
      </Host>
    );
  }
}
