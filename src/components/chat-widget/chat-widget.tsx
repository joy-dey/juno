import { Component, Event, EventEmitter, Host, State, h } from '@stencil/core';

@Component({
  tag: 'chat-widget',
  styleUrl: 'chat-widget.css',
  shadow: true,
})
export class ChatWidget {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts = 50;

  @State() messages: { type: 'user' | 'bot'; message: string }[] = [
    {
      type: 'bot',
      message: 'Hey! How can I help you today?',
    },
  ];
  @State() isMinimized: boolean = true;
  @State() isBotTyping: boolean = false;
  @State() isSocketConnected: boolean = false;

  @Event() socketChangeStatus: EventEmitter<boolean>;

  connectedCallback() {
    console.log('%cInitialized%c Juno initialized', 'color: white; font-size: 10px; background: #762fff; padding: .25rem .5rem; border-radius: .35rem', '');
  }

  componentWillLoad() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    this.socket = new WebSocket('');

    this.socket.onopen = event => {
      this.isSocketConnected = true;
      console.log(
        `%c[WebSocket]%c Connected: ${event.type}`,
        'color: #000; font-weight: medium; font-size: 10px; background: #c9ff07; padding: .25rem .5rem; border-radius: .35rem',
        '',
      );
    };

    this.socket.onmessage = event => {
      console.log('[WebSocket] Message received:', event.data);
      this.isBotTyping = false;
      this.messages = [...this.messages, { type: 'bot', message: event.data }];
    };

    this.socket.onclose = event => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      this.isSocketConnected = false;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const retryIn = 1000 * this.reconnectAttempts;
        setTimeout(() => this.connectWebSocket(), retryIn);
      } else {
        console.error('Max reconnect attempts reached.');
      }
    };

    this.socket.onerror = event => {
      this.isSocketConnected = false;

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
      this.messages = [...this.messages, { type: 'user', message: message }];
    }
  }

  render() {
    return (
      <Host>
        {!this.isMinimized && (
          <chat-area messages={this.messages} onSentMessage={event => this.sendMessage(event.detail)} isSocketConnected={this.isSocketConnected} isBotTyping={this.isBotTyping}>
            {this.isBotTyping && <typing-indicator></typing-indicator>}
          </chat-area>
        )}
        <button class="juno-fab" onClick={() => this.handleClick()}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM20 11C20.6986 11 21.3694 10.8806 21.9929 10.6611C21.9976 10.7735 22 10.8865 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3H14C14.1135 3 14.2265 3.00237 14.3389 3.00705C14.1194 3.63061 14 4.30136 14 5C14 8.31371 16.6863 11 20 11Z"></path>
          </svg>
        </button>
      </Host>
    );
  }
}
