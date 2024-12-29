import { DemoScene } from "../demo-scene/demo-scene";
import { Unit } from "./unit";
import { StoryFn } from "@storybook/react";
import { Unit as UnitType } from "../../../protocol/state";

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
  argTypes: {
    now: {
      control: {
        type: "number",
      },
      defaultValue: 0,
      min: 0,
      max: 100,
    },
    unit: {
      control: {
        type: "object",
      },
      defaultValue: {
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
          {
            x: 0,
            y: 1,
            frame: 400,
          },
          {
            x: 0,
            y: 0,
            frame: 500,
          },
        ],
        color: "blue",
      },
    },
  },
};

const Template: StoryFn<{ now: number; unit: UnitType }> = ({ unit }) => (
  <>
    <Unit unit={unit} tickDurationMs={100} serverStartTime={0} />
  </>
);

export const Sample1 = Template.bind({});
Sample1.args = {
  now: 1,
  unit: {
    id: "1",
    name: "unit1",
    state: {
      type: "moving",
      task: {
        start: 0,
        duration: 500,
      },
      path: [
        {
          x: 0,
          y: 0,
        },
        {
          x: 1,
          y: 0,
        },
        {
          x: 1,
          y: 1,
        },
        {
          x: 0,
          y: 1,
        },
        {
          x: 0,
          y: 0,
        },
      ],
      lookAt: {
        type: "target:position",
        position: {
          x: 1,
          y: 0,
        },
      },
    },
    model: "mage",
    actions: [],
    controller: {
      type: "player",
    },
    color: "blue",
  },
};
