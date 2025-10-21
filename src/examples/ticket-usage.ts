// Example usage of the ticket management system
import { TicketService } from "@/services/product";

// Example: How to use the ticket service functions

export const ticketUsageExamples = {
  // Get all tickets with the new data structure
  async getAllTickets() {
    const data = await TicketService.getAll();
    console.log("All tickets data:", data);

    // Access specific status data
    const pendingTickets = TicketService.getTicketsByStatus(data, "pending");
    const confirmedTickets = TicketService.getTicketsByStatus(
      data,
      "confirmed"
    );
    const rejectedTickets = TicketService.getTicketsByStatus(data, "rejected");

    console.log("Pending tickets:", pendingTickets);
    console.log("Confirmed tickets:", confirmedTickets);
    console.log("Rejected tickets:", rejectedTickets);

    // Get total statistics
    const totalStats = TicketService.getTotalStats(data);
    console.log("Total stats:", totalStats);

    return data;
  },

  // Approve a ticket
  async approveTicket(ticketId: string) {
    const success = await TicketService.approveTicket(ticketId);
    if (success) {
      console.log(`Ticket ${ticketId} approved successfully`);
      // Refresh data after approval
      return await this.getAllTickets();
    } else {
      console.error(`Failed to approve ticket ${ticketId}`);
      return null;
    }
  },

  // Reject a ticket with reason
  async rejectTicket(ticketId: string, reason?: string) {
    const success = await TicketService.rejectTicket(ticketId, reason);
    if (success) {
      console.log(`Ticket ${ticketId} rejected successfully`);
      if (reason) {
        console.log(`Rejection reason: ${reason}`);
      }
      // Refresh data after rejection
      return await this.getAllTickets();
    } else {
      console.error(`Failed to reject ticket ${ticketId}`);
      return null;
    }
  },

  // Get ticket by ID
  async getTicketDetails(ticketId: string) {
    try {
      const ticket = await TicketService.getTicketById(ticketId);
      console.log("Ticket details:", ticket);
      return ticket;
    } catch (error) {
      console.error("Error getting ticket details:", error);
      return null;
    }
  },

  // Example data structure that the API should return
  getExpectedDataStructure() {
    return {
      pending: {
        tickets: [
          {
            _id: "68f366262d7100d9831d6724",
            show_name: "Tên Show Diễn",
            name: "Nguyen Cong Hieu 1",
            email: "hieuncce180986@fpt.edu.vn",
            phone: "0987463552",
            schedule: "show-afternoon",
            price: 69000,
            quantity: 3,
            total: 207000,
            bank_image:
              "https://res.cloudinary.com/dx1ejni0o/image/upload/v1760695562/tich-van/zakfcr4yxjzhoe03jm3z.png",
            status: "pending",
            rejected_reason: "",
            created_at: "2025-10-18T10:04:22.947Z",
          },
        ],
        total_quantity: 21,
        total_price: 1311000,
      },
      confirmed: {
        tickets: [],
        total_quantity: 0,
        total_price: 0,
      },
      rejected: {
        tickets: [
          {
            _id: "68f365ef2d7100d9831d6723",
            show_name: "Tên Show Diễn",
            name: "Nguyen Cong Hieu",
            email: "hieuncce180986@fpt.edu.vn",
            phone: "0987463552",
            schedule: "show-afternoon",
            price: 69000,
            quantity: 3,
            total: 207000,
            bank_image:
              "https://res.cloudinary.com/dx1ejni0o/image/upload/v1760695562/tich-van/zakfcr4yxjzhoe03jm3z.png",
            status: "rejected",
            rejected_reason: "",
            created_at: "2025-10-18T10:03:27.637Z",
          },
        ],
        total_quantity: 3,
        total_price: 207000,
      },
    };
  },
};

// Example usage in a React component:
/*
import { ticketUsageExamples } from "@/examples/ticket-usage";

const MyComponent = () => {
  const handleApprove = async (ticketId: string) => {
    await ticketUsageExamples.approveTicket(ticketId);
    // Refresh your component state here
  };

  const handleReject = async (ticketId: string, reason: string) => {
    await ticketUsageExamples.rejectTicket(ticketId, reason);
    // Refresh your component state here
  };

  return (
    <div>
      // Your component JSX
    </div>
  );
};
*/
