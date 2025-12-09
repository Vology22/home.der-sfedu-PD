using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomederProfile.Data;
using HomederProfile.Models;

namespace HomederProfile.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ������� ��������
        public async Task<IActionResult> Index(string? userId)
        {
            // ���������, ���� �� �������� userId � URL
            if (!string.IsNullOrEmpty(userId) && ulong.TryParse(userId, out ulong id))
            {
                await LoadUserData(id);
            }
            // ��������� ������
            else
            {
                var sessionUserId = HttpContext.Session.GetString("CurrentUserId");
                if (!string.IsNullOrEmpty(sessionUserId) && ulong.TryParse(sessionUserId, out ulong sessionId))
                {
                    await LoadUserData(sessionId);
                }
            }

            return View();
        }

        // API ��� ��������� ������������ (���������� �� JavaScript)
        [HttpPost]
        public async Task<IActionResult> SetUser([FromBody] SetUserRequest request)
        {
            if (string.IsNullOrEmpty(request?.UserId))
            {
                return BadRequest(new { error = "User ID is required" });
            }

            if (!ulong.TryParse(request.UserId, out ulong userId))
            {
                return BadRequest(new { error = "Invalid User ID" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            // ��������� � ������
            HttpContext.Session.SetString("CurrentUserId", request.UserId);

            return Ok(new
            {
                success = true,
                user = new
                {
                    userId = user.UserId,
                    fullName = user.FullName,
                    bio = user.Bio,
                    tgId = user.TgId
                }
            });
        }

        // API ��� ��������� ������ ������������
        [HttpGet]
        public async Task<IActionResult> GetUser(ulong id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Json(new
            {
                user.UserId,
                user.FullName,
                user.Bio,
                user.TgId,
                user.CreatedAt
            });
        }

        // API ��� ��������� ���������� ������������
        [HttpGet]
        public async Task<IActionResult> GetUserProperties(ulong userId)
        {
            var properties = await _context.Properties
                .Include(p => p.Images)
                .Where(p => p.OwnerId == userId)
                .Select(p => new
                {
                    p.PropId,
                    p.Title,
                    p.Price,
                    p.City,
                    p.Description,
                    p.CreatedAt,
                    CoverImage = p\.Images\.FirstOrDefault(i => i\.IsCover) \?\.ImgUrl/CoverImage = p\.Images\.FirstOrDefault(i => i\.IsCover) != null ? p\.Images\.FirstOrDefault(i => i\.IsCover)!.ImgUrl : null/
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Json(properties);
        }

        // ����� �� �������
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("CurrentUserId");
            return RedirectToAction("Index");
        }

        // ��������������� ����� ��� �������� ������
        private async Task LoadUserData(ulong userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                ViewBag.CurrentUser = user;

                var properties = await _context.Properties
                    .Include(p => p.Images)
                    .Where(p => p.OwnerId == userId)
                    .ToListAsync();
                ViewBag.Properties = properties;
            }
        }
    }

    // ������ ��� �������
    public class SetUserRequest
    {
        public string? UserId { get; set; }
    }
}