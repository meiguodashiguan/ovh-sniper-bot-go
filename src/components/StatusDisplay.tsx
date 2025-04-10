
import React from 'react';
import { AvailabilityItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchX, Server, AlertCircle, Loader2 } from 'lucide-react';

interface StatusDisplayProps {
  availabilities: AvailabilityItem[];
  isLoading: boolean;
  planCode: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({ availabilities, isLoading, planCode }) => {
  // 如果没有数据且正在加载
  if (availabilities.length === 0 && isLoading) {
    return (
      <Card className="tech-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> 服务器可用状态
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-4" />
          <h3 className="text-lg font-medium mb-2">正在检查服务器可用性</h3>
          <p className="text-muted-foreground text-center max-w-md">
            系统正在检查 <span className="font-mono text-primary">{planCode}</span> 的可用性
          </p>
        </CardContent>
      </Card>
    );
  }

  // 如果没有数据且不在加载
  if (availabilities.length === 0 && !isLoading) {
    return (
      <Card className="tech-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> 服务器可用状态
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <SearchX className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">暂无可用性数据</h3>
          <p className="text-muted-foreground text-center max-w-md">
            开始任务后将显示服务器的可用性状态
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tech-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" /> 服务器可用状态
          {isLoading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availabilities.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm font-medium text-muted-foreground px-2 pb-2">
              <div>数据中心</div>
              <div>可用区域</div>
              <div className="text-right">状态</div>
            </div>
            <div className="space-y-2">
              {availabilities.map((item) => (
                <div 
                  key={`${item.datacenter}-${item.hardware}`} 
                  className={`grid grid-cols-3 gap-3 rounded-lg p-3 transition-colors
                    ${item.availability ? 'bg-green-500/10 hover:bg-green-500/15' : 'bg-muted hover:bg-muted/80'}`}
                >
                  <div className="font-medium flex items-center">
                    {item.availability && 
                      <span className="mr-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                    <span className="font-mono">{item.datacenter}</span>
                  </div>
                  <div className="font-mono text-muted-foreground">{item.hardware}</div>
                  <div className="text-right">
                    {item.availability ? (
                      <Badge variant="success" className="font-normal">可购买</Badge>
                    ) : (
                      <Badge variant="outline" className="font-normal">缺货中</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {isLoading && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                正在实时更新可用性数据...
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">没有找到任何服务器</h3>
            <p className="text-muted-foreground text-center max-w-md">
              目前没有关于 <span className="font-mono text-primary">{planCode}</span> 的可用性数据
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusDisplay;
