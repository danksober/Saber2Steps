import {
  Alert,
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
import { useAtom } from 'jotai';
import { mapIdAtom } from './formState';

export default function BeatSaberInputForm() {
  const { control, watch, setValue } = useFormContext<ConfigurationFormState>();
  const {
    control: linkControl,
    trigger,
    getValues,
    formState: { errors },
  } = useLinkForm();
  const [mapId, setMapId] = useAtom(mapIdAtom);

  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const watchInputType = watch('inputType');

  const onGenerate = async () => {
    const isValid = await trigger();
    setError('');
    if (isValid) {
      setLoading(true);
      try {
        const mapId = getValues('mapLink').replace(
          'https://beatsaver.com/maps/',
          '',
        );
        const { chartFiles, infoFile, musicFile, backgroundFile } =
          await getMapInfo(mapId);
        setValue('backgroundFile', backgroundFile);
        setValue('musicFile', musicFile);
        setValue('chartFiles', chartFiles);
        setValue('infoFile', infoFile);
        setMapId(mapId);
        setModal(true);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
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
                    value={field.value}
                    onChange={(e) => field.onChange(e.detail.value)}
                  />
                </FormField>
              )}
            />

            <Box float="right">
              <SpaceBetween direction="horizontal" size="m">
                {mapId && <Button onClick={() => setModal(true)}>View</Button>}
                <Button onClick={onGenerate} loading={loading}>
                  {mapId ? 'Re-generate' : 'Generate'}
                </Button>
              </SpaceBetween>
            </Box>
            {error && (
              <Alert type="error" header="Error getting map data">
                {error}
              </Alert>
            )}
          </SpaceBetween>
        </Container>
      )}
      {(watchInputType === 'manual' || mapId) && (
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
