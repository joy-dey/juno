import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'chat-area',
  styleUrl: 'chat-area.css',
  shadow: true,
})
export class ChatArea {
  @Prop() messages: { type: 'user' | 'bot'; message: string }[];
  @Prop() isSocketConnected: boolean = false;
  @Prop() isBotTyping: boolean = false;

  @State() isLoading: boolean = false;

  @Event() sentMessage: EventEmitter<string>;
  @Event() requestClose: EventEmitter<void>;

  private chatContainerEl?: HTMLDivElement;
  private hostElement: HTMLElement;

  @Watch('isBotTyping')
  handleBotTyping(newVal: boolean) {
    if (!newVal) {
      this.isLoading = false;
    }
  }

  componentDidLoad() {
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleEscape);
  }

  componentDidRender() {
    if (this.chatContainerEl) {
      this.chatContainerEl.scrollTop = this.chatContainerEl.scrollHeight;
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscape);
  }

  private handleClickOutside = (event: MouseEvent) => {
    if (!this.hostElement.contains(event.target as Node)) {
      this.requestClose.emit();
    }
  };

  private handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.requestClose.emit();
    }
  };

  private handleFormSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: FormData = new FormData(form);
    this.isLoading = true;
    this.sentMessage.emit(formData.get('message').toString());

    form.reset();
  };
  render() {
    return (
      <Host ref={el => (this.hostElement = el)}>
        <div class="juno-chat-area">
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
              <p>Juno</p>
              <small>Your not-so-smart assistant</small>
            </div>
            <div class={`juno-status-indicator ${this.isSocketConnected ? 'online' : 'offline'}`}>
              <div class="status"></div>
            </div>
          </div>
          <div class="juno-chat-container" ref={el => (this.chatContainerEl = el)}>
            <small class="juno-disclaimer">I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date.</small>
            {this.messages.map(({ type, message }) => (
              <chat-bubble type={type} message={message}></chat-bubble>
            ))}
            <slot></slot>
          </div>
          <div class="juno-chat-footer">
            <form onSubmit={this.handleFormSubmit} autoComplete="off">
              <input type="text" name="message" id="message" placeholder="Type your message here..." />
              <button type="submit" disabled={this.isLoading}>
                {this.isLoading ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="spin">
                    <path d="M12 2C12.5523 2 13 2.44772 13 3V6C13 6.55228 12.5523 7 12 7C11.4477 7 11 6.55228 11 6V3C11 2.44772 11.4477 2 12 2ZM12 17C12.5523 17 13 17.4477 13 18V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V18C11 17.4477 11.4477 17 12 17ZM22 12C22 12.5523 21.5523 13 21 13H18C17.4477 13 17 12.5523 17 12C17 11.4477 17.4477 11 18 11H21C21.5523 11 22 11.4477 22 12ZM7 12C7 12.5523 6.55228 13 6 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H6C6.55228 11 7 11.4477 7 12ZM19.0711 19.0711C18.6805 19.4616 18.0474 19.4616 17.6569 19.0711L15.5355 16.9497C15.145 16.5592 15.145 15.9261 15.5355 15.5355C15.9261 15.145 16.5592 15.145 16.9497 15.5355L19.0711 17.6569C19.4616 18.0474 19.4616 18.6805 19.0711 19.0711ZM8.46447 8.46447C8.07394 8.85499 7.44078 8.85499 7.05025 8.46447L4.92893 6.34315C4.53841 5.95262 4.53841 5.31946 4.92893 4.92893C5.31946 4.53841 5.95262 4.53841 6.34315 4.92893L8.46447 7.05025C8.85499 7.44078 8.85499 8.07394 8.46447 8.46447ZM4.92893 19.0711C4.53841 18.6805 4.53841 18.0474 4.92893 17.6569L7.05025 15.5355C7.44078 15.145 8.07394 15.145 8.46447 15.5355C8.85499 15.9261 8.85499 16.5592 8.46447 16.9497L6.34315 19.0711C5.95262 19.4616 5.31946 19.4616 4.92893 19.0711ZM15.5355 8.46447C15.145 8.07394 15.145 7.44078 15.5355 7.05025L17.6569 4.92893C18.0474 4.53841 18.6805 4.53841 19.0711 4.92893C19.4616 5.31946 19.4616 5.95262 19.0711 6.34315L16.9497 8.46447C16.5592 8.85499 15.9261 8.85499 15.5355 8.46447Z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.7267 2.95694L16.2734 22.0432C16.1225 22.5716 15.7979 22.5956 15.5563 22.1126L11 13L1.9229 9.36919C1.41322 9.16532 1.41953 8.86022 1.95695 8.68108L21.0432 2.31901C21.5716 2.14285 21.8747 2.43866 21.7267 2.95694ZM19.0353 5.09647L6.81221 9.17085L12.4488 11.4255L15.4895 17.5068L19.0353 5.09647Z"></path>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </Host>
    );
  }
}
