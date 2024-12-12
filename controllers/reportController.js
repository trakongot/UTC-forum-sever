import Report from "../models/reportModel.js ";
import User from "../models/userModel.js";
import Thread from "../models/threadModel.js";
import mongoose from "mongoose";

export const createReport = async (req, res) => {
  try {
    const { reportedBy, content, contentType, reason } = req.body;

    const newReport = new Report({
      reportedBy,
      content,
      contentType,
      reason,
    });

    await newReport.save();
    res.status(201).json({ success: true, report: newReport });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getReportsByStatus = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const query = status ? { status } : {};

    // Tính tổng số báo cáo dựa trên truy vấn
    const totalReports = await Report.countDocuments(query);

    // Lấy dữ liệu báo cáo theo phân trang
    const reports = await Report.find(query)
      .populate("reportedBy", "username")
      .populate("content")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Tính tổng số trang
    const totalPages = Math.ceil(totalReports / limit);

    res.status(200).json({
      success: true,
      reports,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalReports,
        pageSize: Number(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi hệ thống" });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ URL params
    console.log(id , "id param");
    // Lấy thông tin báo cáo theo id
    const report = await Report.findById(new mongoose.Types.ObjectId(id))
      .populate("reportedBy", "username") // Populate thông tin người báo cáo
      .populate("content") // Populate thông tin nội dung (Thread hoặc User)
      .exec();

    if (!report) {
      return res
        .status(404)
        .json({ success: false, error: "Báo cáo không tồn tại" });
    }

    // Kiểm tra nếu 'contentType' là "User" và là báo cáo người dùng
    if (report.contentType === "User") {
        console.log(report,"hehehehehehehehehehehhee==");
      // Lấy thông tin người dùng và loại bỏ mật khẩu
      const user = await User.findById(report.content._id).select("-password"); // Không lấy mật khẩu
      if (!user) {
        return res
          .status(404)
          .json({ success: false, error: "Người dùng không tồn tại" });
      }
      report.content = user; // Gắn thông tin người dùng vào content
    }

    // Kiểm tra nếu 'contentType' là "Thread" và là báo cáo bài viết
    if (report.contentType === "Thread") {
      // Lấy thông tin bài viết
      const thread = await Thread.findById(report.content._id).exec();
      if (!thread) {
        return res
          .status(404)
          .json({ success: false, error: "Bài viết không tồn tại" });
      }
      report.content = thread; // Gắn thông tin bài viết vào content
    }

    // Trả về báo cáo chi tiết sau khi đã xử lý content
    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Lỗi hệ thống" });
  }
};

export const updateReportStatus = async (req, res) => {
  const { reportId } = req.params; // ID của báo cáo từ route params
  const { status } = req.body; // Trạng thái mới từ body request

  // Kiểm tra nếu trạng thái không hợp lệ
  const validStatuses = ["pending", "reviewed", "resolved"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    // Tìm và cập nhật báo cáo với trạng thái mới
    const updatedReport = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true } // Trả về document đã cập nhật
    );

    // Nếu không tìm thấy báo cáo
    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Trả về báo cáo đã cập nhật
    return res.status(200).json({
      message: "Report status updated successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

