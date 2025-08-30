import {
  Alert,
  SpaceBetween,
  Wizard,
  type WizardProps,
} from '@cloudscape-design/components';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import {
  useMapConfigurationForm,
  useStepConfigForm,
} from '../form/configurationForm';
import { useParseSaber } from '../parser/SaberParser';
import { StepOutputBuilder } from '../parser/StepOutputBuilder';
import { stepChartAtom } from './state/wizardState';
import BeatSaberInputForm from './steps/Step1-LoadMap/LoadMapStep';
import StepConfiguration from './steps/Step2-ConfigureSteps/ConfigureStepsStep';
import StepCharts from './steps/Step3-GenerateOutput/GenerateOutputStep';

export default function WizardFlow() {
  const [stepChart, setStepChart] = useAtom(stepChartAtom);

  const formMethods = useMapConfigurationForm();
  const stepFormMethods = useStepConfigForm();
  const parse = useParseSaber();
  const [parseError, setParseError] = useState<string>();

  const [activeStepIndex, setActiveStepIndex] = React.useState(0);

  const onNavigate = async (e: WizardProps.NavigateDetail) => {
    setParseError(undefined);
    if (e.requestedStepIndex === 1) {
      const isValid = await formMethods.trigger();
      if (isValid) {
        setActiveStepIndex(e.requestedStepIndex);
      }
    } else if (e.requestedStepIndex === 2) {
      const isValid = await stepFormMethods.trigger();
      if (isValid) {
        parse(formMethods.getValues(), stepFormMethods.getValues())
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
            title: 'Step configuration',
            description:
              'Use this section to configure the Stepmania output options, such as jumps and crossovers',
            isOptional: true,
            content: (
              <FormProvider {...stepFormMethods}>
                <StepConfiguration />
              </FormProvider>
            ),
          },
          {
            title: 'Step output',
            content: <StepCharts />,
          },
        ]}
      />
    </FormProvider>
  );
}
