import { Minus, Plus } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface StepperProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** What is counted, for screen readers */
  unit?: string;
}

/** A number with minus and plus buttons */
export function Stepper({
  value,
  min,
  max,
  onChange,
  unit = "rounds",
}: StepperProps) {
  return (
    <View className="flex-row items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        icon={Minus}
        accessibilityLabel={`Fewer ${unit}`}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <Text
        className="w-8 text-center text-xl font-semibold"
        accessibilityLabel={`${value} ${unit}`}
      >
        {value}
      </Text>
      <Button
        variant="outline"
        size="icon"
        icon={Plus}
        accessibilityLabel={`More ${unit}`}
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}
