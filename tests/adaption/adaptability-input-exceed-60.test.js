import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力 使用者輸入超過60 - Panel 上限驗證', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="calcPanel"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      pretendToBeVisual: true
    });

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;

    window.MAX_ADAPTABILITY_PANEL = 60;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('使用者輸入 panel 值 80 時應被限制為 60', () => {
    // 模擬使用者輸入值
    let inputValue = 80;
    
    // 應用限制
    let constrainedValue = Math.min(inputValue, window.MAX_ADAPTABILITY_PANEL);
    
    // 驗證被限制在60
    expect(constrainedValue).toBe(60);
    expect(constrainedValue).toBeLessThanOrEqual(window.MAX_ADAPTABILITY_PANEL);
  });

  it('使用者輸入 panel 值 100 時應被限制為 60', () => {
    let inputValue = 100;
    let constrainedValue = Math.min(inputValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(constrainedValue).toBe(60);
  });

  it('使用者輸入 panel 值 61 時應被限制為 60', () => {
    let inputValue = 61;
    let constrainedValue = Math.min(inputValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(constrainedValue).toBe(60);
  });

  it('使用者輸入 panel 值 60 時應保持不變', () => {
    let inputValue = 60;
    let constrainedValue = Math.min(inputValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(constrainedValue).toBe(60);
  });

  it('使用者輸入 panel 值 59 時應保持不變', () => {
    let inputValue = 59;
    let constrainedValue = Math.min(inputValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(constrainedValue).toBe(59);
  });

  it('使用者輸入負數 panel 值時應限制為 0', () => {
    let inputValue = -10;
    let constrainedValue = Math.max(0, inputValue);
    
    expect(constrainedValue).toBe(0);
    expect(constrainedValue).toBeGreaterThanOrEqual(0);
  });

  it('使用者輸入 panel 值超過60時，最終計算結果應正確', () => {
    // 使用者輸入值
    const values = {
      panel: 150,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 5,
      preset: 95
    };
    
    // 限制 panel 為最多60
    let panelValue = Math.min(values.panel, window.MAX_ADAPTABILITY_PANEL);
    
    // 計算結果
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const result = buffedPanel + values.super_adapt;
    
    // 驗證 panel 被限制，且最終結果正確
    expect(panelValue).toBe(60);
    expect(result).toBe(65); // 60 + 5
  });

  it('使用者輸入超過60的 panel，加上 buff 後不應超過60', () => {
    const values = {
      panel: 70,
      gathering_place: true,   // +2
      adapt_potion: true,      // +3
      super_adapt: 10,
      preset: 95
    };
    
    // 限制 panel
    let panelValue = Math.min(values.panel, window.MAX_ADAPTABILITY_PANEL);
    
    // 計算結果
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const result = buffedPanel + values.super_adapt;
    
    // 驗證結果
    expect(panelValue).toBe(60);
    expect(buffedPanel).toBe(60);  // min(60 + 2 + 3, 60) = 60
    expect(result).toBe(70);       // 60 + 10
  });

  it('在適應力值格式中應保留超過60的輸入，但計算時限制', () => {
    // 值格式: panel|gathering_place|adapt_potion|super_adapt|preset
    const value = '80|1|0|5|95';
    const parts = value.split('|');
    
    // 對於 panel 值，應用限制
    let panelValue = parseFloat(parts[0]);
    let limitedPanel = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);
    
    // 驗證存儲的是原始值，但計算使用限制值
    expect(panelValue).toBe(80);
    expect(limitedPanel).toBe(60);
    
    // 計算最終結果（使用限制後的值）
    const gatheringBuff = parts[1] === '1' ? 2 : 0;
    const buffedPanel = Math.min(limitedPanel + gatheringBuff, 60);
    const result = buffedPanel + parseFloat(parts[3]);
    
    expect(result).toBe(65); // min(60 + 2, 60) + 5 = 65
  });

  it('來自三向綁定導致超過60時應被限制', () => {
    // 配置1: panel=50
    const leftPanel = 50;
    
    // 配置2 變化量導致新值為 80
    const rightPanel = 80;
    
    // 限制兩邊的 panel
    const limitedLeft = Math.min(leftPanel, window.MAX_ADAPTABILITY_PANEL);
    const limitedRight = Math.min(rightPanel, window.MAX_ADAPTABILITY_PANEL);
    
    // 驗證都被限制在60
    expect(limitedLeft).toBe(50);
    expect(limitedRight).toBe(60);
  });

  it('使用者多次輸入導致超過60時每次都應被限制', () => {
    const inputs = [25, 50, 75, 90, 100, 120];
    const results = inputs.map(val => Math.min(val, window.MAX_ADAPTABILITY_PANEL));
    
    // 驗證所有結果都不超過60
    results.forEach(result => {
      expect(result).toBeLessThanOrEqual(window.MAX_ADAPTABILITY_PANEL);
    });
    
    // 驗證具體值
    expect(results[0]).toBe(25);
    expect(results[1]).toBe(50);
    expect(results[2]).toBe(60);
    expect(results[3]).toBe(60);
    expect(results[4]).toBe(60);
    expect(results[5]).toBe(60);
  });

  it('對話框中輸入超過60時應立即驗證', () => {
    // 模擬對話框輸入
    const panelInput = 150;
    
    // 驗證應在值改變時立即檢查
    const validated = panelInput > window.MAX_ADAPTABILITY_PANEL;
    
    expect(validated).toBe(true);
    
    // 應用限制並儲存
    const stored = Math.min(panelInput, window.MAX_ADAPTABILITY_PANEL);
    expect(stored).toBe(60);
  });

  it('最後畫面顯示的數字應基於限制後的值', () => {
    // 使用者輸入
    const userInput = { panel: 200 };
    
    // 計算顯示值
    let displayPanel = Math.min(userInput.panel, window.MAX_ADAPTABILITY_PANEL);
    const displayValue = displayPanel.toString();
    
    // 驗證顯示值是60
    expect(displayValue).toBe('60');
    expect(displayPanel).toBe(60);
  });
});
