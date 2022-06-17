const jwt = require('jsonwebtoken');
const util = require('util');
const config = require('./serverConfig');

const async = require('async');

const generateToken = (payload) => {
  try {
    // console.log('---------- auth:generateToken ---------')
    // console.log('req.user => ');
    // console.log(req.user);

    //const expiresIn = 60 * 60 * 24;     // 1 days
    const token = jwt.sign(
      {
        mem_idx: payload.mem_idx,
        mem_username: payload.mem_username,
        mem_email: payload.mem_email,
        gb_cd: payload.gb_cd,
        mem_avater_path: payload.mem_avater_path,
      },
      config.auth.jwt.secret,
      {
        expiresIn: '1d',
      },
    );
    // console.log(token);

    return token;
  } catch (error) {
    return error;
    console.error(error);
  }
};

// Web server & rest api - express-jwt built-in
const verifyToken = (token) => {
  try {
    console.log('---------- auth:verifyToken ---------');
    if (!token) {
      // winstonLogger.log('error', 'verifyToken: not logged in.');
      return res.status(401).json({
        code: 401,
        message: 'verifyToken: not logged in.',
      });
    }

    // verify and decode token
    const verify_info = jwt.verify(
      token,
      config.auth.jwt.secret,
      (err, decoded) => {
        if (err) {
          // winstonLogger.log('error', err);
          return {
            code: 403,
            message: 'verifyToken: error = ' + err,
          };
        } else {
          console.log(decoded);

          // winstonLogger.log('info', 'auth:verifyToken: logged in. decoded = %s', JSON.stringify(decoded));
          return decoded;
        }
      },
    );
    return verify_info;
  } catch (error) {
    // winstonLogger.log('error', error);
  }
};

module.exports = {
  // -------------------------------------------------
  // Web server - Rest api
  // -------------------------------------------------

  generateToken: generateToken,
  verifyToken: verifyToken,
};
