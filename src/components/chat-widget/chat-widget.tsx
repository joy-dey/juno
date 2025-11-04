import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
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

  private lateResponseMessages = [
    'Whoa, sorry — got a little carried away thinking!',
    'Ahh, my brain needed an extra second on that one.',
    'Oops, that took me on a mini deep dive!',
    'Sorry! Was chewing on that for a moment.',
    'Just needed a sec to wrap my head around that!',
    'Got a bit lost in thought there — back now!',
    "Okay okay, I took a detour in my brain. Let's go.",
    "That one made me pause for a minute — here's what I think.",
    'Sorry for the slight delay — I wanted to make sure I got it right.',
    'Took me a second to piece that together — thanks for waiting!',
    'Still here! Just wanted to give it a proper think.',
    "Needed a moment to make sure I wasn't totally off base 😅",
    'Had to run that one through a few brain loops!',
    'Hold on — my thoughts took the scenic route.',
    'That question made me sit up straight for a sec!',
    'Whew, that was a thinker. Got it now!',
    'That took a bit longer in my head than I planned!',
    'Oops, took the long way around answering that 😅',
    'Sorry! Needed a quick brain reboot.',
    "I swear I didn't disappear — just thinking a little too hard!",
    "I went full 'overthinking mode' for a sec there!",
    'Yikes, my thoughts did a bit of wandering. Let me get back on track.',
    'Phew, sorry — that took me down a little mental rabbit hole.',
    'My brain clocked out for a moment there 😅',
    'Oh no, I mentally wandered off — bringing it back now!',
    'Had to take a breath and actually *think* — rare, I know.',
    "Give me a sec... okay, I'm back and focused!",
    'Alright, that answer needed a little more marination.',
    'Wow, my brain totally decided to go offline for a minute!',
    "Okay okay, I stopped overanalyzing — here's what I've got!",
  ];

  @Prop() socketURL: string = '';
  @Prop() agent: string = 'Juno';
  @Prop() buttonBackground: string = 'oklch(0.491 0.27 292.581)';
  @Prop() maxReconnectAttempts = 5;
  @Prop() disclaimerText = "I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date.";
  @Prop() allowNotifications: boolean = false;

  @State() messages: ChatMessage[] = chatState.messages;
  @State() isOpen: boolean = chatState.isOpen;
  @State() isBotTyping: boolean = chatState.isBotTyping;
  @State() isSocketConnected: boolean = chatState.isSocketConnected;
  @State() socketConnectionStatus: ChatState['socketConnectionStatus'] = chatState.socketConnectionStatus;

  @Watch('socketURL')
  onSocketURLChange(newValue: string) {
    if (newValue) {
      this.connectWebSocket();
    }
  }

  @Watch('disclaimerText')
  onDisclaimerTextChange(newValue: string) {
    chatActions.setDisclaimerText(newValue);
  }

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
    chatActions.clearMessages();
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

      if (this.allowNotifications) {
        this.notify(event.data);
      }

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
      const randomMessage = this.lateResponseMessages[Math.floor(Math.random() * this.lateResponseMessages.length)];
      chatActions.addMessage({
        type: 'bot',
        message: randomMessage,
        timestamp: this.formatDateIntl(new Date()),
      });
    }, 18000);
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

  disconnectedCallback() {
    this.socket?.close();
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
              if (this.socket) {
                this.socket.onclose = null;
                this.socket.onerror = null;
                this.socket.onmessage = null;
                this.socket.onopen = null;

                this.socket.close();
                this.socket = null;
              }
              this.connectWebSocket();
            }}
          ></chat-area>
        )}
        {!this.isOpen && (
          <button class="juno-fab" style={{ background: this.buttonBackground }} onClick={() => this.handleClick()}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M20.7134 8.12811L20.4668 8.69379C20.2864 9.10792 19.7136 9.10792 19.5331 8.69379L19.2866 8.12811C18.8471 7.11947 18.0555 6.31641 17.0677 5.87708L16.308 5.53922C15.8973 5.35653 15.8973 4.75881 16.308 4.57612L17.0252 4.25714C18.0384 3.80651 18.8442 2.97373 19.2761 1.93083L19.5293 1.31953C19.7058 0.893489 20.2942 0.893489 20.4706 1.31953L20.7238 1.93083C21.1558 2.97373 21.9616 3.80651 22.9748 4.25714L23.6919 4.57612C24.1027 4.75881 24.1027 5.35653 23.6919 5.53922L22.9323 5.87708C21.9445 6.31641 21.1529 7.11947 20.7134 8.12811ZM20 11C20.6986 11 21.3694 10.8806 21.9929 10.6611C21.9976 10.7735 22 10.8865 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3H14C14.1135 3 14.2265 3.00237 14.3389 3.00705C14.1194 3.63061 14 4.30136 14 5C14 8.31371 16.6863 11 20 11Z"></path>
            </svg>
          </button>
        )}
      </Host>
    );
  }
}
