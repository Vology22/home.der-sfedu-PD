using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Models
{
    public class Props
    {
        public int         PropId        { get; set; }
        public int?        OwnerId       { get; set; }
        public Users?      Users         { get; set; }
        public int         Price         { get; set; }
        public string      Title         { get; set; } = string.Empty;
        public string      Description   { get; set; } = string.Empty;
        public string      City          { get; set; } = string.Empty;
        public DateTime    CreatedAt     { get; set; } = DateTime.Now;

        
    }

    public class PropImage
    {
        public int       ImageId    { get; set; }
        public string    ImageUrl   { get; set; } = string.Empty;
        public int?      PropId     { get; set; }
        public  Props?   Props      { get; set; }
    }
}