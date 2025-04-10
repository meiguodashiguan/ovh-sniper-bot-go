
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityItem } from '@/types';
import { AlertTriangle, CheckCircle2, HelpCircle, Server, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusDisplayProps {
  availabilities: AvailabilityItem[];
  isLoading: boolean;
  planCode: string;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  availabilities,
  isLoading,
  planCode
}) => {
  if (isLoading) {
    return (
      <Card className="shadow-md border dark:border-gray-700">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center py-12">
            <Loader2 className="mb-3 h-10 w-10 mx-auto animate-spin text-blue-500" />
            <p className="text-lg font-medium">正在检查服务器可用性...</p>
            <p className="text-sm text-muted-foreground mt-1">请稍候，这可能需要一点时间</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availabilities.length === 0) {
    return (
      <Card className="shadow-md border dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">暂无可用性数据</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              {planCode 
                ? `还未检查计划代码 ${planCode} 的可用性` 
                : '请先设置计划代码并开始抢购'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasAvailable = availabilities.some(item => 
    item.availability && !['unavailable', 'unknown'].includes(item.availability)
  );

  return (
    <Card className="shadow-md border dark:border-gray-700">
      <CardContent className="p-6">
        <div className="space-y-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-medium">服务器可用性</h3>
            <Badge 
              variant="outline"
              className={cn('px-3 py-1 font-medium flex items-center', 
                hasAvailable ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
              )}
            >
              {hasAvailable 
                ? <CheckCircle2 className="h-4 w-4 mr-2" /> 
                : <AlertTriangle className="h-4 w-4 mr-2" />
              }
              {hasAvailable ? '发现可用服务器' : '暂无可用服务器'}
            </Badge>
          </div>
          
          <div className="grid gap-3">
            {availabilities.map((item, index) => {
              const isAvailable = item.availability === 'available';
              return (
                <div 
                  key={index}
                  className={cn(
                    "border rounded-md p-3 transition-all",
                    isAvailable 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                      : "bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Server className={cn("h-4 w-4 mr-2", isAvailable ? "text-green-500" : "text-gray-500")} />
                      <div className="font-medium">{item.fqn || '未知型号'}</div>
                    </div>
                    <Badge className={cn(
                      "px-2 py-0.5 text-xs font-semibold",
                      isAvailable ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      item.availability === 'unavailable' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    )}>
                      {isAvailable ? '可用' :
                      item.availability === 'unavailable' ? '不可用' : 
                      item.availability || '未知'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full mr-2 
                      bg-gradient-to-r from-blue-400 to-blue-600"></span>
                    数据中心: {item.datacenter || '未知'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDisplay;
