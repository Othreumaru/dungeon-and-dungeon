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
  IconBaselineDensityMedium,
} from "@tabler/icons-react";
import { useDrag } from "../../hooks/use-drag";
import { useElementSize, useLocalStorage } from "@mantine/hooks";
import { useContext, useEffect, useRef, useState } from "react";
import { Actions } from "../../../protocol/actions";
import { useServerContext } from "../../hooks/use-server-context";

export function ChatWindow() {
  const { ref: resizeRef } = useElementSize();
  const [windowHeight] = useState(300);
  const [selectedTab, setSelectedTab] = useLocalStorage<string | null>({
    key: "window-tab",
    defaultValue: "chat",
  });
  const [windowSize, setWindowSize] = useLocalStorage({
    key: "window-size",
    defaultValue: {
      width: 400,
      height: 300,
    },
  });
  const [windowPosition, setWindowPosition] = useLocalStorage({
    key: "window-position",
    defaultValue: {
      x: 0,
      y: (window.innerHeight - windowHeight) / window.innerHeight,
    },
  });
  const { ref: dragRef } = useDrag({
    onDrag: (e) => {
      setWindowSize({
        width: Math.max(e.pageX - windowPosition.x, 400),
        height: Math.max(e.pageY - windowPosition.y, 300),
      });
    },
  });
  const { ref } = useDrag({
    onDrag: (e) => {
      setWindowPosition({
        x: e.pageX,
        y: e.pageY,
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
        top: `${windowPosition.y}px`,
        left: `${windowPosition.x}px`,
      }}
    >
      <Paper
        withBorder
        shadow="sm"
        radius="md"
        style={{ width: rem(windowSize.width), height: rem(windowSize.height) }}
        ref={resizeRef}
      >
        <Tabs
          value={selectedTab}
          onChange={setSelectedTab}
          variant="outline"
          h={"calc(100% - 40px)"}
        >
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
                value="state-debug"
                leftSection={<IconSettings style={iconStyle} />}
              >
                State Debug
              </Tabs.Tab>
            </Tabs.List>
          </Group>
          <Tabs.Panel value="chat" h={"100%"}>
            <Flex
              direction="column"
              p={10}
              justify={"space-between"}
              h={"100%"}
            >
              <ScrollArea w={"100%"} h={"100%"}>
                <Flex direction="column" p={10}>
                  {actions
                    .filter((action) => action.type === "action:chat")
                    .map((message, index) => (
                      <Text
                        key={index}
                        fz="xs"
                        lh="xs"
                        ta="left"
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
                      </Text>
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
                mb={rem(5)}
              />
            </Flex>
          </Tabs.Panel>
          <Tabs.Panel value="messages" h={"100%"}>
            <ScrollArea w={"100%"} h={"100%"} scrollbars="y" p={10}>
              <Flex direction="column" gap={rem(10)} w={windowSize.width}>
                {actions.map((message, index) => (
                  <Text fz="xs" lh="xs" ta="left" m={rem(5)} key={index}>
                    {JSON.stringify(message)}
                  </Text>
                ))}
              </Flex>
            </ScrollArea>
          </Tabs.Panel>
          <Tabs.Panel value="state-debug" h={"100%"}>
            <ScrollArea w={"100%"} h={"100%"} scrollbars="y" p={10}>
              <Text ta="left" fz="xs" lh="xs" component="pre">
                {JSON.stringify(state, null, 2)}
              </Text>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "16px",
            height: "16px",
            opacity: 0.3,
            overflow: "hidden",
            userSelect: "none",
          }}
          ref={dragRef}
        >
          <IconBaselineDensityMedium
            style={{
              width: rem(24),
              height: rem(24),
              transform: "rotate(-45deg) translate(0, 4px)",
            }}
          />
        </div>
      </Paper>
    </div>
  );
}
