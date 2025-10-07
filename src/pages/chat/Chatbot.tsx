import React, { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/index.css";

const apiKey = "YOUR_STREAM_API_KEY"; // 👈 replace this with your Stream API Key

export default function Chatbot() {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    const initChat = async () => {
      const client = StreamChat.getInstance(apiKey);

      // Dummy user (replace with logged-in user info later)
      await client.connectUser(
        {
          id: "prowolo_user_1",
          name: "Prowolo Bot User",
          image: "https://getstream.io/random_svg/?id=prowolo_user_1",
        },
        client.devToken("prowolo_user_1")
      );

      const channel = client.channel("messaging", "prowolo-chatbot", {
        name: "Prowolo Chatbot",
      });

      await channel.watch();
      setChannel(channel);
      setChatClient(client);
    };

    initChat();

    return () => {
      chatClient?.disconnectUser();
    };
  }, []);

  if (!chatClient || !channel) return <LoadingIndicator />;

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
}
