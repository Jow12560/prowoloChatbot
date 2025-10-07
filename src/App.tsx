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
import "stream-chat-react/css/v2/index.css";

import { getStreamToken } from "./services/streamToken.service";
import { tutorialLinks } from "./config/tutorialLinks";
import { faqAnswers } from "./config/faqAnswers";

const apiKey = "2eu4f8nrv6rs";
const chatClient = StreamChat.getInstance(apiKey);
let hasConnected = false;

const App: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);

  // ✅ Connect user safely (prevent double connection)
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        if (hasConnected || chatClient.userID) {
          await chatClient.disconnectUser();
        }
        hasConnected = true;

        const userId = "prowolo_user_" + Math.floor(Math.random() * 10000);
        const { token } = await getStreamToken(userId);

        await chatClient.connectUser(
          {
            id: userId,
            name: "Prowolo User",
            image: `https://getstream.io/random_svg/?id=${userId}`,
          },
          token
        );

        const channelId = `prowolo_chat_demo_${userId}`;
        const ch = chatClient.channel("messaging", channelId, {
          members: [userId],
          created_by_id: userId,
        });

        await ch.watch();
        if (isMounted) {
          setChannel(ch);
          setConnected(true);
        }
      } catch (err) {
        console.error("Stream Chat connection failed:", err);
      }
    };

    init();

    return () => {
      isMounted = false;
      chatClient.disconnectUser();
      hasConnected = false;
    };
  }, []);

  // ✅ Chatbot auto-reply logic
  useEffect(() => {
    if (!channel) return;

    const handleSend = async (event: any) => {
      if (event.message.user.id !== chatClient.userID) return;

      const text = event.message.text.toLowerCase();

      // 1️⃣ Tutorial video
      const videoMatch = tutorialLinks.find(t =>
        t.keywords.some(k => text.includes(k.toLowerCase()))
      );
      if (videoMatch) {
        await channel.sendMessage({
          text: `🎬 คลิกเพื่อดูวิดีโอแนะนำ: [เปิดวิดีโอ](${videoMatch.link})`,
        });
        return;
      }

      // 2️⃣ FAQ
      const faqMatch = faqAnswers.find(f =>
        f.keywords.some(k => text.includes(k.toLowerCase()))
      );
      if (faqMatch) {
        let reply = faqMatch.answer;
        if (faqMatch.followup)
          reply += `\n\n💡 ถ้าไม่หาย: ${faqMatch.followup}`;
        await channel.sendMessage({ text: reply });
        return;
      }

      // 3️⃣ Default fallback
      await channel.sendMessage({
        text: "ขออภัยครับ ยังไม่มีข้อมูลสำหรับคำถามนี้ 🧠 กรุณาระบุรายละเอียดเพิ่มเติม",
      });
    };

    channel.on("message.sent", handleSend);
    return () => channel.off("message.sent", handleSend);
  }, [channel]);

  if (!connected || !channel) return <LoadingIndicator />;

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <div style={{ flex: 1, overflow: "hidden" }}>
              <MessageList messageActions={[]} />
            </div>
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                backgroundColor: "#fff",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <MessageInput
                focus
                additionalTextareaProps={{
                  placeholder: "พิมพ์คำถามของคุณที่นี่...",
                }}
              />
            </div>
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default App;
