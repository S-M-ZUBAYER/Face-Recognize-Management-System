import formatDateForStorage from "./formatDateForStorage";

function checkLeaveDataChanges(oldLeave, newLeave) {
  const changes = [];

  // Format helper
  const fmt = (val) => (val || val === 0 ? val : "Empty");

  // Check main fields
  const mainFields = [
    "startDate",
    "endDate",
    "leaveCategory",
    "leaveType",
    "documentUrl",
    "status",
  ];

  mainFields.forEach((field) => {
    const oldVal = oldLeave[field];
    const newVal = newLeave[field];

    // Date comparison
    if (field.includes("Date")) {
      const oldDate = oldVal ? formatDateForStorage(new Date(oldVal)) : oldVal;
      const newDate = newVal ? formatDateForStorage(new Date(newVal)) : newVal;
      if (oldDate !== newDate) {
        changes.push(`${field}: ${fmt(oldDate)} → ${fmt(newDate)}`);
      }
    }
    // Regular comparison
    else if (oldVal !== newVal) {
      changes.push(`${field}: ${fmt(oldVal)} → ${fmt(newVal)}`);
    }
  });

  // Check ALL description fields
  const descFields = [
    "des",
    "fromTime",
    "toTime",
    "fStartHour",
    "fEndHour",
    "lStartHour",
    "lEndHour",
  ];
  const oldDesc = oldLeave.description || {};
  const newDesc = newLeave.description || {};

  descFields.forEach((field) => {
    if (oldDesc[field] !== newDesc[field]) {
      changes.push(`${field}: ${fmt(oldDesc[field])} → ${fmt(newDesc[field])}`);
    }
  });

  // Check approverName
  const oldApprover = oldLeave.approverName || {};
  const newApprover = newLeave.approverName || {};

  if (oldApprover.leader !== newApprover.leader) {
    changes.push(
      `approverName.leader: ${fmt(oldApprover.leader)} → ${fmt(newApprover.leader)}`,
    );
  }
  if (oldApprover.admin !== newApprover.admin) {
    changes.push(
      `approverName.admin: ${fmt(oldApprover.admin)} → ${fmt(newApprover.admin)}`,
    );
  }

  return changes.length > 0 ? changes.join("\n") : "No changes";
}

export default checkLeaveDataChanges;
