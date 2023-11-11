const fs = require('fs').promises;
import path from 'path'

export async function writeMetaJson(metaJsonPath, metaJson) {
  await fs.writeFile(path.join(metaJsonPath, 'meta.json'), JSON.stringify(metaJson), 'utf-8');
}

export async function readMetaJson(metaJsonPath) {
  let metaJson = await fs.readFile(path.join(metaJsonPath, 'meta.json'), 'utf-8');
  return JSON.parse(metaJson);
}

export async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
  } catch (error) {
    // 如果目录不存在，则创建它
    await fs.mkdir(directoryPath, { recursive: true });
    console.log('目录已创建成功');
  }
}

export async function checkDirectoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
    return true;
  } catch (error) {
    return false
  }
}

export function listSubdirectories(directoryPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, { withFileTypes: true }, (error, entries) => {
      if (error) {
        reject(error);
      } else {
        // 使用 filter 筛选出是目录的条目，并获取它们的名称
        const subdirectories = entries
          .filter(entry => entry.isDirectory())
          .map(dir => path.join(directoryPath, dir.name));
        resolve(subdirectories);
      }
    });
  });
}

