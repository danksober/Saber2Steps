import {
  Box,
  Button,
  Container,
  FormField,
  Header,
  Input,
  Link,
  Modal,
  RadioGroup,
  SpaceBetween,
} from '@cloudscape-design/components';
import { Controller, useFormContext } from 'react-hook-form';
import { ConfigurationFormState, useLinkForm } from '../form/configurationForm';
import SaberFileForm from './SaberFileForm';
import LevelMapForm from './LevelMapForm';
import { useState } from 'react';
import styled from 'styled-components';
import { getMapInfo } from '../constants/getMapInfo';

export default function BeatSaberInputForm() {
  const { control, watch } = useFormContext<ConfigurationFormState>();
  const {
    control: linkControl,
    trigger,
    getValues,
    formState: { errors },
  } = useLinkForm();
  const [mapId, setMapId] = useState<string>();

  const [modal, setModal] = useState(false);

  const watchInputType = watch('inputType');

  const onGenerate = async () => {
    const isValid = await trigger();
    if (isValid) {
      const mapId = getValues('mapLink').replace('https://beatsaver.com/maps/', '');
      setMapId(mapId);
      const info = await getMapInfo(mapId);
      setModal(true);
    }
  };
  return (
    <SpaceBetween direction="vertical" size="l">
      <Container header={<Header variant="h2">Choose Beat Saber input</Header>}>
        <Controller
          control={control}
          name="inputType"
          render={({ field }) => (
            <FormField>
              <RadioGroup
                value={field.value as any}
                onChange={(e) => field.onChange(e.detail.value)}
                items={[
                  {
                    value: 'link',
                    label: 'Beat Saver map link',
                    description:
                      'Example: https://beatsaver.com/maps/<YOUR_MAP_ID>',
                  },
                  {
                    value: 'manual',
                    label: 'Manual',
                    description: 'Enter Beat Saber files manually separately',
                  },
                ]}
              />
            </FormField>
          )}
        ></Controller>
      </Container>
      {watchInputType === 'link' && (
        <Container
          header={
            <Header
              variant="h2"
              description={
                <Box>
                  The link can be found in places such as
                  <Link
                    variant="primary"
                    external
                    href="https://bsaber.com/getting-started/custom-songs"
                  >
                    {' '}
                    bsaber
                  </Link>
                </Box>
              }
            >
              Beat Saver map link
            </Header>
          }
        >
          <SpaceBetween size="l">
            <Controller
              control={linkControl}
              name="mapLink"
              render={({ field }) => (
                <FormField
                  label="Enter the link then click generate"
                  errorText={errors.mapLink?.message}
                >
                  <Input
                    placeholder="https://beatsaver.com/maps/<YOUR_MAP_ID>"
                    {...field}
                    value={field.value}
                    onChange={(e) => field.onChange(e.detail.value)}
                  />
                </FormField>
              )}
            />

            <Box float="right">
              <SpaceBetween direction="horizontal" size="m">
                {mapId && <Button onClick={() => setModal(true)}>View</Button>}
                <Button onClick={onGenerate}>
                  {mapId ? 'Re-generate' : 'Generate'}
                </Button>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      )}
      {watchInputType === 'manual' && (
        <>
          <SaberFileForm />
          <LevelMapForm />
        </>
      )}
      {mapId && modal && (
        <Modal
          visible
          size="max"
          onDismiss={() => setModal(false)}
          footer={
            <Box float="right">
              <Button onClick={() => setModal(false)}>Close</Button>
            </Box>
          }
        >
          <StyledPlayer
            src={`https://allpoland.github.io/ArcViewer/?id=${mapId}`}
            allow="fullscreen"
          />
        </Modal>
      )}
    </SpaceBetween>
  );
}

const StyledPlayer = styled.iframe`
    width: 100%;
    min-height: 80vh;
`;
