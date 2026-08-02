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


