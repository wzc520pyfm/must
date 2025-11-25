import React from 'react';
import { Button } from './components/Button';
import { Header } from './components/Header';

const App: React.FC = () => {
  const handleClick = () => {
    alert('Button clicked!');
  };

  return (
    <div className="app">
      <Header title="Welcome to our application" />
      <main>
        <h1>Hello World</h1>
        <p>This is a sample application for testing the auto i18n tool.</p>
        <Button onClick={handleClick}>
          Click me
        </Button>
        <div className="info">
          <p>Please select your preferred language:</p>
          <select>
            <option value="en">English</option>
            <option value="zh-CN">中文</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </main>
    </div>
  );
};

export default App;

