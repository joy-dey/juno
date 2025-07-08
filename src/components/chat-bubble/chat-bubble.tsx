import { Component, Host, Prop, State, h } from '@stencil/core';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  tag: 'chat-bubble',
  styleUrl: 'chat-bubble.css',
  shadow: true,
})
export class ChatBubble {
  @Prop() type: 'bot' | 'user' = 'bot';
  @Prop() message: string = '';

  @State() parsedHTML: string = '';
  @State() showActions: boolean = false;

  async componentWillLoad() {
    const rawHTML = await marked.parse(this.message);
    this.parsedHTML = DOMPurify.sanitize(rawHTML);
  }

  async copyResponse(message: string) {
    try {
      await navigator.clipboard.writeText(message);
      this.showActions = false;
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  private speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-UK';
    window.speechSynthesis.speak(utterance);
    this.showActions = false;
  };

  render() {
    return (
      <Host data-type={this.type}>
        <article class="juno-chat-bubble" onClick={() => (this.showActions = !this.showActions)}>
          {this.type === 'bot' ? <div class="markdown-body" innerHTML={this.parsedHTML}></div> : <p>{this.message}</p>}
        </article>
        {this.showActions && (
          <div class="juno-chat-actions">
            <button class="chat-action" title="Copy Message" onClick={() => this.copyResponse(this.message)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path>
              </svg>
            </button>
            <button class="chat-action" onClick={() => this.speakText(this.message)}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.7134 7.12811L20.4668 7.69379C20.2864 8.10792 19.7136 8.10792 19.5331 7.69379L19.2866 7.12811C18.8471 6.11947 18.0555 5.31641 17.0677 4.87708L16.308 4.53922C15.8973 4.35653 15.8973 3.75881 16.308 3.57612L17.0252 3.25714C18.0384 2.80651 18.8442 1.97373 19.2761 0.930828L19.5293 0.319534C19.7058 -0.106511 20.2942 -0.106511 20.4706 0.319534L20.7238 0.930828C21.1558 1.97373 21.9616 2.80651 22.9748 3.25714L23.6919 3.57612C24.1027 3.75881 24.1027 4.35653 23.6919 4.53922L22.9323 4.87708C21.9445 5.31641 21.1529 6.11947 20.7134 7.12811ZM8.5 6H6.5V18H8.5V6ZM4 10H2V14H4V10ZM13 2H11V22H13V2ZM17.5 8H15.5V18H17.5V8ZM22 10H20V14H22V10Z"></path>
              </svg>
            </button>
          </div>
        )}
      </Host>
    );
  }
}
