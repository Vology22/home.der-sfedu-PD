using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Models
{
    public class Users
    {
        public int      UserId       { get; set; }
        public string   Name         { get; set; } = string.Empty;
        public string   TgUsername   { get; set; } = string.Empty;
        public string   Bio          { get; set; } = string.Empty;
    }
}