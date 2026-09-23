using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamTaskManagement.Core.Enums;

namespace TeamTaskManagement.Core.Entities
{
    public class Notification
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int TaskId { get; set; }

        public NotificationType Type { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime CreatedAt { get; set; }

        // Relationships
        public User User { get; set; } = null!;

        public TaskItem Task { get; set; } = null!;
    }
}
