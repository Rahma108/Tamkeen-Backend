import { Injectable } from "@nestjs/common";
import { Types } from "mongoose";
import { NotificationType } from "src/common/enum/notification.enum";
import { NotificationRepository } from "src/common/repository";
import { FirebaseService } from "./firebase.service";

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly firebaseService: FirebaseService,
  ) {}

  // ===========================
  // Push Notification
  // ===========================

  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: {
      title: string;
      body: string;
    };
  }) {
    return await this.firebaseService.messaging.send({
      token,
      notification: {
        title: data.title,
        body: data.body,
      },
    });
  }

  async sendMultipleNotification({
    tokens,
    data,
  }: {
    tokens: string[];
    data: {
      title: string;
      body: string;
    };
  }) {
    return await Promise.allSettled(
      tokens.map((token) =>
        this.sendNotification({
          token,
          data,
        }),
      ),
    );
  }

  // ===========================
  // Database
  // ===========================

  async createNotification({
    userId,
    type,
    title,
    body,
    image,
    data,
  }: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    image?: string;
    data?: Record<string, any>;
  }) {
    return await this.notificationRepository.create({
      data: {
        userId: new Types.ObjectId(userId),
        type,
        title,
        body,
        image,
        data,
      },
    });
  }

  async getUserNotifications(userId: string) {
    return await this.notificationRepository.find({
      filter: {
        userId: new Types.ObjectId(userId),
      },
      options: {
        sort: {
          createdAt: -1,
        },
      },
    });
  }

  async getUnreadCount(userId: string) {
    return await this.notificationRepository.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(id: string) {
    return await this.notificationRepository.findByAndUpdate({
      _id: new Types.ObjectId(id),
      update: {
        isRead: true,
        readAt: new Date(),
      },
      options: {
        new: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    return await this.notificationRepository.updateMany({
      filter: {
        userId: new Types.ObjectId(userId),
        isRead: false,
      },
      update: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async softDeleteNotification(id: string) {
    return await this.notificationRepository.findByAndUpdate({
      _id: new Types.ObjectId(id),
      update: {
        deletedAt: new Date(),
      },
      options: {
        new: true,
      },
    });
  }

  async restoreNotification(id: string) {
    return await this.notificationRepository.findByAndUpdate({
      _id: new Types.ObjectId(id),
      update: {
        restoredAt: new Date(),
        $unset: {
          deletedAt: 1,
        },
      },
      options: {
        new: true,
      },
    });
  }

  async hardDeleteNotification(id: string) {
    return await this.notificationRepository.findByIdAndDelete({
      _id: new Types.ObjectId(id),
    });
  }

  async deleteAllNotifications(userId: string) {
    return await this.notificationRepository.deleteMany({
      filter: {
        userId: new Types.ObjectId(userId),
      },
    });
  }
}