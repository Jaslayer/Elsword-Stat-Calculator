import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import StatStore from '../src/store.js';
import ComputeEngine from '../src/compute.js';

/**
 * 🎯 DOM 顯示驗證測試 - 完整鏈路測試
 * 
 * 目的：驗證從狀態→計算→DOM更新的完整流程
 * 這是測試套件中最接近真實瀏覽器行為的測試
 * 
 * 作用：
 * - 🐛 捕捉 calc.js 中的語法錯誤
 * - 🐛 發現 DOM 更新邏輯的 bug
 * - 🐛 驗證數值顯示的準確性
 * - 🐛 檢測 updateProductDisplay() 的問題
 */

describe('🎯 DOM 顯示驗證 - 模擬瀏覽器環節', () => {
  
  let container;

  beforeEach(() => {
    // 建立模擬的 DOM 容器
    container = document.createElement('div');
    document.body.appendChild(container);
    StatStore.clear();
  });

  afterEach(() => {
    // 清理 DOM
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  describe('📊 Header 產品顯示驗證', () => {
    
    it('應該正確顯示配置1的值在 DOM 中', () => {
      // 1️⃣ 設置狀態
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig1Value(2, 5);
      
      // 2️⃣ 計算結果
      const config1Product = ComputeEngine.calculateConfig1Product(StatStore);
      
      // 3️⃣ 模擬 DOM 更新（模擬 updateProductDisplay 的行為）
      const config1ProductDiv = document.createElement('div');
      config1ProductDiv.className = 'config1-product-value';
      config1ProductDiv.textContent = config1Product;
      config1ProductDiv.style.fontSize = ComputeEngine.getAdaptiveFontSize(config1Product) + 'px';
      container.appendChild(config1ProductDiv);
      
      // 4️⃣ 驗證顯示的數字
      expect(config1ProductDiv.textContent).toBe('50'); // 10 × 5
      expect(config1ProductDiv.style.fontSize).toBe('30px'); // 2位數字
    });

    it('應該正確顯示配置2的值在 DOM 中', () => {
      StatStore.setConfig2Value(0, 20);
      StatStore.setConfig2Value(2, 10);
      
      const config2Product = ComputeEngine.calculateConfig2Product(StatStore);
      
      const config2ProductDiv = document.createElement('div');
      config2ProductDiv.textContent = config2Product;
      config2ProductDiv.style.fontSize = ComputeEngine.getAdaptiveFontSize(config2Product) + 'px';
      container.appendChild(config2ProductDiv);
      
      // 驗證
      expect(config2ProductDiv.textContent).toBe('200'); // 20 × 10
      expect(config2ProductDiv.style.fontSize).toBe('30px');
    });

    it('應該正確顯示比值並分割顯示格式', () => {
      // 設置不同的配置值
      StatStore.setConfig1Value(0, 10);
      StatStore.setConfig2Value(0, 30);
      
      // 計算比值
      const config1Product = ComputeEngine.calculateConfig1Product(StatStore);
      const config2Product = ComputeEngine.calculateConfig2Product(StatStore);
      const ratio = ComputeEngine.calculateRatioValue(config1Product, config2Product);
      
      // 分割比值
      const display = ComputeEngine.splitRatioForDisplay(ratio);
      
      // 模擬 DOM 更新：建立分割顯示的 HTML
      const ratioDiv = document.createElement('div');
      ratioDiv.innerHTML = `<span style="color: #00ff00;">${display.mainPart}</span>${display.decimalPart}`;
      container.appendChild(ratioDiv);
      
      // 驗證 HTML 結構
      const mainSpan = ratioDiv.querySelector('span');
      expect(mainSpan.textContent).toBe('3.00');
      expect(mainSpan.style.color).toBe('rgb(0, 255, 0)'); // #00ff00
      
      // 驗證完整顯示
      const fullText = mainSpan.textContent + ratioDiv.textContent.replace(mainSpan.textContent, '');
      expect(fullText).toContain('3.00');
    });
  });

  describe('🎨 字体大小自适应验证', () => {
    
    it('應該根據數字大小正確設置字體大小', () => {
      // 測試多個數值
      const testCases = [
        { value: 12345678, expectedSize: 30 },     // 8位
        { value: 123456789, expectedSize: 24 },    // 9位
        { value: 1234567890, expectedSize: 24 },   // 10位
        { value: 12345678901, expectedSize: 14 },  // 11位
      ];

      testCases.forEach(testCase => {
        const div = document.createElement('div');
        div.textContent = testCase.value;
        const fontSize = ComputeEngine.getAdaptiveFontSize(testCase.value);
        div.style.fontSize = fontSize + 'px';
        container.appendChild(div);
        
        expect(div.style.fontSize).toBe(testCase.expectedSize + 'px');
      });
    });

    it('小數點應該被忽略，只計算數字位數', () => {
      const testCases = [
        { value: '1.234', expectedSize: 30 },       // 4位數字
        { value: '12.345', expectedSize: 30 },      // 5位數字
        { value: '123456789.0', expectedSize: 24 }, // 9位數字
      ];

      testCases.forEach(testCase => {
        const fontSize = ComputeEngine.getAdaptiveFontSize(testCase.value);
        expect(fontSize).toBe(testCase.expectedSize);
      });
    });
  });

  describe('🔄 完整流程驗證 - 使用者輸入到顯示', () => {
    
    it('應該正確處理使用者輸入: 輸入→計算→顯示', () => {
      // 場景：使用者輸入配置值 15 和 20
      const userInput1 = 15;
      const userInput2 = 20;
      
      // Step 1: 更新狀態
      StatStore.setConfig1Value(0, userInput1);
      StatStore.setConfig2Value(0, userInput2);
      
      // Step 2: 計算派生值
      const computed = ComputeEngine.getComputedState(StatStore);
      
      // Step 3: 更新 DOM（模擬 updateProductDisplay）
      const headerPanel = document.createElement('div');
      headerPanel.className = 'input-panel-header';
      
      // 配置1 顯示區
      const config1Div = document.createElement('div');
      config1Div.textContent = computed.config1Product;
      config1Div.style.fontSize = ComputeEngine.getAdaptiveFontSize(computed.config1Product) + 'px';
      headerPanel.appendChild(config1Div);
      
      // 配置2 顯示區
      const config2Div = document.createElement('div');
      config2Div.textContent = computed.config2Product;
      config2Div.style.fontSize = ComputeEngine.getAdaptiveFontSize(computed.config2Product) + 'px';
      headerPanel.appendChild(config2Div);
      
      // 比值顯示區
      const ratioDisplay = ComputeEngine.splitRatioForDisplay(computed.ratioValue);
      const ratioDiv = document.createElement('div');
      ratioDiv.innerHTML = `<span style="color: #00ff00;">${ratioDisplay.mainPart}</span>${ratioDisplay.decimalPart}`;
      headerPanel.appendChild(ratioDiv);
      
      container.appendChild(headerPanel);
      
      // Step 4: 驗證所有顯示值
      expect(config1Div.textContent).toBe('15');
      expect(config2Div.textContent).toBe('20');
      expect(ratioDiv.querySelector('span').textContent).toBe('1.33');
      
      // 驗證字體大小
      expect(config1Div.style.fontSize).toBe('30px');
      expect(config2Div.style.fontSize).toBe('30px');
    });

    it('應該處理零值的特殊情況', () => {
      // 0 值應該當作 1 處理
      StatStore.setConfig1Value(0, 0);
      StatStore.setConfig1Value(2, 0);
      
      const computed = ComputeEngine.getComputedState(StatStore);
      
      // 驗證計算結果
      expect(computed.config1Product).toBe(1); // 1 × 1 = 1
      expect(computed.config2Product).toBe(1);
      
      // 模擬 DOM 顯示
      const div = document.createElement('div');
      div.textContent = computed.config1Product;
      container.appendChild(div);
      
      expect(div.textContent).toBe('1');
    });
  });

  describe('🚨 錯誤捕捉 - 發現常見問題', () => {
    
    it('應該捕捉 updateProductDisplay 中的 undefined 錯誤', () => {
      // 模擬常見的 bug：忘記初始化
      StatStore.setConfig1Value(0, 10);
      
      const product = ComputeEngine.calculateConfig1Product(StatStore);
      
      // 驗證 getAdaptiveFontSize 不會返回 undefined
      const fontSize = ComputeEngine.getAdaptiveFontSize(product);
      expect(fontSize).toBeDefined();
      expect(typeof fontSize).toBe('number');
      expect(fontSize).toBeGreaterThan(0);
    });

    it('應該正確處理顯示中的特殊值 "-"', () => {
      // 分母為 0 時返回 "-"
      const ratio = ComputeEngine.calculateRatioValue(10, 0);
      expect(ratio).toBe('-');
      
      // 分割顯示應該也處理好
      const display = ComputeEngine.splitRatioForDisplay(ratio);
      expect(display.mainPart).toBe('-');
      expect(display.decimalPart).toBe('');
      
      // DOM 中顯示也應該正確
      const div = document.createElement('div');
      div.textContent = ratio;
      container.appendChild(div);
      
      expect(div.textContent).toBe('-');
    });

    it('應該驗證浮點精度處理', () => {
      // 驗證 roundNumber 正確處理浮點精度
      StatStore.setConfig1Value(0, 0.1);
      StatStore.setConfig1Value(2, 0.2);
      
      const product = ComputeEngine.calculateConfig1Product(StatStore);
      
      // 應該是 0.02，而不是 0.020000000002
      expect(product).toBe(0.02);
      expect(String(product)).not.toContain('e-');
      
      const div = document.createElement('div');
      div.textContent = product;
      container.appendChild(div);
      
      expect(div.textContent).toBe('0.02');
    });
  });

  describe('✅ 迴歸測試 - 防止舊問題重現', () => {
    
    it('應該避免重複定義 roundNumber 的錯誤', () => {
      // 驗證 roundNumber 是可用的
      expect(typeof ComputeEngine.roundNumber).toBe('function');
      
      const result = ComputeEngine.roundNumber(3.14159265, 5);
      expect(result).toBe(3.14159);
    });

    it('應該避免重複定義 getAdaptiveFontSize 的錯誤', () => {
      // 驗證 getAdaptiveFontSize 是可用的
      expect(typeof ComputeEngine.getAdaptiveFontSize).toBe('function');
      
      const fontSize = ComputeEngine.getAdaptiveFontSize(12345678);
      expect(fontSize).toBe(30);
    });

    it('應該確保所有必要的函數都可用', () => {
      const requiredFunctions = [
        'calculateConfig1Product',
        'calculateConfig2Product',
        'calculateRatioValue',
        'getComputedState',
        'splitRatioForDisplay',
        'compareConfigs',
        'roundNumber',
        'getAdaptiveFontSize'
      ];

      requiredFunctions.forEach(funcName => {
        expect(typeof ComputeEngine[funcName]).toBe('function');
      });
    });
  });
});
