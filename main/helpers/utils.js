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

export async function writeOutlineJson(outlineJsonPath, outlineJson) {
  await fs.writeFile(path.join(outlineJsonPath, 'outline.json'), JSON.stringify(outlineJson), 'utf-8');
}

export async function readOutlineJson(outlineJsonPath) {
  let outlineJson = await fs.readFile(path.join(outlineJsonPath, 'outline.json'), 'utf-8');
  return JSON.parse(outlineJson);
}

export async function writeWordCountJson(wordCountJsonPath, wordCountJson) {
  await fs.writeFile(path.join(wordCountJsonPath, 'word-count.json'), JSON.stringify(wordCountJson), 'utf-8');
}

export async function readWordCountJson(wordCountJsonPath) {
  let wordCountJson = await fs.readFile(path.join(wordCountJsonPath, 'word-count.json'), 'utf-8');
  return JSON.parse(wordCountJson);
}

export async function writeCardJson(cardJsonPathName, cardJson) {
  await fs.writeFile(cardJsonPathName, JSON.stringify(cardJson), 'utf-8');
}

export async function readCardJson(cardJsonPathName) {
  let cardJson = await fs.readFile(cardJsonPathName, 'utf-8');
  return JSON.parse(cardJson);
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

export async function removeFile(filePath) {
  try {
    await fs.rm(filePath);
  } catch (error) {
    console.log(error);
  }
}

// pack directory to zip file
export async function packDirectory(directoryPath, zipFilePath) {
  const archiver = require('archiver');
  const fs = require('fs');
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

export async function packToTxtFile(bookPath, txtPath) {
  // get title from meta.json
  let meta = await fs.readFile(bookPath + '/meta.json');
  meta = JSON.parse(meta);
  let lines = [];

  let title = meta.title;
  lines.push(title);
  lines.push('\n\n');
  console.log('title:', title);
  const MAX = 1000000;
  // for each volume
  for(let i=1; i<MAX; i++) {
    let volumePath = bookPath + '/' + i;
    let volumeExists = await checkDirectoryExists(volumePath);
    if (!volumeExists) {
      break;
    }
    // read volume title from meta.json
    let volumeMeta = await fs.readFile(volumePath + '/meta.json');
    volumeMeta = JSON.parse(volumeMeta);
    let volumeTitle = volumeMeta.title;
    console.log('volumeTitle:', volumeTitle);
    lines.push('\n\n');
    lines.push(volumeTitle);
    lines.push('\n\n');

    // for each chapter
    for(let j=1; j<MAX; j++) {
      let chapterPath = volumePath + '/' + j;
      let chapterExists = await checkDirectoryExists(chapterPath);
      if (!chapterExists) {
        break;
      }
      // read chapter title from meta.json
      let chapterMeta = await fs.readFile(chapterPath + '/meta.json');
      chapterMeta = JSON.parse(chapterMeta);
      let chapterTitle = chapterMeta.title;
      console.log('chapterTitle:', chapterTitle);
      lines.push('\n\n');
      lines.push(chapterTitle);
      lines.push('\n\n');

      let chapterContent = await fs.readFile(chapterPath + '/content.json');
      chapterContent = JSON.parse(chapterContent);
      let text = extractText(chapterContent.root);
      lines.push(text);
    }
  }
  let txt = lines.join('');
  await fs.writeFile(txtPath, txt);
  console.log('done');
}

function extractText(node) {
  let textContent = '';

  if (node.type === 'text') {
    // 如果是文本节点，直接返回文本内容
    return node.text;
  } else if (node.children && node.children.length) {
    // 如果节点有子节点，递归处理每个子节点
    node.children.forEach(child => {
      textContent += extractText(child);
      textContent += "\n";
    });
  }

  return textContent;
}
