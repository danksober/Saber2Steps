import { useAtom } from 'jotai';
import { musicFileAtom, backgroundFileAtom, infoFileAtom } from './formState';
import {
  Box,
  Container,
  FileUpload,
  FormField,
  Header,
  Link,
  SpaceBetween,
} from '@cloudscape-design/components';
import { commonFileUploadProps } from '../constants/fileUpload';

export default function SaberFileForm() {
  const [musicFile, setMusicFile] = useAtom(musicFileAtom);
  const [backgroundFile, setBackgroundFile] = useAtom(backgroundFileAtom);
  const [infoFile, setInfoFile] = useAtom(infoFileAtom);
  return (
    <Container
      header={
        <Header
          variant="h2"
          description={
            <Box>
              This can be downloaded from Beat Saber map websites such as
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
          Choose Beat Saber files
        </Header>
      }
    >
      <SpaceBetween direction="vertical" size="m">
        <FormField
          label=" Choose info file"
          description="Choose info file for the song, the file should be in the zip you downloaded named info.dat"
        >
          <FileUpload
            onChange={({ detail }) => setInfoFile(detail.value)}
            value={infoFile}
            {...commonFileUploadProps}
            constraintText="info.dat"
          />
        </FormField>

        <FormField
          label=" Choose music file"
          description="Choose music file for the song, the music file should be in the zip you downloaded, might need conversion to ogg or mp3 format"
        >
          <FileUpload
            onChange={({ detail }) => setMusicFile(detail.value)}
            value={musicFile}
            {...commonFileUploadProps}
            constraintText=".mp3 or .ogg format"
          />
        </FormField>

        <FormField
          label=" Choose background file (Optional)"
          description="Choose background file for the song, the file should be in the zip you downloaded"
        >
          <FileUpload
            onChange={({ detail }) => setBackgroundFile(detail.value)}
            value={backgroundFile}
            {...commonFileUploadProps}
            constraintText=".jpg, .jpeg, .png etc."
          />
        </FormField>
      </SpaceBetween>
    </Container>
  );
}
