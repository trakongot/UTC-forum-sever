import Report from "../models/reportModel.js ";
import User from "../models/userModel.js";
import Thread from "../models/threadModel.js";
import mongoose from "mongoose";

const createReport = async (req, res) => {
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

const getReportsByStatus = async (req, res) => {
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
    console.log(reports,"hehehe");
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

const getReportById = async (req, res) => {
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

const updateReportStatus = async (req, res) => {
  const {currentStatus, newStatus, reportId ,data } = req.body; // Trạng thái mới và ID báo cáo từ body request
  console.log(data , "hehehhehehehe111111111");
  const validStatuses = ["pending", "reviewed", "resolved"];
  if (!validStatuses.includes(currentStatus)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }

  try {
    // Tìm báo cáo dựa trên ID
    const report = await Report.findById(reportId);
    console.log(reportId,currentStatus ,newStatus,"hello");

    // Nếu không tìm thấy báo cáo
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Kiểm tra nếu trạng thái cũ giống trạng thái mới
    if (report.status !== currentStatus) {
      return res.status(400).json({
        message: "The report already has the specified status.",
      });
    }
    // Cập nhật trạng thái nếu khác
    if (currentStatus!='resolved' && newStatus ==="upDate" ){
      report.status = validStatuses[validStatuses.findIndex((status) => status === currentStatus)+1];
    }
    if(currentStatus === "reviewed" && data){
      
      if (data.selectedAction && data.selectedAction.length > 0) {
        // Kiểm tra nếu có hành động "suspendAccount"

        if (data.currentTargetType ==="User"){
        if (data.selectedAction.includes("suspendAccount")) {
          const user = await User.findById(data.currentTargetTypeId);
          if (!user) {
            return res.status(404).json({ message: "User not found." });
          }
          user.accountStatus = "temporary_ban"; // Cập nhật trạng thái người dùng thành không hoạt động
          await user.save();
        }
        }
          if (data.currentTargetType ==="Thread"){
          const thread = await Thread.findById(data.currentTargetTypeId);

        // Kiểm tra hành động khác nếu cần
        if (data.selectedAction.includes("hideThread")) {
          if (!thread) {
            return res.status(404).json({ message: "Thread not found." });
          }
          thread.isHidden = true; // Ẩn thread
          await thread.save();
          
        }
        if (data.selectedAction.includes("suspendAccount")) {
          if (!thread) {
            return res.status(404).json({ message: "Thread not found." });
          }
          const userId = thread.postedBy;

          const user = await User.findById(userId);
          if (!user) {
            return res.status(404).json({ message: "User not found." });
          }
          user.accountStatus = "temporary_ban"; // Cập nhật trạng thái người dùng thành không hoạt động
          await user.save();
          
        }
      }
        // Thêm các hành động khác nếu cần
      }
      report.adminNote = data.lognote;
    }
    if (currentStatus!='pending' && newStatus ==="setDraft" ){
      report.status = "pending";
      }
    const updatedReport = await report.save();

    return res.status(200).json({
      message: "Report status updated successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({ message: "Server error." });
  }
};


// const getReportsByContent = async (req, res) => {
//   try {
//     const { page = 1, limit = 15, searchText ,status} = req.query;
   
//     // 1. Tìm `_id` của `User` phù hợp
//     const userIds = searchText
//       ? await User.find({ username: { $regex: searchText, $options: "i" } }).distinct("_id")
//       : [];

//     // 2. Tìm `_id` của `Thread` phù hợp
//     const threadIds = searchText
//       ? await Thread.find({ text: { $regex: searchText, $options: "i" } }).distinct("_id")
//       : [];

//     // 3. Tạo query để tìm `Report`
//     const query = {
//       ...(searchText && (userIds.length > 0 || threadIds.length > 0) && {
//         content: { $in: [...userIds, ...threadIds] },
//       }),
//       ...(userIds.length > 0 && { contentType: "User" }), // Nếu có user, thêm contentType là "User"
//       ...(threadIds.length > 0 && { contentType: "Thread" }), // Nếu có thread, thêm contentType là "Thread"
//     };

//     // 4. Tính tổng số báo cáo
//     const totalReports = await Report.countDocuments(query);

//     // 5. Tìm báo cáo theo `query` với phân trang
//     const reportsQuery = Report.find(query)
//       .populate("reportedBy", "username");
   

//     // 6. Populate cho 'User' nếu contentType là 'User'

//     console.log(query.contentType,"hehehee123");
    
//     if (query.contentType === 'User'){
//       reportsQuery.populate({
//         path: "content",
//         ref: "User", // Đảm bảo 'content' là tham chiếu đến bảng User
//         select: "username", // Chỉ lấy 'username' của User
//       });
//       console.log(await Report.find(query)
//       .populate("reportedBy", "username"),"hahahaha");
//     }
//     if (query.contentType === 'Thread'){
//       reportsQuery.populate({
//         path: "content",
//         ref: "Thread", // Đảm bảo 'content' là tham chiếu đến bảng Thread
//         populate: {
//           path: "postedBy", 
//           select: "username", // Lấy thông tin 'postedBy' của Thread
//         },
//       });
//     }
  
//     // 7. Populate cho 'Thread' nếu contentType là 'Thread'

    

//     // 8. Lấy báo cáo từ cơ sở dữ liệu
//     var reports = await reportsQuery
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 });
//   if (searchText == undefined || searchText =="") {
//        const query1 = status ? { status } : {}
//         reports = await Report.find(query1)
//         .populate("reportedBy", "username")
//         .populate("content")
//         .skip((page - 1) * limit)
//         .limit(Number(limit))
//         .sort({ createdAt: -1 });
//       }
//     // 9. Tính tổng số trang
//     const totalPages = Math.ceil(totalReports / limit);
//     console.log(query.contentType,"hehehee123");
//     res.status(200).json({
//       success: true,
//       reports,
//       pagination: {
//         currentPage: Number(page),
//         totalPages,
//         totalReports,
//         pageSize: Number(limit),
//       },
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
const getReportsByContent = async (req, res) => {
  try {
    const { page = 1, limit = 15, searchText ,status} = req.query;
    let query = {};
    if (searchText) {
    // 1. Tìm _id của User phù hợp
const userIds = searchText
? await User.find({ username: { $regex: searchText, $options: "i" } }).distinct("_id")
: [];

// 2. Tìm _id của Thread phù hợp
const threadIds = searchText
? await Thread.find({ text: { $regex: searchText, $options: "i" } }).distinct("_id")
: [];

// 3. Tạo query để tìm Report
let query = {
...(searchText && (userIds.length > 0 || threadIds.length > 0) && {
  content: { $in: [...userIds, ...threadIds] },
}),
...(userIds.length > 0 && { contentType: "User" }), // Nếu có user, thêm contentType là "User"
...(threadIds.length > 0 && { contentType: "Thread" }), // Nếu có thread, thêm contentType là "Thread"
};

// 4. Tính tổng số báo cáo (lấy trước khi phân trang)
var totalReports = await Report.countDocuments(query);
var totalPages = Math.ceil(totalReports / limit);

// 5. Truy vấn cho contentType là 'User'
let userReports = [];
if (userIds.length > 0) {
userReports = await Report.find({
  ...query,
  contentType: "User",
  content: { $in: userIds }, // Chỉ lấy báo cáo cho userIds
})
  .populate("reportedBy", "username")
  .populate({
    path: "content",
    ref: "User",
    select: "username",
  });
}

// 6. Truy vấn cho contentType là 'Thread'
let threadReports = [];
if (threadIds.length > 0) {
threadReports = await Report.find({
  ...query,
  contentType: "Thread",
  content: { $in: threadIds }, // Chỉ lấy báo cáo cho threadIds
})
  .populate("reportedBy", "username")
  .populate({
    path: "content",
    ref: "Thread",
    populate: {
      path: "postedBy",
      select: "username",
    },
  });
}

// 7. Gộp kết quả từ cả hai loại
const combinedReports = [...userReports, ...threadReports];

// 8. Phân trang (skip và limit)
var reports = combinedReports.slice((page - 1) * limit, page * limit);

// 9. Trả về kết quả
if (combinedReports.length === 0) {
return res.status(200).json({
  success: true,
  reports: [],
  pagination: {
    currentPage: Number(page),
    totalPages: 0,
    totalReports: 0,
    pageSize: Number(limit),
  },
});
}

return res.status(200).json({
success: true,
reports,
pagination: {
  currentPage: Number(page),
  totalPages,
  totalReports,
  pageSize: Number(limit),
},
});

  }
  if (searchText == undefined || searchText =="") {
       const query1 = status ? { status } : {};
        reports = await Report.find(query1)
        .populate("reportedBy", "username")
        .populate("content")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
      }
     totalReports = await Report.countDocuments(query);
    // 9. Tính tổng số trang
     totalPages = Math.ceil(totalReports / limit);
    console.log(totalPages , totalReports,"hehehee123");
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default getReportsByContent;


export { createReport, getReportsByStatus, getReportById ,updateReportStatus ,getReportsByContent};
