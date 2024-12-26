const ReportTask = require('../models/reportTask.model');

// Add a report
exports.addReport = async (req, res) => {
  try {
    const { task_id, user_id, desc, activity } = req.body;

    if (!task_id || !user_id || !desc || !activity) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the task report by task_id
    let reportTask = await ReportTask.findOne({ task_id });

    const newReport = { user_id, desc, activity };

    if (reportTask) {
      // If task_id exists, add the new report to the reports array
      reportTask.reports.push(newReport);
      reportTask = await reportTask.save();
      return res.status(200).json({ message: "Report added to existing task.", reportTask });
    } else {
      // If task_id does not exist, create a new task report document
      reportTask = new ReportTask({
        task_id,
        reports: [newReport],
      });

      const savedReportTask = await reportTask.save();
      return res.status(201).json({ message: "New report task created.", savedReportTask });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports for a task
exports.getReportsByTaskId = async (req, res) => {
  try {
    const { task_id } = req.params;

    const reportTask = await ReportTask.findOne({ task_id }).populate('reports.user_id', 'name');
    if (!reportTask) {
      return res.status(404).json({ message: "No reports found for this task." });
    }

    res.status(200).json(reportTask.reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all reports for a task
// exports.getReportsByTaskId = async (req, res) => {
//     try {
//       const { task_id } = req.params;
  
//       const reportTask = await ReportTask.findOne({ task_id })
//         .populate('reports.user_id', 'name')
//         .sort({ 'reports.date': 1 });  // Sort reports by date in ascending order
  
//       if (!reportTask) {
//         return res.status(404).json({ message: "No reports found for this task." });
//       }
  
//       res.status(200).json(reportTask.reports);
//     } catch (error) {
//       res.status(500).json({ message: error.message });
//     }
//   };
  