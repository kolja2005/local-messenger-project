import { io, Socket } from "socket.io-client";
import { SOCKET_URL, SOCKET_CONFIG, ACCESS_TOKEN_KEY } from "./config";
import { EventEmitter } from "events";

// Интерфейсы для событий сокета
export interface SocketMessage {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  timestamp: string;
  is_read: boolean;
  author?: {
    id: string;
    username: string;
    display_name: string;
    avatar_path?: string;
  };
}

export interface UserStatus {
  user_id: string;
  status: "online" | "offline";
  last_seen: string;
}

export interface UserTyping {
  user_id: string;
  chat_id: string;
  is_typing: boolean;
}

class SocketService extends EventEmitter {
  private socket: Socket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isMockMode: boolean = false;

  constructor() {
    super();
    this.setMaxListeners(20);
  }

  // Подключение к WebSocket серверу
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connected && this.socket) {
        resolve();
        return;
      }

      // Получаем токен доступа
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        reject(new Error("Отсутствует токен авторизации"));
        return;
      }

      // Создаем подключение
      this.socket = io(SOCKET_URL, {
        query: { token },
        transports: ["websocket"],
        reconnection: false, // Отключаем автоматическое переподключение
      });

      // Обработчики событий подключения
      this.socket.on("connect", () => {
        console.log("WebSocket подключен");
        this.connected = true;
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Ошибка подключения WebSocket:", error);
        this.connected = false;
        this.attemptReconnect();
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("WebSocket отключен");
        this.connected = false;
        this.attemptReconnect();
      });

      // Обработчики бизнес-событий
      this.socket.on("new_message", (message: SocketMessage) => {
        this.emit("message", message);
      });

      this.socket.on("user_status", (status: UserStatus) => {
        this.emit("status", status);
      });

      this.socket.on("user_typing", (data: UserTyping) => {
        this.emit("typing", data);
      });
    });
  }

  // Попытка переподключения при потере соединения
  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= SOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      console.log("Достигнуто максимальное количество попыток переподключения");
      return;
    }

    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      console.log(`Попытка переподключения ${this.reconnectAttempts}...`);
      this.connect().catch(() => {
        // Ошибка обрабатывается в connect()
      });
    }, SOCKET_CONFIG.RECONNECT_INTERVAL);
  }

  // Отправка статуса набора текста
  sendTyping(chatId: string, isTyping: boolean): void {
    if (!this.connected || !this.socket) {
      return;
    }

    if (this.isMockMode) {
      this.socket.sendEvent("typing", {
        chat_id: chatId,
        is_typing: isTyping,
      });
    } else {
      this.socket.emit("typing", {
        chat_id: chatId,
        is_typing: isTyping,
      });
    }
  }

  // Отправка сообщения через WebSocket
  sendMessage(chatId: string, content: string): void {
    if (!this.connected || !this.socket) {
      return;
    }

    if (this.isMockMode) {
      this.socket.sendEvent("message", {
        chat_id: chatId,
        content,
      });
    } else {
      this.socket.emit("message", {
        chat_id: chatId,
        content,
      });
    }
  }

  // Отправка статуса прочтения сообщения
  markAsRead(messageId: string): void {
    if (!this.connected || !this.socket) {
      return;
    }

    if (this.isMockMode) {
      this.socket.sendEvent("read_message", {
        message_id: messageId,
      });
    } else {
      this.socket.emit("read_message", {
        message_id: messageId,
      });
    }
  }

  // Отключение от WebSocket
  disconnect(): void {
    if (this.socket) {
      if (this.isMockMode) {
        this.socket.disconnect();
      } else {
        this.socket.disconnect();
      }
      this.socket = null;
      this.connected = false;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.reconnectAttempts = 0;
    this.removeAllListeners();
  }

  // Проверка состояния подключения
  isConnected(): boolean {
    return this.connected;
  }
}

// Создаем и экспортируем синглтон для использования во всем приложении
const socketService = new SocketService();

export default socketService;
