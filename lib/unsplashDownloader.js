const fs = require('fs');
const request = require('request');
const _ = require('lodash');
const appRoot = require('app-root-path');
const path = require('path');
const imageDao = require('../model/mysql/imageDao');
//const imageDatas = unsplashImageData.unsplashImageData.slice(1, 10);
const FILE_ROOT_DIR = appRoot.path;
const FILE_FORDER_PATH = '/public/images/';

let OPTIONS = {
  url: null,
  qs: null,
  method: 'GET',
  timeout: 10000,
  followRedirect: true,
  maxRedirects: 10,
};

function timeSleep(interval) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, interval);
  });
}

async function download(url, path) {
  return new Promise((resolve) => {
    fs.access(path, fs.F_OK, (err) => {
      if (err) {
        OPTIONS.url = url;
        const is = request(OPTIONS);
        const os = fs.createWriteStream(path);
        is.pipe(os);
        os.on(
          'close',
          () => console.log('download is success!!'),
          resolve(true),
        );
      } else {
        //file exists
        console.log('file is already Exist, not download');
        resolve(false);
      }
    });
  });
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function downloader() {
  const query = '';
  const data = {
    query: _.isNil(query) ? '' : query,
  };
  const imagesSearchResponse = await imageDao.searchImageData(data);
  const imageDatas = imagesSearchResponse;
  for await (let imageData of imageDatas) {
    const url = imageData.url_regular;
    const path = FILE_ROOT_DIR + FILE_FORDER_PATH + '/' + imageData.id + '.jpg';
    console.log('/-----download start-----/');
    console.log('/-image Id= ' + imageData.id + '--/');
    const res = await download(url, path);
    console.log('res = ', res);
    if (res) {
      await timeSleep(rand(2000, 5000));
    }
    console.log('/                      /');
    console.log('/-----download end-----/');
    console.log('');
    console.log('');
    console.log('');
  }
  return;
}

downloader();
return;
