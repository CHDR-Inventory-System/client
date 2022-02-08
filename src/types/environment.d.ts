// Small hack to enable intellisense when typing out 'process.env'
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      DEBUG_API_URL: string;
      PROD_API_URL: string;
    }
  }
}

export {};
