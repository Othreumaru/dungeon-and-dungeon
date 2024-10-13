import { DemoScene } from "../demo-scene/demo-scene";
import { Track } from "./track";
import { StoryFn } from "@storybook/react";

export default {
  title: "molecule/Track",
  component: Track,
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
  argTypes: {
    numOfTracks: {
      control: {
        type: "number",
        min: 0,
        max: 100,
        step: 1,
      },
    },
  },
};

const Template1 = (props: React.ComponentProps<typeof Track>) => (
  <>
    <Track {...props} />
  </>
);

export const Sample1 = Template1.bind({
  numOfTracks: 5,
});

const Template2 = (props: React.ComponentProps<typeof Track>) => (
  <group>
    <Track {...props} position={[0, 0, 0]} />
    <Track {...props} position={[1, 0, 0]} />
    <Track {...props} position={[2, 0, 1]} rotation-y={-Math.PI / 2} />
  </group>
);

export const Sample2 = Template2.bind({});
