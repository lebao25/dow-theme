const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');
const JSZip = require('jszip');
const url = require('url');
const readline = require('readline');
const css = require('css');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getFolderFromExtension(ext) {
  ext = ext.toLowerCase();
  if (ext === '.css') return 'css';
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.bmp'].includes(ext)) return 'images';
  if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'fonts';
  if (['.js', '.mjs'].includes(ext)) return 'js';
  if (['.mp4', '.webm', '.ogg', '.mp3', '.wav'].includes(ext)) return 'media';
  if (['.ico', '.cur'].includes(ext)) return 'icons';
  return 'other';
}

function makeRelativeUrl(absoluteUrl, baseUrl) {
  try {
    const parsedUrl = new URL(absoluteUrl, baseUrl);
    if (parsedUrl.origin === new URL(baseUrl).origin) {
      return parsedUrl.pathname + (parsedUrl.search || '') + (parsedUrl.hash || '');
    }
    return absoluteUrl;
  } catch {
    return absoluteUrl;
  }
}

async function downloadResource(resourceUrl, outputDir, zip, fileSizes = new Map(), downloadedUrls = new Set(), baseUrl) {
  try {
    const parsedUrl = new URL(resourceUrl, baseUrl);
    const resourcePath = parsedUrl.pathname;
    const ext = path.extname(resourcePath).toLowerCase();
    const folder = getFolderFromExtension(ext);
    const relativePath = resourcePath.startsWith('/') ? resourcePath.slice(1) : resourcePath;
    const dir = path.dirname(path.join(outputDir, relativePath));
    await fs.mkdir(dir, { recursive: true });

    const res = await axios.get(parsedUrl.href, { responseType: 'arraybuffer' });
    const fileSize = res.data.length;

    const fileName = path.basename(resourcePath);
    if (fileSizes.has(relativePath)) {
      const existingSize = fileSizes.get(relativePath);
      if (fileSize <= existingSize) {
        console.log(`Skipped: ${relativePath} (smaller or equal size)`);
        return;
      }
    }

    let content = res.data;
    if (folder === 'css') {
      const cssContent = res.data.toString('utf-8');
      const parsed = css.parse(cssContent);
      for (const rule of parsed.stylesheet.rules) {
        if (rule.type === 'rule' || rule.type === 'font-face') {
          (rule.declarations || []).forEach(decl => {
            if (decl.value && decl.value.includes('url(')) {
              decl.value = decl.value.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, p1) => {
                const nestedUrl = new URL(p1, parsedUrl.href).href;
                if (!downloadedUrls.has(nestedUrl)) {
                  downloadResource(nestedUrl, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
                }
                return `url('${makeRelativeUrl(p1, parsedUrl.href)}')`;
              });
            }
          });
        } else if (rule.type === 'import') {
          const importPath = rule.import.replace(/^['"]|['"]$/g, '');
          const importUrl = new URL(importPath, parsedUrl.href).href;
          if (!downloadedUrls.has(importUrl)) {
            downloadResource(importUrl, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
          }
          rule.import = `'${makeRelativeUrl(importPath, parsedUrl.href)}'`;
        }
      }
      content = Buffer.from(css.stringify(parsed));
    }

    await fs.writeFile(path.join(outputDir, relativePath), content);
    zip.file(relativePath, content);
    fileSizes.set(relativePath, fileSize);
    downloadedUrls.add(parsedUrl.href);
    console.log(`Downloaded: ${relativePath} (${fileSize} bytes)`);
  } catch (error) {
    console.error(`Error downloading ${resourceUrl}:`, error.message);
  }
}

async function getAllLinks(websiteUrl) {
  try {
    const response = await axios.get(websiteUrl);
    const $ = cheerio.load(response.data);
    const links = new Set();
    $('a[href]').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        const absoluteUrl = new URL(href, websiteUrl).href;
        if (absoluteUrl.startsWith(websiteUrl)) {
          links.add(absoluteUrl);
        }
      }
    });
    return Array.from(links);
  } catch (error) {
    console.error(`Error fetching links from ${websiteUrl}:`, error.message);
    return [];
  }
}

async function downloadPage(pageUrl, outputDir, zip, fileSizes, downloadedUrls, baseUrl) {
  try {
    const response = await axios.get(pageUrl);
    const $ = cheerio.load(response.data);
    const pagePath = new URL(pageUrl).pathname;
    const fileName = pagePath === '/' ? 'index.html' : (pagePath.endsWith('/') ? path.join(pagePath.slice(1), 'index.html') : pagePath.slice(1) + '.html');
    const dir = path.dirname(path.join(outputDir, fileName));
    await fs.mkdir(dir, { recursive: true });

    $('a[href], link[href], script[src], img[src], source[src], video[src], audio[src]').each((i, el) => {
      const attr = el.tagName === 'script' || el.tagName === 'img' || el.tagName === 'source' || el.tagName === 'video' || el.tagName === 'audio' ? 'src' : 'href';
      const value = $(el).attr(attr);
      if (value) {
        $(el).attr(attr, makeRelativeUrl(value, pageUrl));
      }
    });

    const htmlContent = $.html();
    await fs.writeFile(path.join(outputDir, fileName), htmlContent);
    zip.file(fileName, htmlContent);
    console.log(`Downloaded page: ${fileName}`);

    const cssPromises = $('link[rel="stylesheet"]').map(async (i, el) => {
      const cssUrl = $(el).attr('href');
      if (cssUrl) await downloadResource(new URL(cssUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
    }).get();

    const jsPromises = $('script[src]').map(async (i, el) => {
      const jsUrl = $(el).attr('src');
      if (jsUrl) await downloadResource(new URL(jsUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
    }).get();

    const imgPromises = $('img[src]').map(async (i, el) => {
      const imgUrl = $(el).attr('src');
      if (imgUrl && (imgUrl.match(/\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i))) {
        await downloadResource(new URL(imgUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
      }
    }).get();

    const svgPromises = $('svg').map(async (i, el) => {
      const svgData = $.html(el);
      const fileName = `images/inline-svg-${i}.svg`;
      const dir = path.dirname(path.join(outputDir, fileName));
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(outputDir, fileName), svgData);
      zip.file(fileName, svgData);
      console.log(`Downloaded inline SVG: ${fileName}`);
    }).get();

    const iconPromises = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').map(async (i, el) => {
      const iconUrl = $(el).attr('href');
      if (iconUrl) await downloadResource(new URL(iconUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
    }).get();

    const fontPromises = $('link[href*="font"], style').map(async (i, el) => {
      const href = $(el).attr('href') || $(el).text();
      if (href && (href.match(/\.(woff|woff2|ttf|otf|eot)/i))) {
        const fontUrlMatch = href.match(/url\(['"]?([^'"]+\.(?:woff|woff2|ttf|otf|eot))['"]?\)/);
        const fontUrl = fontUrlMatch ? fontUrlMatch[1] : href;
        if (fontUrl) await downloadResource(new URL(fontUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
      }
    }).get();

    const mediaPromises = $('video[src], audio[src], source[src]').map(async (i, el) => {
      const mediaUrl = $(el).attr('src');
      if (mediaUrl && (mediaUrl.match(/\.(mp4|webm|ogg|mp3|wav)$/i))) {
        await downloadResource(new URL(mediaUrl, pageUrl).href, outputDir, zip, fileSizes, downloadedUrls, baseUrl);
      }
    }).get();

    await Promise.all([...cssPromises, ...jsPromises, ...imgPromises, ...svgPromises, ...iconPromises, ...fontPromises, ...mediaPromises]);
  } catch (error) {
    console.error(`Error downloading page ${pageUrl}:`, error.message);
  }
}

async function downloadTheme() {
  try {
    const websiteUrl = await askQuestion('Enter the website URL (e.g., https://nappay.vn/): ');
    const zipName = await askQuestion('Enter the name for the ZIP file (e.g., theme.zip): ');
    const outputDir = 'downloaded_theme';

    await fs.mkdir(outputDir, { recursive: true });
    const zip = new JSZip();
    const fileSizes = new Map();
    const downloadedUrls = new Set();

    console.log('Fetching links...');
    const links = await getAllLinks(websiteUrl);
    console.log(`Found ${links.length} links, downloading all...`);

    await downloadPage(websiteUrl, outputDir, zip, fileSizes, downloadedUrls, websiteUrl);
    for (const link of links) {
      await downloadPage(link, outputDir, zip, fileSizes, downloadedUrls, websiteUrl);
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    await fs.writeFile(path.join(outputDir, zipName), zipContent);
    console.log(`Theme downloaded and zipped as ${zipName}!`);

    rl.close();
  } catch (error) {
    console.error('Error:', error.message);
    rl.close();
  }
}

downloadTheme();