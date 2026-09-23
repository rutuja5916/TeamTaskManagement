using System.ComponentModel.DataAnnotations;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Core.DTOs.Tasks
{
    public class UpdateTaskStatusRequest
    {
        [Required]
        public TaskStatusEnum Status { get; set; }
    }
}