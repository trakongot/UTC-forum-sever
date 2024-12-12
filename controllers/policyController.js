import Policy from '../models/policyModel.js';
import User from '../models/userModel.js';

// Hàm tạo chính sách mới (Create Policy)

export const createPolicy = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user._id;
    if (!title || !content) {
      return res
        .status(400)
        .json({ error: 'Title, Content, and CreatedBy are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newPolicy = new Policy({
      title,
      content,
      createdBy: userId,
      status: 'Active',
    });

    await newPolicy.save();
    res.status(201).json({ success: true, policy: newPolicy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// export const createPolicy = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         // Kiểm tra người dùng đã xác thực hay chưa
//         // if (!req.user || userId) {
//         //     return res.status(401).json({ error: 'User is not authenticated' });
//         // }

//         const { title, content } = req.body;

//         // Kiểm tra xem tiêu đề và nội dung có được cung cấp hay không
//         if (!title || !content) {
//             return res.status(400).json({ error: "Title and Content are required" });
//         }

//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ error: "User not found" });

//         const newPolicy = new Policy({
//             title,
//             content,
//             createdBy: userId,
//             status: "Active",
//         });

//         await newPolicy.save();
//         res.status(201).json({ success: true, policy: newPolicy });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

export const getPolicies = async (req, res) => {
  try {
    const { pageNumber = 1, pageSize = 20 } = req.query;
    const skipAmount = (pageNumber - 1) * pageSize;

    const policies = await Policy.find()
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(parseInt(pageSize))
      .populate('createdBy', 'name email');

    const totalPolicies = await Policy.countDocuments();
    const isNext = totalPolicies > skipAmount + policies.length;

    res.status(200).json({
      success: true,
      policies,
      isNext,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// **Lấy chi tiết một Policy**
export const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id).populate(
      'createdBy',
      'name email',
    );
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.status(200).json({ success: true, policy });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// **Chuyển trạng thái Active/Inactive**
export const togglePolicyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id);
    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    policy.status = policy.status === 'Active' ? 'Inactive' : 'Active';
    policy.updatedAt = Date.now();
    await policy.save();

    res.status(200).json({
      success: true,
      message: 'Policy status updated successfully',
      updatedPolicy: policy,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

