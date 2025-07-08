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
          </div>
        )}
      </Host>
    );
  }
}
