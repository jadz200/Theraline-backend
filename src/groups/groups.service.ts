import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MsgDto } from 'src/common/dto/msg.dto';
import { CreateConvoDto } from './dto/create_group.dto';
import { CreateGroupDto } from './dto/create_group.dto copy';
import { Group, GroupDocument } from './schema/group.schema';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}
  async create_convo(dto: CreateConvoDto): Promise<MsgDto> {
    const time = Date.now();
    await this.groupModel.create({
      users: dto.users_id,
      groupType: 'PRIVATE',
      created_at: time,
    });

    return { msg: 'Created convo' };
  }
  async create_group(dto: CreateGroupDto): Promise<MsgDto> {
    const time = Date.now();
    await this.groupModel.create({
      users: dto.users_id,
      groupType: 'PUBLIC',
      created_at: time,
      name: dto.name,
    });

    return { msg: 'Created Group' };
  }
}
