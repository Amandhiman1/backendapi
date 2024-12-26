const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportEntrySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    desc: { type: String, required: true },
    date: { type: Date, default: Date.now },
    activity: { type: String, required: true },
  },
  { _id: false }
);

const reportTaskSchema = new Schema(
  {
    task_id: { type: Schema.Types.ObjectId, ref: 'Tasks', required: true, unique: true },
    reports: { type: [reportEntrySchema], default: [] },
  },
  { timestamps: true }
);

reportTaskSchema.method("toJSON", function () {
  const { _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const ReportTask = mongoose.model("ReportTask", reportTaskSchema);
module.exports = ReportTask;
