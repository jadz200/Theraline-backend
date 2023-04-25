export const SwaggerGetAppointmentResp = {
  docs: [
    {
      _id: 'string',
      patient_id: 'string',
      doctor_id: 'string',
      start_date: '2023-12-07T12:30:00.000Z',
      end_date: '2023-12-07T12:50:00.000Z',
      status: ['CREATED'],
      __v: 0,
    },
    {
      _id: 'string',
      patient_id: 'string',
      title: 'Cool appointment',
      doctor_id: 'string',
      start_date: '2023-11-07T10:30:00.000Z',
      end_date: '2023-11-07T10:40:00.000Z',
      status: ['CREATED'],
      __v: 0,
    },
    {
      _id: 'string',
      patient_id: 'string',
      title: 'title',
      doctor_id: 'string',
      start_date: '2023-11-07T10:30:00.000Z',
      end_date: '2023-11-07T11:30:00.000Z',
      status: ['CONFIRMED'],
      __v: 0,
    },
  ],
  totalDocs: 3,
  limit: 25,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

export const SwaggerGetPaymentInfoResp = {
  docs: [
    {
      _id: 'string',
      patient_id: 'string',
      fullName: 'Sam Smith',
      email: 'string@gmail.com',
      paymentInfo: {
        amount: 5,
        status: 'PAID',
        method: 'string',
        date: '2023-11-07T08:30:00.000Z',
        _id: 'string',
      },
    },
  ],
  totalDocs: 1,
  limit: 25,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

export const SwaggerGetMonthlyPaymentCountResp = {
  April: 1,
  November: 1,
};
