/**
 * 浮點數精度處理函數 - 避免 5.3 顯示成 5.3000000002 或 5.29999999
 * @param {number} num - 要四捨五入的數字
 * @param {number} decimals - 小數位數（默認 10）
 * @returns {number} 精確的浮點數
 */
export const roundNumber = (num, decimals = 10) => {
  if (!Number.isFinite(num)) return num;
  
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(num * multiplier) / multiplier;
  
  // 使用 toFixed 移除末尾的零，然後轉換回數字
  return parseFloat(rounded.toFixed(decimals));
};

/**
 * 三向綁定計算 - 計算配置1、配置2和變動量的關係
 * @param {number} left - 配置1的值
 * @param {number} result - 配置2的值
 * @param {string} changedType - 改變的類型 ('left', 'result', 'middle')
 * @returns {object} 返回更新後的三個值
 */
export const calculateThreeWayBinding = (left, result, middle, changedType) => {
  const leftValue = roundNumber(left || 0);
  const resultValue = roundNumber(result || 0);
  const middleValue = roundNumber(middle || 0);

  if (changedType === 'left') {
    // 配置1改變 → 變動量 = 配置2 - 配置1
    const newMiddle = roundNumber(resultValue - leftValue);
    return { left: leftValue, result: resultValue, middle: newMiddle };
  } else if (changedType === 'result') {
    // 配置2改變 → 變動量 = 配置2 - 配置1
    const newMiddle = roundNumber(resultValue - leftValue);
    return { left: leftValue, result: resultValue, middle: newMiddle };
  } else if (changedType === 'middle') {
    // 變動量改變 → 配置2 = 配置1 + 變動量
    const newResult = roundNumber(leftValue + middleValue);
    return { left: leftValue, result: newResult, middle: middleValue };
  }

  return { left: leftValue, result: resultValue, middle: middleValue };
};
