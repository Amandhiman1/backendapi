const mongoose = require('mongoose');
const Schema = mongoose.Schema

const taskSchema = new Schema(
      {
        title: { type: String, required: true },
        description: { type: String },
        taskType: {type: String, required: true},
        // taskType: {type: Array, required: true}, //mz
        // assignType:{type:String,required:true},  //callback,blog,faq
        queryObject: { type: Object, required: true },
        // assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        // assignedTo: {type: Array, required: true},  //mz
        assignedTo: { 
          type: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
          required: true 
        },
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Approved', 'Rejected', 'Pending Approval'], default: 'Pending' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false},
        approvalRequestedBy:{ type: Schema.Types.ObjectId, ref: 'User' },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        approvalComments: String,
        rejectionComments: String
      },
      { timestamps: true }
    );
  
    taskSchema.method("toJSON", function() {
      const {_id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Task = mongoose.model("Tasks", taskSchema);
    module.exports = Task;

  