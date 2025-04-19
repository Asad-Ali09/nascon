import { config } from "dotenv";
config();

const port = process.env.PORT || 5000;
const morganFormat = ":method :url :status :response-time ms";
const mongoURI = process.env.MONGO_URI || "";
const jwtConfig = {
  secret: process.env.JWT_SECRET || "secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "1d",
};
const googleCredentials = {
  username: process.env.GOOGLE_EMAIL_ACCOUNT || "",
  password: process.env.GOOGLE_EMAIL_PASS || "",
};

export { port, morganFormat, mongoURI, jwtConfig, googleCredentials };
