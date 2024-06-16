import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/MessageWidget.module.css";
import { useEffect, useState } from "react";

const MessageWidget = () => {
  const [messages, setMessages] = useState([]);
  var i = 0;
  useEffect(() => {
    console.log("Connecting to server");
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      const message = event.data;
      if (message == "ping") return;
      try {
        const parsedData = JSON.parse(message);
        if (parsedData.type !== "message") return;
        setMessages((prevMessages) => [...prevMessages, parsedData]);

        setTimeout(() => {
          setMessages((prevMessages) => prevMessages.slice(1));
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    };
    return () => socket.close();
  }, []);

  return (
    <div className={styles.messageContainer}>
      {messages?.map((message, index) => (
        <div
          key={index}
          className={styles.message + " space-x-2 text-black font-bold"}
        >
          <span
            className={styles.username + " font-bold "}
            style={{
              color: message.sender.identity.color,
            }}
          >
            {" "}
            {message.sender.username}{" "}
          </span>
          <span className={styles.messageText}>{message.message}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageWidget;
