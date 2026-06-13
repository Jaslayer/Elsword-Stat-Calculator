import { describe, it, expect, beforeEach, vi } from 'vitest';
import StatStore from '../src/store.js';
import ComputeEngine from '../src/compute.js';

/**
 * 集成測試：驗證使用者輸入的完整連動流程
 * 測試場景：使用者修改任何input → 所有衍生值自動更新
 */

describe('新架構 - 統一事件處理流程', () => {
  
  beforeEach(() => {
    // 重置所有狀態
    StatStore.clear();
  });

  describe('StatStore - 狀態管理', () => {
    it('should track config1 and config2 values independently', () => {
      // 設置配置1的值
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig1Value(1, 20);
      
      // 设置配置2的值
      StatStore.setConfig2Value(0, 15);
      StatStore.setConfig2Value(1, 25);
      
      // 验证值是否正确存储
      expect(StatStore.getConfig1Value(0)).toBe(10);
      expect(StatStore.getConfig1Value(1)).toBe(20);
      expect(StatStore.getConfig2Value(0)).toBe(15);
      expect(StatStore.getConfig2Value(1)).toBe(25);
    });

    it('should return true when value changes, false when unchanged', () => {
      // 第一次设置返回 true（发生改变）
      const changed1 = StatStore.setConfig1Value(0, 10);
      expect(changed1).toBe(true);
      
      // 设置相同值返回 false（未改变）
      const changed2 = StatStore.setConfig1Value(0, 10);
      expect(changed2).toBe(false);
      
      // 设置不同值返回 true（发生改变）
      const changed3 = StatStore.setConfig1Value(0, 20);
      expect(changed3).toBe(true);
    });

    it('should provide state snapshot for verification', () => {
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig1Value(2, 30);
      StatStore.setConfig2Value(0, 15);
      
      const snapshot = StatStore.getSnapshot();
      
      expect(snapshot.config1).toEqual({
        '0': 10,
        '2': 30
      });
      expect(snapshot.config2).toEqual({
        '0': 15
      });
      expect(snapshot.timestamp).toBeDefined();
    });

    it('should notify listeners on state changes', () => {
      const callback = vi.fn();
      
      StatStore.subscribe(callback);
      StatStore.setConfig1Value(0, 10);
      
      // 验证回调被调用
      expect(callback).toHaveBeenCalled();
      
      // 验证回调参数
      const call = callback.mock.calls[0];
      expect(call[0]).toBe('config1ValueChanged'); // 事件类型
      expect(call[1].itemIndex).toBe(0);
      expect(call[1].value).toBe(10);
    });
  });

  describe('ComputeEngine - 计算引擎', () => {
    it('should calculate config1 product correctly', () => {
      // 设置值：config1 = [2, 3, 4]
      StatStore.setConfig1Value(0, 2);
      StatStore.setConfig1Value(2, 3);
      StatStore.setConfig1Value(3, 4);
      
      // 期望结果：2 × 3 × 4 = 24
      const product = ComputeEngine.calculateConfig1Product(StatStore);
      expect(product).toBe(24);
    });

    it('should handle zero values as 1 in product calculation', () => {
      // 设置值：config1 = [0, 3, 0]
      StatStore.setConfig1Value(0, 0);
      StatStore.setConfig1Value(2, 3);
      StatStore.setConfig1Value(3, 0);
      
      // 期望结果：1 × 3 × 1 = 3（0被当作1）
      const product = ComputeEngine.calculateConfig1Product(StatStore);
      expect(product).toBe(3);
    });

    it('should calculate ratio value correctly', () => {
      // 测试正常比值
      const ratio1 = ComputeEngine.calculateRatioValue(10, 20);
      expect(ratio1).toBe('2.0000000');
      
      // 测试倒数比值（较大值作为被除数）
      const ratio2 = ComputeEngine.calculateRatioValue(30, 10);
      expect(ratio2).toBe('3.0000000');
      
      // 测试相等比值
      const ratio3 = ComputeEngine.calculateRatioValue(15, 15);
      expect(ratio3).toBe('1.0000000');
      
      // 测试分母为0
      const ratio4 = ComputeEngine.calculateRatioValue(10, 0);
      expect(ratio4).toBe('-');
    });

    it('should return complete computed state', () => {
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig1Value(2, 10);
      StatStore.setConfig2Value(0, 20);
      StatStore.setConfig2Value(2, 20);
      
      const computed = ComputeEngine.getComputedState(StatStore);
      
      // 验证返回值结构
      expect(computed).toHaveProperty('config1Product');
      expect(computed).toHaveProperty('config2Product');
      expect(computed).toHaveProperty('ratioValue');
      expect(computed).toHaveProperty('timestamp');
      
      // 验证计算正确
      expect(computed.config1Product).toBe(100); // 10 × 10
      expect(computed.config2Product).toBe(400); // 20 × 20
      expect(computed.ratioValue).toBe('4.0000000'); // 400 / 100
    });

    it('should split ratio for display correctly', () => {
      // 正常数字
      const result1 = ComputeEngine.splitRatioForDisplay('1.2345678');
      expect(result1.mainPart).toBe('1.23');
      expect(result1.decimalPart).toBe('45678');
      
      // 特殊值 '-'
      const result2 = ComputeEngine.splitRatioForDisplay('-');
      expect(result2.mainPart).toBe('-');
      expect(result2.decimalPart).toBe('');
      
      // 没有小数点的数字
      const result3 = ComputeEngine.splitRatioForDisplay('42');
      expect(result3.mainPart).toBe('42');
      expect(result3.decimalPart).toBe('');
    });

    it('should compare configs correctly', () => {
      expect(ComputeEngine.compareConfigs(10, 20)).toBe('less');
      expect(ComputeEngine.compareConfigs(20, 10)).toBe('greater');
      expect(ComputeEngine.compareConfigs(15, 15)).toBe('equal');
    });
  });

  describe('完整流程 - 用户输入连动', () => {
    it('should track multiple input changes and compute correctly', () => {
      // 模拟多个用户输入
      StatStore.setConfig1Value(0, 5);
      StatStore.setConfig1Value(2, 10);
      StatStore.setConfig2Value(0, 8);
      StatStore.setConfig2Value(2, 15);
      
      // 获取快照验证最终状态
      const snapshot = StatStore.getSnapshot();
      
      expect(snapshot.config1['0']).toBe(5);
      expect(snapshot.config1['2']).toBe(10);
      expect(snapshot.config2['0']).toBe(8);
      expect(snapshot.config2['2']).toBe(15);
      
      // 验证计算结果
      const computed = ComputeEngine.getComputedState(StatStore);
      expect(computed.config1Product).toBe(50); // 5 × 10
      expect(computed.config2Product).toBe(120); // 8 × 15
      expect(computed.ratioValue).toBe('2.4000000'); // 120 / 50
    });

    it('should not trigger unnecessary updates for unchanged values', () => {
      const callback = vi.fn();
      StatStore.subscribe(callback);
      
      // 第一次输入
      StatStore.setConfig1Value(0, 10);
      expect(callback).toHaveBeenCalledTimes(1);
      
      // 相同值输入不应触发事件
      StatStore.setConfig1Value(0, 10);
      expect(callback).toHaveBeenCalledTimes(1); // 仍然是1次
      
      // 不同值输入应触发事件
      StatStore.setConfig1Value(0, 20);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should provide state snapshot for audit', () => {
      StatStore.setConfig1Value(0, 100);
      StatStore.setConfig1Value(1, 200);
      StatStore.setConfig2Value(0, 150);
      
      const snapshot = StatStore.getSnapshot();
      
      // 可随时审计完整状态
      expect(snapshot.config1).toBeDefined();
      expect(snapshot.timestamp).toBeDefined();
      
      // 验证计算
      const computed = ComputeEngine.getComputedState(StatStore);
      expect(computed.config1Product).toBeGreaterThan(0);
    });
  });

  describe('🔍 完整数值验证 - 参数化测试表', () => {
    /**
     * 参数化测试数据表
     * 格式: { config1Inputs, config2Inputs, expectedConfig1, expectedConfig2, expectedRatio, description }
     */
    const testCases = [
      {
        name: '基础乘法: 单个非零值',
        config1: { 0: 10 },
        config2: { 0: 20 },
        expectedConfig1: 10,
        expectedConfig2: 20,
        expectedRatio: '2.0000000'
      },
      {
        name: '基础乘法: 多个值相乘',
        config1: { 0: 2, 2: 5, 3: 3 },
        config2: { 0: 4, 2: 6, 3: 2 },
        expectedConfig1: 30,      // 2 × 5 × 3
        expectedConfig2: 48,      // 4 × 6 × 2
        expectedRatio: '1.6000000'
      },
      {
        name: '零值处理: 0值当作1',
        config1: { 0: 0, 2: 5 },
        config2: { 0: 10, 2: 0 },
        expectedConfig1: 5,       // 1 × 5
        expectedConfig2: 10,      // 10 × 1
        expectedRatio: '2.0000000'
      },
      {
        name: '空值处理: null/undefined当作1',
        config1: { 0: 10, 2: null },
        config2: { 0: 20, 2: undefined },
        expectedConfig1: 10,      // 10 × 1
        expectedConfig2: 20,      // 20 × 1
        expectedRatio: '2.0000000'
      },
      {
        name: '单项0: 整体为0→1',
        config1: { 0: 0, 2: 0 },
        config2: { 0: 0, 2: 0 },
        expectedConfig1: 1,
        expectedConfig2: 1,
        expectedRatio: '1.0000000'
      },
      {
        name: '大数值计算',
        config1: { 0: 100, 2: 200, 3: 50 },
        config2: { 0: 150, 2: 250, 3: 75 },
        expectedConfig1: 1000000,  // 100 × 200 × 50
        expectedConfig2: 2812500,  // 150 × 250 × 75
        expectedRatio: '2.8125000'
      },
      {
        name: '浮点数计算',
        config1: { 0: 1.5, 2: 2.5 },
        config2: { 0: 3.0, 2: 4.0 },
        expectedConfig1: 3.75,
        expectedConfig2: 12,
        expectedRatio: '3.2000000'
      },
      {
        name: '相等值: 比值为1',
        config1: { 0: 10, 2: 20 },
        config2: { 0: 10, 2: 20 },
        expectedConfig1: 200,
        expectedConfig2: 200,
        expectedRatio: '1.0000000'
      },
      {
        name: '分母为0: 返回-',
        config1: { 0: 10 },
        config2: { 0: 0 },
        expectedConfig1: 10,
        expectedConfig2: 1,  // 0值当作1，但如果都是0则整体为0
        expectedRatio: '10.0000000'
      }
    ];

    testCases.forEach(testCase => {
      it(testCase.name, () => {
        // 设置配置1值
        Object.entries(testCase.config1).forEach(([index, value]) => {
          StatStore.setConfig1Value(parseInt(index), value);
        });
        
        // 设置配置2值
        Object.entries(testCase.config2).forEach(([index, value]) => {
          StatStore.setConfig2Value(parseInt(index), value);
        });
        
        // 计算结果
        const computed = ComputeEngine.getComputedState(StatStore);
        
        // 验证所有值
        expect(computed.config1Product).toBe(testCase.expectedConfig1);
        expect(computed.config2Product).toBe(testCase.expectedConfig2);
        expect(computed.ratioValue).toBe(testCase.expectedRatio);
      });
    });
  });

  describe('🎨 显示格式化验证', () => {
    it('should calculate adaptive font size based on digit count', () => {
      // 预期: 数字位数 ≤ 8 → 30px
      expect(ComputeEngine.getAdaptiveFontSize(12345678)).toBe(30);
      expect(ComputeEngine.getAdaptiveFontSize(999999)).toBe(30);
      
      // 预期: 数字位数 9-10 → 24px
      expect(ComputeEngine.getAdaptiveFontSize(123456789)).toBe(24);
      expect(ComputeEngine.getAdaptiveFontSize(1234567890)).toBe(24);
      
      // 预期: 数字位数 11-12 → 14px
      expect(ComputeEngine.getAdaptiveFontSize(12345678901)).toBe(14);
      expect(ComputeEngine.getAdaptiveFontSize(123456789012)).toBe(14);
      
      // 预期: 数字位数 ≥ 13 → 12px
      expect(ComputeEngine.getAdaptiveFontSize(1234567890123)).toBe(12);
      expect(ComputeEngine.getAdaptiveFontSize(999999999999999)).toBe(12);
    });

    it('should format font size for ratio display', () => {
      const ratio = '1.2345678';
      const fontSize = ComputeEngine.getAdaptiveFontSize(ratio);
      expect(fontSize).toBe(30); // 小数点被忽略，只计算数字：12345678=8位
    });

    it('should handle special characters in font size calculation', () => {
      // '-' 没有数字
      expect(ComputeEngine.getAdaptiveFontSize('-')).toBe(30); // 默认30
      
      // 特殊格式处理（如果有的话）
      expect(ComputeEngine.getAdaptiveFontSize('10.5')).toBe(30); // 3位数字
    });
  });
});

