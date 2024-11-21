import { AppLayout } from '@cloudscape-design/components';
import Home from './home/Home';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    document.body.classList.add('awsui-dark-mode');
  }, []);
  
  return (
    <AppLayout contentType="form" content={<Home />} toolsHide navigationHide />
  );
};

export default App;
