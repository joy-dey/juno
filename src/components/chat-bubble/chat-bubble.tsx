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
  @Prop() timestamp: string = '';

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
                <path d="M6.60282 10.0001L10 7.22056V16.7796L6.60282 14.0001H3V10.0001H6.60282ZM2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.7398 21 12C21 9.26016 19.7758 6.80629 17.8445 5.15557L19.2622 3.73779C21.5539 5.75368 23 8.70795 23 12ZM18 12C18 10.0883 17.106 8.38548 15.7133 7.28673L14.2842 8.71584C15.3213 9.43855 16 10.64 16 12C16 13.36 15.3213 14.5614 14.2842 15.2841L15.7133 16.7132C17.106 15.6145 18 13.9116 18 12Z"></path>
              </svg>
            </button>
          </div>
        )}
      </Host>
    );
  }
}
