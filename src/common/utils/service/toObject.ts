import { BadRequestException } from "@nestjs/common";
import { Types } from "mongoose";

export const generateToObjectId = (id: string | Types.ObjectId) => {
  if (id instanceof Types.ObjectId) return id;

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException("Invalid ID format");
  }

  return new Types.ObjectId(id);
};