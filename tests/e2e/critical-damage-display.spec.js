import { test, expect } from '@playwright/test';

test.describe('E2E: Critical Damage Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await page.waitForLoadState('networkidle');
    await page.waitForFunction(() => window.calculateCriticalDamage && typeof window.calculateCriticalDamage === 'function');
  });

  test('應顯示正確的致命一擊傷害值 - 基本計算', async ({ page }) => {
    // 創建必要的 DOM 結構並調用計算函數
    const result = await page.evaluate(() => {
      // 建立面板結構
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '50|20|2';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '50|20|2';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      // 調用計算函數
      const calcResult = window.calculateCriticalDamage();
      
      // 清理
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`計算結果: config1=${result.config1}, 預期值: 73`);
    expect(result.config1).toBeCloseTo(73, 0);
  });

  test('應顯示正確的致命一擊傷害值 - 複雜計算（多個乘算）', async ({ page }) => {
    const result = await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '100|50|30,10';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '100|50|30,10';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      const calcResult = window.calculateCriticalDamage();
      
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`計算結果: config1=${result.config1}, 預期值: 214.5`);
    expect(result.config1).toBeCloseTo(214.5, 0);
  });

  test('應顯示正確的致命一擊傷害值 - 僅加算（無乘算）', async ({ page }) => {
    const result = await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '50|20|';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '50|20|';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      const calcResult = window.calculateCriticalDamage();
      
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`計算結果: config1=${result.config1}, 預期值: 70`);
    expect(result.config1).toBeCloseTo(70, 0);
  });

  test('應顯示正確的致命一擊傷害值 - 僅乘算（無加算）', async ({ page }) => {
    const result = await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '50||10';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '50||10';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      const calcResult = window.calculateCriticalDamage();
      
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`計算結果: config1=${result.config1}, 預期值: 65`);
    expect(result.config1).toBeCloseTo(65, 0);
  });

  test('Config-Product 應正確計算', async ({ page }) => {
    const result = await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '100|40|20';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '100|40|20';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      const calcResult = window.calculateCriticalDamage();
      
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`config1=${result.config1}, config2=${result.config2}`);
    expect(result.config1).toBeCloseTo(170, 0);
    expect(result.config2).toBeCloseTo(170, 0);
  });

  test('應返回正確的結構', async ({ page }) => {
    const result = await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = '2';
      
      const leftButton = document.createElement('button');
      leftButton.className = 'left-input';
      leftButton.dataset.value = '50|20|2';
      
      const resultButton = document.createElement('button');
      resultButton.className = 'result-input';
      resultButton.dataset.value = '50|20|2';
      
      panel.appendChild(leftButton);
      panel.appendChild(resultButton);
      document.body.appendChild(panel);
      
      const calcResult = window.calculateCriticalDamage();
      
      panel.remove();
      
      return calcResult;
    });
    
    console.log(`結構: ${JSON.stringify(result)}`);
    
    expect(result).toHaveProperty('config1');
    expect(result).toHaveProperty('config2');
    expect(typeof result.config1).toBe('number');
    expect(typeof result.config2).toBe('number');
    expect(result.config1).toBeGreaterThan(0);
  });
});
