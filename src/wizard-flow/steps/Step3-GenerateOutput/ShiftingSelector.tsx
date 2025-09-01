import { Slider } from '@cloudscape-design/components';
import { useState } from 'react';

interface Props {
  defaultValue?: number | null;
  onChange?: (value: number | null, direction: 'forward' | 'backward') => void;
}

const positions = [-32, -24, -16, -12, -8, -4, 0, 4, 8, 12, 16, 24, 32];

export default function ShiftingSelector({ defaultValue, onChange }: Props) {
  const defaultIndex =
    defaultValue != null ? positions.indexOf(defaultValue) : 6;
  const [index, setIndex] = useState(defaultIndex === -1 ? 6 : defaultIndex);

  const handleChange = (value: number) => {
    setIndex(value);
    const val = positions[value];
    console.log(val);
    if (onChange)
      onChange(
        val === 0 ? null : Math.abs(val),
        val < 0 ? 'backward' : 'forward',
      );
  };

  return (
    <Slider
      min={0}
      max={positions.length - 1}
      step={1}
      value={index}
      onChange={({ detail }) => handleChange(detail.value as number)}
      valueFormatter={(val) => {
        const i = Number(val);
        const p = positions[i];
        return p === 0
          ? 'None'
          : `${Math.abs(p)}th notes (${p < 0 ? 'backward' : 'forward'})`;
      }}
    />
  );
}
