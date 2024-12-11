const getReportsByContent = async (req, res) => {
  try {
    const { page = 1, limit = 15, searchText = "", status } = req.query;

    // 1. Xây dựng query ban đầu
    let query = {};

    // Nếu có `searchText`, thêm điều kiện tìm kiếm theo `User` và `Thread`
    if (searchText) {
      const userIds = await User.find({
        username: { $regex: searchText, $options: "i" },
      }).distinct("_id");
      const threadIds = await Thread.find({
        text: { $regex: searchText, $options: "i" },
      }).distinct("_id");

      if (userIds.length > 0 || threadIds.length > 0) {
        query = {
          content: { $in: [...userIds, ...threadIds] },
          ...(userIds.length > 0 && { contentType: "User" }),
          ...(threadIds.length > 0 && { contentType: "Thread" }),
        };
      } else {
        // Nếu không có kết quả tìm kiếm, trả về báo cáo rỗng
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
    }

    // Nếu có `status`, thêm điều kiện lọc theo `status`
    if (status) {
      query.status = status;
    }

    // 2. Tính tổng số báo cáo
    const totalReports = await Report.countDocuments(query);

    // 3. Tìm báo cáo với query
    const reportsQuery = Report.find(query)
      .populate("reportedBy", "username")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Populate riêng theo `contentType`
    if (query.contentType === "User") {
      reportsQuery.populate({
        path: "content",
        ref: "User",
        select: "username",
      });
    } else if (query.contentType === "Thread") {
      reportsQuery.populate({
        path: "content",
        ref: "Thread",
        populate: {
          path: "postedBy",
          select: "username",
        },
      });
    }

    const reports = await reportsQuery;



    // 4. Tính tổng số trang
    const totalPages = Math.ceil(totalReports / limit);
    // 5. Trả về kết quả
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
