import { useContext, useEffect, useRef, useState } from "react";
import "./chat-window.css";
import { useServerContext } from "../../hooks/use-server-context";
import { Actions, ChatRequest } from "../../../api";
import { EngineContext } from "../../engine-context";

export function ChatWindow() {
  const eventEmitter = useServerContext();
  const state = useContext(EngineContext);
  const [actions, setActions] = useState<Actions[]>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fn = (action: Actions) => {
      setActions((prev) => [...prev, action]);
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    };
    eventEmitter.on("message", fn);
    return () => {
      eventEmitter.off("message", fn);
    };
  }, [eventEmitter]);

  return (
    <>
      <div className="chat-window">
        <div className="chat-window-header">Chat Window</div>
        <div className="chat-window-content">
          <div className="chat-window-chat-messages" ref={messagesRef}>
            {actions.map((message, index) =>
              message.type === "action:chat" ? (
                <div
                  key={index}
                  className="chat-window-chat-message"
                  style={{
                    color:
                      state.units.find(
                        (unit) => unit.id === message.payload.userId
                      )?.color ?? "black",
                  }}
                >
                  {`${message.payload.userId.slice(0, 5)}: ${message.payload.message}`}
                </div>
              ) : (
                <div key={index} className="chat-window-chat-action">
                  {JSON.stringify(message)}
                </div>
              )
            )}
          </div>
        </div>
        <div className="chat-window-chat-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            onKeyUp={(event) => {
              if (event.key === "Enter") {
                const chatRequest: ChatRequest = {
                  type: "request:chat",
                  payload: { message: event.currentTarget.value },
                };
                eventEmitter.emit("request", chatRequest);
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
