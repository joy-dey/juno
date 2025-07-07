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

  async componentWillLoad() {
    const rawHTML = await marked.parse(this.message);
    this.parsedHTML = DOMPurify.sanitize(rawHTML);
  }

  render() {
    return (
      <Host data-type={this.type}>
        <article class="juno-chat-bubble">{this.type === 'bot' ? <div class="markdown-body" innerHTML={this.parsedHTML}></div> : <p>{this.message}</p>}</article>
      </Host>
    );
  }
}
