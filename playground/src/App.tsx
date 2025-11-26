import React, { useState } from "react";
import "./App.css";
import UserProfile from "./components/UserProfile";
import { useTranslation } from "react-i18next";
function App() {
  const { i18n } = useTranslation();
  const [count, setCount] = useState(0);
  const [language, setLanguage] = useState(t("playground.App.zhcn"));
  const changeLanguage = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="language-switcher">
          <button
            className={language === "zh-CN" ? "active" : ""}
            onClick={() => changeLanguage("zh-CN")}
          >
            中文
          </button>
          <button
            className={language === "en" ? "active" : ""}
            onClick={() => changeLanguage("en")}
          >
            English
          </button>
          <button
            className={language === "ja" ? "active" : ""}
            onClick={() => changeLanguage("ja")}
          >
            日本語
          </button>
        </div>
        <h1>欢迎使用 Must 国际化工具</h1>
        <p>这是一个自动化的国际化解决方案，支持多语言文案提取与翻译。</p>
      </header>

      <main className="main-content">
        <section className="counter-section">
          <h2>计数器示例</h2>
          <p>当前计数：{count}</p>
          <button onClick={() => setCount(count + 1)}>增加计数</button>
          <button onClick={() => setCount(0)}>重置计数</button>
        </section>

        <section className="features-section">
          <h2>核心功能</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>自动提取</h3>
              <p>自动从代码中提取所有文案</p>
            </div>
            <div className="feature-card">
              <h3>智能翻译</h3>
              <p>支持多种翻译服务商，一键翻译多语言</p>
            </div>
            <div className="feature-card">
              <h3>简单易用</h3>
              <p>通过简单的命令行工具快速集成</p>
            </div>
          </div>
        </section>

        <section className="instructions">
          <h2>使用方法</h2>
          <ol>
            <li>
              在项目根目录运行 <code>pnpm must</code> 命令
            </li>
            <li>
              查看生成的 <code>src/i18n</code> 目录
            </li>
            <li>检查提取的文案和翻译结果</li>
          </ol>
        </section>

        <UserProfile initialName="张三" />
      </main>

      <footer className="app-footer">
        <p>基于 React 和 Vite 构建</p>
        <p>由 Must 提供技术支持 - 智能国际化工具</p>
      </footer>
    </div>
  );
}

export default App;
