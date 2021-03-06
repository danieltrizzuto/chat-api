import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { v4 } from 'uuid';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(
    username: string,
    passwordHash: string,
  ): Promise<LeanDocument<UserDocument>> {
    const user = await this.userModel.create({
      _id: v4(),
      username,
      passwordHash,
    });
    return user.toObject();
  }

  async findOne(
    query: FilterQuery<UserDocument>,
  ): Promise<LeanDocument<UserDocument> | undefined> {
    const user = await this.userModel.findOne(query);
    return user.toObject();
  }
}
