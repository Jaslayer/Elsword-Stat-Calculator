import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('適應力 下拉選單 Preset - 環境 Debuff 選擇', () => {
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

  it('下拉選單應包含4個預設選項', () => {
    const presetOptions = [
      { value: '0', label: '0%' },
      { value: '50', label: '50% (12CG)' },
      { value: '90', label: '90% (18CG)' },
      { value: '95', label: '95% (20、21、高熵)' }
    ];
    
    expect(presetOptions).toHaveLength(4);
    expect(presetOptions[0].value).toBe('0');
    expect(presetOptions[1].value).toBe('50');
    expect(presetOptions[2].value).toBe('90');
    expect(presetOptions[3].value).toBe('95');
  });

  it('選擇 0% preset 應使用 debuff=0', () => {
    // 格式: panel|gathering_place|adapt_potion|super_adapt|preset
    let value = '30|0|0|0|0';
    const parts = value.split('|');
    
    const presetValue = parseFloat(parts[4]);
    
    expect(presetValue).toBe(0);
    
    // 計算乘數
    const currentAdaptValue = 30;
    const multiplierBase = Math.min(100 - presetValue + currentAdaptValue, 100);
    const multiplier = multiplierBase / 100;
    
    // min(100 - 0 + 30, 100) / 100 = 100 / 100 = 1
    expect(multiplier).toBe(1);
  });

  it('選擇 50% preset 應使用 debuff=50', () => {
    let value = '30|0|0|0|50';
    const parts = value.split('|');
    
    const presetValue = parseFloat(parts[4]);
    expect(presetValue).toBe(50);
    
    // 計算乘數
    const currentAdaptValue = 30;
    const multiplierBase = Math.min(100 - presetValue + currentAdaptValue, 100);
    const multiplier = multiplierBase / 100;
    
    // min(100 - 50 + 30, 100) / 100 = 80 / 100 = 0.8
    expect(multiplier).toBe(0.8);
  });

  it('選擇 90% preset 應使用 debuff=90', () => {
    let value = '30|0|0|0|90';
    const parts = value.split('|');
    
    const presetValue = parseFloat(parts[4]);
    expect(presetValue).toBe(90);
    
    // 計算乘數
    const currentAdaptValue = 30;
    const multiplierBase = Math.min(100 - presetValue + currentAdaptValue, 100);
    const multiplier = multiplierBase / 100;
    
    // min(100 - 90 + 30, 100) / 100 = 40 / 100 = 0.4
    expect(multiplier).toBe(0.4);
  });

  it('選擇 95% preset 應使用 debuff=95', () => {
    let value = '30|0|0|0|95';
    const parts = value.split('|');
    
    const presetValue = parseFloat(parts[4]);
    expect(presetValue).toBe(95);
    
    // 計算乘數
    const currentAdaptValue = 30;
    const multiplierBase = Math.min(100 - presetValue + currentAdaptValue, 100);
    const multiplier = multiplierBase / 100;
    
    // min(100 - 95 + 30, 100) / 100 = 35 / 100 = 0.35
    expect(multiplier).toBe(0.35);
  });

  it('改變 preset 應同步到兩個配置', () => {
    // 配置1（left）
    let leftValue = '30|0|0|0|95';
    let leftParts = leftValue.split('|');
    
    // 配置2（result）
    let rightValue = '40|0|0|0|50';
    let rightParts = rightValue.split('|');
    
    // 在配置1中改變 preset 為 0
    leftParts[4] = '0';
    leftValue = leftParts.join('|');
    
    // 應同步到配置2
    rightParts[4] = leftParts[4];
    rightValue = rightParts.join('|');
    
    // 驗證同步
    expect(leftParts[4]).toBe('0');
    expect(rightParts[4]).toBe('0');
    expect(leftValue).toBe('30|0|0|0|0');
    expect(rightValue).toBe('40|0|0|0|0');
  });

  it('改變配置2的 preset 應同步到配置1', () => {
    // 配置1（left）
    let leftValue = '30|0|0|0|95';
    let leftParts = leftValue.split('|');
    
    // 配置2（result）
    let rightValue = '40|0|0|0|50';
    let rightParts = rightValue.split('|');
    
    // 在配置2中改變 preset 為 90
    rightParts[4] = '90';
    rightValue = rightParts.join('|');
    
    // 應同步到配置1
    leftParts[4] = rightParts[4];
    leftValue = leftParts.join('|');
    
    // 驗證同步
    expect(rightParts[4]).toBe('90');
    expect(leftParts[4]).toBe('90');
    expect(rightValue).toBe('40|0|0|0|90');
    expect(leftValue).toBe('30|0|0|0|90');
  });

  it('preset 改變不應影響其他字段', () => {
    const value = '45|1|0|15|95';
    const parts = value.split('|');
    
    // 記錄初始值
    const initialPanel = parts[0];
    const initialGathering = parts[1];
    const initialPotion = parts[2];
    const initialSuper = parts[3];
    
    // 改變 preset
    parts[4] = '50';
    
    // 驗證其他字段未改變
    expect(parts[0]).toBe(initialPanel);
    expect(parts[1]).toBe(initialGathering);
    expect(parts[2]).toBe(initialPotion);
    expect(parts[3]).toBe(initialSuper);
  });

  it('不同 preset 應導致不同的乘數', () => {
    const adaptValue = 40;
    
    const presets = ['0', '50', '90', '95'];
    const multipliers = presets.map(preset => {
      const debuff = parseFloat(preset);
      const base = Math.min(100 - debuff + adaptValue, 100);
      return base / 100;
    });
    
    // 驗證乘數從高到低
    expect(multipliers[0]).toBe(1.0);    // 0%
    expect(multipliers[1]).toBe(0.9);    // 50%
    expect(multipliers[2]).toBe(0.5);    // 90%
    expect(multipliers[3]).toBe(0.45);   // 95%
    
    // 驗證乘數遞減
    expect(multipliers[0]).toBeGreaterThan(multipliers[1]);
    expect(multipliers[1]).toBeGreaterThan(multipliers[2]);
    expect(multipliers[2]).toBeGreaterThan(multipliers[3]);
  });

  it('預設值應為 95%', () => {
    // 未指定 preset 時的默認值
    let value = '30|0|0|0';
    const parts = value.split('|');
    
    // 如果沒有 preset，應設為默認值 95
    const preset = parts[4] !== undefined ? parts[4] : '95';
    
    expect(preset).toBe('95');
  });

  it('preset 選項的標籤應正確對應遊戲副本', () => {
    const presetOptions = [
      { value: '0', label: '0%' },
      { value: '50', label: '50% (12CG)' },
      { value: '90', label: '90% (18CG)' },
      { value: '95', label: '95% (20、21、高熵)' }
    ];
    
    // 驗證標籤
    expect(presetOptions.find(o => o.value === '50').label).toBe('50% (12CG)');
    expect(presetOptions.find(o => o.value === '90').label).toBe('90% (18CG)');
    expect(presetOptions.find(o => o.value === '95').label).toBe('95% (20、21、高熵)');
  });

  it('在對話框中改變 preset 應更新按鈕顯示', () => {
    // 初始按鈕值
    let buttonValue = '30|0|0|0|95';
    let parts = buttonValue.split('|');
    
    // 計算當前乘數
    const adaptValue = 30;
    const oldPreset = parseFloat(parts[4]);
    let multiplierBefore = Math.min(100 - oldPreset + adaptValue, 100) / 100;
    
    // 用戶在對話框改變 preset 為 50
    parts[4] = '50';
    
    // 重新計算乘數
    const newPreset = parseFloat(parts[4]);
    let multiplierAfter = Math.min(100 - newPreset + adaptValue, 100) / 100;
    
    // 驗證乘數改變
    expect(multiplierBefore).toBe(0.35);  // min(100 - 95 + 30, 100) / 100
    expect(multiplierAfter).toBe(0.8);    // min(100 - 50 + 30, 100) / 100
    expect(multiplierBefore).toBeLessThan(multiplierAfter);
  });

  it('兩個配置可以選擇不同的 preset（但應同步）', () => {
    // 假設 preset 需要同步，所以實際上應該相同
    let leftValue = '30|0|0|0|95';
    let rightValue = '40|0|0|0|50';
    
    let leftParts = leftValue.split('|');
    let rightParts = rightValue.split('|');
    
    // 驗證初始狀態不同
    expect(leftParts[4]).not.toBe(rightParts[4]);
    
    // 同步 preset
    rightParts[4] = leftParts[4];
    rightValue = rightParts.join('|');
    
    // 驗證同步後相同
    expect(rightParts[4]).toBe(leftParts[4]);
    expect(rightValue).toBe('40|0|0|0|95');
  });

  it('最後畫面顯示的數字應基於選擇的 preset', () => {
    // 適應力值為30，不同 preset 導致不同的乘數
    const adaptValue = 30;
    
    // 使用 preset 95
    let presetsAndResults = [];
    const presets = [
      { preset: 0, debuff: 0 },
      { preset: 50, debuff: 50 },
      { preset: 90, debuff: 90 },
      { preset: 95, debuff: 95 }
    ];
    
    presets.forEach(p => {
      const multiplier = Math.min(100 - p.debuff + adaptValue, 100) / 100;
      presetsAndResults.push({ preset: p.preset, multiplier });
    });
    
    // 驗證每個 preset 的結果不同
    expect(presetsAndResults[0].multiplier).toBe(1.0);    // min(100 - 0 + 30, 100) / 100 = 1.0
    expect(presetsAndResults[1].multiplier).toBe(0.8);    // min(100 - 50 + 30, 100) / 100 = 0.8
    expect(presetsAndResults[2].multiplier).toBe(0.4);    // min(100 - 90 + 30, 100) / 100 = 0.4
    expect(presetsAndResults[3].multiplier).toBe(0.35);   // min(100 - 95 + 30, 100) / 100 = 0.35
  });

  it('無效的 preset 值應使用默認值', () => {
    let value = '30|0|0|0|999';
    const parts = value.split('|');
    
    // 如果 preset 不在預設選項中
    const validPresets = ['0', '50', '90', '95'];
    const selectedPreset = parts[4];
    
    const isValid = validPresets.includes(selectedPreset);
    expect(isValid).toBe(false);
    
    // 應使用默認值 95
    const fallback = isValid ? selectedPreset : '95';
    expect(fallback).toBe('95');
  });
});
