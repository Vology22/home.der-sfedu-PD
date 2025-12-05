using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomederProfile.Models
{
    [Table("prop_image")]
    public class PropImage
    {
        [Key]
        [Column("img_id")]
        public ulong ImgId { get; set; }

        [Column("property")]
        public ulong PropertyId { get; set; }

        [Column("img_url")]
        [Required]
        public string ImgUrl { get; set; } = string.Empty;

        [Column("is_cover")]
        public bool IsCover { get; set; }

        // Связь с объявлением
        [ForeignKey("PropertyId")]
        public virtual Property Property { get; set; } = null!;
    }
}