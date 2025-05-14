
import { generateRandomTime } from "./utils";

export const mockedUsers = [
  {
    id: "user1",
    username: "ivan",
    displayName: "Иван Петров",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(0),
    isOnline: true,
  },
  {
    id: "user2",
    username: "elena",
    displayName: "Елена Смирнова",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(0),
    isOnline: true,
  },
  {
    id: "user3",
    username: "alexey",
    displayName: "Алексей Иванов",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(1),
    isOnline: false,
  },
  {
    id: "user4",
    username: "maria",
    displayName: "Мария Кузнецова",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(2),
    isOnline: false,
  },
  {
    id: "user5",
    username: "dmitry",
    displayName: "Дмитрий Соколов",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(5),
    isOnline: false,
  },
  {
    id: "user6",
    username: "olga",
    displayName: "Ольга Новикова",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=150&auto=format&fit=crop",
    lastSeen: generateRandomTime(1),
    isOnline: false,
  },
];

export const mockedChats = [
  {
    id: "chat1",
    name: "Иван Петров",
    participants: [
      { 
        id: "admin1",
        username: "admin",
        displayName: "Администратор",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      },
      mockedUsers[0]
    ],
    lastMessage: {
      senderId: "user1",
      text: "Привет! Как дела с проектом?",
      timestamp: generateRandomTime(0.1),
    },
    isGroup: false,
    unreadCount: 1,
    avatar: mockedUsers[0].avatar,
  },
  {
    id: "chat2",
    name: "Елена Смирнова",
    participants: [
      { 
        id: "admin1",
        username: "admin",
        displayName: "Администратор",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      },
      mockedUsers[1]
    ],
    lastMessage: {
      senderId: "admin1",
      text: "Документы готовы, можно забирать",
      timestamp: generateRandomTime(1),
    },
    isGroup: false,
    unreadCount: 0,
    avatar: mockedUsers[1].avatar,
  },
  {
    id: "chat3",
    name: "Рабочая группа",
    participants: [
      { 
        id: "admin1",
        username: "admin",
        displayName: "Администратор",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      },
      mockedUsers[0],
      mockedUsers[1],
      mockedUsers[2],
    ],
    lastMessage: {
      senderId: "user1",
      text: "Встреча в 15:00 в конференц-зале",
      timestamp: generateRandomTime(3),
    },
    isGroup: true,
    unreadCount: 3,
    avatar: null,
  },
  {
    id: "chat4",
    name: "Алексей Иванов",
    participants: [
      { 
        id: "admin1",
        username: "admin",
        displayName: "Администратор",
        avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=150&auto=format&fit=crop",
        lastSeen: new Date(),
        isOnline: true,
      },
      mockedUsers[2]
    ],
    lastMessage: {
      senderId: "user3",
      text: "Спасибо за информацию!",
      timestamp: generateRandomTime(5),
    },
    isGroup: false,
    unreadCount: 0,
    avatar: mockedUsers[2].avatar,
  },
];

// Генерация истории сообщений для чата
export const generateMessages = (chatId: string, count = 10) => {
  const chat = mockedChats.find(c => c.id === chatId);
  if (!chat) return [];
  
  const messages = [];
  const participants = chat.participants;
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const sender = participants[Math.floor(Math.random() * participants.length)];
    const timestamp = new Date(now);
    timestamp.setMinutes(now.getMinutes() - (count - i) * 5); // Сообщения с интервалом в 5 минут
    
    messages.push({
      id: `msg-${chatId}-${i}`,
      chatId: chatId,
      senderId: sender.id,
      text: getRandomMessage(i),
      timestamp: timestamp,
      isRead: true
    });
  }
  
  return messages;
};

const getRandomMessage = (index: number) => {
  const messages = [
    "Привет, как дела?",
    "Можешь посмотреть документы, которые я отправил?",
    "Когда будет готов отчет?",
    "Встреча перенесена на завтра",
    "Спасибо за информацию!",
    "Хорошо, сделаю",
    "У меня есть вопрос по проекту",
    "Не забудь про дедлайн в пятницу",
    "Обсудим при встрече",
    "Посмотри презентацию, нужны твои комментарии",
    "Я отправил тебе на почту важную информацию",
    "Согласен, так и сделаем",
    "Отличная идея!",
    "Хорошего дня!",
    "До завтра!"
  ];
  
  return messages[index % messages.length];
};
