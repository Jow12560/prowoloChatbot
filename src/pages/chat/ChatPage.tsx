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

import { getStreamToken } from "../../services/streamToken.service";
import { tutorialLinks } from "../../config/tutorialLinks";
import { faqAnswers } from "../../config/faqAnswers";

import type { FAQEntry } from "../../config/faqAnswers";
import type { Tutorial } from "../../config/tutorialLinks";

// ✅ Global single Stream instance and connect guard
const apiKey = "2eu4f8nrv6rs";
const chatClient = StreamChat.getInstance(apiKey);
let globalConnected = false;

const ChatPage: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [botMessages, setBotMessages] = useState<{ id: string; text: string }[]>([]);
  const listenerAttached = useRef(false);
  const lastReplyTime = useRef<number>(0);
  const processedIds = useRef(new Set<string>()); // ✅ Prevent re-replies

  // ✅ Connect user once per session
  useEffect(() => {
    const connectChat = async () => {
      if (globalConnected) {
        console.log("⚡ Already connected to Stream, skipping...");
        return;
      }

      try {
        if (chatClient.userID) await chatClient.disconnectUser();

        const userId = "thaveephon";
        const { token } = await getStreamToken(userId);
        if (!token) throw new Error("No token returned from backend");

        console.log("🔗 Connecting Stream user:", userId);
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
        await ch.truncate(); // 🧹 Clear old chat each session
        setChannel(ch);
        setConnected(true);
        globalConnected = true;
      } catch (err) {
        console.error("❌ Chat connection failed:", err);
      }
    };

    connectChat();
  }, []);

  // ✅ Chatbot logic (English only)
  useEffect(() => {
    if (!channel || listenerAttached.current) return;
    listenerAttached.current = true;

    console.log("🤖 Attaching chatbot listener...");

    const normalize = (str: string) =>
      str
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\w\s]/gi, "")
        .trim();

    const fuseTutorials = new Fuse(tutorialLinks, {
      keys: ["keywords"],
      threshold: 0.5,
    });

    const fuseFaqs = new Fuse(faqAnswers, {
      keys: ["keywords"],
      threshold: 0.45,
    });

    const handleSend = async (event: any) => {
      const message = event?.message;
      if (!message?.text) return;

      // 🧩 Skip bot messages
      if (message.user.id === "prowolo-bot") return;

      // 🧩 Prevent duplicate replies
      if (processedIds.current.has(message.id)) return;
      processedIds.current.add(message.id);

      // 🧩 Debounce for 500 ms
      const now = Date.now();
      if (now - lastReplyTime.current < 500) return;
      lastReplyTime.current = now;

      const text = normalize(message.text);
      console.log("📝 Received:", text);

      try {
        await channel.sendEvent({
          type: "typing.start",
          user: { id: "prowolo-bot", name: "Prowolo Bot 🤖" },
        });
        await new Promise((r) => setTimeout(r, 700));

        let reply =
          "Sorry, I don’t have information about this question yet. Please provide more details.";

        // 🔍 Fuzzy search for tutorials and FAQs
        let videoMatch: Tutorial | undefined = fuseTutorials.search(text)[0]?.item;
        let faqMatch: FAQEntry | undefined = fuseFaqs.search(text)[0]?.item;

        // Fallback substring match
        if (!videoMatch)
          videoMatch = tutorialLinks.find((t) =>
            t.keywords.some((k) => text.includes(k.toLowerCase()))
          );
        if (!faqMatch)
          faqMatch = faqAnswers.find((f) =>
            f.keywords.some((k) => text.includes(k.toLowerCase()))
          );

        // 🧠 Build English reply
        if (videoMatch) {
          reply = `🎬 Click here to watch tutorial: <a href="${videoMatch.link}" target="_blank" style="color:#2c3d92;text-decoration:underline;">Open Video</a>`;
        } else if (faqMatch) {
          reply = faqMatch.answer;
          if (faqMatch.followup) reply += `<br><br>💡 If the problem persists: ${faqMatch.followup}`;
        }

        // Update local UI
        setBotMessages((prev) => [...prev, { id: message.id, text: reply }]);
      } catch (err) {
        console.error("❌ Bot reply failed:", err);
      } finally {
        await channel.sendEvent({
          type: "typing.stop",
          user: { id: "prowolo-bot" },
        });
      }
    };

    channel.off("message.new");
    channel.on("message.new", handleSend);

    return () => {
      channel.off("message.new", handleSend);
      listenerAttached.current = false;
    };
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

              {/* ✅ Bot replies (English only) */}
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
