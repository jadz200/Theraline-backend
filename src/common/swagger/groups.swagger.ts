export const getChatsResp = {
  chats: [
    {
      _id: 'string',
      name: 'Super cool group',
      groupType: ['GROUP'],
      latestMessage: {
        _id: 'string',
        send_at: '2023-03-20T19:44:19.883Z',
        user_id: 'string',
        text: 'Hello!',
      },
    },
    {
      _id: 'string',
      name: 'ADHD',
      groupType: ['GROUP'],
      groupImage: 'string',
      latestMessage: {
        _id: 'string',
        send_at: '2023-04-04T08:19:08.508Z',
        user_id: 'string',
        text: 'testing time!',
      },
    },
    {
      _id: 'string',
      name: 'Jad Zarzour',
      groupType: ['PRIVATE'],
      groupImage: 'string',
      latestMessage: {
        _id: 'string',
        send_at: '2023-04-13T05:53:33.190Z',
        user_id: 'string',
        text: 'hi',
      },
    },
    {
      _id: 'string',
      name: 'Very cool',
      groupImage: 'string',
      groupType: ['GROUP'],
    },
    {
      _id: 'string',
      name: 'string string',
      groupType: ['PRIVATE'],
    },
    {
      _id: 'string',
      name: 'string string',
      groupImage: null,
      groupType: ['PRIVATE'],
    },
  ],
};

export const getUserChatResp = {
  users: [
    {
      _id: 'string',
      email: 'string',
      firstName: 'Jhon',
      lastName: 'Doe',
    },
    {
      _id: 'string',
      email: 'string',
      firstName: 'Mart',
      lastName: 'Slavin',
    },
    {
      _id: 'string',
      email: 'string',
      firstName: 'string',
      lastName: 'string',
    },
  ],
};
