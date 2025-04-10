
import React from 'react';
import { Server, Zap, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Header: React.FC = () => {
  return (
    <header className="tech-header bg-gradient-to-r from-gray-900 to-slate-800 text-white py-8 px-6 shadow-lg relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-full h-full">
          <div className="absolute -right-10 top-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute right-1/2 bottom-1/4 w-56 h-56 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute left-1/4 top-1/3 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Tech grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzFoMXY5aC0xeiIgZmlsbC1vcGFjaXR5PSIuMyIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOSAzMGgydjJoLTJ6TTI5IDI4aDJ2MmgtMnoiIGZpbGwtb3BhY2l0eT0iLjMiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMzIgMzBoMnY3aC0yeiIgZmlsbC1vcGFjaXR5PSIuMyIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0zMCAyN2gydjJoLTJ6IiBmaWxsLW9wYWNpdHk9Ii4zIiBmaWxsPSIjRkZGIi8+PHBhdGggZD0iTTMxIDI2aDJ2MmgtMnoiIGZpbGwtb3BhY2l0eT0iLjMiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMzIgMjRoMnYyaC0yeiIgZmlsbC1vcGFjaXR5PSIuMyIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yNSAyNGgydjZoLTJ6IiBmaWxsLW9wYWNpdHk9Ii4zIiBmaWxsPSIjRkZGIi8+PHBhdGggZD0iTTI3IDI0aDJ2N2gtMnoiIGZpbGwtb3BhY2l0eT0iLjMiIGZpbGw9IiNGRkYiLz48L2c+PC9zdmc+')] opacity-5"></div>
      </div>
      
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10 relative">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-4 bg-gradient-to-br from-blue-600/30 to-purple-600/30 p-3 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner shadow-white/5">
            <Cpu className="h-8 w-8 text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gradient">
              OVH 服务器抢购助手
              <Badge variant="outline" className="bg-white/5 border-white/20 text-xs font-normal backdrop-blur-sm">
                v1.0
              </Badge>
            </h1>
            <p className="text-sm opacity-80 mt-1 max-w-md">基于高性能算法，快速检测与抢购 OVH 服务器</p>
          </div>
        </div>
        
        <div className="flex items-center glass-card rounded-full px-5 py-2 bg-white/5 border border-white/10 shadow-lg">
          <span className="relative flex h-3 w-3 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <Zap className="h-4 w-4 mr-2 text-cyan-300" />
          <span className="text-sm font-medium">实时监控中</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
