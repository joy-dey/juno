import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private manuallyClosed = false;
  private messagesSubject = new Subject<any>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  message$ = this.messagesSubject.asObservable();
  connectionStatus$ = this.connectionStatusSubject.asObservable();

  connect(url: string): void {
    if (!url) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname;
      url = `${protocol}//${host}`;
    }

    if (this.socket) {
      this.manuallyClosed = true;
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close();
      this.socket = null;
    }

    this.manuallyClosed = false;
    this.socket = new WebSocket(url);
    this.socket.onopen = (event) => {
      console.log('[WebSocket] Connected:', event);
      this.connectionStatusSubject.next(true);
    };

    this.socket.onmessage = (event) => {
      console.log('[WebSocket] Message received:', event.data);

      try {
        const data = JSON.parse(event.data);
        this.messagesSubject.next(data);
      } catch {
        this.messagesSubject.next({ text: event.data, type: 'raw' });
      }
    };

    this.socket.onclose = (event) => {
      console.warn('[WebSocket] Closed:', event.code, event.reason);
      this.connectionStatusSubject.next(false);

      if (!this.manuallyClosed && event.code !== 1000) {
        console.log('[WebSocket] Reconnecting in 3s...');
        this.reconnectTimeout = setTimeout(() => this.connect(url!), 3000);
      }
    };

    this.socket.onerror = (event) => {
      console.error('[WebSocket] Error:', event);
    };
  }

  sendMessage(message: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const messageStr =
        typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(messageStr);
      console.log('[WebSocket] Message sent:', messageStr);
    } else {
      console.error('[WebSocket] Cannot send message, not connected.');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.manuallyClosed = true;
      clearTimeout(this.reconnectTimeout);
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
      this.connectionStatusSubject.next(false);
      console.log('[WebSocket] Manually disconnected');
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
