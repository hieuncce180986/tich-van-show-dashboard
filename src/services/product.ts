import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_TICKETS, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    // Return the structured data with pending, confirmed, and rejected tickets
    return data.data || data;
  } catch (error: any) {
    console.error("========= Error Get All Tickets:", error);
    return false;
  }
};

// const getAllWithDeleted = async () => {
//   try {
//     const response = await fetch(API.GET_ALL_PRODUCTS_W_DELETED, {
//       method: "GET",
//     });
//     if (!response.ok) {
//       throw new Error(`Failed - Status: ${response.status}`);
//     }
//     const data = await response.json();
//     return data;
//   } catch (error: any) {
//     console.error("========= Error Get All Products:", error);
//     return false;
//   }
// };

const createTicket = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(API.CREATE_TICKET, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Create Ticket:", error);
    return false;
  }
};

const updateTicket = async (id: any, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_TICKET}/${id}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      console.log("check update: failed", response.status);

      throw new Error(`Failed - Status: ${response.status}`);
    }
    console.log("check update: success", response.status);
    return true;
  } catch (error: any) {
    console.error("========= Error Update Ticket:", error);
    return false;
  }
};

const getTicketById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_TICKET_BY_ID}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Login failed - Status: ${response.status}`);
      throw new Error(`Get Ticket Failed - Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("========= Error Get Ticket:", error);
    throw error;
  }
};

const approveTicket = async (id: string, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.APPROVE_TICKET}/${id}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }

    return response;
  } catch (error: any) {
    console.error("========= Error Approve Ticket:", error);
    return false;
  }
};

const rejectTicket = async (id: string, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // const payload = reason ? { rejected_reason: reason } : {};

    const response = await fetch(`${API.REJECT_TICKET}/${id}`, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }

    return true;
  } catch (error: any) {
    console.error("========= Error Reject Ticket:", error);
    return false;
  }
};

// Helper function to get tickets by status
const getTicketsByStatus = (
  data: any,
  status: "pending" | "confirmed" | "rejected"
) => {
  if (!data || !data[status]) {
    return { tickets: [], total_quantity: 0, total_price: 0 };
  }
  return data[status];
};

// Helper function to get total statistics
const getTotalStats = (data: any) => {
  if (!data) {
    return { totalTickets: 0, totalQuantity: 0, totalPrice: 0 };
  }

  const totalTickets =
    (data.pending?.tickets?.length || 0) +
    (data.confirmed?.tickets?.length || 0) +
    (data.rejected?.tickets?.length || 0);

  const totalQuantity =
    (data.pending?.total_quantity || 0) +
    (data.confirmed?.total_quantity || 0) +
    (data.rejected?.total_quantity || 0);

  const totalPrice =
    (data.pending?.total_price || 0) +
    (data.confirmed?.total_price || 0) +
    (data.rejected?.total_price || 0);

  return { totalTickets, totalQuantity, totalPrice };
};

export const TicketService = {
  getAll,
  createTicket,
  updateTicket,
  getTicketById,
  approveTicket,
  rejectTicket,
  getTicketsByStatus,
  getTotalStats,
};
