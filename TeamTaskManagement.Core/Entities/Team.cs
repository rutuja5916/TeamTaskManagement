using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeamTaskManagement.Core.Entities
{
    public class Team
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        // Relationships
        public User Creator { get; set; } = null!;

        public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();

        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}
