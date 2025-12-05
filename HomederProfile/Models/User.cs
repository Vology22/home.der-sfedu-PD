User.csusing System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomederProfile.Models
{
	[Table("users")]  // Это таблица в базе данных
	public class User
	{
		[Key]  // Главный ключ таблицы
		[Column("user_id")]
		public ulong UserId { get; set; }

		[Column("full_name")]
		[StringLength(120)]
		public string? FullName { get; set; }

		[Column("bio")]
		public string? Bio { get; set; }

		[Column("tg_id")]
		[StringLength(48)]
		public string? TgId { get; set; }

		[Column("created_at")]
		public DateTime CreatedAt { get; set; }

		// Связи с другими таблицами
		public virtual ICollection<Property> Properties { get; set; } = new List<Property>();
		public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
	}
}