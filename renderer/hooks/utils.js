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

