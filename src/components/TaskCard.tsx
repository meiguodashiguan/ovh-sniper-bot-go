import React from 'react';
import { TaskStatus, LogMessage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, PlayCircle, StopCircle, RefreshCw, Terminal, ClockIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, Info } from '@/components/icons';

interface TaskCardProps {
  taskStatus: TaskStatus;
  onStopTask: () => void;
  onRestartTask: () => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success" className="ml-2">任务完成</Badge>;
    case 'running':
      return <Badge variant="info" className="ml-2 animate-pulse">正在运行</Badge>;
    case 'failed':
      return <Badge variant="destructive" className="ml-2">任务失败</Badge>;
    default:
      return <Badge variant="outline" className="ml-2">空闲</Badge>;
  }
};

const getLogIcon = (level: string) => {
  switch (level) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />;
  }
};

const getLogClass = (level: string) => {
  switch (level) {
    case 'success':
      return 'text-green-500 dark:text-green-400';
    case 'error':
      return 'text-red-500 dark:text-red-400';
    case 'warning':
      return 'text-amber-500 dark:text-amber-400';
    case 'info':
    default:
      return 'text-blue-500 dark:text-blue-400';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ taskStatus, onStopTask, onRestartTask }) => {
  const isRunning = taskStatus.status === 'running';
  const { logs } = taskStatus;

  return (
    <Card className="tech-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center">
            <Terminal className="h-5 w-5 text-primary mr-2" />
            抢购任务状态
            {getStatusBadge(taskStatus.status)}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {taskStatus.orderId && (
          <div className="bg-success/10 border border-success/20 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-700 dark:text-green-400">抢购成功!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  订单ID: <span className="font-mono font-medium">{taskStatus.orderId}</span>
                </p>
                {taskStatus.orderUrl && (
                  <a 
                    href={taskStatus.orderUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
                  >
                    查看订单详情 <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" /> 任务日志
            </h3>
          </div>
          
          <div className="console-box h-[350px]">
            <ScrollArea className="h-full w-full pr-3">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  暂无日志记录
                </div>
              ) : (
                logs.map((log: LogMessage) => (
                  <div key={log.id} className="console-line flex">
                    <span className="text-gray-500 mr-2">[{log.time}]</span>
                    <div className={`flex items-start ${getLogClass(log.level)}`}>
                      {getLogIcon(log.level)}
                      <span>{log.message}</span>
                    </div>
                  </div>
                ))
              )}
              {isRunning && <div className="console-line animate-pulse">系统正在运行中...</div>}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2">
        {isRunning ? (
          <Button 
            onClick={onStopTask} 
            variant="destructive"
            className="w-full"
          >
            <StopCircle className="mr-2 h-4 w-4" /> 停止任务
          </Button>
        ) : (
          <Button 
            onClick={onRestartTask} 
            className="w-full"
          >
            {taskStatus.status === 'idle' ? (
              <>
                <PlayCircle className="mr-2 h-4 w-4" /> 开始任务
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> 重新开始任务
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
