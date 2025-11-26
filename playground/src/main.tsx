import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 初始化i18n
import './i18n.ts';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
