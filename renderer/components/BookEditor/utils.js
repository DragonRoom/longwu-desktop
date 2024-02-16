// 输入数字，返回格式： XX 万 XXXX 字
export function formatNumber(num) {
  if (num < 10000) {
    return formatNumberWithCommas(num) + ' 字';
  } else {
    return (num / 10000).toFixed(0) + '万 ' + formatNumberWithCommas(num % 10000) + '字';
  }
}

// 给数字加千位符
function formatNumberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

