
import React from 'react';
import { Server, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  return (
    <header className="tech-header text-white py-6 px-6 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 h-full w-1/2 opacity-20">
        <div className="absolute -right-10 top-1/4 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute right-40 bottom-1/4 w-28 h-28 rounded-full bg-purple-500/20 blur-2xl"></div>
      </div>
      
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10 relative">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-4 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <Server className="h-7 w-7 text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              OVH 服务器抢购助手
              <Badge variant="outline" className="bg-accent/10 border-accent/20 text-xs font-normal">
                v1.0
              </Badge>
            </h1>
            <p className="text-sm opacity-80">基于高性能算法，快速检测与抢购 OVH 服务器</p>
          </div>
        </div>
        
        <div className="flex items-center glass-morphism rounded-full px-4 py-2">
          <span className="status-indicator active mr-2"></span>
          <Zap className="h-4 w-4 mr-2 text-blue-300" />
          <span className="text-sm font-medium">实时监控中</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
