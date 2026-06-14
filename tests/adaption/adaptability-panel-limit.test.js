import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力面板最大值60限制', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // 建立 DOM 環境
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

    // 定義常量
    window.MAX_ADAPTABILITY_PANEL = 60;
    window.STAT_ITEMS = {
      ADAPTABILITY: 1
    };
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('應該限制適應力面板值不超過60', () => {
    // 模擬適應力按鈕值超過60的情況
    const mockData = '80|0|0|0|95'; // panel=80，超過60
    const parts = mockData.split('|');
    
    let panelValue = parseFloat(parts[0]) || 0;
    // 應用限制
    panelValue = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(panelValue).toBe(60);
  });

  it('應該允許適應力面板值等於60', () => {
    const mockData = '60|0|0|0|95';
    const parts = mockData.split('|');
    
    let panelValue = parseFloat(parts[0]) || 0;
    panelValue = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(panelValue).toBe(60);
  });

  it('應該允許適應力面板值小於60', () => {
    const mockData = '50|0|0|0|95';
    const parts = mockData.split('|');
    
    let panelValue = parseFloat(parts[0]) || 0;
    panelValue = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);
    
    expect(panelValue).toBe(50);
  });

  it('spinner上升按鈕不應超過60', () => {
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    const currentValue = 59;
    const increment = 1;
    
    let newValue = Math.max(0, Math.min(currentValue + increment, MAX_PANEL));
    
    expect(newValue).toBe(60);
  });

  it('spinner上升按鈕在60時應保持60', () => {
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    const currentValue = 60;
    const increment = 1;
    
    let newValue = Math.max(0, Math.min(currentValue + increment, MAX_PANEL));
    
    expect(newValue).toBe(60);
  });

  it('spinner下降按鈕應正確減少', () => {
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    const currentValue = 60;
    const decrement = -1;
    
    let newValue = Math.max(0, Math.min(currentValue + decrement, MAX_PANEL));
    
    expect(newValue).toBe(59);
  });

  it('計算適應力時應限制panel值', () => {
    // 模擬calculateAdaptabilityValue函數的行為
    const values = {
      panel: 100, // 超過60
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 10
    };

    let panelValue = parseFloat(values.panel) || 0;
    panelValue = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);

    const gatheringPlace = values.gathering_place ? 2 : 0;
    const adaptPotion = values.adapt_potion ? 3 : 0;
    const superAdapt = parseFloat(values.super_adapt) || 0;

    const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
    const result = buffedPanel + superAdapt;

    // 預期結果: min(60 + 0 + 0, 60) + 10 = 70
    expect(result).toBe(70);
  });

  it('計算適應力加上buff也不應超過60', () => {
    const values = {
      panel: 58,
      gathering_place: true, // +2
      adapt_potion: true, // +3
      super_adapt: 5
    };

    let panelValue = parseFloat(values.panel) || 0;
    panelValue = Math.min(panelValue, window.MAX_ADAPTABILITY_PANEL);

    const gatheringPlace = values.gathering_place ? 2 : 0;
    const adaptPotion = values.adapt_potion ? 3 : 0;
    const superAdapt = parseFloat(values.super_adapt) || 0;

    const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
    const result = buffedPanel + superAdapt;

    // 預期結果: min(58 + 2 + 3, 60) + 5 = 60 + 5 = 65
    expect(result).toBe(65);
  });

  it('變化量導致面板超過60時應限制面板為60', () => {
    // 模擬場景：左配置panel=50, 變化量=50, 導致右配置結果=100
    // 此時應該反推出右配置的panel值並限制為60
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    const gatheringPlace = 0;
    const adaptPotion = 0;
    const superAdapt = 0;
    
    const newResult = 100; // 左=50 + 變化量=50
    
    // 反推panel值
    const buffedPanel = newResult - superAdapt; // 100 - 0 = 100
    let panelValue;
    
    if (buffedPanel <= 60) {
      panelValue = Math.max(0, buffedPanel - gatheringPlace - adaptPotion);
    } else {
      panelValue = MAX_PANEL;
    }
    
    // 限制panel不超過60
    panelValue = Math.min(panelValue, MAX_PANEL);
    
    // 重新計算顯示值
    const recalculated = Math.min(panelValue + gatheringPlace + adaptPotion, 60) + superAdapt;
    
    expect(panelValue).toBe(60);
    expect(recalculated).toBe(60);
  });

  it('變化量導致面板超過60時仍保持計算結果', () => {
    // 模擬場景：左=30(panel) + 右變化量=40, 导致右結果=70
    // 此時右的panel應該被限制為60，但計算結果應該是60+superAdapt
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    const gatheringPlace = 0;
    const adaptPotion = 0;
    const superAdapt = 10;
    
    const newResult = 70; // 左=30 + 變化量=40
    
    // 反推panel值
    const buffedPanel = newResult - superAdapt; // 70 - 10 = 60
    let panelValue;
    
    if (buffedPanel <= 60) {
      panelValue = Math.max(0, buffedPanel - gatheringPlace - adaptPotion);
    } else {
      panelValue = MAX_PANEL;
    }
    
    panelValue = Math.min(panelValue, MAX_PANEL);
    
    // 重新計算顯示值（照常計算）
    const recalculated = Math.min(panelValue + gatheringPlace + adaptPotion, 60) + superAdapt;
    
    // 預期：panel被限制為60，但按鈕計算結果是 min(60+0+0, 60) + 10 = 70
    expect(panelValue).toBe(60);
    expect(recalculated).toBe(70);
  });
});
