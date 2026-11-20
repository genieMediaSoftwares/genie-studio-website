# Genie Studio — Backend API Module Documentation

This directory contains the REST API service for **Genie Studio**, built with Node.js, Express, MySQL, Sharp, and JWT authentication.

---

## Architecture Overview

- **Server Framework**: Express `5.2.1` on Node.js.
- **Database Engine**: MySQL using `mysql2` connection pool (`10` concurrent connection limit).
- **Security & Authentication**:
  - JWT tokens signed using HMAC SHA-256 (`jsonwebtoken` `9.0.3`) with 24-hour expiration.
  - Password hashing with salt rounds using `bcrypt` `6.0.0`.
- **Image Ladder Pipeline** (`lib/imagePipeline.js`):
  - Uses `sharp` `0.35.3` to read full-resolution camera uploads.
  - Generates ladder widths: `400px`, `800px`, `1200px`, `1600px`, and `2000px`.
  - Outputs formats: WebP (quality 82) and AVIF (quality 58).
  - Generates 24px blurred Low-Quality Image Placeholder (LQIP) as a base64 data URI.
- **Social Media Crawlers** (`/share/:permalink`):
  - Serves server-rendered HTML with Open Graph tags for WhatsApp, Facebook, Twitter, and LinkedIn crawlers, and executes instant JavaScript redirect to the SPA article page for humans.

---

## Directory Structure

```
backend/
├── lib/
│   └── imagePipeline.js          # Sharp image resizing, format conversion, and LQIP
├── public/
│   └── uploads/                  # Temporary buffer directory for multer uploads
├── scripts/
│   ├── backfill-image-variants.js# One-time script to backfill variants for existing photos
│   ├── image-urls.txt            # Extracted list of studio photo URLs
│   └── variants-manifest.json    # Local state tracker for backfilled variants
├── package.json
└── server.js                     # Main application entry point, DB pool, and API routes
```

---

## Environment Variables

Create `.env` in this directory:

```ini
# MySQL Database Connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=geniestudio_db

# Security
JWT_SECRET=super_secret_jwt_key_minimum_32_chars

# Server Settings
PORT=5000
NODE_ENV=development

# Allowed Origins & Subdomain Configuration
BASE_URL=http://localhost:5000
```

---

## Database Migration & Schema

When started, `server.js` verifies the MySQL connection and creates the `images`, `portfolio_images`, and `gallery_images` tables.

**IMPORTANT**: The `admins` and `blogs` tables **MUST** be created manually before logging in or creating blogs:

```sql
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  createdAt BIGINT DEFAULT NULL,
  updatedAt BIGINT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  permalink VARCHAR(255) NOT NULL UNIQUE,
  metaDescription TEXT DEFAULT NULL,
  description LONGTEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  keywords VARCHAR(500) DEFAULT NULL,
  status ENUM('draft', 'published') DEFAULT 'draft',
  createdAt BIGINT DEFAULT NULL,
  updatedAt BIGINT DEFAULT NULL,
  KEY idx_status_created (status, createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## API Endpoints Reference

### Public Routes
- `GET /`: Health check confirmation.
- `POST /api/login`: Authenticate admin (`{ "email", "password" }`).
- `GET /api/portfolio`: Retrieve portfolio items (`?category=corporate`).
- `GET /api/gallery`: Retrieve 3D Dome Gallery images.
- `GET /api/blogs`: Retrieve published articles.
- `GET /share/:permalink`: Render crawler-specific Open Graph HTML page.

### Protected Admin Routes (Requires `Authorization: Bearer <token>`)
- `POST /api/images`: Upload image to library (runs Sharp pipeline).
- `GET /api/images`: Fetch all media in library.
- `PUT /api/images/:id`: Rename image display title.
- `DELETE /api/images/:id`: Remove image entry.
- `POST /api/portfolio/bulk`: Ingest portfolio image URLs in bulk.
- `PUT /api/portfolio/reorder`: Update display sequence.
- `PUT /api/portfolio/:id`: Edit portfolio item metadata.
- `DELETE /api/portfolio/:id`: Delete portfolio item.
- `POST /api/gallery/bulk`: Add images to 3D Dome Gallery in bulk.
- `PUT /api/gallery/reorder`: Update dome order.
- `PUT /api/gallery/:id`: Update dome alt text.
- `DELETE /api/gallery/:id`: Delete dome item.
- `GET /api/admin/blogs`: Retrieve all blogs (drafts + published).
- `POST /api/blogs`: Create article with featured image.
- `PUT /api/blogs/:id`: Update article.
- `DELETE /api/blogs/:id`: Delete article.

---

## Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm start
```

---

## Subdomain Migration Notes

1. **CORS Configuration**: In `server.js`, locate `allowedOrigins` and add the new frontend subdomain (e.g., `https://studio.yourdomain.com`).
2. **Upload Destination**: In `server.js` and `lib/imagePipeline.js`, replace `https://geniestudio.in/upload.php` with either local storage (served via `app.use('/uploads', express.static(...))`) or a cloud storage provider (AWS S3, Cloudinary).
3. **Share Redirects**: In `/share/:permalink`, update the destination URL from `https://geniestudio.in/blog/` to the new subdomain path.
