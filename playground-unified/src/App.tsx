import { useState } from 'react';
import { APP_TITLE, WELCOME_MESSAGE, MENU_ITEMS } from './constants';

/**
 * React 组件示例
 * 同样使用统一的国际化配置
 */
function App() {
  const [count, setCount] = useState(0);
  const [username] = useState('张三');

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>{APP_TITLE}</h1>
      <p>{WELCOME_MESSAGE}</p>

      <nav>
        <h3>导航菜单</h3>
        <ul>
          {MENU_ITEMS.map(item => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
      </nav>

      <section>
        <h2>计数器示例</h2>
        <p>当前计数：{count}</p>
        <button onClick={() => setCount(c => c + 1)}>增加计数</button>
        <button onClick={() => setCount(0)}>重置</button>
      </section>

      <section>
        <h2>用户信息</h2>
        <p>欢迎回来，{username}！</p>
        <p>{`您已经点击了 ${count} 次按钮`}</p>
      </section>

      <footer style={{ marginTop: '40px', color: '#666' }}>
        <p>统一模式演示 - 所有文件使用相同的 trans() 函数</p>
      </footer>
    </div>
  );
}

export default App;

