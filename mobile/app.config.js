const DEFAULT_LOCAL_API_URL = 'http://172.20.10.2:8000';
const DEFAULT_PROD_API_URL = 'https://your-production-domain.com';

module.exports = ({ config }) => {
  const APP_ENV = process.env.APP_ENV || 'development';
  const API_URL = process.env.API_URL || (APP_ENV === 'production'
    ? process.env.PROD_API_URL || DEFAULT_PROD_API_URL
    : process.env.LOCAL_API_URL || DEFAULT_LOCAL_API_URL);

  return {
    ...config,
    extra: {
      ...config.extra,
      APP_ENV,
      API_URL,
      LOCAL_API_URL: process.env.LOCAL_API_URL || DEFAULT_LOCAL_API_URL,
      PROD_API_URL: process.env.PROD_API_URL || DEFAULT_PROD_API_URL,
    },
  };
};
