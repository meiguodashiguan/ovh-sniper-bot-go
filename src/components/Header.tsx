
import React from 'react';
import { Server, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-ovh text-white py-6 px-6 shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <Server className="h-8 w-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">OVH 服务器抢购助手</h1>
            <p className="text-sm opacity-80">快速配置并抢购 OVH 高性能服务器</p>
          </div>
        </div>
        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
          <Zap className="h-5 w-5 mr-2 text-ovh-teal" />
          <span className="text-sm font-medium">实时抢购，快人一步</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
