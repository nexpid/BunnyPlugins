import { ReactNative as RN } from "@vendetta/metro/common";

import { Redesign } from "$/types";

import SliderIcon from "../SliderIcon";

export default function RedesignSlider({
  value,
  step,
  onValueChange,
  minimumValue,
  maximumValue,
}: {
  value: number;
  step: number;
  onValueChange?: (val: number) => void;
  minimumValue: number;
  maximumValue: number;
}) {
  return (
    <RN.View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 12 }}>
      <Redesign.Slider
        value={value}
        step={step}
        onValueChange={onValueChange}
        minimumValue={minimumValue}
        startIcon={
          <SliderIcon
            side="start"
            onPress={() => {
              const val = Math.min(
                Math.max(value - step, minimumValue),
                maximumValue,
              );
              if (val !== value) onValueChange(val);
            }}
          />
        }
        maximumValue={maximumValue}
        endIcon={
          <SliderIcon
            side="end"
            onPress={() => {
              const val = Math.min(
                Math.max(value + step, minimumValue),
                maximumValue,
              );
              if (val !== value) onValueChange(val);
            }}
          />
        }
      />
    </RN.View>
  );
}
