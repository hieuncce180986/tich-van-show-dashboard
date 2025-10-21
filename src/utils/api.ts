const BASE_URL = "http://localhost:8000/v1";

export const API = {
  // TICKETS
  GET_ALL_TICKETS: `${BASE_URL}/tichvan/ticket/dashboard`,
  GET_TICKET_BY_ID: `${BASE_URL}/tichvan/ticket`,
  CREATE_TICKET: `${BASE_URL}/tichvan/ticket/register`,
  UPDATE_TICKET: `${BASE_URL}/tichvan/ticket`,
  APPROVE_TICKET: `${BASE_URL}/tichvan/ticket/approve`,
  REJECT_TICKET: `${BASE_URL}/tichvan/ticket/reject`,
};
