
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskStatus, LogMessage } from '@/types';
import { StopCircle, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TaskCardProps {
  taskStatus: TaskStatus;
  onStopTask: () => void;
  onRestartTask: () => void;
}

const LogItem: React.FC<{ log: LogMessage }> = ({ log }) => {
  const iconMap = {
    info: <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />,
    error: <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
  };
  
  const bgColorMap = {
    info: 'bg-blue-50 dark:bg-blue-900/30',
    error: 'bg-red-50 dark:bg-red-900/30',
    success: 'bg-green-50 dark:bg-green-900/30',
    warning: 'bg-amber-50 dark:bg-amber-900/30'
  };
  
  return (
    <div className={cn('p-3 rounded-md mb-2 flex items-start gap-2 transition-all', bgColorMap[log.level])}>
      {iconMap[log.level]}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium">{log.time}</span>
        </div>
        <p className="text-sm mt-1">{log.message}</p>
      </div>
    </div>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ taskStatus, onStopTask, onRestartTask }) => {
  const statusStyles = {
    idle: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: '准备就绪',
      icon: <Clock className="h-5 w-5 text-gray-500 mr-2" />
    },
    running: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: '任务执行中',
      icon: <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
    },
    completed: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: '任务完成',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
    },
    failed: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: '任务失败',
      icon: <XCircle className="h-5 w-5 text-red-500 mr-2" />
    }
  };
  
  const currentStatus = statusStyles[taskStatus.status];
  
  return (
    <Card className="shadow-card border dark:border-gray-700">
      <CardHeader className="border-b dark:border-gray-700">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">抢购任务状态</CardTitle>
          <Badge 
            variant="outline" 
            className={cn('flex items-center px-3 py-1.5 font-medium transition-colors', 
              currentStatus.bg
            )}
          >
            {currentStatus.icon}
            {currentStatus.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-5">
          {taskStatus.status === 'running' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">正在检查服务器可用性</span>
                <span className="text-sm text-muted-foreground">请稍候...</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}

          {taskStatus.orderId && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-300 mb-1">订单创建成功！</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                订单 ID: <span className="font-medium">{taskStatus.orderId}</span>
              </p>
              {taskStatus.orderUrl && (
                <a 
                  href={taskStatus.orderUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-sm text-green-700 dark:text-green-400 hover:underline"
                >
                  查看订单详情
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              )}
            </div>
          )}
          
          <div>
            <h3 className="font-semibold mb-3">任务日志记录</h3>
            <ScrollArea className="h-[350px] border rounded-md p-3 dark:border-gray-700">
              <div className="pr-3">
                {taskStatus.logs.length > 0 ? (
                  taskStatus.logs.map((log) => (
                    <LogItem key={log.id} log={log} />
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-16 flex flex-col items-center">
                    <Info className="h-10 w-10 mb-2 opacity-30" />
                    <p>暂无日志记录</p>
                    <p className="text-xs mt-1">任务开始后将在此显示日志信息</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-2">
        {taskStatus.status === 'running' ? (
          <Button 
            variant="destructive" 
            onClick={onStopTask}
            className="w-full flex items-center gap-2 py-6"
            size="lg"
          >
            <StopCircle className="h-5 w-5" /> 停止任务
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 transition-opacity flex items-center gap-2 py-6"
            onClick={onRestartTask}
            size="lg"
          >
            <RefreshCw className="h-5 w-5" /> 重新开始任务
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
