// src/ChatWindow.jsx
import React, { useState, useEffect } from "react";
import echo from "../echo";

const ChatWindow = ({ conversationId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Load existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/chat/${conversationId}/messages`,
          {
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("token"),
              "Accept": "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Failed to load messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    // ✅ Listen for new messages
    echo.channel("chat." + conversationId).listen("MessageSent", (e) => {
      setMessages((prev) => [...prev, e.message]);
    });
  }, [conversationId]);

  // ✅ Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/chat/${conversationId}/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("token"),
            "Accept": "application/json",
          },
          body: JSON.stringify({ message: newMessage }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md h-[500px] border rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
        <h2 className="font-bold">Chat</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.sender_id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-3 py-2 rounded-2xl max-w-xs ${
                msg.sender_id === userId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-black"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex items-center border-t px-3 py-2 bg-white"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-3 py-2 mr-2 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
