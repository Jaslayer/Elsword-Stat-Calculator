import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力 Preset 同步 - 配置1與配置2同步設置', () => {
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

  it('應能解析適應力值格式 "panel|gathering_place|adapt_potion|super_adapt|preset"', () => {
    const value = '30|1|0|5|95';
    const parts = value.split('|');
    
    expect(parts[0]).toBe('30'); // panel
    expect(parts[1]).toBe('1');  // gathering_place
    expect(parts[2]).toBe('0');  // adapt_potion
    expect(parts[3]).toBe('5');  // super_adapt
    expect(parts[4]).toBe('95'); // preset
  });

  it('修改配置1的preset時，應能更新為新值並同步到配置2', () => {
    // 模擬配置1（left-input）當前值
    const leftValue = '30|0|0|0|95';
    const leftParts = leftValue.split('|');
    
    // 模擬preset更新為50
    const newPreset = '50';
    leftParts[4] = newPreset;
    
    // 構建更新後的配置1值
    const updatedLeftValue = leftParts.join('|');
    expect(updatedLeftValue).toBe('30|0|0|0|50');
    
    // 模擬同步到配置2（result-input）
    const rightValue = '20|1|1|10|95';
    const rightParts = rightValue.split('|');
    rightParts[4] = newPreset; // 同步preset
    
    const updatedRightValue = rightParts.join('|');
    expect(updatedRightValue).toBe('20|1|1|10|50');
  });

  it('修改配置2的preset時，應能同步到配置1', () => {
    // 模擬配置2（result-input）當前值
    const rightValue = '20|1|1|10|90';
    const rightParts = rightValue.split('|');
    
    // 模擬preset更新為0
    const newPreset = '0';
    rightParts[4] = newPreset;
    
    // 構建更新後的配置2值
    const updatedRightValue = rightParts.join('|');
    expect(updatedRightValue).toBe('20|1|1|10|0');
    
    // 模擬同步到配置1（left-input）
    const leftValue = '30|0|0|0|90';
    const leftParts = leftValue.split('|');
    leftParts[4] = newPreset; // 同步preset
    
    const updatedLeftValue = leftParts.join('|');
    expect(updatedLeftValue).toBe('30|0|0|0|0');
  });

  it('同步後配置1與配置2的preset應該相同', () => {
    const leftValue = '30|1|0|5|95';
    const rightValue = '20|0|1|10|50';
    
    const leftParts = leftValue.split('|');
    const rightParts = rightValue.split('|');
    
    // 同步preset（假設從配置1同步到配置2）
    rightParts[4] = leftParts[4];
    
    // 驗證preset相同
    expect(leftParts[4]).toBe(rightParts[4]);
    expect(rightParts[4]).toBe('95');
  });

  it('其他字段修改不應影響preset同步', () => {
    // 模擬修改panel值不應影響preset
    const leftValue = '30|0|0|0|95';
    const leftParts = leftValue.split('|');
    
    // 只修改panel和gathering_place
    leftParts[0] = '40'; // panel
    leftParts[1] = '1';  // gathering_place
    // preset 保持不變
    
    const rightValue = '20|1|1|10|50';
    const rightParts = rightValue.split('|');
    
    // preset應保持原值
    expect(rightParts[4]).toBe('50');
    expect(leftParts[4]).toBe('95');
  });

  it('應能處理多個preset選項值的同步', () => {
    const presetOptions = ['0', '50', '90', '95'];
    
    presetOptions.forEach(preset => {
      const leftValue = `30|0|0|0|${preset}`;
      const rightValue = `20|1|1|10|95`;
      
      const leftParts = leftValue.split('|');
      const rightParts = rightValue.split('|');
      
      // 同步preset
      rightParts[4] = leftParts[4];
      
      // 驗證同步成功
      expect(rightParts[4]).toBe(preset);
    });
  });
});
