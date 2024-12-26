const Task = require('../models/tasks.model');
const User = require('../models/user.model');

// Create a task   
exports._createTask = async (body) => {    //zafar
    try {
        console.log("sdsadasdasd***body", body)
        const { title, description, taskType, queryObject, assignedTo, createdBy } = body;
        // console.log("req*************creatTask",req.body)
        // Ensure assignedTo is provided and valid
        
        if (!assignedTo) {
            return { status: 400, message: 'assignedTo is required' };
        }

        for (let i = 0; i < assignedTo.length; i++) {
            assignee = await User.findById(assignedTo[i]);
        
            if (!assignee) {
                return { status: 404, message: 'Assigned user not found' };
            }
        
            // Ensure Managers can assign tasks to TeamLeads and Executives
            if (createdBy.role === 'Manager' && !['TeamLead', 'Executive'].includes(assignee.role)) {
                return { status: 403, message: 'Managers can only assign tasks to TeamLeads or Executives' };
            }
        
            // Ensure TeamLeads can only assign tasks to Executives
            if (createdBy.role === 'TeamLead' && assignee.role !== 'Executive') {
                return { status: 403, message: 'TeamLeads can only assign tasks to Executives' };
            }
        }
        

        // let assignee;
        // for (let i = 0; i < assignedTo.length; i++) {
        //     assignee = await User.findById(assignedTo[i]);


        //     if (!assignee) {
        //         return { status: 404, message: 'Assigned user not found' };
        //     }

        //     // Ensure Managers can only assign tasks to TeamLeads, and TeamLeads to Executives
        //     if (createdBy.role === 'Manager' && assignee.role !== 'TeamLead') {
        //         return { status: 403, message: 'Managers can only assign tasks to TeamLeads' };
        //     }
        //     if (createdBy.role === 'TeamLead' && assignee.role !== 'Executive') {
        //         return { status: 403, message: 'TeamLeads can only assign tasks to Executives' };
        //     }
        // }
        console.log("assignee",assignee)

        let task = new Task({
            title,
            description,
            queryObject,
            taskType,
            // assignType,
            assignedTo: assignedTo,
            createdBy: createdBy._id,
            status: 'Pending'
        });

        // If the creator is a TeamLead or Executive, task needs approval
        if (createdBy.role === 'TeamLead') {
            task.status = 'Pending Approval';
            task.approvalRequestedBy = createdBy._id;
        }
        if (createdBy.role === 'Executive') {
            task.status = 'Pending Approval';
            task.approvalRequestedBy = createdBy._id;
        }

        console.log("assigneetask987",task)
        const newTask = await task.save();
        // console.log('Task created successfully:', newTask);
        return { status: 201, message: 'Task created successfully', task:newTask };
    } catch (err) {
        console.error('Task creation error:', err);
        return { status: 400, message: err.message };
    }
}




exports.createTask = async (req, res) => { //zafar
    try {
        console.log("sadasdsads**********1", req.body)
        const { title, description, queryObject, assignedTo, taskType } = req.body;
        console.log("sadasdsads**********2", req.body)

        await this._createTask({ title, description, assignedTo, taskType, queryObject, createdBy: req.user });

        // Ensure assignedTo is provided and valid
        // if (!assignedTo) {
        //     return res.status(400).send({ message: 'assignedTo is required' });
        // }

        // const assignee = await User.findById(assignedTo);
        // if (!assignee) {
        //     return res.status(404).send({ message: 'Assigned user not found' });
        // }

        // // Ensure Managers can only assign tasks to TeamLeads, and TeamLeads to Executives
        // if (req.user.role === 'Manager' && assignee.role !== 'TeamLead') {
        //     return res.status(403).send({ message: 'Managers can only assign tasks to TeamLeads' });
        // }
        // if (req.user.role === 'TeamLead' && assignee.role !== 'Executive') {
        //     return res.status(403).send({ message: 'TeamLeads can only assign tasks to Executives' });
        // }

        // let task = new Task({
        //     title,
        //     description,
        //     assignedTo: assignee._id,
        //     createdBy: req.user._id,
        //     status: 'Pending'
        // });

        // // If the creator is a TeamLead or Executive, task needs approval
        // if (req.user.role === 'TeamLead') {
        //     task.status = 'Pending Approval';
        //     task.approvalRequestedBy = req.user._id;
        // }
        // if (req.user.role === 'Executive') {
        //     task.status = 'Pending Approval';
        //     task.approvalRequestedBy = req.user._id;
        // }

        // await task.save();
        res.status(201).send({ message: 'Task created successfully' });
    } catch (err) {
        console.error('Task creation error:', err);
        res.status(400).send({ message: err.message });
    }
};



// Assign a task


exports.assignTask = async (req, res) => {
    try {
        const { taskId, assignedTo } = req.body;
        const user = await User.findById(assignedTo);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Ensure Managers can only assign tasks to TeamLeads, and TeamLeads to Executives
        if (req.user.role === 'Manager' && user.role !== 'TeamLead') {
            return res.status(403).send({ message: 'Managers can only assign tasks to TeamLeads' });
        }
        if (req.user.role === 'TeamLead' && user.role !== 'Executive') {
            return res.status(403).send({ message: 'TeamLeads can only assign tasks to Executives' });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        task.assignedTo = user._id;
        await task.save();

        res.status(200).send({ message: 'Task assigned successfully' });
    } catch (err) {
        console.error('Task assignment error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Change task status
exports.changeTaskStatus = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        // Ensure only the assigned user can change the task status
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: 'You can only change the status of tasks assigned to you' });
        }

        task.status = status;
        await task.save();

        res.status(200).send({ message: 'Task status updated successfully' });
    } catch (err) {
        console.error('Task status change error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Request task approval
exports.requestTaskApproval = async (req, res) => {
    try {
        const { taskId } = req.body;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        if (task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: 'You can only request approval for tasks assigned to you' });
        }

        task.status = 'Pending Approval';
        task.approvalRequestedBy = req.user._id;
        await task.save();

        res.status(200).send({ message: 'Approval request sent' });
    } catch (err) {
        console.error('Task approval request error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Approve task
exports.approveTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { comments } = req.body;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        if (task.status !== 'Pending Approval') {
            return res.status(403).send({ message: 'Only tasks pending approval can be approved' });
        }

        if (req.user.role === 'Manager' && task.createdBy.toString() === req.user._id.toString()) {
            return res.status(403).send({ message: 'Managers cannot approve their own tasks' });
        }
        if (req.user.role === 'TeamLead' && task.createdBy.toString() === req.user._id.toString()) {
            return res.status(403).send({ message: 'TeamLeads cannot approve their own tasks' });
        }

        task.status = 'Approved';
        task.approvedBy = req.user._id;
        task.approvalComments = comments;
        await task.save();

        res.status(200).send({ message: 'Task approved successfully' });
    } catch (err) {
        console.error('Task approval error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Reject task
exports.rejectTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { comments } = req.body;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        if (task.status !== 'Pending Approval') {
            return res.status(403).send({ message: 'Only tasks pending approval can be rejected' });
        }

        if (req.user.role === 'Manager' && task.createdBy.toString() === req.user._id.toString()) {
            return res.status(403).send({ message: 'Managers cannot reject their own tasks' });
        }
        if (req.user.role === 'TeamLead' && task.createdBy.toString() === req.user._id.toString()) {
            return res.status(403).send({ message: 'TeamLeads cannot reject their own tasks' });
        }

        task.status = 'Rejected';
        task.rejectedBy = req.user._id;
        task.rejectionComments = comments;
        await task.save();

        res.status(200).send({ message: 'Task rejected successfully' });
    } catch (err) {
        console.error('Task rejection error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Get all tasks
// exports.getTasks = async (req, res) => {
//     try {
//         let tasks;
//         if (req.user.role === 'Admin') {
//             // Admin can see all tasks

//             tasks = await Task.find().populate('assignedTo createdBy approvalRequestedBy approvedBy rejectedBy');
//         } else if (req.user.role === 'Manager') {
//             // Manager can see their own tasks and their team's tasks
//             const teamMembers = await User.find({ createdBy: req.user._id });
//             const teamMemberIds = teamMembers.map(member => member._id);
//             tasks = await Task.find({
//                 $or: [
//                     { createdBy: req.user._id },
//                     { assignedTo: req.user._id },
//                     { assignedTo: { $in: teamMemberIds } }
//                 ]
//             }).populate('assignedTo createdBy approvalRequestedBy approvedBy rejectedBy');
//         } else if (req.user.role === 'TeamLead') {
//             // TeamLead can see their own tasks and their team's tasks
//             const teamMembers = await User.find({ createdBy: req.user._id });
//             const teamMemberIds = teamMembers.map(member => member._id);
//             tasks = await Task.find({
//                 $or: [
//                     { createdBy: req.user._id },
//                     { assignedTo: req.user._id },
//                     { assignedTo: { $in: teamMemberIds } }
//                 ]
//             }).populate('assignedTo createdBy approvalRequestedBy approvedBy rejectedBy');
//         } else if (req.user.role === 'Executive') {
//             // Executive can see their own tasks
//             tasks = await Task.find({
//                 $or: [
//                     { createdBy: req.user._id },
//                     { assignedTo: req.user._id }
//                 ]
//             }).populate('assignedTo createdBy approvalRequestedBy approvedBy rejectedBy');
//         }

//         res.status(200).send(tasks);
//     } catch (err) {
//         console.error('Get tasks error:', err);
//         res.status(400).send({ message: err.message });
//     }
// };

exports.getTasks = async (req, res) => { //zafar
    try {
      let tasks;
      const userId = req.user._id;
      console.log("User ID:", userId);
      console.log("User Role:", req.user.role);
      switch(req.user.role) {
        case 'Admin':
          tasks = await Task.find()
            .populate({
              path: 'assignedTo',
            //   select: 'name email'
            })
            .populate('createdBy', 'name email')
            .populate('approvalRequestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email');
          break;
        
        case 'Manager':
        case 'TeamLead':
          const teamMembers = await User.find({ createdBy: userId });
          const teamMemberIds = teamMembers.map(member => member._id);
          
          tasks = await Task.find({
            $or: [
              { createdBy: userId },
              { assignedTo: { $in: [userId] } },
              { assignedTo: { $in: teamMemberIds } }
            ]
          })
            .populate({
              path: 'assignedTo',
            //   select: 'name email'
            })
            .populate('createdBy', 'name email')
            .populate('approvalRequestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email');
          break;
        
        case 'Executive':
          tasks = await Task.find({
            $or: [
              { createdBy: userId },
              { assignedTo: { $in: [userId] } }
            ]
          })
            .populate({
              path: 'assignedTo',
            //   select: 'name email'
            })
            .populate('createdBy', 'name email')
            .populate('approvalRequestedBy', 'name email')
            .populate('approvedBy', 'name email')
            .populate('rejectedBy', 'name email');
          break;
        
        default:
          return res.status(403).send({ message: 'Unauthorized access' });
      }

      console.log("tasks987",tasks)
    //   res.status(200).send(tasks);
    return res.status(200).json({
        message:"assigned Tasks list",
        status:true,
        tasks
    })
    } catch (err) {
      console.error('Get tasks error:', err);
      res.status(400).send({ message: err.message });
    }
  };
  



// Get task by ID
exports.getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findById(taskId).populate('assignedTo createdBy approvedBy rejectedBy');
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }
        res.status(200).send(task);
    } catch (err) {
        console.error('Get task by ID error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userRole = req.user.role;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        const isOwner = task.createdBy.toString() === req.user._id.toString();
        const isPendingApproval = task.status === 'Pending Approval';
        if (userRole === 'Executive' && isOwner && !isPendingApproval) {
            return res.status(403).send({ message: 'You can only update tasks that are pending approval' });
        }

        if (userRole !== 'Admin' && userRole !== 'Manager' && userRole !== 'TeamLead' && !isOwner) {
            return res.status(403).send({ message: 'You do not have the required permissions or role to perform this action' });
        }

        const updates = req.body;
        const updatedtask = await Task.findByIdAndUpdate({ _id: task.id }, updates)

        res.status(200).send({ message: 'Task updated successfully', updatedtask });
    } catch (err) {
        console.error('Update task error:', err);
        res.status(400).send({ message: err.message });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await Task.findByIdAndDelete(taskId);

        if (!task) {
            return res.status(404).send({ message: 'Task not found' });
        }

        res.status(200).send({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Delete task error:', err);
        res.status(400).send({ message: err.message });
    }
};