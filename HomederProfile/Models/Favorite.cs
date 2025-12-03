using System.ComponentModel.DataAnnotations.Schema;

namespace HomederProfile.Models
{
	[Table("favorites")]
	public class Favorite
	{
		[Column("user_id")]
		public ulong UserId { get; set; }

		[Column("prop_id")]
		public ulong PropId { get; set; }

		// Связь с пользователем
		[ForeignKey("UserId")]
		public virtual User User { get; set; } = null!;

		// Связь с объявлением
		[ForeignKey("PropId")]
		public virtual Property Property { get; set; } = null!;
	}
}