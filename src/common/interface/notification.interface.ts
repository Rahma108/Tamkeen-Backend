import { Types } from "mongoose";
import { NotificationType } from "../enum/notification.enum";
export interface INotification{
    userId: Types.ObjectId;
    type: NotificationType;
    title: string;

    body: string;

    isRead: boolean;

    readAt?: Date;

    image?: string;

    data?: Record<string, any>;

    createdAt?: Date;

    updatedAt?: Date;

    deletedAt?: Date;

    restoredAt?: Date;
}