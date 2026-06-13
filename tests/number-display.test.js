import { describe, it, expect, beforeEach } from 'vitest';
import StatStore from '../src/store.js';
import ComputeEngine from '../src/compute.js';

/**
 * 📊 數值顯示驗證測試
 * 
 * 目的：驗證最終顯示給使用者的數字是否正確
 * 場景：檢查計算結果 → 格式化 → 顯示 的完整鏈路
 * 
 * 包含：
 * - 比值分割顯示格式
 * - 字體大小自適應
 * - 數值精度處理
 * - 邊界情況的顯示
 */

describe('📊 數值顯示驗證', () => {
  
  beforeEach(() => {
    StatStore.clear();
  });

  describe('🔢 比值分割顯示 - splitRatioForDisplay()', () => {
    const displayTestCases = [
      {
        input: '1.2345678',
        expectedMain: '1.23',
        expectedDecimal: '45678',
        description: '標準7位小數分割（前3位|後4位）'
      },
      {
        input: '10.5555555',
        expectedMain: '10.55',
        expectedDecimal: '55555',
        description: '兩位整數分割'
      },
      {
        input: '123.4567890',
        expectedMain: '123.45',
        expectedDecimal: '67890',
        description: '三位整數分割'
      },
      {
        input: '0.9999999',
        expectedMain: '0.99',
        expectedDecimal: '99999',
        description: '零點幾分割'
      },
      {
        input: '1.0000000',
        expectedMain: '1.00',
        expectedDecimal: '00000',
        description: '精确值分割'
      },
      {
        input: '2.0000000',
        expectedMain: '2.00',
        expectedDecimal: '00000',
        description: '整數分割'
      },
      {
        input: '-',
        expectedMain: '-',
        expectedDecimal: '',
        description: '特殊值 - 當分母為0時'
      },
      {
        input: '42',
        expectedMain: '42',
        expectedDecimal: '',
        description: '沒有小數點的整數'
      }
    ];

    displayTestCases.forEach(testCase => {
      it(testCase.description, () => {
        const result = ComputeEngine.splitRatioForDisplay(testCase.input);
        expect(result.mainPart).toBe(testCase.expectedMain);
        expect(result.decimalPart).toBe(testCase.expectedDecimal);
      });
    });

    it('should correctly split when displaying HTML', () => {
      const ratio = '1.2345678';
      const result = ComputeEngine.splitRatioForDisplay(ratio);
      
      // 模擬HTML顯示
      const html = `<span style="color: #00ff00;">${result.mainPart}</span>${result.decimalPart}`;
      
      // 验证格式
      expect(html).toContain('1.23');
      expect(html).toContain('45678');
      expect(html).toContain('color: #00ff00;');
    });
  });

  describe('🎨 字体大小自适应 - getAdaptiveFontSize()', () => {
    const fontSizeTestCases = [
      {
        value: 12345678,
        expected: 30,
        description: '8位数字 → 30px'
      },
      {
        value: 123456789,
        expected: 24,
        description: '9位数字 → 24px'
      },
      {
        value: 1234567890,
        expected: 24,
        description: '10位数字 → 24px'
      },
      {
        value: 12345678901,
        expected: 14,
        description: '11位数字 → 14px'
      },
      {
        value: 123456789012,
        expected: 14,
        description: '12位数字 → 14px'
      },
      {
        value: 1234567890123,
        expected: 12,
        description: '13位数字 → 12px'
      },
      {
        value: 1,
        expected: 30,
        description: '1位数字 → 30px'
      },
      {
        value: 100,
        expected: 30,
        description: '3位数字 → 30px'
      },
      {
        value: '1.234',
        expected: 30,
        description: '小數點被忽略，只計算數字4位 → 30px'
      },
      {
        value: '12345.678',
        expected: 30,
        description: '小數點被忽略，只計算4位 → 30px'
      },
      {
        value: '-',
        expected: 30,
        description: '特殊值 - 沒有數字 → 30px'
      }
    ];

    fontSizeTestCases.forEach(testCase => {
      it(testCase.description, () => {
        const fontSize = ComputeEngine.getAdaptiveFontSize(testCase.value);
        expect(fontSize).toBe(testCase.expected);
      });
    });
  });

  describe('🎯 完整端到端數值驗證', () => {
    it('應該正確顯示小數值：1.2345678 分割爲 1.23 和 45678', () => {
      StatStore.setConfig1Value(0, 12);
      StatStore.setConfig2Value(0, 100);
      
      const computed = ComputeEngine.getComputedState(StatStore);
      const display = ComputeEngine.splitRatioForDisplay(computed.ratioValue);
      
      // 驗證比值計算
      expect(computed.ratioValue).toBe('8.3333333');
      
      // 驗證分割顯示
      expect(display.mainPart).toBe('8.33');
      expect(display.decimalPart).toBe('33333');
      
      // 驗證字體大小
      const fontSize = ComputeEngine.getAdaptiveFontSize(computed.ratioValue);
      expect(fontSize).toBe(30); // 7位数字
    });

    it('應該正確處理大數值的顯示', () => {
      // 設置導致大乘積的值
      StatStore.setConfig1Value(0, 100);
      StatStore.setConfig1Value(2, 200);
      StatStore.setConfig1Value(3, 50);
      StatStore.setConfig2Value(0, 100);
      StatStore.setConfig2Value(2, 200);
      StatStore.setConfig2Value(3, 100);
      
      const computed = ComputeEngine.getComputedState(StatStore);
      
      // config1: 100 × 200 × 50 = 1,000,000
      // config2: 100 × 200 × 100 = 2,000,000
      // ratio: 2,000,000 / 1,000,000 = 2.0
      
      expect(computed.config1Product).toBe(1000000);
      expect(computed.config2Product).toBe(2000000);
      
      // 檢查大數值的字體大小
      const fontSize = ComputeEngine.getAdaptiveFontSize(computed.config1Product);
      expect(fontSize).toBe(30); // 7位數字，滿足 length <= 8 條件，應該是30px
    });

    it('應該正確處理零值情況的顯示', () => {
      StatStore.setConfig1Value(0, 0);
      StatStore.setConfig2Value(0, 0);
      
      const computed = ComputeEngine.getComputedState(StatStore);
      const display = ComputeEngine.splitRatioForDisplay(computed.ratioValue);
      
      // 0值當作1，所以 1/1 = 1.0
      expect(computed.config1Product).toBe(1);
      expect(computed.config2Product).toBe(1);
      expect(display.mainPart).toBe('1.00');
    });

    it('應該正確處理配置值為0的分母情況', () => {
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig2Value(0, 0); // 配置2為0 → 當作1
      
      const computed = ComputeEngine.getComputedState(StatStore);
      
      // 10 vs 1 → 10/1 = 10.0
      expect(computed.ratioValue).toBe('10.0000000');
      
      const display = ComputeEngine.splitRatioForDisplay(computed.ratioValue);
      expect(display.mainPart).toBe('10.00');
      expect(display.decimalPart).toBe('00000');
    });
  });

  describe('🔍 精度验证 - roundNumber()', () => {
    it('應該正確處理浮點精度問題', () => {
      // 測試常見的浮點精度問題 - 使用會導致浮點精度問題的值
      StatStore.setConfig1Value(0, 0.5);
      StatStore.setConfig1Value(2, 0.4);
      
      const product = ComputeEngine.calculateConfig1Product(StatStore);
      
      // 0.5 × 0.4 = 0.2 (避免浮點精度問題)
      expect(product).toBe(0.2);
      expect(typeof product).toBe('number');
      expect(String(product)).not.toContain('e');
    });

    it('應該保持合理的小數位數', () => {
      const ratio = ComputeEngine.calculateRatioValue(7, 3);
      
      // 7/3 = 2.333... → 保留7位小數
      expect(ratio).toBe('2.3333333');
      
      // 驗證沒有過度精度
      const parts = ratio.split('.');
      expect(parts[1].length).toBe(7);
    });
  });

  describe('📋 顯示對照表驗證', () => {
    /**
     * 這個表格可以用來快速核對顯示是否正確
     * 輸入 | 期望顯示 | 說明
     */
    it('完整的顯示對照表驗證', () => {
      const displayTable = [
        {
          config1: { 0: 10 },
          config2: { 0: 20 },
          expectedDisplay: { main: '2.00', decimal: '00000' },
          note: '简单比值'
        },
        {
          config1: { 0: 15 },
          config2: { 0: 10 },
          expectedDisplay: { main: '1.50', decimal: '00000' },
          note: '1.5倍'
        },
        {
          config1: { 0: 1 },
          config2: { 0: 3 },
          expectedDisplay: { main: '3.00', decimal: '00000' },
          note: '3倍'
        },
        {
          config1: { 0: 7 },
          config2: { 0: 3 },
          expectedDisplay: { main: '2.33', decimal: '33333' },
          note: '2.333...'
        }
      ];

      displayTable.forEach(row => {
        StatStore.clear();
        
        Object.entries(row.config1).forEach(([idx, val]) => {
          StatStore.setConfig1Value(parseInt(idx), val);
        });
        Object.entries(row.config2).forEach(([idx, val]) => {
          StatStore.setConfig2Value(parseInt(idx), val);
        });
        
        const computed = ComputeEngine.getComputedState(StatStore);
        const display = ComputeEngine.splitRatioForDisplay(computed.ratioValue);
        
        expect(display.mainPart).toBe(row.expectedDisplay.main);
        expect(display.decimalPart).toBe(row.expectedDisplay.decimal);
      });
    });
  });
});
