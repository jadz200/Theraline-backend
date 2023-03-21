import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from 'src/auth/schema/user.schema';
import { CreateConvoDto } from './dto/create_convo.dto';
import { CreateGroupDto } from './dto/create_group.dto';
import { Group, GroupDocument } from './schema/group.schema';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async get_all_chats(user_id) {
    const user = await this.userModel.findOne({ _id: user_id });
    return user.groups;
  }

  async create_convo(dto: CreateConvoDto) {
    const time = Date.now();
    const resp = this.check_users(dto.users_id);
    if ((await resp) === false) {
      throw new BadRequestException('User does not exists');
    }

    const checkconv = await this.groupModel.exists({
      $or: [
        {
          groupType: 'PRIVATE',
          users: dto.users_id,
        },
        {
          groupType: 'PRIVATE',
          users: [dto.users_id[1], dto.users_id[0]],
        },
      ],
    });

    if (checkconv) {
      throw new BadRequestException('Conv already exists');
    } else if (dto.users_id[0] == dto.users_id[1]) {
      throw new BadRequestException(
        "You can't create a conversation with yourself ",
      );
    }

    const newConvo = await this.groupModel.create({
      users: dto.users_id,
      groupType: 'PRIVATE',
      created_at: time,
    });
    this.logger.log(`Created convo ${newConvo.id}`);

    for (const user_id of dto.users_id) {
      const user: User = await this.userModel.findOne({ _id: user_id });
      await this.userModel.updateOne(user, { $push: { groups: newConvo.id } });
    }
    this.logger.log(`Added users to convo ${newConvo.id}`);

    return { msg: 'Created convo' };
  }

  async create_group(dto: CreateGroupDto) {
    const time = Date.now();
    const resp = this.check_users(dto.users_id);

    if ((await resp) === false) {
      throw new BadRequestException('User does not exists');
    }

    const newGroup = await this.groupModel.create({
      users: dto.users_id,
      groupType: 'PUBLIC',
      created_at: time,
      name: dto.name,
    });
    this.logger.log(`Created group ${newGroup.id}`);

    for (const user_id of dto.users_id) {
      const user: User = await this.userModel.findOne({ _id: user_id });
      await this.userModel.updateOne(user, { $push: { groups: newGroup.id } });
    }
    this.logger.log(`Added users to group ${newGroup.id}`);

    return { msg: 'Created Group' };
  }

  async check_users(users_id): Promise<boolean> {
    for (const user_id of users_id) {
      const user_mongoose_id = new mongoose.Types.ObjectId(user_id);
      const user = await this.userModel.exists({ _id: user_mongoose_id });
      if (!user) {
        this.logger.log(`${user_id} does not exist`);
        return false;
      }
    }
    return true;
  }

  async check_user_group_socket(user_id: string, group_id: string) {
    const group = await this.groupModel.find({ _id: group_id });
    if (group.length == 0) {
      return;
    }
    return group[0].users.includes(user_id);
  }
}
