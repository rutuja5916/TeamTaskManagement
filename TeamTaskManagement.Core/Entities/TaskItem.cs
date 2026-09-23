using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;
using TeamTaskManagement.Core.Enums;

namespace TeamTaskManagement.Core.Entities
{
    public class TaskItem
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int TeamId { get; set; }

        public int AssignedTo { get; set; }

        public int AssignedBy { get; set; }

        public TaskStatusEnum Status { get; set; } = TaskStatusEnum.ToDo;

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        public DateTime Deadline { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Relationships
        public Team Team { get; set; } = null!;

        public User Assignee { get; set; } = null!;

        public User Creator { get; set; } = null!;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();

        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    }
}
