import React, { useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import Fuse from "fuse.js";
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

import { getStreamToken, } from "../../services/streamToken.service";
import { tutorialLinks } from "../../config/tutorialLinks";
import { faqAnswers } from "../../config/faqAnswers";

import type { FAQEntry } from "../../config/faqAnswers";
import type { Tutorial } from "../../config/tutorialLinks";

const apiKey = "2eu4f8nrv6rs";
const chatClient = StreamChat.getInstance(apiKey);

const ChatPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [botMessages, setBotMessages] = useState<{ id: string; text: string }[]>([]);
  const listenerAttached = useRef(false);
  const initDone = useRef(false);

  // ✅ Connect user
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const connectChat = async () => {
      try {
        if (chatClient.userID) await chatClient.disconnectUser();

        const userId = "thaveephon";
        const { token } = await getStreamToken(userId);
        if (!token) throw new Error("No token returned from backend");

        await chatClient.connectUser(
          {
            id: userId,
            name: "Thaveephon",
            image: `https://getstream.io/random_svg/?id=${userId}`,
          },
          token
        );

        const channelId = `prowolo_chat_demo_${userId}`;
        const ch = chatClient.channel("messaging", channelId, {
          members: [userId],
        });

        await ch.watch();
        setChannel(ch);
        setConnected(true);
      } catch (err) {
        console.error("❌ Chat connection failed:", err);
      }
    };

    connectChat();

    return () => {
      (async () => {
        if (chatClient.userID) await chatClient.disconnectUser();
      })();
    };
  }, []);

  // ✅ Chatbot logic (Fuse.js + fallback)
  useEffect(() => {
    if (!channel || listenerAttached.current) return;
    listenerAttached.current = true;

    console.log("🤖 Attaching chatbot listener...");
    const repliedIds = new Set<string>();

    // Normalize text for matching
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s]/gi, "")
        .trim();

    // Fuse configuration
    const fuseTutorials = new Fuse(tutorialLinks, {
      keys: ["keywords"],
      threshold: 0.5, // relaxed for better long phrase match
    });
    const fuseFaqs = new Fuse(faqAnswers, {
      keys: ["keywords"],
      threshold: 0.45,
    });

    const handleSend = async (event: any) => {
      const message = event?.message;
      if (!message || !message.text) return;

      // Skip bot messages or duplicates
      if (message.user.id === "prowolo-bot" || repliedIds.has(message.id)) return;
      repliedIds.add(message.id);

      const text = normalize(message.text);
      console.log("📝 Received:", text);

      try {
        // Show typing indicator
        await channel.sendEvent({
          type: "typing.start",
          user: { id: "prowolo-bot", name: "Prowolo Bot 🤖" },
        });
        await new Promise((r) => setTimeout(r, 800));

        // Default fallback
        let reply = "Sorry, I don’t have information about this question yet. Please provide more details.";

        // Fuse search
        let videoMatch: Tutorial | undefined = fuseTutorials.search(text)[0]?.item;
        let faqMatch: FAQEntry | undefined = fuseFaqs.search(text)[0]?.item;

        // 🔹 Extra fallback (substring match)
        if (!videoMatch) {
        videoMatch = tutorialLinks.find((t) =>
            t.keywords.some((k) => text.includes(k.toLowerCase()))
        );
        }

        if (!faqMatch) {
        faqMatch = faqAnswers.find((f) =>
            f.keywords.some((k) => text.includes(k.toLowerCase()))
        );
        }


        // 🧩 Construct reply
        if (videoMatch) {
          reply = `🎬 Click here to watch tutorial video: <a href="${videoMatch.link}" target="_blank" style="color:#2c3d92; text-decoration:underline;">Open Video</a>`;
        } else if (faqMatch) {
          reply = faqMatch.answer;
          if (faqMatch.followup) {
            reply += `<br><br>💡 If the problem persists: ${faqMatch.followup}`;
          }
        }

        // Show bot message
        setBotMessages((prev) => [...prev, { id: message.id, text: reply }]);
      } catch (error) {
        console.error("❌ Bot reply failed:", error);
      } finally {
        await channel.sendEvent({
          type: "typing.stop",
          user: { id: "prowolo-bot" },
        });
      }
    };

    channel.on("message.new", handleSend);
    return () => channel.off("message.new", handleSend);
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
            <ChannelHeader title="💬 Prowolo Chatbot" />
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <MessageList messageActions={[]} />

              {/* ✅ Bot replies (English only + clickable links) */}
              {botMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    background: "#EAF3FF",
                    color: "#222",
                    margin: "4px 16px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    alignSelf: "flex-start",
                    maxWidth: "80%",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <strong>🤖 Prowolo Bot:</strong>
                  <div
                    style={{
                      marginTop: 4,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                </div>
              ))}
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
                  placeholder: "Type your question here...",
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

export default ChatPage;
