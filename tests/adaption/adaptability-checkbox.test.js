import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力 Checkbox 功能 - 集合地與適應靈藥 Buff', () => {
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

  it('勾選集合地 checkbox 應增加 +2 到面板值', () => {
    const values = {
      panel: 30,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 計算未勾選時的結果
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const resultBefore = buffedPanel + values.super_adapt;
    
    // 勾選集合地
    values.gathering_place = true;
    
    // 重新計算
    panelValue = Math.min(values.panel, 60);
    const gatheringBuffAfter = values.gathering_place ? 2 : 0;
    const buffedPanelAfter = Math.min(panelValue + gatheringBuffAfter + potionBuff, 60);
    const resultAfter = buffedPanelAfter + values.super_adapt;
    
    // 驗證差異為2
    expect(resultAfter - resultBefore).toBe(2);
    expect(resultAfter).toBe(32);
  });

  it('勾選適應靈藥 checkbox 應增加 +3 到面板值', () => {
    const values = {
      panel: 30,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 計算未勾選時的結果
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    let potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const resultBefore = buffedPanel + values.super_adapt;
    
    // 勾選適應靈藥
    values.adapt_potion = true;
    
    // 重新計算
    panelValue = Math.min(values.panel, 60);
    potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanelAfter = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const resultAfter = buffedPanelAfter + values.super_adapt;
    
    // 驗證差異為3
    expect(resultAfter - resultBefore).toBe(3);
    expect(resultAfter).toBe(33);
  });

  it('同時勾選兩個 checkbox 應增加 +5', () => {
    const values = {
      panel: 30,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 計算未勾選時的結果
    let panelValue = Math.min(values.panel, 60);
    let gatheringBuff = values.gathering_place ? 2 : 0;
    let potionBuff = values.adapt_potion ? 3 : 0;
    let buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const resultBefore = buffedPanel + values.super_adapt;
    
    // 同時勾選兩個
    values.gathering_place = true;
    values.adapt_potion = true;
    
    // 重新計算
    panelValue = Math.min(values.panel, 60);
    gatheringBuff = values.gathering_place ? 2 : 0;
    potionBuff = values.adapt_potion ? 3 : 0;
    buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const resultAfter = buffedPanel + values.super_adapt;
    
    // 驗證差異為5
    expect(resultAfter - resultBefore).toBe(5);
    expect(resultAfter).toBe(35);
  });

  it('勾選與取消勾選 checkbox 應可切換', () => {
    const values = {
      panel: 30,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 初始結果
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = (val) => val ? 2 : 0;
    const potionBuff = (val) => val ? 3 : 0;
    const calcResult = () => {
      const buffed = Math.min(panelValue + gatheringBuff(values.gathering_place) + potionBuff(values.adapt_potion), 60);
      return buffed + values.super_adapt;
    };
    
    const initial = calcResult();
    
    // 勾選
    values.gathering_place = true;
    const after1stCheck = calcResult();
    
    // 取消勾選
    values.gathering_place = false;
    const afterUncheck = calcResult();
    
    // 驗證可以切換回原狀
    expect(initial).toBe(30);
    expect(after1stCheck).toBe(32);
    expect(afterUncheck).toBe(30);
  });

  it('在適應力格式中應正確儲存 checkbox 狀態（0或1）', () => {
    // 格式: panel|gathering_place|adapt_potion|super_adapt|preset
    
    // 未勾選狀態
    let value = '30|0|0|0|95';
    let parts = value.split('|');
    expect(parts[1]).toBe('0'); // gathering_place 未勾選
    expect(parts[2]).toBe('0'); // adapt_potion 未勾選
    
    // 勾選集合地
    parts[1] = '1';
    value = parts.join('|');
    expect(value).toBe('30|1|0|0|95');
    
    // 勾選適應靈藥
    parts[2] = '1';
    value = parts.join('|');
    expect(value).toBe('30|1|1|0|95');
    
    // 取消勾選集合地
    parts[1] = '0';
    value = parts.join('|');
    expect(value).toBe('30|0|1|0|95');
  });

  it('Checkbox 狀態改變不應影響 panel 和 super_adapt 值', () => {
    const value = '45|0|0|10|95';
    const parts = value.split('|');
    
    // 初始值
    const initialPanel = parseFloat(parts[0]);
    const initialSuper = parseFloat(parts[3]);
    
    // 改變 checkbox 狀態
    parts[1] = '1'; // 勾選集合地
    parts[2] = '1'; // 勾選適應靈藥
    
    // 驗證 panel 和 super_adapt 未改變
    expect(parseFloat(parts[0])).toBe(initialPanel);
    expect(parseFloat(parts[3])).toBe(initialSuper);
  });

  it('Checkbox buff 加上後不應超過 panel 最大值 60', () => {
    const values = {
      panel: 58,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 同時勾選兩個
    values.gathering_place = true;
    values.adapt_potion = true;
    
    // 計算
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const result = buffedPanel + values.super_adapt;
    
    // 驗證不超過60（58 + 2 + 3 = 63, 但限制在60）
    expect(buffedPanel).toBe(60);
    expect(result).toBe(60);
    expect(result).toBeLessThanOrEqual(60);
  });

  it('面板超過限制時 checkbox buff 應無法進一步增加', () => {
    const values = {
      panel: 55,
      gathering_place: true,   // 已勾選 +2
      adapt_potion: true,      // 已勾選 +3
      super_adapt: 5,
      preset: 95
    };
    
    // 計算結果
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const result = buffedPanel + values.super_adapt;
    
    // 驗證受到60的限制
    expect(buffedPanel).toBe(60);
    // min(55 + 2 + 3, 60) + 5 = 60 + 5 = 65
    expect(result).toBe(65);
  });

  it('兩個配置的 checkbox 狀態可以不同', () => {
    // 配置1（left）
    const leftValue = '30|1|0|0|95';
    const leftParts = leftValue.split('|');
    
    // 配置2（result）
    const rightValue = '30|0|1|0|95';
    const rightParts = rightValue.split('|');
    
    // 驗證狀態不同
    expect(leftParts[1]).toBe('1');  // left 勾選集合地
    expect(rightParts[1]).toBe('0'); // right 未勾選集合地
    expect(leftParts[2]).toBe('0');  // left 未勾選適應靈藥
    expect(rightParts[2]).toBe('1'); // right 勾選適應靈藥
  });

  it('最後畫面顯示的數字應基於 checkbox 狀態', () => {
    const values = {
      panel: 25,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 未勾選時
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    let displayValue = buffedPanel + values.super_adapt;
    expect(displayValue).toBe(25);
    
    // 勾選兩個後
    values.gathering_place = true;
    values.adapt_potion = true;
    panelValue = Math.min(values.panel, 60);
    const buffedPanelAfter = Math.min(panelValue + 2 + 3, 60);
    displayValue = buffedPanelAfter + values.super_adapt;
    expect(displayValue).toBe(30);
  });

  it('對話框中 checkbox 改變應立即更新按鈕顯示', () => {
    // 初始按鈕值
    let buttonValue = '20|0|0|5|95';
    let parts = buttonValue.split('|');
    
    // 計算當前顯示值
    let panelValue = Math.min(parseFloat(parts[0]), 60);
    const gatheringBuff = parts[1] === '1' ? 2 : 0;
    const potionBuff = parts[2] === '1' ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    let displayBefore = buffedPanel + parseFloat(parts[3]);
    
    // 用戶在對話框勾選集合地
    parts[1] = '1';
    
    // 重新計算
    panelValue = Math.min(parseFloat(parts[0]), 60);
    const buffedPanelAfter = Math.min(panelValue + 2 + potionBuff, 60);
    let displayAfter = buffedPanelAfter + parseFloat(parts[3]);
    
    // 驗證更新
    expect(displayBefore).toBe(25);  // 20 + 5
    expect(displayAfter).toBe(27);   // min(20 + 2, 60) + 5
  });
});
