import { createStore } from '@stencil/store';

export interface ChatMessage {
  type: 'user' | 'bot';
  message: string;
  timestamp: string;
}

type connectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface ChatState {
  // chat data
  messages: ChatMessage[];
  isBotTyping: boolean;

  // socket state
  isSocketConnected: boolean;
  socketConnectionStatus: connectionStatus;
  reconnectAttempts: number;

  // ui state
  isOpen: boolean;
}

const { state, onChange } = createStore<ChatState>({
  messages: [],
  isBotTyping: false,

  isSocketConnected: false,
  socketConnectionStatus: 'connecting',
  reconnectAttempts: 0,

  isOpen: false,
});

export { state as chatState, onChange as onChatStateChange };

export const chatActions = {
  addMessage: (message: ChatMessage) => {
    state.messages = [...state.messages, message];
  },

  setBotTyping: (isTyping: boolean) => {
    state.isBotTyping = isTyping;
  },

  setSocketConnection: (connectionStatus: connectionStatus) => {
    state.socketConnectionStatus = connectionStatus;
  },

  increaseReconnectAttempt: () => {
    state.reconnectAttempts += 1;
  },

  resetReconnectAttepts: () => {
    state.reconnectAttempts = 0;
  },

  openChat: () => {
    state.isOpen = true;
  },

  closeChat: () => {
    state.isOpen = false;
  },

  toggleChat: () => {
    state.isOpen = !state.isOpen;
  },
};
