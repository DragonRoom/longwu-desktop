import { debounce } from 'lodash-es';
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
  maxWait?: number,
) {
  // 使用 useRef 来存储最新的 fn 引用
  const funcRef = useRef<T | null>(null);

  // 每当 fn 改变时，更新 ref
  funcRef.current = fn;

  // 使用 useCallback 来缓存防抖函数
  return useCallback(
    debounce(
      (...args: Parameters<T>) => {
        // 在防抖函数内部调用最新的 fn
        if (funcRef.current) {
          funcRef.current(...args);
        }
      },
      ms,
      { maxWait },
    ),
    // 当 ms 或 maxWait 改变时，重新创建防抖函数
    [ms, maxWait],
  );
}
