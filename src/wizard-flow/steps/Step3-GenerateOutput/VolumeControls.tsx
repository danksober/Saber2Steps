import { FormField, Grid, Slider } from '@cloudscape-design/components';
import { useAtom } from 'jotai';
import { hitSoundVolumeAtom, musicVolumeAtom } from '../../state/wizardState';

export default function VolumeControls() {
  const [musicVolume, setMusicVolume] = useAtom(musicVolumeAtom);
  const [hitSoundVolume, setHitSoundVolume] = useAtom(hitSoundVolumeAtom);

  return (
    <Grid gridDefinition={[{ colspan: 6 }, { colspan: 6 }]}>
      <FormField label="Music Volume">
        <Slider
          value={musicVolume * 100}
          onChange={({ detail }) => setMusicVolume(detail.value / 100)}
          step={1}
          min={0}
          max={100}
          valueFormatter={(value) => `${value}%`}
        />
      </FormField>
      <FormField label="Hit Sound Volume">
        <Slider
          value={hitSoundVolume * 100}
          onChange={({ detail }) => setHitSoundVolume(detail.value / 100)}
          step={1}
          min={0}
          max={100}
          valueFormatter={(value) => `${value}%`}
        />
      </FormField>
    </Grid>
  );
}
