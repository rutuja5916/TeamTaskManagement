using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeamTaskManagement.Core.DTOs.Teams
{
    public class AddTeamMemberRequest
    {
        [Required]
        public int UserId { get; set; }
    }
}
