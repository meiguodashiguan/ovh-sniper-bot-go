import React, { useState, useEffect } from 'react';
import { OvhConfig, TaskConfig, TelegramConfig, TaskStatus, LogMessage, AvailabilityItem } from '@/types';
import ConfigForm from '@/components/ConfigForm';
import TaskCard from '@/components/TaskCard';
import StatusDisplay from '@/components/StatusDisplay';
import Header from '@/components/Header';
import { OvhService } from '@/services/ovhService';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { MoonStar, Sun, SunMoon, Server, Settings, Bot, Clock, Terminal, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Fingerprint, Globe, CheckCircle, Layers } from '@/components/icons';

const Index = () => {
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ovhConfig, setOvhConfig] = useState<OvhConfig | null>(null);
  const [taskConfig, setTaskConfig] = useState<TaskConfig | null>(null);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig | null>(null);
  const [ovhService, setOvhService] = useState<OvhService | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>({
    id: uuidv4(),
    status: 'idle',
    logs: []
  });
  const [availabilities, setAvailabilities] = useState<AvailabilityItem[]>([]);

  const addLog = (level: 'info' | 'error' | 'success' | 'warning', message: string) => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newLog: LogMessage = {
      id: uuidv4(),
      time: timeString,
      level,
      message
    };
    
    setTaskStatus(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
    
    if (level === 'error') {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: message,
      });
    }
    
    if (level === 'success') {
      toast({
        title: "成功",
        description: message,
      });
    }
  };

  const updateAvailabilities = (availabilityItems: AvailabilityItem[]) => {
    setAvailabilities(availabilityItems);
    setTaskStatus(prev => ({
      ...prev,
      availabilities: availabilityItems
    }));
  };

  const handleSubmit = (
    ovhConfig: OvhConfig,
    taskConfig: TaskConfig,
    telegramConfig: TelegramConfig | null
  ) => {
    setOvhConfig(ovhConfig);
    setTaskConfig(taskConfig);
    setTelegramConfig(telegramConfig);
    setIsConfigured(true);
    
    setTaskStatus({
      id: uuidv4(),
      status: 'idle',
      logs: []
    });
    setAvailabilities([]);
    
    const service = new OvhService(
      ovhConfig,
      taskConfig,
      telegramConfig,
      addLog,
      updateAvailabilities
    );
    setOvhService(service);
    
    startTask(service);
  };

  const startTask = async (service?: OvhService) => {
    const activeService = service || ovhService;
    if (!activeService) return;
    
    setIsRunning(true);
    setTaskStatus(prev => ({
      ...prev,
      status: 'running',
      orderId: undefined,
      orderUrl: undefined
    }));
    
    try {
      addLog('info', '开始执行抢购任务...');
      
      const success = await activeService.executeTask();
      
      if (success) {
        setTaskStatus(prev => ({
          ...prev,
          status: 'completed'
        }));
        addLog('success', '任务成功完成！');
      } else {
        setTaskStatus(prev => ({
          ...prev,
          status: 'failed'
        }));
        addLog('warning', '任务未能成功完成');
      }
    } catch (error) {
      setTaskStatus(prev => ({
        ...prev,
        status: 'failed'
      }));
      addLog('error', `执行任务时出错: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopTask = () => {
    if (ovhService) {
      ovhService.stopTask();
      setIsRunning(false);
      setTaskStatus(prev => ({
        ...prev,
        status: 'idle'
      }));
      addLog('info', '任务已手动停止');
    }
  };

  const restartTask = () => {
    if (ovhService) {
      startTask();
    }
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem('ovhSniperConfig');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.ovhConfig && config.taskConfig) {
          setOvhConfig(config.ovhConfig);
          setTaskConfig(config.taskConfig);
          setTelegramConfig(config.telegramConfig || null);
          setIsConfigured(true);
          
          const service = new OvhService(
            config.ovhConfig,
            config.taskConfig,
            config.telegramConfig || null,
            addLog,
            updateAvailabilities
          );
          setOvhService(service);
          
          addLog('info', '已从本地存储恢复配置');
        }
      } catch (e) {
        console.error('恢复配置失败:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isConfigured && ovhConfig && taskConfig) {
      const configToSave = {
        ovhConfig,
        taskConfig,
        telegramConfig
      };
      localStorage.setItem('ovhSniperConfig', JSON.stringify(configToSave));
    }
  }, [isConfigured, ovhConfig, taskConfig, telegramConfig]);

  useEffect(() => {
    const logs = taskStatus.logs;
    if (logs.length === 0) return;
    
    const orderIdLog = logs.find(log => 
      log.level === 'success' && log.message.includes('订单创建成功！订单ID:')
    );
    
    const orderUrlLog = logs.find(log =>
      log.level === 'info' && log.message.includes('订单链接:')
    );
    
    if (orderIdLog) {
      const orderId = orderIdLog.message.split('订单ID:')[1]?.trim();
      if (orderId) {
        setTaskStatus(prev => ({
          ...prev,
          orderId
        }));
      }
    }
    
    if (orderUrlLog) {
      const orderUrl = orderUrlLog.message.split('订单链接:')[1]?.trim();
      if (orderUrl) {
        setTaskStatus(prev => ({
          ...prev,
          orderUrl
        }));
      }
    }
  }, [taskStatus.logs]);

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const ThemeIcon = () => {
    if (theme === 'dark') return <MoonStar className="h-[1.2rem] w-[1.2rem]" />;
    if (theme === 'light') return <Sun className="h-[1.2rem] w-[1.2rem]" />;
    return <SunMoon className="h-[1.2rem] w-[1.2rem]" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      
      <main className="container mx-auto py-8 px-4 relative">
        <div className="absolute top-4 right-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full bg-background/80 backdrop-blur-sm border-primary/10" 
            onClick={cycleTheme}
            title="切换主题"
          >
            <ThemeIcon />
          </Button>
        </div>
        
        {!isConfigured ? (
          <div className="max-w-4xl mx-auto">
            <Card className="hover-card-effect border-primary/10">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
                  <Server className="h-7 w-7 text-primary" />
                  配置 OVH 服务器抢购
                </h2>
                <ConfigForm onSubmit={handleSubmit} />
              </CardContent>
            </Card>
            
            <div className="text-center text-muted-foreground mt-8">
              <p>
                本工具用于自动检查和抢购 OVH 服务器。填写必要信息后开始抢购任务。
              </p>
              <p className="mt-2">
                API Key 仅在本地存储，不会发送至任何第三方服务器。
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="status" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="tech-border p-1 bg-muted/30">
                    <TabsTrigger value="status" className="data-[state=active]:bg-white dark:data-[state=active]:bg-card flex items-center gap-2 text-base">
                      <Terminal className="h-4 w-4" /> 任务状态
                    </TabsTrigger>
                    <TabsTrigger value="availability" className="data-[state=active]:bg-white dark:data-[state=active]:bg-card flex items-center gap-2 text-base">
                      <Server className="h-4 w-4" /> 服务器可用性
                    </TabsTrigger>
                  </TabsList>
                  
                  <Button 
                    onClick={() => setIsConfigured(false)}
                    variant="outline"
                    size="sm"
                    className="text-sm border-primary/20 hover:bg-primary/5"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    修改配置
                  </Button>
                </div>
                
                <TabsContent value="status" className="mt-2">
                  <TaskCard 
                    taskStatus={taskStatus}
                    onStopTask={stopTask}
                    onRestartTask={restartTask}
                  />
                </TabsContent>
                
                <TabsContent value="availability" className="mt-2">
                  <StatusDisplay 
                    availabilities={availabilities}
                    isLoading={isRunning}
                    planCode={taskConfig?.planCode || ''}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <Card className="hover-card-effect border-primary/10">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    当前配置信息
                  </h3>
                  <Separator className="my-4 bg-primary/10" />
                  
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">API 端点</h4>
                        <p className="font-medium">{ovhConfig?.endpoint || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Fingerprint className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">标识 (IAM)</h4>
                        <p className="font-medium">{taskConfig?.iam || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">区域</h4>
                        <p className="font-medium">{taskConfig?.zone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Server className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">计划代码</h4>
                        <p className="font-medium font-mono">{taskConfig?.planCode || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Bot className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">Telegram 通知</h4>
                        <div>
                          {telegramConfig?.enabled ? (
                            <Badge variant="success" className="font-normal">已启用</Badge>
                          ) : (
                            <Badge variant="outline" className="font-normal">已禁用</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Layers className="h-5 w-5 text-primary/60 mr-3 mt-0.5" />
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-1">选项数量</h4>
                        <p className="font-medium">
                          {taskConfig?.options?.length || 0} 个
                          {taskConfig?.options && taskConfig.options.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({taskConfig.options.join(', ')})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="tech-border bg-tech-gradient text-white overflow-hidden">
                <CardContent className="p-6 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-x-10 -translate-y-10"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-x-5 translate-y-5"></div>
                  
                  <h3 className="text-lg font-bold mb-4 relative z-10">快速提示</h3>
                  <ul className="space-y-3 text-sm relative z-10">
                    <li className="flex items-start">
                      <span className="inline-block bg-white/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                      <span>任务将自动检查服务器可用性</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-white/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Zap className="h-3.5 w-3.5" />
                      </span>
                      <span>找到可用服务器后会立即尝试下单</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-white/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </span>
                      <span>购买成功后会显示订单信息</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block bg-white/10 p-1.5 rounded-full mr-3 mt-0.5">
                        <Bot className="h-3.5 w-3.5" />
                      </span>
                      <span>如启用，还会通过 Telegram 接收通知</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <footer className="border-t border-muted/20 py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>OVH 服务器抢购助手 &copy; {new Date().getFullYear()}</p>
          <p className="mt-2">本工具仅用于辅助购买 OVH 服务器，与 OVH 官方无关</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
