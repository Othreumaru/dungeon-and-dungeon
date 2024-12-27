// import { useContext, useEffect, useRef, useState } from "react";
// import "./chat-window.css";
import { EngineContext } from "../../engine-context";
import { emitChatRequest } from "../../../protocol/requests";
import {
  rem,
  Tabs,
  Group,
  Paper,
  Box,
  ScrollArea,
  Flex,
  Input,
  Text,
} from "@mantine/core";
import {
  IconPhoto,
  IconMessageCircle,
  IconSettings,
  IconGridDots,
} from "@tabler/icons-react";
import { useDrag } from "../../hooks/use-drag";
import { useLocalStorage } from "@mantine/hooks";
import { useContext, useEffect, useRef, useState } from "react";
import { Actions } from "../../../protocol/actions";
import { useServerContext } from "../../hooks/use-server-context";

export function ChatWindow() {
  const [windowHeight] = useState(300);
  const [selectedTab, setSelectedTab] = useLocalStorage<string | null>({
    key: "window-tab",
    defaultValue: "chat",
  });
  const [windowPosition, setWindowPosition] = useLocalStorage({
    key: "window-position",
    defaultValue: {
      x: 0,
      y: (window.innerHeight - windowHeight) / window.innerHeight,
    },
  });
  const { ref } = useDrag({
    onDrag: (e) => {
      setWindowPosition({
        x: windowPosition.x + e.movementX / window.innerWidth,
        y: windowPosition.y + e.movementY / window.innerHeight,
      });
    },
  });

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

  const iconStyle = { width: rem(12), height: rem(12) };

  return (
    <div
      style={{
        position: "fixed",
        top: `calc(${windowPosition.y * 100}% - ${rem(8)})`,
        left: `calc(${windowPosition.x * 100}% - ${rem(8)})`,
      }}
    >
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        style={{ width: rem(400), height: rem(windowHeight) }}
      >
        <Tabs value={selectedTab} onChange={setSelectedTab} variant="outline">
          <Group justify="start">
            <Box component="div" ref={ref} p={rem(8)}>
              <IconGridDots
                style={{ width: rem(24), height: rem(24), opacity: 0.3 }}
              />
            </Box>
            <Tabs.List>
              <Tabs.Tab
                value="chat"
                leftSection={<IconPhoto style={iconStyle} />}
              >
                Chat
              </Tabs.Tab>
              <Tabs.Tab
                value="messages"
                leftSection={<IconMessageCircle style={iconStyle} />}
              >
                Messages
              </Tabs.Tab>
              <Tabs.Tab
                value="settings"
                leftSection={<IconSettings style={iconStyle} />}
              >
                State Debug
              </Tabs.Tab>
            </Tabs.List>
          </Group>
          <Tabs.Panel value="chat">
            <ScrollArea w={300} h={200}>
              <Flex direction="column" gap="md">
                {actions
                  .filter((action) => action.type === "action:chat")
                  .map((message, index) => (
                    <Box
                      key={index}
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
                    </Box>
                  ))}
              </Flex>
            </ScrollArea>
            <Input
              placeholder="Send meessage..."
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  emitChatRequest(eventEmitter, event.currentTarget.value);
                  event.currentTarget.value = "";
                }
              }}
            />
          </Tabs.Panel>
          <Tabs.Panel value="messages">
            <ScrollArea w={400} h={200}>
              <Flex direction="column" gap="md">
                {actions.map((message, index) => (
                  <Text fz="xs" lh="xs" ta="left" m={rem(10)} key={index}>
                    {JSON.stringify(message)}
                  </Text>
                ))}
              </Flex>
            </ScrollArea>
          </Tabs.Panel>
          <Tabs.Panel value="settings">State debug comming soon...</Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
}
