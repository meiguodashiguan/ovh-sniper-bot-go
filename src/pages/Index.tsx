
import React, { useState, useEffect } from 'react';
import { OvhConfig, TaskConfig, TelegramConfig, TaskStatus, LogMessage, AvailabilityItem } from '@/types';
import ConfigForm from '@/components/ConfigForm';
import TaskCard from '@/components/TaskCard';
import StatusDisplay from '@/components/StatusDisplay';
import Header from '@/components/Header';
import { OvhService } from '@/services/ovhService';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
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

  // 添加日志
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
    
    // 如果是错误，显示 toast
    if (level === 'error') {
      toast({
        variant: "destructive",
        title: "操作失败",
        description: message,
      });
    }
    
    // 如果是成功，显示 toast
    if (level === 'success') {
      toast({
        title: "成功",
        description: message,
      });
    }
  };

  // 更新可用性列表
  const updateAvailabilities = (availabilityItems: AvailabilityItem[]) => {
    setAvailabilities(availabilityItems);
  };

  // 处理表单提交
  const handleSubmit = (
    ovhConfig: OvhConfig,
    taskConfig: TaskConfig,
    telegramConfig: TelegramConfig | null
  ) => {
    // 保存配置
    setOvhConfig(ovhConfig);
    setTaskConfig(taskConfig);
    setTelegramConfig(telegramConfig);
    setIsConfigured(true);
    
    // 重置状态
    setTaskStatus({
      id: uuidv4(),
      status: 'idle',
      logs: []
    });
    setAvailabilities([]);
    
    // 创建 OvhService 实例
    const service = new OvhService(
      ovhConfig,
      taskConfig,
      telegramConfig,
      addLog
    );
    setOvhService(service);
    
    // 自动开始任务
    startTask(service);
  };

  // 开始任务
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
      
      // 执行任务
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

  // 停止任务
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

  // 重新开始任务
  const restartTask = () => {
    if (ovhService) {
      startTask();
    }
  };

  // 从 localStorage 恢复配置
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
          
          // 创建 OvhService 实例但不自动开始任务
          const service = new OvhService(
            config.ovhConfig,
            config.taskConfig,
            config.telegramConfig || null,
            addLog
          );
          setOvhService(service);
          
          addLog('info', '已从本地存储恢复配置');
        }
      } catch (e) {
        console.error('恢复配置失败:', e);
      }
    }
  }, []);

  // 保存配置到 localStorage
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

  // 处理订单 ID 和 URL
  useEffect(() => {
    const logs = taskStatus.logs;
    if (logs.length === 0) return;
    
    // 查找订单创建成功的日志
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto py-8 px-4">
        {!isConfigured ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-center mb-6">配置 OVH 服务器抢购</h2>
              <ConfigForm onSubmit={handleSubmit} />
            </div>
            
            <div className="text-center text-gray-600 mt-8">
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
                  <TabsList>
                    <TabsTrigger value="status">任务状态</TabsTrigger>
                    <TabsTrigger value="availability">服务器可用性</TabsTrigger>
                  </TabsList>
                  
                  <button 
                    onClick={() => setIsConfigured(false)}
                    className="text-sm text-ovh-blue hover:underline"
                  >
                    修改配置
                  </button>
                </div>
                
                <TabsContent value="status">
                  <TaskCard 
                    taskStatus={taskStatus}
                    onStopTask={stopTask}
                    onRestartTask={restartTask}
                  />
                </TabsContent>
                
                <TabsContent value="availability">
                  <StatusDisplay 
                    availabilities={availabilities}
                    isLoading={isRunning}
                    planCode={taskConfig?.planCode || ''}
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">当前配置信息</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">API 端点</h4>
                    <p className="font-medium">{ovhConfig?.endpoint || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">标识 (IAM)</h4>
                    <p className="font-medium">{taskConfig?.iam || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">区域</h4>
                    <p className="font-medium">{taskConfig?.zone || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">计划代码</h4>
                    <p className="font-medium">{taskConfig?.planCode || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">Telegram 通知</h4>
                    <p className="font-medium">{telegramConfig?.enabled ? '已启用' : '已禁用'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm text-gray-500 mb-1">选项数量</h4>
                    <p className="font-medium">{taskConfig?.options?.length || 0} 个</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gradient-ovh text-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold mb-2">快速提示</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 任务将自动检查服务器可用性</li>
                  <li>• 找到可用服务器后会立即尝试下单</li>
                  <li>• 购买成功后会显示订单信息</li>
                  <li>• 如启用，还会通过 Telegram 接收通知</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white shadow-inner py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>OVH 服务器抢购助手 &copy; {new Date().getFullYear()}</p>
          <p className="mt-2">本工具仅用于辅助购买 OVH 服务器，与 OVH 官方无关</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
