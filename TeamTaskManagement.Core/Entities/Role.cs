using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamTaskManagement.Core.Enums;

namespace TeamTaskManagement.Core.Entities
{
    public class Role
    {
        public int Id { get; set; }

        public RoleType Name { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
