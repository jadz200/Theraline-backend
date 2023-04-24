export const SwaggerCreateUserReq = {
  Required_Fields: {
    value: {
      firstName: 'string',
      lastName: 'string',
      email: 'string@gmail.com',
      password: 'string',
      gender: 'MALE',
      birthday: '2000-01-01',
    },
    summary: 'Required field',
  },
  ExpoToken: {
    value: {
      firstName: 'string',
      lastName: 'string',
      email: 'string@gmail.com',
      password: 'string',
      birthday: '2000-01-01',
      gender: 'MALE',
      expoToken: 'string',
    },
    summary: 'Required field + Expo Token',
  },
  Image: {
    value: {
      firstName: 'string',
      lastName: 'string',
      email: 'string@gmail.com',
      gender: 'MALE',
      birthday: '2000-01-01',
      password: 'string',
      image: 'string',
    },
    summary: 'Required field + Image Base64',
  },
};

export const SwaggerSignInReq = {
  patient: {
    value: { email: 'new@gmail.com', password: 'string' },
    summary: 'Patient login',
  },
  doctor: {
    value: { email: 'doctor@gmail.com', password: 'string' },
    summary: 'Doctor login',
  },
  expotoken: {
    value: {
      email: 'doctor@gmail.com',
      password: 'string',
      expoToken: 'string',
    },
    summary: 'Login expo Token example',
  },
};
