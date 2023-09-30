import { AES, enc } from "react-native-crypto-js";

export function encrypt(content: string, secret: string) {
  return AES.encrypt(content, secret).toString();
}

export function decrypt(content: string, secret: string) {
  return AES.decrypt(content, secret).toString(enc.Utf8);
}
