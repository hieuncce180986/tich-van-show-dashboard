/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
// import { ModalCreateTicket } from "./modal.create";
import { ModalUpdateTicket } from "./modal.update";
import { useEffect, useState } from "react";
import { TicketService } from "@/services/product";
import { Loader, MoveRight } from "lucide-react";
import { HELPER } from "@/utils/helper";

type TicketData = {
  pending: {
    tickets: any[];
    total_quantity: number;
    total_quantity_pending_show_morning: number;
    total_quantity_pending_show_afternoon: number;
    total_price: number;
  };
  approved: {
    tickets: any[];
    total_quantity: number;
    total_quantity_approved_show_morning: number;
    total_quantity_approved_show_afternoon: number;
    total_price: number;
  };
  rejected: {
    tickets: any[];
    total_quantity: number;
    total_price: number;
  };
};

export default function Tickets() {
  const COUNT = 5;
  const AMOUNT_MORNING_TICKETS = 30;
  const AMOUNT_AFTERNOON_TICKETS = 30;

  const [ticketData, setTicketData] = useState<TicketData>({
    pending: {
      tickets: [],
      total_quantity: 0,
      total_quantity_pending_show_morning: 0,
      total_quantity_pending_show_afternoon: 0,
      total_price: 0,
    },
    approved: {
      tickets: [],
      total_quantity: 0,
      total_quantity_approved_show_morning: 0,
      total_quantity_approved_show_afternoon: 0,
      total_price: 0,
    },
    rejected: { tickets: [], total_quantity: 0, total_price: 0 },
  });
  const [originalData, setOriginalData] = useState<TicketData>({
    pending: {
      tickets: [],
      total_quantity: 0,
      total_quantity_pending_show_morning: 0,
      total_quantity_pending_show_afternoon: 0,
      total_price: 0,
    },
    approved: {
      tickets: [],
      total_quantity: 0,
      total_quantity_approved_show_morning: 0,
      total_quantity_approved_show_afternoon: 0,
      total_price: 0,
    },
    rejected: { tickets: [], total_quantity: 0, total_price: 0 },
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currenPage, setCurrenPage] = useState<any>(1 as any);
  const [currenData, setCurrenData] = useState<any>([] as any);
  const [searchId, setSearchId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");

  const selectPage = (pageSelected: any) => {
    setCurrenPage(pageSelected);
    const start = (pageSelected - 1) * COUNT;
    const end = pageSelected * COUNT;
    const currentTickets = ticketData[activeTab].tickets;
    setCurrenData(currentTickets.slice(start, end));
  };

  const prevPage = () => {
    if (currenPage > 1) {
      selectPage(currenPage - 1);
    }
  };

  const nextPage = () => {
    if (currenPage < totalPage) {
      selectPage(currenPage + 1);
    }
  };

  const render = (data: TicketData) => {
    setOriginalData(data);
    setTicketData(data);
    updateCurrentTabData(data[activeTab].tickets);
  };

  const updateCurrentTabData = (tickets: any[]) => {
    setTotalPage(Math.ceil(tickets.length / COUNT));
    setCurrenPage(1);
    setCurrenData(tickets.slice(0, COUNT));
  };

  const searchCustomerById = (id: string) => {
    const trimmedId = id.trim();
    setSearchId(id);

    const currentTickets = originalData[activeTab].tickets;
    const filteredTickets = trimmedId
      ? currentTickets.filter((item: any) =>
          item.name.toLowerCase().includes(trimmedId.toLowerCase())
        )
      : currentTickets;

    // Update the current tab's tickets
    const updatedData = {
      ...ticketData,
      [activeTab]: {
        ...ticketData[activeTab],
        tickets: filteredTickets,
      },
    };
    setTicketData(updatedData);
    updateCurrentTabData(filteredTickets);
  };

  const switchTab = (tab: "pending" | "approved" | "rejected") => {
    setActiveTab(tab);
    setSearchId(""); // Reset search when switching tabs
    updateCurrentTabData(originalData[tab].tickets);
  };

  const refreshData = async () => {
    setIsLoading(true);
    await init();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    searchCustomerById(value);
  };

  // Helper function to get total statistics
  const getTotalStats = () => {
    const totalTickets =
      ticketData.pending.tickets.length +
      ticketData.approved.tickets.length +
      ticketData.rejected.tickets.length;

    const totalQuantity =
      ticketData.pending.total_quantity +
      ticketData.approved.total_quantity +
      ticketData.rejected.total_quantity;

    const totalPrice =
      ticketData.pending.total_price +
      ticketData.approved.total_price +
      ticketData.rejected.total_price;

    return { totalTickets, totalQuantity, totalPrice };
  };

  const init = async () => {
    const res = await TicketService.getAll();
    if (res) {
      console.log("check data: ", res);

      render(res);
      setIsLoading(false);
    } else {
      setTicketData({
        pending: {
          tickets: [],
          total_quantity: 0,
          total_quantity_pending_show_morning: 0,
          total_quantity_pending_show_afternoon: 0,
          total_price: 0,
        },
        approved: {
          tickets: [],
          total_quantity: 0,
          total_quantity_approved_show_morning: 0,
          total_quantity_approved_show_afternoon: 0,
          total_price: 0,
        },
        rejected: { tickets: [], total_quantity: 0, total_price: 0 },
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // Update current tab data when activeTab changes
    updateCurrentTabData(originalData[activeTab].tickets);
  }, [activeTab]);

  return (
    <section className="p-4">
      <div className="relative overflow-hidden">
        <div className="flex">
          <div className="flex items-center flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                DANH SÁCH VÉ{" "}
                <span className="text-indigo-600">
                  ({ticketData[activeTab].tickets.length})
                </span>
              </span>
            </h5>
          </div>
          <div className="flex flex-row gap-4">
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm kiếm vé theo tên..."
                value={searchId}
                onChange={handleSearchChange}
                className="h-[40px] w-full focus:outline-none focus:ring-0 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
              />
            </div>
            <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
              {/* <ModalCreateTicket /> */}
            </div>
          </div>
        </div>
        <div className="h-[640px] flex flex-col justify-start gap-5">
          {/* Summary Statistics */}
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Tổng quan vé
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {getTotalStats().totalQuantity}
                </div>
                <div className="text-sm text-gray-600">Tổng số lượng vé</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {ticketData.pending.total_quantity}
                </div>
                <div className="text-sm text-gray-600">Đang chờ</div>
                <div className="text-xs text-blue-400">
                  {ticketData.pending.total_price.toLocaleString()} VND
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {ticketData.approved.total_quantity}
                </div>
                <div className="text-sm text-gray-600">Đã duyệt</div>
                <div className="text-xs text-green-400">
                  {ticketData.approved.total_price.toLocaleString()} VND
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {ticketData.rejected.total_quantity}
                </div>
                <div className="text-sm text-gray-600">Đã từ chối</div>
                <div className="text-xs text-red-400">
                  {ticketData.rejected.total_price.toLocaleString()} VND
                </div>
              </div>
            </div>
          </div> */}

          <div className="flex flex-col mt-5">
            <div className="flex flex-row justify-start items-center gap-6">
              <div
                className={`cursor-pointer border px-2 py-1 rounded-lg w-36 text-center ${
                  activeTab === "pending"
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => switchTab("pending")}
              >
                ĐANG CHỜ ({ticketData.pending.tickets.length})
              </div>
              <div
                className={`cursor-pointer border px-2 py-1 rounded-lg w-36 text-center ${
                  activeTab === "approved"
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => switchTab("approved")}
              >
                XÁC NHẬN ({ticketData.approved.tickets.length})
              </div>
              <div
                className={`cursor-pointer border px-2 py-1 rounded-lg w-36 text-center ${
                  activeTab === "rejected"
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => switchTab("rejected")}
              >
                TỪ CHỐI ({ticketData.rejected.tickets.length})
              </div>
            </div>
            <div className="flex flex-row justify-start items-start gap-6 w-full mt-5">
              <div className="flex flex-row items-center">
                <div className="cursor-pointer px-4 py-1 rounded-lg bg-yellow-50 border border-yellow-200">
                  ĐANG CHỜ:{" "}
                  <span className="text-lg text-black font-bold italic">
                    {" "}
                    {ticketData.pending.total_quantity} vé
                  </span>
                  <div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất sáng:{" "}
                      {ticketData.pending.total_quantity_pending_show_morning}{" "}
                      vé
                    </div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất chiều:{" "}
                      {ticketData.pending.total_quantity_pending_show_afternoon}{" "}
                      vé
                    </div>
                  </div>
                  <span className="text-sm text-fuchsia-700 font-bold">
                    {ticketData.pending.total_price.toLocaleString()} VND
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="cursor-pointer px-4 py-1 rounded-lg bg-green-50 border border-green-200">
                  XÁC NHẬN:{" "}
                  <span className="text-lg text-black font-bold italic">
                    {ticketData.approved.total_quantity} vé
                  </span>
                  <div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất sáng:{" "}
                      {ticketData.approved.total_quantity_approved_show_morning}{" "}
                      vé
                    </div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất chiều:{" "}
                      {
                        ticketData.approved
                          .total_quantity_approved_show_afternoon
                      }{" "}
                      vé
                    </div>
                  </div>
                  <span className="text-sm text-fuchsia-700 font-bold">
                    {ticketData.approved.total_price.toLocaleString()} VND
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="cursor-pointer px-4 py-1 rounded-lg bg-blue-50 border border-blue-200">
                  CÒN LẠI:{" "}
                  <div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất sáng:{" "}
                      {AMOUNT_MORNING_TICKETS -
                        (ticketData.approved
                          .total_quantity_approved_show_morning +
                          ticketData.pending
                            .total_quantity_pending_show_morning)}{" "}
                      vé
                    </div>
                    <div className="text-lg text-black flex flex-row items-center gap-2">
                      Suất chiều:{" "}
                      {AMOUNT_AFTERNOON_TICKETS -
                        (ticketData.approved
                          .total_quantity_approved_show_afternoon +
                          ticketData.pending
                            .total_quantity_pending_show_afternoon)}{" "}
                      vé
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center">
                <div className="cursor-pointer px-4 py-1 rounded-lg bg-red-50 border border-red-200">
                  TỪ CHỐI:{" "}
                  <strong className="text-lg text-red-600">
                    {ticketData.rejected.total_quantity} vé
                  </strong>
                  <br />
                  <span className="text-sm text-red-500">
                    {ticketData.rejected.total_price.toLocaleString()} VND
                  </span>
                </div>
              </div>
              <div className="cursor-pointer px-4 py-1 rounded-lg bg-indigo-50 border border-indigo-200">
                DOANH THU:{" "}
                <strong className="text-lg text-indigo-600">
                  {ticketData.approved.total_price // ticketData.pending.total_price +
                    // + ticketData.rejected.total_price
                    .toLocaleString()}{" "}
                  VND
                </strong>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="w-full flex justify-center items-center pt-72">
              <Loader className="animate-spin text-indigo-600" size={36} />
            </div>
          ) : currenData.length === 0 ? (
            <div className="col-span-2 text-center w-full flex justify-center items-center py-4">
              <p className="text-gray-500 text-lg">Không tìm thấy vé nào.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto mt-0">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="w-52 px-4 py-3">
                        Họ và tên
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Email
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Số điện thoại
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Suất chiếu
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Số lượng
                      </th>
                      <th scope="col" className="w-32 px-4 py-3">
                        Tổng tiền
                      </th>
                      <th scope="col" className="w-32 py-3">
                        Trạng thái
                      </th>
                      <th scope="col" className="w-24 px-4 py-3">
                        Chi tiết
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {currenData?.map((item: any, index: any) => {
                      return (
                        <tr
                          key={index}
                          className={`${
                            item?.deleted_at ? "hidden" : ""
                          } border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700`}
                        >
                          <td className="w-52 px-4 py-2 gap-3 items-center">
                            <div className="w-full col-span-9 text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                              {item?.name}
                            </div>
                          </td>
                          <td className="w-32 px-4 py-2">
                            <span className="text-[14px] bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                              {item?.email}
                            </span>
                          </td>
                          <td className="w-32 px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <div className="flex items-center">
                              {item?.phone}
                            </div>
                          </td>
                          <td className="w-32 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item?.schedule === "show-morning"
                              ? "Sáng (8:00)"
                              : "Tối (18:00)"}
                          </td>
                          <td className="w-32 text-[14px] px-11 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item?.quantity}
                          </td>
                          <td className="w-32 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {item?.total?.toLocaleString()} VND
                          </td>
                          <td className="w-32 text-[14px] px-0 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item?.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item?.status === "approved" ||
                                    item?.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item?.status === "approved"
                                ? "APPROVED"
                                : item?.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="w-24 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <ModalUpdateTicket data={item} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <nav
                className="flex flex-col items-start justify-center mt-4 p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
                aria-label="Table navigation"
              >
                <ul className="inline-flex items-stretch -space-x-px">
                  <li>
                    <button
                      onClick={prevPage}
                      disabled={currenPage === 1}
                      className="cursor-pointer flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-indigo-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                  {Array.from({ length: totalPage }, (_, i) => i + 1)?.map(
                    (item: any, index: any) => {
                      return (
                        <li key={index} onClick={() => selectPage(item)}>
                          <a
                            href="#"
                            className={`${
                              item === currenPage
                                ? "bg-indigo-100 hover:bg-indigo-100 text-gray-700"
                                : "bg-white hover:bg-indigo-50"
                            } flex items-center justify-center px-3 py-2 text-sm leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700`}
                          >
                            {item}
                          </a>
                        </li>
                      );
                    }
                  )}
                  <li>
                    <button
                      onClick={nextPage}
                      disabled={currenPage === totalPage}
                      className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-indigo-50 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="w-5 h-5"
                        aria-hidden="true"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
