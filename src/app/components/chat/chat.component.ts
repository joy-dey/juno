import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

type Message = {
  text: string;
  from: 'bot' | 'user';
};

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent {
  isMinimized: Boolean = true;
  isExpanded: Boolean = false;

  messages: Message[] = [];

  messageForm = new FormGroup({
    message: new FormControl('', Validators.required),
  });

  sendMessage() {
    console.log(this.messageForm.value);
    if (this.messageForm.value.message) {
      this.messages.push({
        text: this.messageForm.value.message,
        from: 'user',
      });
      this.messageForm.reset();
    }
  }

  toggleMinimize(): void {
    this.isMinimized = !this.isMinimized;
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }
}
