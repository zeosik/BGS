import React from 'react';
import './App.css';
import { MyComp } from 'components';

const App: React.FC = () => {
  return (
    <MyComp text2="Hello" text="World" />
  );
}

export default App;
