/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import ProductDescriptionEditor from "./quill";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TicketService } from "@/services/product";
import { ImageUp, Loader, Plus, SquarePen, Upload, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { UploadService } from "@/services/upload";
import { Lens } from "@/components/ui/lens";

export function ModalUpdateTicket({ data }: { data: any }) {
  const [hovering, setHovering] = useState(false);

  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [secondaryPreviews, setSecondaryPreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("");
  const [price, setPrice] = useState<number>(69000);
  const [quantity, setQuantity] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [bankImage, setBankImage] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [rejectedReason, setRejectedReason] = useState<string>("");

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSecondaryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const newPreviews: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert(`File ${file.name} không phải là hình ảnh.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setSecondaryPreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập họ và tên.",
      });
      return false;
    }

    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập email.",
      });
      return false;
    }

    if (!phone.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập số điện thoại.",
      });
      return false;
    }

    if (!schedule.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn suất chiếu.",
      });
      return false;
    }

    if (!status.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn trạng thái.",
      });
      return false;
    }

    if (quantity <= 0) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập số lượng vé.",
      });
      return false;
    }

    if (status === "rejected" && !rejectedReason.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập lý do từ chối.",
      });
      return false;
    }

    return true;
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await UploadService.uploadToCloudinary([file]);
      if (
        uploadResponse &&
        Array.isArray(uploadResponse) &&
        uploadResponse[0]
      ) {
        return uploadResponse[0]?.secure_url;
      } else {
        console.error("Upload failed or response is not as expected");
        return "";
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  }, []);

  const extractBase64Images = (htmlContent: string) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    const matches = [...htmlContent.matchAll(imgTagRegex)];
    return matches.map((match) => match[1]);
  };

  const replaceBase64WithCloudUrls = async (
    htmlContent: string,
    uploadFunc: (file: File) => Promise<string>
  ) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    let updatedContent = htmlContent;

    const matches = [...htmlContent.matchAll(imgTagRegex)];
    for (const match of matches) {
      const base64String = match[1];
      const file = base64ToFile(base64String);
      const uploadedUrl = await uploadFunc(file);
      updatedContent = updatedContent.replace(base64String, uploadedUrl);
    }

    return updatedContent;
  };

  const base64ToFile = (base64String: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.png", { type: mime });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const body = {
      show_name: "Hoa Độc Điền Trang",
      name: name,
      email: email,
      phone: phone,
      schedule: schedule,
      quantity: quantity,
      total: total,
      status: status,
      rejected_reason: status === "rejected" ? rejectedReason : "",
      bank_image: mainPreview,
    };

    let response;

    try {
      if (status === "pending") {
        response = await TicketService.updateTicket(data?._id, body);
      } else if (status === "approved") {
        response = await TicketService.approveTicket(data?._id, body);
      } else if (status === "rejected") {
        response = await TicketService.rejectTicket(data?._id, body);
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      response = false;
    }

    setIsLoading(false);

    if (response) {
      toast({
        title: "Cập nhật thành công!",
        description: "Thông tin vé đã được cập nhật.",
      });
      window.location.reload();
    } else {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại!",
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  const updateDOM = () => {
    if (data) {
      setName(data?.name || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setSchedule(data?.schedule || "");
      setPrice(data?.price || 69000);
      setQuantity(data?.quantity || 0);
      setTotal(data?.total || 0);
      setBankImage(data?.bank_image || "");
      setStatus(data?.status || "");
      setRejectedReason(data?.rejected_reason || "");
      setMainPreview(data?.bank_image || "");
      setSecondaryPreviews(data?.images || []);
    }
  };

  useEffect(() => {
    updateDOM();
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger onClick={updateDOM}>
        <div className="flex">
          <div className="mx-2 p-2 cursor-pointer hover:bg-indigo-600 rounded-full group">
            <SquarePen
              size={23}
              className="text-gray-900 group-hover:text-white"
            />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa sản phẩm</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa thông tin sản phẩm và nhấn{" "}
              <strong className="text-indigo-600">Cập nhật</strong> để lưu thông
              tin.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="flex flex-col justify-start items-start gap-2 overflow-y-auto hide-scrollbar max-h-[70vh] pr-0 scroll-bar-style">
              <Label htmlFor="description" className="text-[14.5px]">
                Họ và tên
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Họ và tên"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>
              <Label htmlFor="email" className="text-[14.5px]">
                Email
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>
              <Label htmlFor="phone" className="text-[14.5px]">
                Số điện thoại
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Số điện thoại"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>
              <Label htmlFor="description" className="text-[14.5px]">
                Giá vé
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="price"
                  value={price}
                  type="number"
                  disabled
                  placeholder="Giá vé"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>
              <Label htmlFor="description" className="text-[14.5px] mt-2">
                Chọn suất chiếu
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="schedule"
                  value={schedule}
                  onChange={(e) => {
                    setSchedule(e.target.value);
                  }}
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                >
                  <option value="">Chọn suất chiếu</option>
                  <option value="show-morning">Sáng (9h30 - 11h00)</option>
                  <option value="show-afternoon">Chiều (18h30 - 20h00)</option>
                </select>
              </div>
              <Label htmlFor="status" className="text-[14.5px] mt-2">
                Trạng thái
              </Label>
              <div className="w-full grid items-center gap-4">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="pending">Đang chờ</option>
                  <option value="approved">Xác nhận</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>

              <Label htmlFor="description" className="text-[14.5px]">
                Số lượng vé
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value) || 0;
                    setQuantity(newQuantity);
                    setTotal(newQuantity * price);
                  }}
                  placeholder="Số lượng"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>

              <Label htmlFor="total" className="text-[14.5px]">
                Tổng cộng
              </Label>
              <div className="w-full grid items-center gap-4">
                <input
                  id="total"
                  type="number"
                  value={total}
                  disabled
                  placeholder="Tổng cộng"
                  className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                />
              </div>

              {status === "rejected" && (
                <>
                  <Label htmlFor="rejectedReason" className="text-[14.5px]">
                    Lý do từ chối
                  </Label>
                  <div className="w-full grid items-center gap-4">
                    <textarea
                      id="rejectedReason"
                      value={rejectedReason}
                      onChange={(e) => setRejectedReason(e.target.value)}
                      placeholder="Nhập lý do từ chối"
                      className="col-span-3 p-2 border border-[#CFCFCF] rounded placeholder-custom focus:border-gray-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <div className="overflow-y-auto hide-scrollbar max-h-[70vh] scroll-bar-style">
              <div className="mb-6">
                <Label htmlFor="bankImage" className="text-right !text-[16px]">
                  Hình ảnh chuyển khoản
                </Label>
                <div className="mt-2">
                  {!mainPreview && (
                    <div
                      onClick={handleUpdateMainImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <span>+ Tải hình lên</span>
                        <span className="text-xs text-gray-500">
                          hoặc kéo thả file vào đây
                        </span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={mainImageInputRef}
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {mainPreview && (
                    <div className="mt-2">
                      <div className="relative group w-full h-full">
                        {/* <div className="absolute top-0 left-0 right-0 bottom-0 group-hover:bg-black rounded-md opacity-25 z-0 transform duration-200"></div>
                        <div className="cursor-pointer absolute top-[43%] left-[43%] hidden group-hover:flex z-10 transform duration-200">
                          <div className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full">
                            <Upload
                              onClick={handleUpdateMainImage}
                              color="white"
                              size={26}
                            />
                          </div>
                        </div> */}
                        <Lens hovering={hovering} setHovering={setHovering}>
                          <Image
                            src={mainPreview}
                            alt="bank-image-preview"
                            className="w-full h-full object-contain rounded-md mt-2 border border-gray-200"
                            width={1000}
                            height={1000}
                          />
                        </Lens>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full !flex !flex-row !justify-between !items-center">
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Huỷ
              </Button>
            </DialogClose>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex flex-row justify-center items-center gap-2 text-white bg-indigo-600 hover:opacity-80 font-medium rounded-md text-sm !px-10 !text-[16px] py-2.5 text-center"
            >
              Cập nhật
              {isLoading && <Loader className="animate-spin" size={17} />}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
