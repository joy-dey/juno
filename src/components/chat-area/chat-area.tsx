import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'chat-area',
  styleUrl: 'chat-area.css',
  shadow: true,
})
export class ChatArea {
  render() {
    return (
      <Host>
        <div class="juno-chat-area">
          <p>I'm an AI chatbot. While I aim for accuracy, my responses may not always be entirely correct or up-to-date.</p>
        </div>
      </Host>
    );
  }
}
