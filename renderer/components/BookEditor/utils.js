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

export function promisify(fn, ...args) {
  // 返回一个新的Promise对象
  return new Promise((resolve, reject) => {
    // 调用原始函数，并将参数传递给它
    // 添加一个回调函数来处理异步操作的结果
    fn(...args, (ret) => {
      if (ret.success) {
        resolve(ret); // 否则，解决Promise
      } else {
        reject(ret); // 如果有错误，拒绝Promise
      }
    });
  });
}
