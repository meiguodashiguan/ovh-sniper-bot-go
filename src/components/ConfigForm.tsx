
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { OvhConfig, TaskConfig, TelegramConfig } from "@/types";
import { Settings, Key, Bot, SendHorizontal } from 'lucide-react';

interface ConfigFormProps {
  onSubmit: (
    ovhConfig: OvhConfig, 
    taskConfig: TaskConfig, 
    telegramConfig: TelegramConfig | null
  ) => void;
}

const ENDPOINTS = [
  { label: '欧洲 (ovh-eu)', value: 'eu.api.ovh.com' },
  { label: '北美 (ovh-ca)', value: 'ca.api.ovh.com' },
  { label: '美国 (ovh-us)', value: 'api.us.ovhcloud.com' },
];

const ZONES = [
  { label: '法国 (FR)', value: 'FR' },
  { label: '英国 (GB)', value: 'GB' },
  { label: '德国 (DE)', value: 'DE' },
  { label: '西班牙 (ES)', value: 'ES' },
  { label: '葡萄牙 (PT)', value: 'PT' },
  { label: '意大利 (IT)', value: 'IT' },
  { label: '波兰 (PL)', value: 'PL' },
  { label: '爱尔兰 (IE)', value: 'IE' },
  { label: '芬兰 (FI)', value: 'FI' },
  { label: '立陶宛 (LT)', value: 'LT' },
  { label: '捷克 (CZ)', value: 'CZ' },
  { label: '荷兰 (NL)', value: 'NL' },
  { label: '加拿大 (CA)', value: 'CA' },
];

const ConfigForm: React.FC<ConfigFormProps> = ({ onSubmit }) => {
  const [ovhConfig, setOvhConfig] = useState<OvhConfig>({
    appKey: '',
    appSecret: '',
    consumerKey: '',
    endpoint: 'eu.api.ovh.com',
  });

  const [taskConfig, setTaskConfig] = useState<TaskConfig>({
    iam: '',
    zone: 'IE',
    planCode: '',
    os: 'none_64.en',
    duration: 'P1M',
    options: [],
  });

  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    token: '',
    chatId: '',
    enabled: false,
  });

  const [optionsText, setOptionsText] = useState<string>('');

  const handleOvhChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOvhConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTelegramConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOptionsText(e.target.value);
  };

  const handleTelegramToggle = () => {
    setTelegramConfig((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 处理选项
    const options = optionsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    
    const finalTaskConfig = {
      ...taskConfig,
      options,
    };
    
    onSubmit(
      ovhConfig, 
      finalTaskConfig, 
      telegramConfig.enabled ? telegramConfig : null
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" /> API 配置
          </TabsTrigger>
          <TabsTrigger value="task" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> 任务配置
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <SendHorizontal className="h-4 w-4" /> Telegram
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OVH API 配置</CardTitle>
              <CardDescription>
                配置 OVH API 密钥以访问服务器抢购功能
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appKey">应用密钥 (Application Key)</Label>
                  <Input
                    id="appKey"
                    name="appKey"
                    placeholder="输入您的 OVH 应用密钥"
                    value={ovhConfig.appKey}
                    onChange={handleOvhChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appSecret">应用密钥 (Application Secret)</Label>
                  <Input
                    id="appSecret"
                    name="appSecret"
                    type="password"
                    placeholder="输入您的 OVH 应用密钥"
                    value={ovhConfig.appSecret}
                    onChange={handleOvhChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consumerKey">消费者密钥 (Consumer Key)</Label>
                  <Input
                    id="consumerKey"
                    name="consumerKey"
                    type="password"
                    placeholder="输入您的 OVH 消费者密钥"
                    value={ovhConfig.consumerKey}
                    onChange={handleOvhChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">API 端点</Label>
                  <select
                    id="endpoint"
                    name="endpoint"
                    value={ovhConfig.endpoint}
                    onChange={handleOvhChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ovh-blue focus:border-transparent"
                    required
                  >
                    {ENDPOINTS.map((endpoint) => (
                      <option key={endpoint.value} value={endpoint.value}>
                        {endpoint.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                <p>
                  您可以在 
                  <a 
                    href="https://www.ovh.com/auth/api/createToken" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium mx-1"
                  >
                    OVH API 页面
                  </a> 
                  创建所需的 API 密钥
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="task" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>抢购任务配置</CardTitle>
              <CardDescription>
                配置您要抢购的服务器详细信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iam">标识 (IAM)</Label>
                  <Input
                    id="iam"
                    name="iam"
                    placeholder="例如：go-ovh-fr, go-ovh-ie, go-ovh-ca"
                    value={taskConfig.iam}
                    onChange={handleTaskChange}
                    required
                  />
                  <p className="text-sm text-gray-500">您的自定义标识，用于区分不同的抢购任务</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">OVH 子公司区域</Label>
                  <select
                    id="zone"
                    name="zone"
                    value={taskConfig.zone}
                    onChange={handleTaskChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ovh-blue focus:border-transparent"
                    required
                  >
                    {ZONES.map((zone) => (
                      <option key={zone.value} value={zone.value}>
                        {zone.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planCode">目标计划代码 (Plan Code)</Label>
                <Input
                  id="planCode"
                  name="planCode"
                  placeholder="输入您要抢购的服务器计划代码"
                  value={taskConfig.planCode}
                  onChange={handleTaskChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  您可以在 
                  <a 
                    href="https://eu.api.ovh.com/v1/order/catalog/public/eco?ovhSubsidiary=IE" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium mx-1"
                  >
                    OVH 产品目录
                  </a> 
                  中找到计划代码
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="options">目标附加选项 (可选)</Label>
                <Textarea
                  id="options"
                  placeholder="每行输入一个选项代码，例如：
bandwidth-1000-unguaranteed-25skmystery01
ram-64g-ecc-2133-25skmystery01
softraid-2x480ssd-25skmystery01"
                  value={optionsText}
                  onChange={handleOptionsChange}
                  className="h-24"
                />
                <p className="text-sm text-gray-500">每行一个选项，例如磁盘、内存和带宽信息</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="telegram" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Telegram 通知配置 (可选)</CardTitle>
                  <CardDescription>
                    配置 Telegram 机器人以接收抢购状态通知
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="telegram-enabled"
                    checked={telegramConfig.enabled}
                    onCheckedChange={handleTelegramToggle}
                  />
                  <Label htmlFor="telegram-enabled">
                    {telegramConfig.enabled ? '启用' : '禁用'}
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className={`space-y-4 ${!telegramConfig.enabled && 'opacity-50'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Telegram Bot Token</Label>
                  <Input
                    id="token"
                    name="token"
                    placeholder="输入您的 Telegram Bot Token"
                    value={telegramConfig.token}
                    onChange={handleTelegramChange}
                    disabled={!telegramConfig.enabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatId">Telegram Chat ID</Label>
                  <Input
                    id="chatId"
                    name="chatId"
                    placeholder="输入您希望发送消息的 Chat ID"
                    value={telegramConfig.chatId}
                    onChange={handleTelegramChange}
                    disabled={!telegramConfig.enabled}
                  />
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
                <div className="flex items-start gap-2">
                  <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <p>
                    创建 Telegram Bot 并获取 Token 请访问 
                    <a 
                      href="https://t.me/BotFather" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium mx-1"
                    >
                      BotFather
                    </a>
                    。要获取 Chat ID，请向 
                    <a 
                      href="https://t.me/myidbot" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium mx-1"
                    >
                      @myidbot
                    </a> 
                    发送 /getid 命令。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-4">
        <Button 
          type="submit" 
          size="lg"
          className="bg-gradient-ovh hover:opacity-90 transition-opacity shadow-lg"
        >
          开始抢购任务
        </Button>
      </div>
    </form>
  );
};

export default ConfigForm;
