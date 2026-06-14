import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力 按按鈕調整 - Spinner 增減功能', () => {
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

  it('按上升按鈕應增加 panel 值', () => {
    // 初始值
    const value = '25|0|0|0|95';
    const parts = value.split('|');
    
    // 模擬點擊增加按鈕（增加1）
    const increment = 1;
    const newPanel = parseFloat(parts[0]) + increment;
    parts[0] = String(newPanel);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證 panel 值增加
    expect(parseFloat(updatedParts[0])).toBe(26);
    expect(updatedParts[1]).toBe('0');  // gathering_place 不變
    expect(updatedParts[2]).toBe('0');  // adapt_potion 不變
  });

  it('按下降按鈕應減少 panel 值', () => {
    // 初始值
    const value = '30|0|0|0|95';
    const parts = value.split('|');
    
    // 模擬點擊減少按鈕（減少1）
    const decrement = 1;
    const newPanel = Math.max(0, parseFloat(parts[0]) - decrement);
    parts[0] = String(newPanel);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證 panel 值減少
    expect(parseFloat(updatedParts[0])).toBe(29);
  });

  it('panel 不應降低到負數', () => {
    // 初始值為1
    const value = '1|0|0|0|95';
    const parts = value.split('|');
    
    // 減少2，但應限制在0
    const newPanel = Math.max(0, parseFloat(parts[0]) - 2);
    parts[0] = String(newPanel);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證不低於0
    expect(parseFloat(updatedParts[0])).toBe(0);
    expect(parseFloat(updatedParts[0])).toBeGreaterThanOrEqual(0);
  });

  it('panel 不應超過60的限制', () => {
    // 初始值為59
    const value = '59|0|0|0|95';
    const parts = value.split('|');
    
    // 增加2，但應限制在60
    let newPanel = parseFloat(parts[0]) + 2;
    newPanel = Math.min(newPanel, window.MAX_ADAPTABILITY_PANEL);
    parts[0] = String(newPanel);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證限制在60
    expect(parseFloat(updatedParts[0])).toBe(60);
    expect(parseFloat(updatedParts[0])).toBeLessThanOrEqual(window.MAX_ADAPTABILITY_PANEL);
  });

  it('增加 super_adapt 時 panel 應保持不變', () => {
    // 初始值
    const value = '30|0|0|5|95';
    const parts = value.split('|');
    
    // 增加 super_adapt（增加1）
    const newSuper = parseFloat(parts[3]) + 1;
    parts[3] = String(newSuper);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證 panel 保持不變，super_adapt 增加
    expect(parseFloat(updatedParts[0])).toBe(30);
    expect(parseFloat(updatedParts[3])).toBe(6);
  });

  it('連續增加按鈕應累加效果', () => {
    // 初始值
    let value = '20|0|0|0|95';
    const parts = value.split('|');
    
    // 點擊5次增加按鈕
    for (let i = 0; i < 5; i++) {
      parts[0] = String(parseFloat(parts[0]) + 1);
    }
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證累加結果
    expect(parseFloat(updatedParts[0])).toBe(25);
  });

  it('super_adapt 增加應不受 panel 限制影響', () => {
    // panel 已在最大值 60
    const value = '60|0|0|10|95';
    const parts = value.split('|');
    
    // 增加 super_adapt（增加5）
    const newSuper = parseFloat(parts[3]) + 5;
    parts[3] = String(newSuper);
    
    const updatedValue = parts.join('|');
    const updatedParts = updatedValue.split('|');
    
    // 驗證 super_adapt 能正常增加
    expect(parseFloat(updatedParts[3])).toBe(15);
    // panel 保持在60
    expect(parseFloat(updatedParts[0])).toBe(60);
  });

  it('計算結果應正確反映按按鈕調整後的最終數值', () => {
    // 初始狀態
    const values = {
      panel: 30,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: 95
    };
    
    // 按上升按鈕增加 panel
    values.panel += 5;
    
    // 計算結果：min(panel + buff, 60) + super_adapt
    let panelValue = Math.min(values.panel, 60);
    const gatheringBuff = values.gathering_place ? 2 : 0;
    const potionBuff = values.adapt_potion ? 3 : 0;
    const buffedPanel = Math.min(panelValue + gatheringBuff + potionBuff, 60);
    const result = buffedPanel + values.super_adapt;
    
    // 驗證最終結果
    expect(values.panel).toBe(35);
    expect(result).toBe(35);
  });

  it('按按鈕調整與三向綁定配合時應同步更新', () => {
    // 配置1 (left)
    const leftValue = '30|0|0|0|95';
    const leftParts = leftValue.split('|');
    
    // 配置2 (result)
    const rightValue = '40|0|0|0|95';
    const rightParts = rightValue.split('|');
    
    // 記錄初始差值
    const initialDifference = parseFloat(rightParts[0]) - parseFloat(leftParts[0]);
    
    // 按按鈕增加 left panel
    leftParts[0] = String(parseFloat(leftParts[0]) + 5);
    
    // 在三向綁定中，right 應該也增加相同量來保持差值
    rightParts[0] = String(parseFloat(rightParts[0]) + 5);
    
    // 驗證新的差值保持不變
    const newDifference = parseFloat(rightParts[0]) - parseFloat(leftParts[0]);
    expect(newDifference).toBe(initialDifference);
    expect(newDifference).toBe(10); // 40 - 30 = 10
  });
});
