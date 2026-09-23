using TeamTaskManagement.Core.Enums;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Core.DTOs.Tasks
{
    public class TaskResponse
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int TeamId { get; set; }

        public string TeamName { get; set; } = string.Empty;

        public int AssignedTo { get; set; }

        public string AssignedToName { get; set; } = string.Empty;

        public int AssignedBy { get; set; }

        public string AssignedByName { get; set; } = string.Empty;

        public TaskStatusEnum Status { get; set; }

        public TaskPriority Priority { get; set; }

        public DateTime Deadline { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}