import { DemoScene } from "../demo-scene/demo-scene";
import { Unit } from "./unit";
import { StoryFn } from "@storybook/react";

export default {
  title: "molecule/Unit",
  component: Unit,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: StoryFn) => (
      <DemoScene cameraPosition={[2, 2, 2]}>
        <Story />
      </DemoScene>
    ),
  ],
};

const Template = () => (
  <>
    <Unit
      unit={{
        id: "1",
        type: "moving",
        path: [
          {
            x: 0,
            y: 0,
            frame: 100,
          },
          {
            x: 1,
            y: 0,
            frame: 200,
          },
          {
            x: 1,
            y: 1,
            frame: 300,
          },
        ],
        color: "blue",
      }}
    />
  </>
);

export const Sample1 = Template.bind({});
