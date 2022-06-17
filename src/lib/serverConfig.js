module.exports = {
  endpoint: {
    web: 'http://localhost',
    api: 'http://localhost/api',
  },
  auth: {
    jwt: { secret: process.env.JWT_SECRET },
    cookieOptions: {
      maxAge: 1000 * (60 * 60 * 24),
      httpOnly: false,
    },
  },
};
