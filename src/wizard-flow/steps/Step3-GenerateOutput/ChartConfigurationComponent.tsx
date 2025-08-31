import {
  Button,
  Container,
  Form,
  Header,
  SpaceBetween,
} from '@cloudscape-design/components';
import {
  type ChartConfigurationFormState,
  useChartConfigurationForm,
} from '../../../form/chartConfigurationForm';
import SharedStepFields from '../Shared/SharedStepFields';

interface ChartConfigurationComponentProps {
  defaultValues?: Partial<ChartConfigurationFormState>;
  onSave: (data: ChartConfigurationFormState) => void;
  onCancel: () => void;
  isExpanded: boolean;
}

export default function ChartConfigurationComponent({
  defaultValues,
  onSave,
  onCancel,
  isExpanded,
}: ChartConfigurationComponentProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useChartConfigurationForm(defaultValues);

  const onSubmit = (data: ChartConfigurationFormState) => {
    onSave(data);
  };

  if (!isExpanded) {
    return null;
  }

  return (
    <Container header={<Header variant="h3">Chart Configuration</Header>}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="primary" onClick={() => handleSubmit(onSubmit)()}>
              Apply Configuration
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <SharedStepFields control={control} errors={errors} />
        </SpaceBetween>
      </Form>
    </Container>
  );
}
