import { Injectable } from "@nestjs/common";
import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeApp, cert, getApp, getApps, App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

@Injectable()
export class FirebaseService {
  private app: App;

  constructor() {
    const serviceAccount = JSON.parse(
      readFileSync(
        resolve("./src/config/tamkeen-notification-firebase-adminsdk-fbsvc-8d55f4d4a7.json"),
        "utf-8",
      ),
    );

    this.app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert(serviceAccount),
        });
  }

  get messaging() {
    return getMessaging(this.app);
  }
}