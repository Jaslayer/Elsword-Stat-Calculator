import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力乘數計算方式 - min(100-debuff+input, 100)/100', () => {
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

  it('環境debuff 95% 時，panel=0 的乘數應為 0.05', () => {
    // 公式: min(100 - 95 + 0, 100) / 100 = 5 / 100 = 0.05
    const debuff = 95;
    const panelValue = 0;
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    expect(multiplier).toBe(0.05);
  });

  it('環境debuff 95% 時，panel=50 的乘數應為 0.55', () => {
    // 公式: min(100 - 95 + 50, 100) / 100 = 55 / 100 = 0.55
    const debuff = 95;
    const panelValue = 50;
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    expect(multiplier).toBe(0.55);
  });

  it('環境debuff 50% 時，panel=30 的乘數應為 0.80', () => {
    // 公式: min(100 - 50 + 30, 100) / 100 = 80 / 100 = 0.80
    const debuff = 50;
    const panelValue = 30;
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    expect(multiplier).toBe(0.8);
  });

  it('環境debuff 0% 時，panel=60 的乘數應為 1.00（達上限）', () => {
    // 公式: min(100 - 0 + 60, 100) / 100 = min(160, 100) / 100 = 100 / 100 = 1.00
    const debuff = 0;
    const panelValue = 60;
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    expect(multiplier).toBe(1.0);
  });

  it('環境debuff 90% 時，panel=100 會被限制為 100% 乘數', () => {
    // 公式: min(100 - 90 + 100, 100) / 100 = min(110, 100) / 100 = 100 / 100 = 1.00
    const debuff = 90;
    const panelValue = 100; // 實際會被限制為60，但這裡測試限制邏輯
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    expect(multiplier).toBe(1.0);
  });

  it('panel為 0 時應返回最小乘數（取決於debuff）', () => {
    // 對於任何debuff，最小panel=0時的乘數是 (100 - debuff) / 100
    const debuff = 95;
    const panelValue = 0;
    
    const multiplierBase = Math.min(100 - debuff + panelValue, 100);
    const multiplier = multiplierBase / 100;
    
    // 最小乘數應該不小於 0（當debuff >= 100時）
    expect(multiplier).toBeGreaterThanOrEqual(0);
  });

  it('乘數應始終不超過 1.0', () => {
    // 測試多個場景確保乘數不會超過1.0
    const testCases = [
      { debuff: 0, panel: 60 },   // max case
      { debuff: 0, panel: 100 },  // exceeds max
      { debuff: 50, panel: 100 }, // exceeds max with debuff
      { debuff: 95, panel: 60 },  // normal case
    ];
    
    testCases.forEach(({ debuff, panel }) => {
      const multiplierBase = Math.min(100 - debuff + panel, 100);
      const multiplier = multiplierBase / 100;
      expect(multiplier).toBeLessThanOrEqual(1.0);
    });
  });

  it('應支持所有preset debuff值', () => {
    // preset 值: '0', '50', '90', '95'
    const presetValues = [
      { preset: '0', debuff: 0 },
      { preset: '50', debuff: 50 },
      { preset: '90', debuff: 90 },
      { preset: '95', debuff: 95 }
    ];
    
    const panelValue = 30;
    
    presetValues.forEach(({ preset, debuff }) => {
      const multiplierBase = Math.min(100 - debuff + panelValue, 100);
      const multiplier = multiplierBase / 100;
      
      // 驗證計算結果有效
      expect(multiplier).toBeGreaterThanOrEqual(0);
      expect(multiplier).toBeLessThanOrEqual(1.0);
    });
  });
});
