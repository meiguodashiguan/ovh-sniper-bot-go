
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskStatus, LogMessage } from '@/types';
import { StopCircle, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  taskStatus: TaskStatus;
  onStopTask: () => void;
  onRestartTask: () => void;
}

const LogItem: React.FC<{ log: LogMessage }> = ({ log }) => {
  const iconMap = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    error: <XCircle className="h-4 w-4 text-red-500" />,
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />
  };
  
  const bgColorMap = {
    info: 'bg-blue-50',
    error: 'bg-red-50',
    success: 'bg-green-50',
    warning: 'bg-amber-50'
  };
  
  return (
    <div className={cn('p-3 rounded-md mb-2 flex items-start gap-2', bgColorMap[log.level])}>
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
      bg: 'bg-gray-100',
      text: '准备就绪',
      icon: <RefreshCw className="h-5 w-5 text-gray-500 mr-2" />
    },
    running: {
      bg: 'bg-blue-100',
      text: '任务执行中',
      icon: <RefreshCw className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
    },
    completed: {
      bg: 'bg-green-100',
      text: '任务完成',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
    },
    failed: {
      bg: 'bg-red-100',
      text: '任务失败',
      icon: <XCircle className="h-5 w-5 text-red-500 mr-2" />
    }
  };
  
  const currentStatus = statusStyles[taskStatus.status];
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">抢购任务状态</CardTitle>
          <div className={cn('flex items-center px-3 py-1 rounded-full text-sm font-medium', currentStatus.bg)}>
            {currentStatus.icon}
            {currentStatus.text}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {taskStatus.orderId && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-1">订单创建成功！</h3>
              <p className="text-sm text-green-700">
                订单 ID: <span className="font-medium">{taskStatus.orderId}</span>
              </p>
              {taskStatus.orderUrl && (
                <a 
                  href={taskStatus.orderUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-green-700 underline"
                >
                  查看订单详情
                </a>
              )}
            </div>
          )}
          
          <div>
            <h3 className="font-medium mb-2">任务日志记录</h3>
            <ScrollArea className="h-[300px] border rounded-md p-2">
              {taskStatus.logs.map((log) => (
                <LogItem key={log.id} log={log} />
              ))}
              {taskStatus.logs.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  暂无日志记录
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {taskStatus.status === 'running' ? (
          <Button 
            variant="destructive" 
            onClick={onStopTask}
            className="w-full flex items-center gap-2"
          >
            <StopCircle className="h-5 w-5" /> 停止任务
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-ovh hover:opacity-90 transition-opacity flex items-center gap-2"
            onClick={onRestartTask}
          >
            <RefreshCw className="h-5 w-5" /> 重新开始任务
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
