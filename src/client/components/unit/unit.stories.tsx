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
        type: "stationary",
        x: 0,
        y: 0,
        color: "blue",
      }}
    />
  </>
);

export const Sample1 = Template.bind({});
