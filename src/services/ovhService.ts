
import { OvhConfig, TaskConfig, TelegramConfig } from '@/types';

/**
 * OVH API 服务
 * 实现与OVH API的直接交互
 */
export class OvhService {
  private config: OvhConfig;
  private telegramConfig: TelegramConfig | null;
  private taskConfig: TaskConfig;
  private abortController: AbortController | null = null;
  private logCallback: (level: 'info' | 'error' | 'success' | 'warning', message: string) => void;

  constructor(
    config: OvhConfig,
    taskConfig: TaskConfig,
    telegramConfig: TelegramConfig | null,
    logCallback: (level: 'info' | 'error' | 'success' | 'warning', message: string) => void
  ) {
    this.config = config;
    this.taskConfig = taskConfig;
    this.telegramConfig = telegramConfig;
    this.logCallback = logCallback;
  }

  /**
   * 停止当前正在执行的任务
   */
  public stopTask() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.log('info', '任务已手动停止');
    }
  }

  /**
   * 执行OVH服务器抢购任务
   * 直接调用OVH API来检查可用性并处理购买流程
   */
  public async executeTask(): Promise<boolean> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    
    try {
      this.log('info', '开始检查服务器可用性...');
      
      // 1. 检查服务器可用性
      const availabilities = await this.checkAvailability();
      
      if (signal.aborted) return false;

      if (!availabilities || availabilities.length === 0) {
        this.log('warning', `未找到计划代码 ${this.taskConfig.planCode} 的可用性信息`);
        return false;
      }
      
      // 查找可用的数据中心
      let foundAvailable = false;
      let availableDC = null;
      let fqn = null;
      
      for (const item of availabilities) {
        fqn = item.fqn;
        const datacenters = item.datacenters || [];
        
        for (const dcInfo of datacenters) {
          const availability = dcInfo.availability;
          const datacenterName = dcInfo.datacenter;
          
          this.log('info', `型号: ${fqn}, 数据中心: ${datacenterName}, 可用性: ${availability}`);
          
          if (availability && !['unavailable', 'unknown'].includes(availability)) {
            foundAvailable = true;
            availableDC = datacenterName;
            this.log('success', `在数据中心 ${availableDC} 找到可用服务器 ${fqn}!`);
            break;
          }
        }
        
        if (foundAvailable) break;
      }
      
      if (!foundAvailable) {
        this.log('warning', `计划代码 ${this.taskConfig.planCode} 当前无可用服务器`);
        return false;
      }
      
      if (signal.aborted) return false;
      
      // 发送可用性通知到Telegram
      if (this.telegramConfig?.enabled) {
        const msg = `${this.taskConfig.iam}: 在 ${availableDC} 找到 ${this.taskConfig.planCode} (${fqn}) 可用`;
        await this.sendTelegramMessage(msg);
      }
      
      // 2. 创建购物车
      this.log('info', `为区域 ${this.taskConfig.zone} 创建购物车...`);
      const cartResult = await this.createCart();
      
      if (signal.aborted) return false;
      
      if (!cartResult || !cartResult.cartId) {
        this.log('error', '创建购物车失败');
        return false;
      }
      
      const cartId = cartResult.cartId;
      this.log('success', `购物车创建成功，ID: ${cartId}`);
      
      // 3. 绑定购物车
      this.log('info', `绑定购物车 ${cartId}...`);
      await this.assignCart(cartId);
      this.log('success', '购物车绑定成功');
      
      if (signal.aborted) return false;
      
      // 4. 添加商品到购物车
      this.log('info', `将商品 ${this.taskConfig.planCode} 添加到购物车 ${cartId}...`);
      const itemResult = await this.addItemToCart(cartId);
      
      if (!itemResult || !itemResult.itemId) {
        this.log('error', '添加商品失败');
        return false;
      }
      
      const itemId = itemResult.itemId;
      this.log('success', `商品添加成功，项目 ID: ${itemId}`);
      
      if (signal.aborted) return false;
      
      // 5. 获取必需配置
      this.log('info', `检查项目 ${itemId} 的必需配置...`);
      const requiredConfig = await this.getRequiredConfiguration(cartId, itemId);
      this.log('info', `获取到必需配置项信息`);
      
      // 设置配置
      const configurationsToSet: Record<string, string> = {
        'dedicated_datacenter': availableDC || 'rbx', // 使用找到的可用数据中心
        'dedicated_os': this.taskConfig.os
      };
      
      // 查找region配置项
      if (requiredConfig) {
        for (const config of requiredConfig) {
          if (config.label === 'region' && config.allowedValues?.length > 0) {
            configurationsToSet['region'] = config.allowedValues[0];
          }
        }
      }
      
      // 6. 配置购物车商品
      for (const [label, value] of Object.entries(configurationsToSet)) {
        if (!value) {
          this.log('warning', `配置项 ${label} 的值是空的，跳过设置`);
          continue;
        }
        
        try {
          this.log('info', `配置项目 ${itemId}: 设置 ${label} = ${value}`);
          await this.configureItem(cartId, itemId, label, value);
        } catch (e) {
          this.log('error', `配置 ${label} = ${value} 失败: ${e instanceof Error ? e.message : String(e)}`);
          
          if (label === 'dedicated_datacenter') {
            throw new Error(`关键配置项 ${label} 设置失败，中止购买`);
          }
        }
        
        if (signal.aborted) return false;
      }
      
      /* 
      // 7. 添加附加选项（可选功能）
      if (this.taskConfig.options?.length > 0) {
        this.log('info', `为项目 ${itemId} 添加附加选项...`);
        
        for (const optionPlanCode of this.taskConfig.options) {
          try {
            this.log('info', `添加选项: ${optionPlanCode}`);
            await this.addOptionToItem(cartId, itemId, optionPlanCode);
            this.log('success', `选项 ${optionPlanCode} 添加成功`);
          } catch (e) {
            this.log('error', `添加选项 ${optionPlanCode} 失败: ${e instanceof Error ? e.message : String(e)}`);
          }
          
          if (signal.aborted) return false;
        }
      }
      */
      
      // 8. 检查购物车和准备结账
      this.log('info', `获取购物车 ${cartId} 的摘要信息...`);
      const cartSummary = await this.getCartSummary(cartId);
      this.log('info', `获取购物车摘要成功`);
      
      this.log('info', `获取购物车 ${cartId} 的结账信息...`);
      const checkoutInfo = await this.getCheckoutInfo(cartId);
      this.log('info', `获取结账信息成功`);
      
      if (signal.aborted) return false;
      
      // 9. 执行结账
      this.log('info', `对购物车 ${cartId} 执行结账...`);
      const checkoutResult = await this.checkoutCart(cartId);
      
      if (!checkoutResult) {
        this.log('error', '结账失败');
        return false;
      }
      
      this.log('success', '结账请求已提交！');
      
      const orderId = checkoutResult.orderId || 'N/A';
      const orderUrl = checkoutResult.url || 'N/A';
      
      this.log('success', `订单创建成功！订单ID: ${orderId}`);
      this.log('info', `订单链接: ${orderUrl}`);
      
      // 结账成功后发送最终通知
      if (this.telegramConfig?.enabled) {
        const successMsg = `${this.taskConfig.iam}: 订单 ${orderId} 已成功创建并提交！\n服务器: ${fqn}\n数据中心: ${availableDC}\n订单链接: ${orderUrl}`;
        await this.sendTelegramMessage(successMsg);
      }
      
      return true;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log('error', `执行任务时发生错误: ${errorMessage}`);
      
      if (this.telegramConfig?.enabled) {
        await this.sendTelegramMessage(`${this.taskConfig.iam}: 操作失败 - ${errorMessage}`);
      }
      
      return false;
    }
  }

  /**
   * 向 Telegram 发送消息
   */
  private async sendTelegramMessage(message: string): Promise<void> {
    if (!this.telegramConfig?.enabled || !this.telegramConfig.token || !this.telegramConfig.chatId) {
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${this.telegramConfig.token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: this.telegramConfig.chatId,
          text: message
        })
      });

      if (!response.ok) {
        this.log('error', `发送消息到 Telegram 失败: ${response.status}, ${await response.text()}`);
        return;
      }

      this.log('info', '成功发送消息到 Telegram');
    } catch (e) {
      this.log('error', `发送 Telegram 消息时发生错误: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * 记录日志
   */
  private log(level: 'info' | 'error' | 'success' | 'warning', message: string): void {
    this.logCallback(level, message);
  }

  /**
   * 调用 OVH API
   */
  private async callOvhApi(
    method: string,
    path: string,
    body?: Record<string, any>
  ): Promise<any> {
    try {
      // 注意：这是前端直接调用 OVH API 的示例
      // 实际生产环境中，应该通过后端服务来中转这些请求，并处理签名等安全问题
      // 在前端直接调用需要处理CORS问题，这里只是为了演示

      const timestamp = Math.round(Date.now() / 1000);
      const url = `https://${this.config.endpoint}/1.0${path}`;
      
      // 创建签名
      // 注意：在浏览器环境中无法安全地计算签名，这部分通常应在后端完成
      // 以下代码仅供参考，实际应用中请使用适当的后端服务处理API请求
      
      const payload = body ? JSON.stringify(body) : '';
      
      // 模拟请求，实际开发时需要实现正确的签名逻辑
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Ovh-Application': this.config.appKey,
          'X-Ovh-Consumer': this.config.consumerKey,
          // 实际请求还需要 X-Ovh-Timestamp 和 X-Ovh-Signature
        },
        body: method !== 'GET' ? payload : undefined,
        signal: this.abortController?.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OVH API 请求失败 (${response.status}): ${errorText}`);
      }

      if (response.status === 204) {
        return null; // No content
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求已取消');
      }
      throw error;
    }
  }

  /**
   * 检查服务器可用性
   */
  private async checkAvailability() {
    return await this.callOvhApi('GET', `/dedicated/server/datacenter/availabilities?planCode=${this.taskConfig.planCode}`);
  }
  
  /**
   * 创建购物车
   */
  private async createCart() {
    return await this.callOvhApi('POST', '/order/cart', {
      ovhSubsidiary: this.taskConfig.zone
    });
  }
  
  /**
   * 绑定购物车
   */
  private async assignCart(cartId: string) {
    return await this.callOvhApi('POST', `/order/cart/${cartId}/assign`);
  }
  
  /**
   * 添加商品到购物车
   */
  private async addItemToCart(cartId: string) {
    return await this.callOvhApi('POST', `/order/cart/${cartId}/eco`, {
      planCode: this.taskConfig.planCode,
      pricingMode: 'default',
      duration: this.taskConfig.duration,
      quantity: 1
    });
  }
  
  /**
   * 获取必需配置
   */
  private async getRequiredConfiguration(cartId: string, itemId: string) {
    return await this.callOvhApi('GET', `/order/cart/${cartId}/item/${itemId}/requiredConfiguration`);
  }
  
  /**
   * 配置商品
   */
  private async configureItem(cartId: string, itemId: string, label: string, value: string) {
    return await this.callOvhApi('POST', `/order/cart/${cartId}/item/${itemId}/configuration`, {
      label,
      value
    });
  }
  
  /**
   * 添加选项
   */
  private async addOptionToItem(cartId: string, itemId: string, planCode: string) {
    return await this.callOvhApi('POST', `/order/cart/${cartId}/item/${itemId}/option`, {
      planCode,
      pricingMode: 'default',
      duration: this.taskConfig.duration,
      quantity: 1
    });
  }
  
  /**
   * 获取购物车摘要
   */
  private async getCartSummary(cartId: string) {
    return await this.callOvhApi('GET', `/order/cart/${cartId}`);
  }
  
  /**
   * 获取结账信息
   */
  private async getCheckoutInfo(cartId: string) {
    return await this.callOvhApi('GET', `/order/cart/${cartId}/checkout`);
  }
  
  /**
   * 结账
   */
  private async checkoutCart(cartId: string) {
    return await this.callOvhApi('POST', `/order/cart/${cartId}/checkout`, {
      autoPayWithPreferredPaymentMethod: false,
      waiveRetractationPeriod: true
    });
  }
  
  /**
   * 获取服务器产品目录
   */
  public static async getServerCatalog(endpoint: string, zone: string): Promise<any> {
    try {
      const url = `https://${endpoint}/v1/order/catalog/public/eco?ovhSubsidiary=${zone}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`获取产品目录失败: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('获取服务器产品目录失败:', error);
      throw error;
    }
  }
}
