/**
 * Global helper functions - client & server
 */
let bcrypt = require('bcrypt-nodejs');
let token = require('./token');
const STATUS_CODE = {
  200: 'success',
  404: 'data not found',
  999: 'etc',
};

const parseCookies = (cookie = '') => {
  console.log('cookie : ', cookie);
  return cookie
    .split(';')
    .map((v) => v.split('='))
    .map(([k, ...vs]) => [k, vs.join('=')])
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});
};

const generateStatus = () => {
  return {
    message: '',
    data: '',
    status: '',
  };
};

const getBcryptSalt = () => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function (err, salt) {
      if (err) reject(err);
      resolve(salt);
    });
  });
};

const getHashedPassword = (password, bcySalt) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, bcySalt, null, function (err, hash) {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
};
function makeReturnData(code, data) {
  return {
    result: code,
    message: STATUS_CODE[code],
    data: data,
  };
}

const bcryptCompare = (password, rows) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, rows[0].mem_password, (err, res) => {
      console.log(res, err);
      if (err) {
        reject(err);
      } else if (res) {
        //성공시
        console.log('bcryptCheck , res', res);
        payload = {
          mem_email: rows[0].mem_email,
          gb_cd: rows[0].mem_gb_cd,
          mem_avater_path: rows[0].mem_avater_path,
          mem_user_name: rows[0].mem_username,
        };
        resolve(token.generateToken(payload));
      } else {
        reject();
      }
    });
  });
};

getPaginatedItems = (items, pageNo, pageSize) => {
  //pageNo = 1 , pageSize = 5
  // => 5( 1 - 1 ) * 5 , 1 * 5
  // =>  0 , 5
  //pageNo = 2 , pageSize = 5
  // => ( 2 -1 ) * 5  , 2 * 5
  // => 5 , 10
  return items.slice((pageNo - 1) * pageSize, pageNo * pageSize);
};

const PAGE_SIZE = 5;
//page는 1부터 시작한다;
const makePaginate = (req, result) => {
  let pageNo = parseInt(req.query.pageNo, 10);
  let pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize, 10)
    : PAGE_SIZE;
  let totalCount = result.length;
  let totalPageCount = Math.ceil(result.length / pageSize) + 1;
  let nextPageNo = pageNo + 1 < totalPageCount ? pageNo + 1 : totalPageCount;
  let isLast = nextPageNo === totalPageCount;

  let meta = {
    pageNo: pageNo,
    pageSize: pageSize,
    totalCount: totalCount,
    totalPageCount: totalPageCount,
    nextPageNo: nextPageNo,
    isLast: isLast,
  };

  const paginatedPosts = getPaginatedItems(result, pageNo, pageSize);
  const json = {
    meta: meta,
    postsList: paginatedPosts,
  };

  return json;
};

const isEmpty = (value) => {
  if (
    value === '' ||
    value === 'undefined' ||
    value === 'null' ||
    value === undefined ||
    value === null ||
    (value !== null && typeof value === 'object' && !Object.keys(value).length)
  ) {
    return true;
  } else {
    return false;
  }
};

// ---------------------------------------------------------
// check apis - login, auth, ...
// ---------------------------------------------------------

const checkLogin = (userId, token) => {
  if (isEmpty(userId)) {
    return false;
  }
  if (isEmpty(token)) {
    return false;
  }

  return true;
};

const checkAuth = (userId) => {
  switch (userId) {
    // admin
    case '000001':
    case '000002':
    case 'msson':
      return true;
    default:
      return false;
  }
};

const checkAdminUrl = (to) => {
  switch (to) {
    case '/admin':
      return true;
    default:
      return false;
  }
};

const checkMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

const checkEmail = (email) => {
  return /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(
    email,
  );
};

const checkReqUserBrowser = (req) => {
  const header = req.get('user-agent').toString();

  if (header.includes('MSIE')) {
    return 'MSIE';
  } else if (header.includes('Chrome')) {
    return 'Chrome';
  } else if (header.includes('Opera')) {
    return 'Opera';
  }
  return 'Firefox';
};
// ---------------------------------------------------------
// check file format
// ---------------------------------------------------------
const isImageFormat = (filename) => {
  return filename.match(/.(jpg|jpeg|png|gif|tiff|bmp)$/i);
};

const checkFileFormat = (filename) => {
  return !filename.match(/.(exe|sh|bat)$/i);
};

// ---------------------------------------------------------
// getHash
// MD5 해쉬를 생성해서 리턴한다. 주로 파일명 해쉬 등에 사용된다.
// ---------------------------------------------------------
const getHash = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(data).digest('hex');
};

// ---------------------------------------------------------
// getRandomInt
//
// min (포함) 과 max (불포함) 사이의 임의 정수를 반환
// ---------------------------------------------------------
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

// ---------------------------------------------------------
// Restful api error code
// ---------------------------------------------------------

const errorCode = {
  empty: {
    code: 101,
    message: 'invalid parameter',
  },
  failure: {
    code: 101,
    message: 'failure',
    error: '',
  },
  socketFailure: {
    code: 101,
    message: 'invalid socket',
  },
};

module.exports = {
  // properties
  errorCode: errorCode,

  // methods
  getHash: getHash,
  getRandomInt: getRandomInt,
  parseCookies: parseCookies,
  isEmpty: isEmpty,
  isImageFormat: isImageFormat,
  checkFileFormat: checkFileFormat,
  checkLogin: checkLogin,
  checkAuth: checkAuth,
  checkAdminUrl: checkAdminUrl,
  checkMobile: checkMobile,
  checkEmail: checkEmail,
  checkReqUserBrowser: checkReqUserBrowser,
  makePaginate: makePaginate,
  generateStatus: generateStatus,
  getBcryptSalt: getBcryptSalt,
  getHashedPassword: getHashedPassword,
  bcryptCompare: bcryptCompare,
  makeReturnData: makeReturnData,
};
