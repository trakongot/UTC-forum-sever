import Thread from '../models/threadModel.js';
import User from '../models/userModel.js';

export const getPostCountByMonthHandler = async (req, res) => {
  try {
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 5); 

    const result = await Thread.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalPosts: { $sum: 1 }, 
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }, 
      },
    ]);

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const formattedResult = result.map((item) => ({
      month: monthNames[item._id.month - 1], 
      threads: item.totalPosts, 
    }));

    res.status(200).json({ success: true, data: formattedResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getMonthlyRegistrations = async (req, res) => {
  try {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const result = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalRegistrations: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }, 
      },
    ]);

    const formattedResult = result.map((item) => ({
      month: monthNames[item._id.month - 1], 
      totalRegistrations: item.totalRegistrations,
    }));

    const completeData = monthNames.map((month) => {
      const monthData = formattedResult.find((data) => data.month === month);
      return {
        month,
        totalRegistrations: monthData ? monthData.totalRegistrations : 0,
      };
    });

    res.status(200).json({ success: true, data: completeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getUserGrowthCumulativeForChart = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    let cumulativeTotal = 0;
    const formattedData = result.map((item) => {
      cumulativeTotal += item.totalUsers;

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      const monthName = monthNames[item._id.month - 1];

      return {
        month: monthName,
        user: cumulativeTotal, 
      };
    });

    res.status(200).json({ success: true, data: formattedData });
  } catch (err) {
    console.error('Error fetching user growth data for chart:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getPostContentStatistics = async (req, res) => {
  try {
    const result = await Thread.aggregate([
      {
        $project: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          textOnlyPosts: {
            $cond: [
              {
                $and: [{ $eq: [{ $size: { $ifNull: ['$media', []] } }, 0] }],
              },
              1,
              0,
            ],
          },
          textAndImagePosts: {
            $cond: [
              {
                $and: [
                  { $gt: [{ $size: { $ifNull: ['$media', []] } }, 0] },
                  { $eq: [{ $size: { $ifNull: ['$media.video', []] } }, 0] },
                ],
              },
              1,
              0,
            ],
          },
          textAndAllContentPosts: {
            $cond: [
              {
                $and: [
                  { $gt: [{ $size: { $ifNull: ['$media', []] } }, 0] },
                  { $gt: [{ $size: { $ifNull: ['$media.video', []] } }, 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          totalPosts: { $sum: 1 },
          textOnlyPosts: { $sum: '$textOnlyPosts' },
          textAndImagePosts: { $sum: '$textAndImagePosts' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    console.log('Grouped and aggregated result:', result); 
    const formattedResult = result.map((item) => ({
      month: `${item._id.month}/${item._id.year}`,
      threads: item.totalPosts,
      textThreads: item.textOnlyPosts,
      textAndImageThreads: item.textAndImagePosts,
    }));

    res.status(200).json({ success: true, data: formattedResult });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); 
    res.status(200).json({ success: true, totalUsers });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
export const getMonthlyUserStatistics = async (req, res) => {
  try {
    // Truy vấn dữ liệu người dùng và nhóm theo tháng
    const result = await User.aggregate([
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          newUsers: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const formattedResult = result.map((item, index, array) => {
      const currentMonth = item._id;
      const currentMonthCount = item.newUsers;
      let previousMonthCount = 0;
      let percentageChange = '0.00%';

      if (index > 0) {
        const previousMonth = array[index - 1];
        previousMonthCount = previousMonth.newUsers;

        if (previousMonthCount > 0) {
          const change =
            ((currentMonthCount - previousMonthCount) / previousMonthCount) *
            100;
          percentageChange = `${change.toFixed(2)}%`;
        }
      }

      return {
        month: `${currentMonth.month}/${currentMonth.year}`,
        newUsers: currentMonthCount,
        percentageChange,
      };
    });

    res.status(200).json({ success: true, data: formattedResult });
  } catch (error) {
    console.error('Error fetching monthly user statistics:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getPostStatistics = async (req, res) => {
  try {
    const result = await Thread.aggregate([
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          totalPosts: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const formattedResult = result.map((item, index) => {
      const currentMonth = `${item._id.month}/${item._id.year}`;
      const totalPosts = item.totalPosts;

      let percentageChange = '0.00%';
      if (index > 0) {
        const previousPosts = result[index - 1].totalPosts;
        if (previousPosts > 0) {
          const change = ((totalPosts - previousPosts) / previousPosts) * 100;
          percentageChange = `${change.toFixed(2)}%`;
        }
      }

      return {
        month: currentMonth,
        totalPosts,
        percentageChange,
      };
    });

    res.status(200).json({ success: true, data: formattedResult });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
