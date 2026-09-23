using TeamTaskManagement.Core.Enums;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Core.DTOs.Tasks
{
    public class TaskFilterRequest
    {
        public TaskStatusEnum? Status { get; set; }

        public TaskPriority? Priority { get; set; }

        public DateTime? DeadlineFrom { get; set; }

        public DateTime? DeadlineTo { get; set; }

        public int? AssignedTo { get; set; }

        public int? TeamId { get; set; }
    }
}