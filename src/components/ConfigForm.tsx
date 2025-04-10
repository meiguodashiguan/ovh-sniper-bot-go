import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { OvhConfig, TaskConfig, TelegramConfig } from "@/types";
import { Settings, Key, Bot, SendHorizontal, Code, Shield, Server, Cpu, Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Fingerprint, Lightbulb, MapPin, MessageSquare, Info, Layers } from '@/components/icons';

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

  const handleOvhChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOvhConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleEndpointChange = (value: string) => {
    setOvhConfig(prev => ({ ...prev, endpoint: value }));
  };

  const handleZoneChange = (value: string) => {
    setTaskConfig(prev => ({ ...prev, zone: value }));
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <TabsList className="grid grid-cols-3 mb-6 tech-border p-1 bg-muted/30">
          <TabsTrigger value="api" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <Shield className="h-4 w-4" /> API 配置
          </TabsTrigger>
          <TabsTrigger value="task" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <Server className="h-4 w-4" /> 任务配置
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card">
            <SendHorizontal className="h-4 w-4" /> Telegram
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="space-y-4">
          <Card className="hover-card-effect border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" /> OVH API 配置
                  </CardTitle>
                  <CardDescription>
                    配置 OVH API 密钥以访问服务器抢购功能
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                  必填
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appKey" className="flex items-center gap-1">
                    <Code className="h-3.5 w-3.5" /> 应用密钥 (Application Key)
                  </Label>
                  <Input
                    id="appKey"
                    name="appKey"
                    placeholder="输入您的 OVH 应用密钥"
                    value={ovhConfig.appKey}
                    onChange={handleOvhChange}
                    required
                    className="tech-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appSecret" className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> 应用密钥 (Application Secret)
                  </Label>
                  <Input
                    id="appSecret"
                    name="appSecret"
                    type="password"
                    placeholder="输入您的 OVH 应用密钥"
                    value={ovhConfig.appSecret}
                    onChange={handleOvhChange}
                    required
                    className="tech-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="consumerKey" className="flex items-center gap-1">
                    <Key className="h-3.5 w-3.5" /> 消费者密钥 (Consumer Key)
                  </Label>
                  <Input
                    id="consumerKey"
                    name="consumerKey"
                    type="password"
                    placeholder="输入您的 OVH 消费者密钥"
                    value={ovhConfig.consumerKey}
                    onChange={handleOvhChange}
                    required
                    className="tech-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint" className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> API 端点
                  </Label>
                  <Select
                    value={ovhConfig.endpoint}
                    onValueChange={handleEndpointChange}
                  >
                    <SelectTrigger className="tech-border">
                      <SelectValue placeholder="选择 API 端点" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENDPOINTS.map((endpoint) => (
                        <SelectItem key={endpoint.value} value={endpoint.value}>
                          {endpoint.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="bg-info text-card-foreground/80 rounded-lg tech-border p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary mb-1">如何获取 API 密钥？</p>
                    <p>
                      您可以在 
                      <a 
                        href="https://www.ovh.com/auth/api/createToken" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium mx-1"
                      >
                        OVH API 页面
                      </a> 
                      创建所需的 API 密钥
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="task" className="space-y-4">
          <Card className="hover-card-effect border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" /> 抢购任务配置
                  </CardTitle>
                  <CardDescription>
                    配置您要抢购的服务器详细信息
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                  必填
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="iam" className="flex items-center gap-1">
                    <Fingerprint className="h-3.5 w-3.5" /> 标识 (IAM)
                  </Label>
                  <Input
                    id="iam"
                    name="iam"
                    placeholder="例如：go-ovh-fr, go-ovh-ie, go-ovh-ca"
                    value={taskConfig.iam}
                    onChange={handleTaskChange}
                    required
                    className="tech-border"
                  />
                  <p className="text-sm text-muted-foreground mt-1">您的自定义标识，用于区分不同的抢购任务</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone" className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> OVH 子公司区域
                  </Label>
                  <Select
                    value={taskConfig.zone}
                    onValueChange={handleZoneChange}
                  >
                    <SelectTrigger className="tech-border">
                      <SelectValue placeholder="选择区域" />
                    </SelectTrigger>
                    <SelectContent>
                      {ZONES.map((zone) => (
                        <SelectItem key={zone.value} value={zone.value}>
                          {zone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="planCode" className="flex items-center gap-1">
                  <Server className="h-3.5 w-3.5" /> 目标计划代码 (Plan Code)
                </Label>
                <Input
                  id="planCode"
                  name="planCode"
                  placeholder="输入您要抢购的服务器计划代码"
                  value={taskConfig.planCode}
                  onChange={handleTaskChange}
                  required
                  className="tech-border"
                />
                <div className="flex items-start gap-2 mt-1">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    您可以在 
                    <a 
                      href="https://eu.api.ovh.com/v1/order/catalog/public/eco?ovhSubsidiary=IE" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium mx-1"
                    >
                      OVH 产品目录
                    </a> 
                    中找到计划代码
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="options" className="flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5" /> 目标附加选项 (可选)
                </Label>
                <Textarea
                  id="options"
                  placeholder="每行输入一个选项代码，例如：
bandwidth-1000-unguaranteed-25skmystery01
ram-64g-ecc-2133-25skmystery01
softraid-2x480ssd-25skmystery01"
                  value={optionsText}
                  onChange={handleOptionsChange}
                  className="h-24 font-mono text-sm tech-border"
                />
                <p className="text-sm text-muted-foreground mt-1">每行一个选项，例如��盘、内存和带宽信息</p>
              </div>
              
              <div className="bg-info text-card-foreground/80 rounded-lg tech-border p-4 text-sm">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-primary mb-1">提示</p>
                    <p>
                      抢购系统将以最高速度轮询服务器可用性，并在发现有库存时立即尝试下单。计划代码决定了您要抢购的服务器型号。
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="telegram" className="space-y-4">
          <Card className="hover-card-effect border-primary/10">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" /> Telegram 通知配置
                  </CardTitle>
                  <CardDescription>
                    配置 Telegram 机器人以接收抢购状态通知
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-muted/20">
                  可选
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">启用 Telegram 通知</h4>
                  <p className="text-sm text-muted-foreground">
                    开启后会通过 Telegram Bot 发送重要通知
                  </p>
                </div>
                <Switch
                  id="telegram-enabled"
                  checked={telegramConfig.enabled}
                  onCheckedChange={handleTelegramToggle}
                />
              </div>
              
              <Separator />
              
              <div className={`space-y-6 ${!telegramConfig.enabled && 'opacity-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="token" className="flex items-center gap-1">
                      <Key className="h-3.5 w-3.5" /> Telegram Bot Token
                    </Label>
                    <Input
                      id="token"
                      name="token"
                      placeholder="输入您的 Telegram Bot Token"
                      value={telegramConfig.token}
                      onChange={handleTelegramChange}
                      disabled={!telegramConfig.enabled}
                      className="tech-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatId" className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" /> Telegram Chat ID
                    </Label>
                    <Input
                      id="chatId"
                      name="chatId"
                      placeholder="输入您希望发送消息的 Chat ID"
                      value={telegramConfig.chatId}
                      onChange={handleTelegramChange}
                      disabled={!telegramConfig.enabled}
                      className="tech-border"
                    />
                  </div>
                </div>
                
                <div className="bg-amber-950/20 dark:bg-amber-900/10 border border-amber-200/20 dark:border-amber-700/20 text-amber-800 dark:text-amber-300 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-medium mb-1">如何获取 Telegram Bot 凭据？</p>
                      <p>
                        1. 创建 Telegram Bot 并获取 Token 请访问 
                        <a 
                          href="https://t.me/BotFather" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 dark:text-amber-300 hover:underline font-medium mx-1"
                        >
                          @BotFather
                        </a>
                      </p>
                      <p className="mt-1">
                        2. 要获取 Chat ID，请向 
                        <a 
                          href="https://t.me/myidbot" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-700 dark:text-amber-300 hover:underline font-medium mx-1"
                        >
                          @myidbot
                        </a> 
                        发送 /getid 命令
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center pt-8">
        <Button 
          type="submit" 
          size="lg"
          className="bg-tech-gradient relative overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 px-10 py-6"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <Server className="w-5 h-5 mr-2" /> 
          <span className="font-medium">开始抢购任务</span>
        </Button>
      </div>
    </form>
  );
};

export default ConfigForm;
