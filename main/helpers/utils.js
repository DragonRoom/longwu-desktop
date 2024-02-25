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

async function getPathNonExists(filePath) {
  try {
    console.log('1');
    await fs.access(filePath, fs.constants.F_OK);
    let dir = path.dirname(filePath);
    let ext = path.extname(filePath);
    let name = path.basename(filePath, ext);
    let i = 1;
    let newPath = path.join(dir, name + `(${i})` + ext);
    console.log('2');

    while (true) {
      try {
        await fs.access(newPath, fs.constants.F_OK);
        i++;
        newPath = path.join(dir, name + `(${i})` + ext);
        console.log('4');

      } catch (err) {
        console.log('5');

        return newPath;
      }
    }
  } catch (err) {
    console.log('3');

    return filePath;
  }
}

export async function importTxtFile(title, rootPath, txtPath) {
  let bookPath = await getPathNonExists(path.join(rootPath, title));
  title = path.basename(bookPath, path.extname(bookPath));
  console.log('bookPath:', bookPath);
  // make dir for bookPath 
  await fs.mkdir(bookPath);
  // create meta.json to place book title
  let meta = {
    "title": title,
    "mainCharacter": "",
    "type": "",
    "author": "",
    "intro": "",
    "cover": "/images/cover.png",
    "createTime": Date.now(),
    "updateTime": Date.now(),
  };
  await fs.writeFile(path.join(bookPath, 'meta.json'), JSON.stringify(meta));
  // read each line of txt file to an array
  let txt = await fs.readFile(txtPath, 'utf-8');
  let lines = txt.split('\n');
  // filter empty lines
  lines = lines.filter(line => line.trim() !== '');
  // get all volume lines match with "第x卷xxxx"
  let volumes = [];
  lines.forEach((line, index) => {
    if (line.match(/第\d+卷/)) {
      // push line text into volumes array
      volumes.push({title: line, lineNumber: index});
    }
  });

  console.log('volumes:', volumes);

  // make dir for each volume from 1 to volumes.length
  for(let i=0; i<volumes.length; i++) {
    let volume = volumes[i].title;
    let volumeTitle = volume;
    let volumePath = path.join(bookPath, i+1 + '');
    await fs.mkdir(volumePath);
    // create meta.json to place volume title
    let meta = {
      "title": volumeTitle,
      "createTime": Date.now()
    };
    await fs.writeFile(path.join(volumePath, 'meta.json'), JSON.stringify(meta));

    // find chapters for current volume from volumes[i].lineNumber to volumes[i+1].lineNumber
    let start = volumes[i].lineNumber;
    let end = i === volumes.length - 1 ? lines.length : volumes[i+1].lineNumber;
    let chapterLines = lines.slice(start, end);
    let chapters = [];
    chapterLines.forEach((line, index) => {
      if (line.match(/第\d+章/)) {
        chapters.push({title: line, lineNumber: index + start});
      }
    });
    console.log('chapters:', chapters);
    // make dir for each chapter from 1 to chapters.length
    for(let j=0; j<chapters.length; j++) {
      let chapter = chapters[j].title;
      let chapterTitle = chapter;
      let chapterPath = path.join(volumePath, j+1 + '');
      await fs.mkdir(chapterPath);
      // create meta.json to place chapter title
      let meta = {
        "title": chapterTitle,
        "createTime": Date.now()
      };
      await fs.writeFile(path.join(chapterPath, 'meta.json'), JSON.stringify(meta));
      // create content.json to place chapter content
      let content = {
        "root": {
          "children": [],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "root",
          "version": 1
        }
      };
      // fill each line of chapter content into content.json as children:[] from chapters[j].lineNumber to chapters[j+1].lineNumber
      let start = chapters[j].lineNumber;
      let end = j === chapters.length - 1 ? lines.length : chapters[j+1].lineNumber;
      let chapterContent = lines.slice(start, end);
      chapterContent.forEach(line => {
        content.root.children.push({
          "children": [
            {
              "detail": 0,
              "format": 0,
              "mode": "normal",
              "style": "",
              "text": line,
              "type": "text",
              "version": 1
            }
          ],
          "direction": "ltr",
          "format": "",
          "indent": 0,
          "type": "paragraph",
          "version": 1
        });
      });
      await fs.writeFile(path.join(chapterPath, 'content.json'), JSON.stringify(content));
    }
  }
}

