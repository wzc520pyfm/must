import React, { useState } from "react";
import "./UserProfile.css";
import { UUName, UUName2 } from "../constants";
interface UserProfileProps {
  initialName?: string;
}

function UserProfile({ initialName }: UserProfileProps) {
  const [name, setName] = useState(initialName || "访客");
  const [age, setAge] = useState(25);
  const [points, setPoints] = useState(1000);

  const level = Math.floor(points / 100);

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
  };

  const upgradeLevel = () => {
    if (points >= 100) {
      setPoints((prev) => prev - 100);
    }
  };

  return (
    <div className="user-profile">
      <h2>用户信息</h2>

      <div className="profile-card">
        <div className="profile-header">
          <h3>欢迎回来，{name}！{UUName} {UUName2}</h3>
          <p>当前等级：{level} 级</p>
        </div>

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-label">用户名</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入用户名"
            />
          </div>

          <div className="stat-item">
            <span className="stat-label">年龄</span>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              placeholder={String(age)}
            />
          </div>

          <div className="stat-item">
            <span className="stat-label">积分</span>
            <span className="stat-value">{points}</span>
          </div>
        </div>

        <div className="profile-info">
          <p>
            {name} 今年 {age} 岁，拥有 {points} 积分
          </p>
          <p>{`距离下一等级还需要 ${100 - (points % 100)} 积分`}</p>
          {points >= 1000 && <p className="vip-badge">尊贵的VIP会员</p>}
        </div>

        <div className="profile-actions">
          <button onClick={() => addPoints(50)}>获取 50 积分</button>
          <button onClick={upgradeLevel} disabled={points < 100}>
            升级（消耗 100 积分）
          </button>
        </div>

        <div className="profile-messages">
          <p>系统消息：您有 3 条未读消息</p>
          <p>最近登录：今天 10:30</p>
          <p>账户状态：正常</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
