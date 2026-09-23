using System.ComponentModel.DataAnnotations;
using TeamTaskManagement.Core.Enums;

namespace TeamTaskManagement.Core.DTOs.Tasks
{
    public class UpdateTaskRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Required]
        public int AssignedTo { get; set; }

        [Required]
        public TaskPriority Priority { get; set; }

        [Required]
        public DateTime Deadline { get; set; }
    }
}