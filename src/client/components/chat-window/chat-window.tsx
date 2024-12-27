import { useContext, useEffect, useRef, useState } from "react";
import "./chat-window.css";
import { useServerContext } from "../../hooks/use-server-context";
import { Actions } from "../../../protocol/actions";
import { EngineContext } from "../../engine-context";
import { emitChatRequest } from "../../../protocol/requests";

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
                  {`${
                    state.units.find(
                      (unit) => unit.id === message.payload.userId
                    )?.name ?? "Unknown"
                  }: ${message.payload.message}`}
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
                emitChatRequest(eventEmitter, event.currentTarget.value);
                event.currentTarget.value = "";
              }
            }}
          />
        </div>
      </div>
    </>
  );
}
