import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeLanguageDto, UpdateUserDto } from './dto/update-user.dto';
import type{ HUserDocument } from 'src/common/model/user.model';
import { Translator } from 'src/common/i18n/translator';

@Injectable()
export class UserService {

async changeLanguage(
  user: HUserDocument,
  dto: ChangeLanguageDto,
) {
  user.lang = dto.lang;

  await user.save();

  return {
    message: Translator.user('LANGUAGE_UPDATED', dto.lang),
  };
}


















  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
