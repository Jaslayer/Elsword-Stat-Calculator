import { describe, it, expect } from 'vitest';
import { roundNumber, calculateThreeWayBinding } from '../src/utils';

describe('roundNumber', () => {
  it('應該正確處理整數', () => {
    expect(roundNumber(5)).toBe(5);
    expect(roundNumber(100)).toBe(100);
  });

  it('應該正確處理浮點數', () => {
    expect(roundNumber(5.5)).toBe(5.5);
    expect(roundNumber(3.14159)).toBe(3.14159);
  });

  it('應該消除浮點數計算產生的精度誤差 - 一直加0.1', () => {
    // 測試累積加0.1時的浮點數誤差處理
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum = roundNumber(sum + 0.1);
    }
    expect(sum).toBe(1);
  });

  it('應該消除浮點數計算產生的精度誤差 - 一直減0.1', () => {
    // 測試累積減0.1時的浮點數誤差處理
    let sum = 1;
    for (let i = 0; i < 10; i++) {
      sum = roundNumber(sum - 0.1);
    }
    expect(sum).toBe(0);
  });

  it('應該尊重小數位數參數', () => {
    expect(roundNumber(3.14159, 2)).toBe(3.14);
    expect(roundNumber(3.14159, 3)).toBe(3.142);
    expect(roundNumber(3.14159, 5)).toBe(3.14159);
  });

  it('應該在需要時進行四捨五入', () => {
    expect(roundNumber(3.14159, 2)).toBe(3.14);
    expect(roundNumber(2.5, 0)).toBe(3); // Math.round 的標準行為
  });

  it('應該處理負數', () => {
    expect(roundNumber(-5.5)).toBe(-5.5);
    expect(roundNumber(-0.1 - 0.2)).toBe(-0.3);
  });

  it('應該處理非有限數值', () => {
    expect(roundNumber(Infinity)).toBe(Infinity);
    expect(roundNumber(-Infinity)).toBe(-Infinity);
    expect(Number.isNaN(roundNumber(NaN))).toBe(true);
  });

  it('應該處理零', () => {
    expect(roundNumber(0)).toBe(0);
    expect(roundNumber(-0)).toBe(0);
  });
});

describe('calculateThreeWayBinding', () => {
  it('配置1改變時，應該計算正確的變動量', () => {
    const result = calculateThreeWayBinding(100, 150, 0, 'left');
    expect(result.left).toBe(100);
    expect(result.result).toBe(150);
    expect(result.middle).toBe(50);
  });

  it('配置2改變時，應該計算正確的變動量', () => {
    const result = calculateThreeWayBinding(100, 120, 0, 'result');
    expect(result.left).toBe(100);
    expect(result.result).toBe(120);
    expect(result.middle).toBe(20);
  });

  it('變動量改變時，應該計算正確的配置2', () => {
    const result = calculateThreeWayBinding(100, 0, 25, 'middle');
    expect(result.left).toBe(100);
    expect(result.result).toBe(125);
    expect(result.middle).toBe(25);
  });

  it('應該處理負數變動量', () => {
    const result = calculateThreeWayBinding(150, 0, -25, 'middle');
    expect(result.left).toBe(150);
    expect(result.result).toBe(125);
    expect(result.middle).toBe(-25);
  });

  it('應該處理零值', () => {
    const result = calculateThreeWayBinding(0, 100, 0, 'left');
    expect(result.left).toBe(0);
    expect(result.result).toBe(100);
    expect(result.middle).toBe(100);
  });

  it('應該處理 null/undefined 值', () => {
    const result = calculateThreeWayBinding(null, undefined, 50, 'middle');
    expect(result.left).toBe(0);
    expect(result.result).toBe(50);
    expect(result.middle).toBe(50);
  });

  it('應該應用 roundNumber 的精度處理', () => {
    const result = calculateThreeWayBinding(0.1 + 0.2, 0.4, 0, 'left');
    expect(result.middle).toBe(0.1); // 應該是 0.1，而不是 0.09999...
  });
});
