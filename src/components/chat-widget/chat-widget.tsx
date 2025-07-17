import { Component, Host, Prop, State, h } from '@stencil/core';
import { chatActions, ChatMessage, ChatState, chatState, onChatStateChange } from '../../store/chat-store';

@Component({
  tag: 'chat-widget',
  styleUrl: 'chat-widget.css',
  shadow: true,
})
export class ChatWidget {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private responseTimeout: any = null;

  @Prop() socketURL: string = '';
  @Prop() agent: string = 'Juno';
  @Prop() buttonBackground: string = 'oklch(0.491 0.27 292.581)';
  @Prop() maxReconnectAttempts = 5;
  @Prop() disclaimerText = "I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date.";

  @State() messages: ChatMessage[] = chatState.messages;
  @State() isOpen: boolean = chatState.isOpen;
  @State() isBotTyping: boolean = chatState.isBotTyping;
  @State() isSocketConnected: boolean = chatState.isSocketConnected;
  @State() socketConnectionStatus: ChatState['socketConnectionStatus'] = chatState.socketConnectionStatus;

  connectedCallback() {
    console.log('%cInitialized%c Juno initialized', 'color: white; font-size: 10px; background: #762fff; padding: .25rem .5rem; border-radius: .35rem', '');
  }

  componentWillLoad() {
    if (this.socketURL) {
      this.connectWebSocket();
    } else {
      chatState.socketConnectionStatus = 'disconnected';
    }

    chatActions.setDisclaimerText(this.disclaimerText);

    onChatStateChange('isOpen', value => {
      this.isOpen = value;
    });
  }

  private connectWebSocket() {
    if (!this.socketURL || this.socketURL.trim() === '') return;

    this.socket = new WebSocket(this.socketURL);
    this.socket.onopen = event => {
      this.isSocketConnected = true;
      chatActions.setSocketConnection('connected');
      chatActions.setBotTyping(false);
      console.log(
        `%c[WebSocket]%c Connected: ${event.type}`,
        'color: #000; font-weight: medium; font-size: 10px; background: #c9ff07; padding: .25rem .5rem; border-radius: .35rem',
        '',
      );
    };

    this.socket.onmessage = event => {
      chatActions.setBotTyping(false);
      clearTimeout(this.responseTimeout);
      this.notify(event.data);
      const incomingMessage: ChatMessage = { type: 'bot', message: event.data, timestamp: this.formatDateIntl(new Date()) };
      chatActions.addMessage(incomingMessage);
    };

    this.socket.onclose = event => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      this.isSocketConnected = false;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        chatActions.setSocketConnection('connecting');
        const retryIn = 1000 * this.reconnectAttempts;

        setTimeout(() => this.connectWebSocket(), retryIn);
      } else {
        console.error('Max reconnect attempts reached.');
        chatActions.setSocketConnection('disconnected');
      }
    };

    this.socket.onerror = event => {
      this.isSocketConnected = false;
      chatActions.setSocketConnection('disconnected');
      console.log('[WebSocket] Error:', event);
    };
  }

  handleClick() {
    chatActions.toggleChat();
    console.log('%cClicked%c Juno triggered', 'color: white; font-size: 10px; background: #212529; padding: .25rem .5rem; border-radius: .35rem', '');
  }

  sendMessage(message: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      chatActions.setBotTyping(true);
      const processedMessage: ChatMessage = { type: 'user', message: message, timestamp: this.formatDateIntl(new Date()) };
      chatActions.addMessage(processedMessage);
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
      chatActions.addMessage({
        type: 'bot',
        message: 'Something went wrong! Please retry',
        timestamp: this.formatDateIntl(new Date()),
      });
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
        {this.isOpen && (
          <chat-area
            agent={this.agent}
            onSentMessage={event => this.sendMessage(event.detail)}
            onRequestSocketReconnection={() => {
              this.reconnectAttempts = 0;
              this.connectWebSocket();
            }}
          ></chat-area>
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
