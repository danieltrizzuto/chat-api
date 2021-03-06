export interface EnvironmentVariables {
  env: string;
  port: number;
  jwtSecret: string;
  database: {
    uri: string;
  };
}

export default (): EnvironmentVariables => ({
  env: process.env.NODE_ENV || 'dev',
  port: parseInt(process.env.PORT),

  jwtSecret: process.env.JWT_SECRET,

  database: {
    uri: process.env.MONGO_URI,
  },
});
