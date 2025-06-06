import { Component, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'chat-bubble',
  styleUrl: 'chat-bubble.css',
  shadow: true,
})
export class ChatBubble {
  @Prop() type: 'bot' | 'user' = 'bot';
  @Prop() message: string;

  render() {
    return (
      <Host data-type={this.type}>
        <article class="juno-chat-bubble">
          <p>{this.message}</p>
        </article>
      </Host>
    );
  }
}
