
import React from "react";
import MessengerLayout from "@/components/messenger/MessengerLayout";
import { ChatProvider } from "@/contexts/ChatContext";

const MessengerPage: React.FC = () => {
  return (
    <ChatProvider>
      <MessengerLayout />
    </ChatProvider>
  );
};

export default MessengerPage;
