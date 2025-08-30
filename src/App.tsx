import { AppLayout } from '@cloudscape-design/components';
import { useEffect } from 'react';
import WizardFlow from './wizard-flow/WizardFlow';

const App = () => {
  useEffect(() => {
    document.body.classList.add('awsui-dark-mode');
  }, []);

  return (
    <AppLayout
      contentType="form"
      content={<WizardFlow />}
      toolsHide
      navigationHide
    />
  );
};

export default App;
