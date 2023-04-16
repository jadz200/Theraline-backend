import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message, MessageDocument } from '../messages/schema/message.schema';
import { User, UserDocument } from '../auth/schema/user.schema';

import { Chat, getChatsDto, CreateConvoDto, CreateGroupDto } from './dto/index';
import { Group, GroupDocument } from './schema/group.schema';
import { Appointment, AppointmentDocument } from 'src/appointment/schema';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async get_groups_id(user_id): Promise<string[]> {
    const user = await this.userModel.findOne({ _id: user_id });
    return user.groups;
  }
  async get_all_chats(user_id): Promise<getChatsDto> {
    const user = await this.userModel.findOne({ _id: user_id });

    const user_groups = user.groups;
    const resp: Chat[] = [];
    for (const group of user_groups) {
      const temp = await this.groupModel.findOne({ _id: group });
      let fullName = temp.name;
      let image = temp.image;
      if (temp.groupType.toString() === 'PRIVATE') {
        const otherId = temp.users.find((id) => id !== user_id);
        const temp2 = await this.userModel
          .findOne({ _id: otherId })
          .select('firstName  lastName image');
        fullName = temp2.firstName + ' ' + temp2.lastName;
        image = temp2.image;
      }
      const latestMessage = await this.messageModel.findOne(
        { group_id: temp._id },
        {},
        { created_at: -1 },
      );
      let chat;
      if (latestMessage) {
        chat = {
          _id: temp._id,
          name: fullName,
          groupType: temp.groupType,
          groupImage: image,
          latestMessage: {
            _id: latestMessage._id,
            send_at: latestMessage.send_at,
            user_id: latestMessage.user_id,
            text: latestMessage.text,
          },
        };
      } else {
        chat = {
          _id: temp._id,
          name: fullName,
          groupImage: image,
          groupType: temp.groupType,
        };
      }
      resp.push(chat);
    }
    return { chats: resp };
  }

  async create_convo(dto: CreateConvoDto) {
    if (dto.users_id.length !== 2) {
      throw new BadRequestException('More than 2 users in this conversation');
    }

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

    const set = new Set(dto.users_id);

    if (dto.users_id.length !== set.size) {
      throw new BadRequestException('Duplicate entries');
    }
    if ((await resp) === false) {
      throw new BadRequestException('User does not exists');
    }
    const newGroup = await this.groupModel.create({
      users: dto.users_id,
      groupType: 'GROUP',
      created_at: time,
      name: dto.name,
      image: dto.image,
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
      if (!mongoose.Types.ObjectId.isValid(user_id)) {
        throw new BadRequestException('Id is not in valid format');
      }
      const user_mongoose_id = new mongoose.Types.ObjectId(user_id);
      const user = await this.userModel.exists({ _id: user_mongoose_id });
      if (!user) {
        this.logger.log(`${user_id} does not exist`);
        return false;
      }
    }
    return true;
  }

  async get_users_to_create_chat(user_id) {
    const set = new Set();
    const user = await this.userModel.findOne({ _id: user_id });
    for (const group_id of user.groups) {
      const group = await this.groupModel.findOne({ _id: group_id });
      for (const contact_id of group.users) {
        if (contact_id != user_id && group.groupType.toString() !== 'PRIVATE') {
          const contact = await this.userModel
            .findOne({ _id: contact_id })
            .select('_id firstName lastName email image');
          set.add(contact);
        }
      }
    }
    const jsonData = Array.from(set);
    return { users: jsonData };
  }

  async get_users_to_create_group(doctor_id) {
    const patientIds = await this.appointmentModel.distinct('patient_id', {
      doctor_id: doctor_id,
    });
    const users = [];
    for (const patient_id of patientIds) {
      const patient = await this.userModel
        .findOne({ _id: patient_id })
        .select('_id firstName lastName email image');
      if (!patient) {
        continue;
      }
      users.push(patient);
    }
    return { users };
  }

  async check_user_group_socket(user_id: string, group_id: string) {
    const group = await this.groupModel.findOne({ _id: group_id });
    if (group.users.length == 0) {
      return;
    }
    return group.users.includes(user_id);
  }

  async check_group_valid(group_id: string) {
    if (!mongoose.Types.ObjectId.isValid(group_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    if (!(await this.groupModel.exists({ _id: group_id }))) {
      throw new BadRequestException("Group doesn't exist");
    }
  }
}
