import {
  Container,
  FileInput,
  Header,
  SpaceBetween,
  Table,
} from '@cloudscape-design/components';
import { useAtom } from 'jotai';
import React from 'react';
import { chartFilesAtom } from './formState';

export default function LevelMapForm() {
  const [chartFiles, setChartFiles] = useAtom(chartFilesAtom);
  return (
    <Container
      header={
        <Header
          variant="h2"
          description="Choose the level .dat files such as Expert.dat, ExpertPlus.dat"
        >
          Choose Beat Saber map files
        </Header>
      }
    >
      <SpaceBetween size="s">
        <FileInput
          onChange={({ detail }) => setChartFiles(detail.value)}
          value={chartFiles}
          multiple
        >
          Choose files
        </FileInput>
        <Table<File>
          columnDefinitions={[
            {
              id: 'name',
              header: 'File name',
              cell: (file) => file.name,
            },
            {
              id: 'size',
              header: 'File size',
              cell: (file) => file.size / 1000 + 'KB',
            },
          ]}
          items={chartFiles}
          empty="No map files"
          variant="embedded"
        />
      </SpaceBetween>
    </Container>
  );
}
