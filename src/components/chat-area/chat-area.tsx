import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { chatActions, ChatMessage, chatState, ChatState, onChatStateChange } from '../../store/chat-store';

@Component({
  tag: 'chat-area',
  styleUrl: 'chat-area.css',
  shadow: true,
})
export class ChatArea {
  @Prop() agent: string = '';
  @State() messages: ChatMessage[] = [];
  @State() isBotTyping: boolean = chatState.isBotTyping;
  @State() socketConnectionStatus: ChatState['socketConnectionStatus'] = chatState.socketConnectionStatus;
  @State() disclaimerText: string = chatState.disclaimerText;

  @State() isMaximized: boolean = false;
  @State() transcript: string = '';
  @State() isRecognizing: boolean = false;
  @State() isPopupOpen: boolean = false;

  @Event() sentMessage: EventEmitter<string>;
  @Event() requestSocketReconnection: EventEmitter<void>;

  private recognition: any;
  private chatContainerEl?: HTMLDivElement;
  private hostElement: HTMLElement;
  private messageBoxElement: HTMLInputElement;
  private actionPopup: HTMLDivElement;

  componentWillLoad() {
    this.messages = chatState.messages;

    onChatStateChange('messages', message => {
      this.messages = message;
    });

    onChatStateChange('socketConnectionStatus', value => {
      this.socketConnectionStatus = value;
    });

    onChatStateChange('isBotTyping', value => {
      this.isBotTyping = value;
    });
  }

  componentDidLoad() {
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('click', this.togglePopupOnOutsideClick, true);
    document.addEventListener('keydown', this.handleEscape);

    // speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isRecognizing = true;
        console.log('recognition started');
      };
      this.recognition.onresult = event => {
        const result = event.results[0][0].transcript;
        this.transcript = result;
      };

      this.recognition.onend = () => {
        this.isRecognizing = false;
        console.log('Recognition ended');
      };

      this.recognition.onerror = event => {
        console.error('Speech recognition error', event.error);
        this.isRecognizing = false;
      };
    } else {
      console.warn('Speech Recognition not supported in this browser.');
    }
  }

  startRecognition = () => {
    if (this.recognition && !this.isRecognizing) {
      this.recognition.start();
    }
  };

  stopRecognition = () => {
    if (this.recognition && this.isRecognizing) {
      this.recognition.stop();
    }
  };

  componentDidRender() {
    if (this.chatContainerEl) {
      this.chatContainerEl.scrollTop = this.chatContainerEl.scrollHeight;
    }

    if (this.messageBoxElement) {
      this.messageBoxElement.focus();
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscape);
  }

  private handleClickOutside = (event: MouseEvent) => {
    const path = event.composedPath();
    if (!path.includes(this.hostElement)) {
      chatActions.closeChat();
    }
  };

  private handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      chatActions.closeChat();
    }
  };

  private handleUserInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.transcript = target.value;
  };

  private requestReconnection = () => {
    this.requestSocketReconnection.emit();
  };

  private handleFormSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    this.sentMessage.emit(formData.get('message').toString());
    this.transcript = '';

    form.reset();
  };

  private downloadMessagesAsText() {
    const text = this.messages.map(msg => `${msg.timestamp}[${msg.type}] ${msg.message}`).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().getTime()}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }

  togglePopup() {
    this.isPopupOpen = !this.isPopupOpen;
  }

  private togglePopupOnOutsideClick = (event: MouseEvent) => {
    const path = event.composedPath();
    if (this.isPopupOpen && !path.includes(this.actionPopup)) {
      this.isPopupOpen = false;
    }
  };

  render() {
    return (
      <Host ref={el => (this.hostElement = el)}>
        <div class={`juno-chat-area ${this.isMaximized ? 'maximized' : ''}`}>
          <div class="juno-chat-header">
            <div class="juno-brand-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M20.7134 7.12811L20.4668 7.69379C20.2864 8.10792 19.7136 8.10792 19.5331 7.69379L19.2866 7.12811C18.8471 6.11947 18.0555 5.31641 17.0677 4.87708L16.308 4.53922C15.8973 4.35653 15.8973 3.75881 16.308 3.57612L17.0252 3.25714C18.0384 2.80651 18.8442 1.97373 19.2761 0.930828L19.5293 0.319534C19.7058 -0.106511 20.2942 -0.106511 20.4706 0.319534L20.7238 0.930828C21.1558 1.97373 21.9616 2.80651 22.9748 3.25714L23.6919 3.57612C24.1027 3.75881 24.1027 4.35653 23.6919 4.53922L22.9323 4.87708C21.9445 5.31641 21.1529 6.11947 20.7134 7.12811ZM9 2C13.0675 2 16.426 5.03562 16.9337 8.96494L19.1842 12.5037C19.3324 12.7367 19.3025 13.0847 18.9593 13.2317L17 14.071V17C17 18.1046 16.1046 19 15 19H13.001L13 22H4L4.00025 18.3061C4.00033 17.1252 3.56351 16.0087 2.7555 15.0011C1.65707 13.6313 1 11.8924 1 10C1 5.58172 4.58172 2 9 2ZM21.1535 18.1024L19.4893 16.9929C20.4436 15.5642 21 13.8471 21 12.0001C21 11.489 20.9574 10.9878 20.8756 10.5L22.8186 10C22.9378 10.6486 23 11.317 23 12.0001C23 14.2576 22.32 16.3562 21.1535 18.1024Z"
                  fill="url(#paint0_linear_287_224)"
                />
                <defs>
                  <linearGradient id="paint0_linear_287_224" x1="12.5" y1="0" x2="12.5" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FF0069" />
                    <stop offset="0.5" stop-color="#D300C5" />
                    <stop offset="1" stop-color="#7638FA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="brand-info">
              <div class="flex-group">
                <p>{this.agent}</p>
                <div
                  class={`juno-status-indicator ${
                    this.socketConnectionStatus === 'connecting' ? 'reconnecting' : this.socketConnectionStatus === 'connected' ? 'online' : 'offline'
                  }`}
                  title={`${this.agent} is ${this.socketConnectionStatus}`}
                >
                  <div class="status"></div>
                </div>
              </div>
              <small>{this.isBotTyping ? 'typing...' : this.socketConnectionStatus}</small>
            </div>
            <div class="juno-buttons-container">
              <div class="action-wrapper">
                <button class="juno-size-button" onClick={() => this.togglePopup()}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C10.9 3 10 3.9 10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3ZM12 17C10.9 17 10 17.9 10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"></path>
                  </svg>
                </button>

                <div class={`popup-content ${this.isPopupOpen ? 'active' : ''}`} ref={el => (this.actionPopup = el)}>
                  <button class="popup-action" onClick={() => this.requestReconnection()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class={this.socketConnectionStatus === 'connecting' ? 'spin' : ''}>
                      <path d="M12 4C14.5905 4 16.8939 5.23053 18.3573 7.14274L16 9.5H22V3.5L19.7814 5.71863C17.9494 3.452 15.1444 2 12 2 6.47715 2 2 6.47715 2 12H4C4 7.58172 7.58172 4 12 4ZM20 12C20 16.4183 16.4183 20 12 20 9.40951 20 7.10605 18.7695 5.64274 16.8573L8 14.5 2 14.5V20.5L4.21863 18.2814C6.05062 20.548 8.85557 22 12 22 17.5228 22 22 17.5228 22 12H20Z"></path>
                    </svg>
                    <span>{this.socketConnectionStatus === 'connecting' ? 'Connecting ...' : 'Reconnect'}</span>
                  </button>
                  <button class="popup-action" disabled={this.messages.length < 1} onClick={() => this.downloadMessagesAsText()}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path>
                    </svg>
                    <span>Download Transcript</span>
                  </button>
                </div>
              </div>
              <button class="juno-size-button maximize-button" onClick={() => (this.isMaximized = !this.isMaximized)}>
                {!this.isMaximized ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.41421 5H10V3H3V10H5V6.41421L9.29289 10.7071L10.7071 9.29289L6.41421 5ZM21 14H19V17.5858L14.7071 13.2929L13.2929 14.7071L17.5858 19H14V21H21V14Z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.00008 4.00008H11.0001V11.0001H4.00008V9.00008H7.58586L3.29297 4.70718L4.70718 3.29297L9.00008 7.58586V4.00008ZM20 15H16.4142L20.7071 19.2929L19.2929 20.7071L15 16.4142V20H13V13H20V15Z"></path>
                  </svg>
                )}
              </button>

              <button class="juno-size-button close-button" onClick={() => chatActions.closeChat()}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="juno-chat-container" ref={el => (this.chatContainerEl = el)}>
            <small class="juno-disclaimer">{this.disclaimerText}</small>
            {this.messages.map(({ type, message, timestamp }) => (
              <chat-bubble type={type} message={message} timestamp={timestamp}></chat-bubble>
            ))}
            {this.isBotTyping && <typing-indicator></typing-indicator>}
          </div>
          <div class="juno-chat-footer">
            <form onSubmit={this.handleFormSubmit} autoComplete="off">
              <input
                ref={el => (this.messageBoxElement = el)}
                type="text"
                name="message"
                required
                id="message"
                value={this.transcript}
                placeholder="Ask anything"
                onInput={event => this.handleUserInput(event)}
              />

              {this.transcript.trim() === '' ? (
                !this.isRecognizing ? (
                  <button type="button" disabled={this.isBotTyping || this.socketConnectionStatus !== 'connected'} onClick={() => this.startRecognition()} title="Dictate">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M2 10v3" />
                      <path d="M6 6v11" />
                      <path d="M10 3v18" />
                      <path d="M14 8v7" />
                      <path d="M18 5v13" />
                      <path d="M22 10v3" />
                    </svg>
                  </button>
                ) : (
                  <button type="button" onClick={() => this.stopRecognition()} title="Stop Dictation">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 5H18C18.5523 5 19 5.44772 19 6V18C19 18.5523 18.5523 19 18 19H6C5.44772 19 5 18.5523 5 18V6C5 5.44772 5.44772 5 6 5Z"></path>
                    </svg>
                  </button>
                )
              ) : (
                <button type="submit" disabled={this.isBotTyping || this.socketConnectionStatus !== 'connected'}>
                  {this.isBotTyping ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="spin">
                      <path d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2ZM12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17ZM22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12ZM7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12ZM19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L15.5355 16.9497C15.145 16.5592 15.145 15.9261 15.5355 15.5355C15.9261 15.145 16.5592 15.145 16.9497 15.5355L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711ZM8.46447 8.46447C8.07394 8.85499 7.44078 8.85499 7.05025 8.46447L4.92893 6.34315C4.53841 5.95262 4.53841 5.31946 4.92893 4.92893C5.31946 4.53841 5.95262 4.53841 6.34315 4.92893L8.46447 7.05025C8.85499 7.44078 8.85499 8.07394 8.46447 8.46447ZM4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L7.05025 15.5355C7.44078 15.145 8.07394 15.145 8.46447 15.5355C8.85499 15.9261 8.85499 16.5592 8.46447 16.9497L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711ZM15.5355 8.46447C15.145 8.07394 15.145 7.44078 15.5355 7.05025L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L16.9497 8.46447C16.5592 8.85499 15.9261 8.85499 15.5355 8.46447Z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1.94607 9.31543C1.42353 9.14125 1.4194 8.86022 1.95682 8.68108L21.043 2.31901C21.5715 2.14285 21.8746 2.43866 21.7265 2.95694L16.2733 22.0432C16.1223 22.5716 15.8177 22.59 15.5944 22.0876L11.9999 14L17.9999 6.00005L9.99992 12L1.94607 9.31543Z"></path>
                    </svg>
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
