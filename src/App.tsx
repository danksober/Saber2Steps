import { AppLayout } from '@cloudscape-design/components';
import { useEffect } from 'react';
import Home from './home/Home';

const App = () => {
  useEffect(() => {
    document.body.classList.add('awsui-dark-mode');
  }, []);

  return (
    <AppLayout contentType="form" content={<Home />} toolsHide navigationHide />
  );
};

export default App;
