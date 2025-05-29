import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SocketService } from '../../services/socket.service';

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
  constructor(private _socketService: SocketService) {
    _socketService.message$.subscribe((message) => {
      this.messages.push({
        from: 'bot',
        text: message.text,
      });
    });
  }

  ngOnInit() {
    this._socketService.connect(
      'http://10.10.10.133:8260/admin_socket?authorization=tanay'
    );
  }

  sendMessage() {
    if (this.messageForm.value.message) {
      this.messages.push({
        text: this.messageForm.value.message,
        from: 'user',
      });
      this._socketService.sendMessage(this.messageForm.value.message);
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
