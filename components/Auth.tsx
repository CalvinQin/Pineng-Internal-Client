
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS, COMPANY_LOGO } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role
      };
      onLogin(newUser);
    } else {
      const foundUser = MOCK_USERS.find(u => u.username === username && u.password === password);
      
      if (foundUser) {
        onLogin(foundUser);
      } else {
        if (username && password) {
             const demoUser: User = { id: username, username, role, password };
             onLogin(demoUser);
        } else {
             setError("用户名或密码错误");
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden z-10 relative">
        <div className="p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <img src={COMPANY_LOGO} alt="Jiangsu Pineng" className="w-24 h-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">江苏品能锂电</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Jiangsu Pineng Electric Tools Co., LTD</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">用户名 (Username)</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors bg-slate-50"
                placeholder="请输入您的账号"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">密码 (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors bg-slate-50"
                placeholder="请输入密码"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">选择身份</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('SALES')}
                  className={`py-3 text-sm font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    role === 'SALES'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                   业务员 / 老板
                </button>
                <button
                  type="button"
                  onClick={() => setRole('PACKER')}
                  className={`py-3 text-sm font-bold rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    role === 'PACKER'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  打包员
                </button>
              </div>
              {role === 'SALES' && (
                 <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <button type="button" onClick={() => setRole('BOSS')} className={`hover:text-blue-600 ${role === 'BOSS' ? 'text-blue-600 font-bold' : ''}`}>
                        我是老板? (Switch to Boss)
                    </button>
                 </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              {isRegister ? '注册并登录' : '安全登录'}
            </button>

            <div className="text-center pt-2">
               <button 
                 type="button"
                 onClick={() => setIsRegister(!isRegister)}
                 className="text-sm text-slate-500 hover:text-slate-800 underline"
               >
                 {isRegister ? '已有账号？直接登录' : '新员工？注册账号'}
               </button>
            </div>
          </form>
        </div>
        <div className="bg-slate-50 p-3 text-center text-[10px] text-slate-400 border-t border-slate-100">
          内部系统 请勿外传 | TradeFlow AI v2.3
        </div>
      </div>
    </div>
  );
};

export default Auth;
