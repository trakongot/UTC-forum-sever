import Report from "../models/reportModel.js " ; 



const createReport = async (req, res) => {
    try {
        const {   reportedBy, content, contentType, reason } = req.body;

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
            const { page = 1, limit = 10, status } = req.query;
            const query = status ? { status } : {};

            const reports = await Report.find(query)
                .populate("reportedBy", "username")
                .populate("content")
                .skip((page - 1) * limit)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, reports });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Lỗi hệ thống" });
        }
    };

    const getReportById = async (req, res) => {
        try {
            const { id } = req.params;
    
            // Lấy thông tin báo cáo
            const report = await Report.findById(id)
                .populate("reportedBy", "username")  // Chỉ lấy trường 'username' của người báo cáo
                .populate("content");
    
            if (!report) {
                return res.status(404).json({ error: "Báo cáo không tồn tại" });
            }
    
            // Kiểm tra nếu 'contentType' là "Account" và là báo cáo người dùng
            if (report.contentType === "Account") {
                // Giả sử bạn có model User, và muốn tránh trả về mật khẩu
                const user = await User.findById(report.reportedObjectId).select("-password");  // Chỉ lấy thông tin cần thiết, không lấy mật khẩu
                report.reportedObjectId = user; // Gắn thông tin người dùng đã lọc vào báo cáo
            }
    
            res.status(200).json({ success: true, report });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Lỗi hệ thống" });
        }
    };
    
    
export {
    createReport , 
    getReportsByStatus , 
    getReportById
}
