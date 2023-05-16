import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message, MessageDocument } from '../messages/schema/message.schema';
import { User, UserDocument } from '../auth/schema/user.schema';

import { Chat, CreateConvoDto, CreateGroupDto } from './dto/index';
import { Group, GroupDocument } from './schema/group.schema';
import { Appointment, AppointmentDocument } from '../appointment/schema';

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

  async get_groups_id(userId): Promise<string[]> {
    const user = await this.userModel.findOne({ _id: userId });
    return user.groups;
  }

  async get_all_chats(userId): Promise<Chat[]> {
    const user = await this.userModel.findOne({ _id: userId });

    const userGroups = user.groups;
    console.log(userGroups);
    const resp = Promise.all(
      userGroups.map(async (group) => {
        const temp = await this.groupModel.findOne({ _id: group });
        let fullName = temp.name;
        let { image } = temp;
        if (temp.groupType.toString() === 'PRIVATE') {
          const otherId = temp.users.find((id) => id !== userId);
          const temp2 = await this.userModel
            .findOne({ _id: otherId })
            .select('firstName lastName image');
          fullName = `${temp2.firstName} ${temp2.lastName}`;
          image = temp2.image;
        }
        const latestMessagePromise = this.messageModel
          .findOne({ group_id: temp._id })
          .sort({ send_at: -1 })
          .limit(1);
        return Promise.all([latestMessagePromise]).then(([latestMessage]) => {
          let chat;
          if (latestMessage) {
            chat = {
              _id: temp._id,
              name: fullName,
              groupType: temp.groupType,
              groupImage: image,
              created_at: temp.created_at,
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
              created_at: temp.created_at,
              latestMessage: null,
            };
          }
          return chat;
        });
      }),
    );
    this.logger.log(`Got all chats for ${userId}`);
    (await resp).sort(function (a, b) {
      // First, handle pinned chats

      // If both have same pinned and unread, compare by 'send_at' within 'latestMessage'
      if (a.latestMessage && b.latestMessage) {
        if (a.latestMessage.send_at < b.latestMessage.send_at) {
          return 1; // sort by most recent message timestamp
          // eslint-disable-next-line no-else-return
        } else if (a.latestMessage.send_at > b.latestMessage.send_at) {
          return -1;
        }
      }

      // If both 'created_at', 'send_at' and 'name' are equal, return 0
      return 0;
    });

    return resp;
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
      throw new BadRequestException('Conversation already exists');
    } else if (dto.users_id[0] === dto.users_id[1]) {
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

    await Promise.all(
      dto.users_id.map(async (user_id) => {
        await this.userModel.updateOne(
          { _id: user_id },
          {
            $push: { groups: newConvo._id },
          },
        );
      }),
    );
    this.logger.log(`Added users to convo ${newConvo.id}`);

    return { msg: 'Created convo' };
  }

  async create_group(dto: CreateGroupDto) {
    const time = Date.now();
    const resp = await this.check_users(dto.users_id);

    const set = new Set(dto.users_id);

    if (dto.users_id.length !== set.size) {
      throw new BadRequestException('Duplicate entries');
    }
    if (resp === false) {
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

    await Promise.all(
      dto.users_id.map(async (user_id) => {
        await this.userModel.updateOne(
          { _id: user_id },
          {
            $push: { groups: newGroup._id },
          },
        );
      }),
    );
    this.logger.log(`Added users to group ${newGroup.id}`);

    return { msg: 'Created Group' };
  }

  async check_users(usersId): Promise<boolean> {
    await Promise.all(
      usersId.map(async (userId) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          throw new BadRequestException('Id is not in valid format');
        }

        const userMongooseId = new mongoose.Types.ObjectId(userId);
        const user = await this.userModel.exists({ _id: userMongooseId });

        if (!user) {
          this.logger.log(`${userId} does not exist`);
          return false;
        }
        return true;
      }),
    );
    return true;
  }

  async get_users_to_create_chat(userId) {
    const user = await this.userModel.findOne({ _id: userId });
    const groupIds = user.groups;
    const users = await Promise.all(
      groupIds.map((groupId) => this.groupModel.findOne({ _id: groupId })),
    )
      .then((groups) => groups.flatMap((group) => group.users))
      .then((contactIds) =>
        contactIds.filter((contactId) => contactId !== userId),
      )
      .then((contactIds) =>
        this.userModel
          .find({ _id: { $in: contactIds } })
          .select('_id firstName lastName email image'),
      );

    return users;
  }

  async get_users_to_create_group(doctor_id) {
    const patientIds = await this.appointmentModel.distinct('patient_id', {
      doctor_id,
    });

    const users = await Promise.all(
      patientIds.map(async (patient_id) => {
        const patient = this.userModel
          .findOne({ _id: patient_id })
          .select('_id firstName lastName email image');
        return patient;
      }),
    );
    return users;
  }

  async get_chat_users(groupId) {
    const resp = await this.groupModel.findOne({ _id: groupId });
    const users = Promise.all(
      resp.users.map((userId) => {
        return this.userModel
          .findOne({ _id: userId })
          .select('firstName lastName role image');
      }),
    );
    return users;
  }

  async check_user_group_socket(
    userId: string,
    groupId: string,
  ): Promise<boolean> {
    const group = await this.groupModel.findOne({ _id: groupId });
    if (group.users.length === 0) {
      return false;
    }
    return group.users.includes(userId);
  }

  async check_group_valid(groupId: string) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    if (!(await this.groupModel.exists({ _id: groupId }))) {
      throw new BadRequestException("Group doesn't exist");
    }
  }
}
