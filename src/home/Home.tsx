import {
  Alert,
  SpaceBetween,
  Wizard,
  WizardProps,
} from '@cloudscape-design/components';
import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { stepChartAtom } from './formState';
import { useParseSaber } from '../parser/SaberParser';
import StepCharts from './StepCharts';
import { StepOutputBuilder } from '../parser/StepOutputBuilder';
import { useMapConfigurationForm } from '../form/configurationForm';
import { FormProvider } from 'react-hook-form';
import BeatSaberInputForm from './BeatSaberInputForm';

export default function Home() {
  const [stepChart, setStepChart] = useAtom(stepChartAtom);

  const formMethods = useMapConfigurationForm();
  const parse = useParseSaber();
  const [parseError, setParseError] = useState<string>();

  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  const onNavigate = async (e: WizardProps.NavigateDetail) => {
    setParseError(undefined);
    if (e.reason === 'next') {
      const isValid = await formMethods.trigger();
      if (isValid) {
        parse(formMethods.getValues())
          .then((data) => {
            setStepChart(data);
            setActiveStepIndex(e.requestedStepIndex);
          })
          .catch((e) => {
            setParseError(e.message);
          });
      }
    } else {
      setActiveStepIndex(e.requestedStepIndex);
    }
  };

  const onSubmit = () => {
    const stepOutputBuilder = new StepOutputBuilder(stepChart!, {
      music: formMethods.getValues('musicFile'),
      background: formMethods.getValues('backgroundFile'),
    });
    stepOutputBuilder.downloadZip();
  };

  return (
    <FormProvider {...formMethods}>
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
        onSubmit={() => onSubmit()}
        activeStepIndex={activeStepIndex}
        steps={[
          {
            title: 'Saber2Steps',
            description:
              'This app can convert Beat Saber custom maps to ITG/Stepmania chart files',
            content: (
              <SpaceBetween direction="vertical" size="l">
                <BeatSaberInputForm />
                {parseError && (
                  <Alert
                    header="Error parsing Beat Saber files. Please check file format"
                    type="error"
                  >
                    {parseError}
                  </Alert>
                )}
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
    </FormProvider>
  );
}
