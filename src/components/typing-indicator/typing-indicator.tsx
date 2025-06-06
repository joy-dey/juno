import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'typing-indicator',
  styleUrl: 'typing-indicator.css',
  shadow: true,
})
export class TypingIndicator {
  render() {
    return (
      <Host>
        <div class="juno-typing-indicator">
          <div class="dancing-dot"></div>
          <div class="dancing-dot"></div>
          <div class="dancing-dot"></div>
        </div>
      </Host>
    );
  }
}
