using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomederProfile.Models
{
	[Table("properties")]
	public class Property
	{
		[Key]
		[Column("prop_id")]
		public ulong PropId { get; set; }

		[Column("owner_id")]
		public ulong OwnerId { get; set; }

		[Column("price")]
		public int? Price { get; set; }

		[Column("title")]
		[StringLength(255)]
		public string? Title { get; set; }

		[Column("description")]
		public string? Description { get; set; }

		[Column("city")]
		[StringLength(60)]
		public string? City { get; set; }

		[Column("created_at")]
		public DateTime CreatedAt { get; set; }

		// Связь с пользователем
		[ForeignKey("OwnerId")]
		public virtual User Owner { get; set; } = null!;

		// Связь с фотографиями
		public virtual ICollection<PropImage> Images { get; set; } = new List<PropImage>();
	}
}