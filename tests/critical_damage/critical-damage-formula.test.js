import { describe, it, expect } from 'vitest';

/**
 * 致命一擊傷害 新公式測試
 * 公式: 面板 + 150 * (∏[(乘算+100)/100] - 1) + Σ加算
 */
describe('致命一擊傷害 - 新公式計算', () => {
  const roundNumber = (num, decimals = 5) => {
    if (!Number.isFinite(num)) return num;
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.round(num * multiplier) / multiplier;
    return parseFloat(rounded.toFixed(decimals).replace(/\.?0+$/, ''));
  };

  const calculateCriticalDamage = (panel, additives = [], multiplicatives = []) => {
    const additiveSum = additives.reduce((sum, v) => sum + (v || 0), 0);
    const multiplicativeProduct = multiplicatives.length > 0
      ? multiplicatives.reduce((prod, v) => prod * ((v + 100) / 100), 1)
      : 1;
    const result = panel + 150 * (multiplicativeProduct - 1) + additiveSum;
    return roundNumber(result);
  };

  it('基本計算：面板=50，無加算和乘算', () => {
    // 50 + 150 * (1 - 1) + 0 = 50
    const result = calculateCriticalDamage(50, [], []);
    expect(result).toBe(50);
  });

  it('含加算：面板=50，加算=20，無乘算', () => {
    // 50 + 150 * (1 - 1) + 20 = 70
    const result = calculateCriticalDamage(50, [20], []);
    expect(result).toBe(70);
  });

  it('多加算：面板=50，加算=[20, 30]，無乘算', () => {
    // 50 + 150 * (1 - 1) + (20 + 30) = 100
    const result = calculateCriticalDamage(50, [20, 30], []);
    expect(result).toBe(100);
  });

  it('含乘算：面板=50，加算=20，乘算=2', () => {
    // 乘算總乘積: (2+100)/100 = 1.02
    // 50 + 150 * (1.02 - 1) + 20 = 50 + 150 * 0.02 + 20 = 50 + 3 + 20 = 73
    const result = calculateCriticalDamage(50, [20], [2]);
    expect(result).toBe(73);
  });

  it('大乘算值：面板=50，加算=20，乘算=10', () => {
    // 乘算總乘積: (10+100)/100 = 1.1
    // 50 + 150 * (1.1 - 1) + 20 = 50 + 150 * 0.1 + 20 = 50 + 15 + 20 = 85
    const result = calculateCriticalDamage(50, [20], [10]);
    expect(result).toBe(85);
  });

  it('多個乘算值：面板=50，加算=20，乘算=[2, 10]', () => {
    // 乘算總乘積: (2+100)/100 * (10+100)/100 = 1.02 * 1.1 = 1.122
    // 50 + 150 * (1.122 - 1) + 20 = 50 + 150 * 0.122 + 20 = 50 + 18.3 + 20 = 88.3
    const result = calculateCriticalDamage(50, [20], [2, 10]);
    expect(result).toBe(88.3);
  });

  it('複雜組合：面板=100，加算=[50]，乘算=[30, 10]', () => {
    // 乘算總乘積: (30+100)/100 * (10+100)/100 = 1.3 * 1.1 = 1.43
    // 100 + 150 * (1.43 - 1) + 50 = 100 + 150 * 0.43 + 50 = 100 + 64.5 + 50 = 214.5
    const result = calculateCriticalDamage(100, [50], [30, 10]);
    expect(result).toBe(214.5);
  });

  it('加算有0值：面板=50，加算=[20, 0, 10]，無乘算', () => {
    // 應該計算所有值的和，包括0
    // 50 + 150 * (1 - 1) + (20 + 0 + 10) = 80
    const result = calculateCriticalDamage(50, [20, 0, 10], []);
    expect(result).toBe(80);
  });

  it('乘算有0值應被過濾：面板=50，加算=20，乘算=[0, 2]', () => {
    // 0值應被過濾，只計算2
    // 乘算總乘積: (2+100)/100 = 1.02
    // 50 + 150 * (1.02 - 1) + 20 = 73
    const result = calculateCriticalDamage(50, [20], [0, 2]);
    // 預期：與[2]相同，因為0被過濾
    expect(result).toBe(73);
  });

  it('大乘算值組合：面板=100，加算=50，乘算=[30, 30]', () => {
    // 乘算總乘積: (30+100)/100 * (30+100)/100 = 1.3 * 1.3 = 1.69
    // 100 + 150 * (1.69 - 1) + 50 = 100 + 150 * 0.69 + 50 = 253.5
    const result = calculateCriticalDamage(100, [50], [30, 30]);
    expect(result).toBe(253.5);
  });

  it('無面板和加算，只有乘算：面板=0，加算=[]，乘算=2', () => {
    // 0 + 150 * ((2+100)/100 - 1) + 0 = 150 * 0.02 = 3
    const result = calculateCriticalDamage(0, [], [2]);
    expect(result).toBe(3);
  });

  it('資料序列化格式驗證', () => {
    // 格式: panel|additive1,additive2,...|multiplicative1,multiplicative2,...
    const panel = 50;
    const additivesStr = '20,30';
    const multiplicativesStr = '2,10';
    const dataValue = `${panel}|${additivesStr}|${multiplicativesStr}`;
    
    // 解析
    const parts = dataValue.split('|');
    expect(parts[0]).toBe('50');
    expect(parts[1]).toBe('20,30');
    expect(parts[2]).toBe('2,10');
    
    // 驗證能正確重構
    const additives = parts[1].split(',').map(v => parseFloat(v) || 0);
    const multiplicatives = parts[2].split(',').map(v => parseFloat(v) || 0);
    expect(additives).toEqual([20, 30]);
    expect(multiplicatives).toEqual([2, 10]);
  });
});
