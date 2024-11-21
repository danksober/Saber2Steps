import {
  Container,
  Header,
  SpaceBetween,
  Wizard,
  WizardProps,
} from '@cloudscape-design/components';
import React from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { chartFilesAtom, stepChartAtom } from './formState';
import SaberFileForm from './SaberFileForm';
import LevelMapForm from './LevelMapForm';
import { useParseSaber } from '../parser/SaberParser';
import StepCharts from './StepCharts';

export default function Home() {
  const parse = useParseSaber();
  const charts = useAtomValue(chartFilesAtom);
  const setStepChart = useSetAtom(stepChartAtom);
  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  const onNavigate = (e: WizardProps.NavigateDetail) => {
    if (e.reason === 'next') {
      // validate
      if (charts?.length) {
        parse().then((data) => {
          setStepChart(data);
          setActiveStepIndex(e.requestedStepIndex);
        });
      } else {
        // set error state
      }
    } else {
      setActiveStepIndex(e.requestedStepIndex);
    }
  };
  return (
    <Wizard
      i18nStrings={{
        stepNumberLabel: (stepNumber) => `Step ${stepNumber}`,
        collapsedStepsLabel: (stepNumber, stepsCount) =>
          `Step ${stepNumber} of ${stepsCount}`,
        skipToButtonLabel: (step) => `Skip to ${step.title}`,
        navigationAriaLabel: 'Steps',

        previousButton: 'Previous',
        nextButton: 'Next',
        submitButton: 'Create',
        optional: 'optional',
      }}
      allowSkipTo={false}
      onNavigate={(e) => onNavigate(e.detail)}
      activeStepIndex={activeStepIndex}
      steps={[
        {
          title: 'Saber2Steps',
          description:
            'This app can convert Beat Saber custom maps to ITG/Stepmania chart files',
          content: (
            <SpaceBetween direction="vertical" size="l">
              <SaberFileForm />
              <LevelMapForm />
            </SpaceBetween>
          ),
        },
        {
          title: 'Stepmania',
          content: (
            <SpaceBetween size="xs">
              <StepCharts />
            </SpaceBetween>
          ),
        },
      ]}
    />
  );
}
