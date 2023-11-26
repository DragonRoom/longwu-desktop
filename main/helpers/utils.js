const fs = require('fs').promises;
import path from 'path'

export async function writeMetaJson(metaJsonPath, metaJson) {
  await fs.writeFile(path.join(metaJsonPath, 'meta.json'), JSON.stringify(metaJson), 'utf-8');
}

export async function readMetaJson(metaJsonPath) {
  let metaJson = await fs.readFile(path.join(metaJsonPath, 'meta.json'), 'utf-8');
  return JSON.parse(metaJson);
}

export async function writeContentJson(contentJsonPath, contentJson) {
  await fs.writeFile(path.join(contentJsonPath, 'content.json'), JSON.stringify(contentJson), 'utf-8');
}

export async function readContentJson(contentJsonPath) {
  let contentJson = await fs.readFile(path.join(contentJsonPath, 'content.json'), 'utf-8');
  return JSON.parse(contentJson);
}

export async function writeDetailOutlineJson(detailOutlineJsonPath, detailOutlineJson) {
  await fs.writeFile(path.join(detailOutlineJsonPath, 'detail-outline.json'), JSON.stringify(detailOutlineJson), 'utf-8');
}

export async function readDetailOutlineJson(detailOutlineJsonPath) {
  let detailOutlineJson = await fs.readFile(path.join(detailOutlineJsonPath, 'detail-outline.json'), 'utf-8');
  return JSON.parse(detailOutlineJson);
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

// remove directory
export async function removeDirectory(directoryPath) {
  try {
    await fs.rmdir(directoryPath, { recursive: true });
  } catch (error) {
    console.log(error);
  }
}

// pack directory to zip file
export async function packDirectory(directoryPath, zipFilePath) {
  const archiver = require('archiver');
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  archive.pipe(output);
  archive.directory(directoryPath, false);
  await archive.finalize();
}

// unpack zip file to directory
export async function unpackDirectory(zipFilePath, directoryPath) {
  const decompress = require('decompress');
  await decompress(zipFilePath, directoryPath);
}
