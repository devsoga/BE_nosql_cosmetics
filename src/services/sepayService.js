import {historyTransfersModel} from "../models/historyTransfersModel.js";
import {orderModel} from "../models/orderModel.js";
import {parseStringToObjectId} from "../utils/parseStringToObjectId.js";

const checkSepay = async (reqBody) => {
  const {code, content, transferType, transferAmount} = reqBody;

  const parts = content.split(".");
  const orderId = parts[3];
  console.log(orderId);

  try {
    // Lấy thông tin order trong DB
    const order = await orderModel.findOneById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Chuẩn bị dữ liệu lưu vào sepayModel
    const isSuccess =
      order.totalPriceOrder === transferAmount && transferType === "in";
    const newSepay = {
      orderId: parseStringToObjectId(orderId),
      success: isSuccess,
      // fix cung loi total not correct
      message: isSuccess
        ? "Transfer completed!"
        : "Total price is not correct!",
      transferInfo: {...reqBody},
    };

    // Lưu vào DB
    await historyTransfersModel.createNew(newSepay);

    // Cập nhật trạng thái order
    await orderModel.updateIsPaymentByOrderId(orderId, isSuccess);
    if (isSuccess) {
      await orderModel.updateStatusByorderId(orderId, "shipping");
    }

    return isSuccess;
  } catch (error) {
    console.error("Error in checkSepay:", error);
    throw error;
  }
};

export const sepayService = {
  checkSepay,
};
