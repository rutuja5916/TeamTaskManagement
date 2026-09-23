using System.ComponentModel.DataAnnotations;
using TeamTaskManagement.Core.Enums;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Core.DTOs.Tasks
{
    public class CreateTaskRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        public int TeamId { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        public TaskStatusEnum Status { get; set; } = TaskStatusEnum.ToDo;

        [Required]
        public TaskPriority Priority { get; set; }

        [Required]
        public DateTime Deadline { get; set; }
    }
}