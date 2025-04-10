
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AvailabilityItem } from '@/types';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

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
      <Card className="shadow-md">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mb-3 h-8 w-8 mx-auto border-4 border-t-ovh-blue border-r-transparent border-b-ovh-blue border-l-transparent rounded-full"></div>
            <p>正在检查服务器可用性...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availabilities.length === 0) {
    return (
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">暂无可用性数据</h3>
            <p className="text-gray-500">
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
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">服务器可用性</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
              hasAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {hasAvailable 
                ? <CheckCircle2 className="h-4 w-4 mr-2" /> 
                : <AlertTriangle className="h-4 w-4 mr-2" />
              }
              {hasAvailable ? '发现可用服务器' : '暂无可用服务器'}
            </div>
          </div>
          
          <div className="grid gap-3">
            {availabilities.map((item, index) => (
              <div 
                key={index}
                className="border rounded-md p-3 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{item.fqn || '未知型号'}</div>
                  <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    item.availability === 'available' ? 'bg-green-100 text-green-800' :
                    item.availability === 'unavailable' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.availability === 'available' ? '可用' :
                     item.availability === 'unavailable' ? '不可用' : 
                     item.availability || '未知'}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  数据中心: {item.datacenter || '未知'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDisplay;
