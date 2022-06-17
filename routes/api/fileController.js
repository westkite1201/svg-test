const multer = require('multer');
const path = require('path');
let fs = require('fs');
let express = require('express');
let router = express.Router();
const _ = require('lodash');
const mime = require('mime');
/* multiple file Upload example  */
let FILE_ROOT_DIR = process.cwd();
let FILE_FORDER_PATH = '/public/images/';
// 일지 조회 끝

// var storage = multer.diskStorage({
//   // 서버에 저장할 폴더
//   destination: function (req, file, cb) {
//     //storage  생성
//     //console.log('destination', req.headers.name, file)
//     cb(null, 'public/images');
//   },
//   // 서버에 저장할 파일 명
//   filename: function (req, file, cb) {
//     //console.log("file!!!!", file)
//     let name = file.originalname.split('.')[0];
//     name = name.replace('(', '');
//     name = name.replace(')', '');
//     name = name.replace(/\s/gi, '_'); // 위와 같이 모든 공백을 제거
//     console.log('file name ', name);
//     file.uploadedFile = {
//       name: name,
//       ext: file.mimetype.split('/')[1],
//     };
//     cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
//   },
// });
let storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    console.log('dest');
    await userFilePathCheck(req);
    await destFilePathCheck(req);

    const store_dir = FILE_ROOT_DIR + FILE_FORDER_PATH;
    //'/' +
    //req.body.reg_date.substring(0, 8);
    // const store_dir = FILE_ROOT_DIR + '/' + test_user_id + "/" + test_reg_date.substring(0, 8);
    cb(null, store_dir);
  },
  filename: (req, file, cb) => {
    const store_file_name = file.originalname;
    // const store_file_name = file.originalname + '_' + test_reg_date;
    cb(null, store_file_name);
  },
});

let limits = {
  files: 1, // allow only 1 file per request
  fileSize: 1024 * 1024 * 5, // 5 MB (max file size)
};

const fileFilter = function (req, file, cb) {
  console.log('file = ', file);
  // supported image file mimetypes
  const allowedMimes = [
    'image/jpeg',
    'image/pjpeg',
    'image/png',
    'image/gif',
    'image/jpg',
  ];

  if (_.includes(allowedMimes, file.mimetype)) {
    // allow supported image files
    cb(null, true);
  } else {
    // throw error for invalid files
    cb(
      new Error(
        'Invalid file type. Only jpg, png and gif image files are allowed.',
      ),
    );
  }
};

let upload = multer({
  storage: storage,
  limits: limits,
  fileFilter: fileFilter,
});

// const upload = multer({
//   storage: multer.diskStorage({
//     // set a localstorage destination
//     destination: (req, file, cb) => {
//       console.log('req ', file);
//       cb(null, 'public/images/');
//     },
//     // convert a file name
//     filename: (req, file, cb) => {
//       console.log(
//         'new Date().valueOf() + path.extname(file.originalname) ',
//         new Date().valueOf() + path.extname(file.originalname),
//       );
//       cb(null, new Date().valueOf() + path.extname(file.originalname));
//     },
//   }),
// });
// router.post('/uploadFiles', async (req, res, next) => {
//   try {
//     upload(req, res, function (err) {
//       if (err) {
//         return res.json({
//           code: 400,
//           message: 'file upload error',
//           error: err,
//         });
//       } else {
//         console.log('req = ', req);
//         return res.json({
//           status: 200,
//           message: 'file save complete',
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       status: 400,
//       message: 'file upload error',
//       error: error,
//     });
//   }
// });

router.post('/uploadFiles', upload.single('image'), async function (req, res) {
  try {
    let rf = req.file;
    console.log(rf);
    let file_name = rf.originalname;
    let file_path = rf.path;
    let brokerage_idx = 43;

    console.log('req = ', req);
    return res.json({
      status: 200,
      message: 'file save complete',
      data: rf,
    });
  } catch (err) {
    console.log('error', err);
  }
});

function existsAsync(path) {
  return new Promise(function (resolve) {
    fs.exists(path, resolve);
  });
}

function mkdirAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.mkdir(path, { recursive: true }, function (err) {
      if (err) {
        console.log('Error in folder creation');
        return reject(err);
      }
      return resolve(true);
    });
  });
}

// // 유저 별 파일 저장 디렉토리 확인
async function userFilePathCheck(req) {
  try {
    if (_.isEmpty(req.files)) {
      return;
    } else {
      const user_file_path =
        FILE_ROOT_DIR + FILE_FORDER_PATH + req.body.user_id;
      // const user_file_path = FILE_ROOT_DIR + '/' + test_user_id;
      /**
       * 현재 해당 아이디랑 날짜에 대한 디렉토리가 있는지 확인해볼 것.
       */
      // console.log("user_file_path ", user_file_path);
      let exist = await existsAsync(user_file_path);
      if (!exist) {
        await mkdirAsync(user_file_path);
      }
      return;
    }
  } catch (error) {
    console.log(error);
    // return res.json({
    //   code: 400,
    //   message: 'userFilePathCheck Error',
    //   error: error,
    // });
  }
}

// // 최종 저장경로 확인
async function destFilePathCheck(req) {
  try {
    if (_.isEmpty(req.files)) {
      return;
    } else {
      const dest_file_path =
        FILE_ROOT_DIR + FILE_FORDER_PATH + req.body.user_id;
      // '/' +
      // req.body.reg_date.substring(0, 8);
      // const dest_file_path = FILE_ROOT_DIR + '/' + test_user_id + '/' + test_reg_date.substring(0, 8);
      /**
       * 현재 해당 아이디랑 날짜에 대한 디렉토리가 있는지 확인해볼 것.
       */
      let exist = await existsAsync(dest_file_path);
      // console.log(exist);
      if (!exist) {
        let mkdir = await mkdirAsync(dest_file_path);
        return;
      }
      return;
    }
  } catch (error) {
    return res.json({
      code: 400,
      message: 'destFilePathCheck Error',
      error: error,
    });
  }
}

// 이미지파일 호스팅 로직
router.get('/image/:filename', function (req, res) {
  let pathDir = FILE_ROOT_DIR + FILE_FORDER_PATH;
  let filename = req.params.filename;
  console.log('filename', pathDir + '/' + filename);
  fs.exists(pathDir + '/' + filename, function (exists) {
    if (exists) {
      if (filename.indexOf('.svg')) {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); //svg+xml 이 부분이 중요
      }
      fs.readFile(pathDir + '/' + filename, function (err, data) {
        res.end(data);
      });
    } else {
      res.end('file is not exists');
    }
  });
});

//해당 디렉터리르 읽고 해당 디렉터리에 ㅣㅇㅆ는
// 파일들을 반호나

router.post('/getImageFilePath', function (req, res) {
  const store_dir = FILE_ROOT_DIR + FILE_FORDER_PATH;
  try {
    let files = fs.readdirSync(store_dir); // 디렉토리를 읽어온다
    //console.log(' files', files);
    return res.json({
      code: 200,
      message: 'success',
      data: {
        files: files,
      },
    });
  } catch (e) {
    console.log('error ', e);
  }
});
//unsplash container 이용할때 사용
//upload photho
router.get('/getImageDownloadToUrl/:url/:id/:userId', async function (
  req,
  res,
) {
  let fs = require('fs'),
    request = require('request');

  let url = req.params.url;
  let path = FILE_ROOT_DIR + FILE_FORDER_PATH + '/' + req.params.id + '.jpg';
  // console.log('url', url);
  // console.log('path ', path);
  try {
    let download = function (url, path, callback) {
      request.head(url, function (err, res, body) {
        // console.log('content-type:', res.headers['content-type']);
        // console.log('content-length:', res.headers['content-length']);
        request(url).pipe(fs.createWriteStream(path)).on('close', callback);
      });
    };

    download(url, path, function () {
      console.log('done');
      res.json({
        message: 'success',
        status: '200',
      });
    });
  } catch (e) {
    res.json({
      message: 'error' + e,
      status: '400',
    });
  }
});
function decodeBase64Image(dataString) {
  let matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

router.post('/save_canvas_image', function (req, res) {
  let imgB64Data = req.body.imgB64Data;
  let author = req.body.author;
  let content = req.body.content;
  let decodedImg = decodeBase64Image(imgB64Data);
  let type = decodedImg.type;
  let extension = mime.getExtension(type);
  var base64Data = imgB64Data.replace(/^data:image\/png;base64,/, '');
  let fileName = content + '_' + author + '.' + extension;
  let path = FILE_ROOT_DIR + FILE_FORDER_PATH + fileName;

  console.log('req.body');
  try {
    require('fs').writeFile(path, base64Data, 'base64', function (err) {
      console.log(err);
    });
    res.json({
      message: 'success',
      status: '200',
    });
  } catch (err) {
    console.error(err);
    res.json({
      message: 'error' + e,
      status: '400',
    });
  }
});

router.post('/delete_file_image', function (req, res) {
  let imageUrlPath = req.body.imageUrlPath;
  let splitPath = imageUrlPath.split('/');
  let imageName = splitPath[splitPath.length - 1];
  let filePath = FILE_ROOT_DIR + FILE_FORDER_PATH + '/' + imageName;

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return console.log('삭제할 수 없는 파일입니다');

    fs.unlink(filePath, (err) => {
      if (err) {
        console.log(err);
        return res.json({
          message: 'error' + err,
          status: 400,
        });
      } else {
        return res.json({
          message: `${filePath} 를 정상적으로 삭제했습니다`,
          status: 200,
        });
      }
    });
  });
});
module.exports = router;
