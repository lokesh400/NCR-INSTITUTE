# NCR-INSTITUTE

A comprehensive institute management web application for NCR Institute, deployed at [ncriot.in](https://ncriot.in).

## Features
- User authentication and authorization
- Course management
- Job postings
- Enquiry management
- Gallery management
- Admin dashboard

## Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account for image storage

## Environment Variables
The following environment variables are required:

```bash
mongo_url=<Your MongoDB connection string>
secret=<Session secret key>
cloud_name=<Cloudinary cloud name>
api_key=<Cloudinary API key>
api_secret=<Cloudinary API secret>
mailpass=<Email password for nodemailer>
PORT=<Server port (optional, defaults to 3000)>
NODE_ENV=<Environment (development/production)>
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lokesh400/NCR-INSTITUTE.git
cd NCR-INSTITUTE
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the required environment variables.

4. Start the application:

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start and display:
```
MongoDB connected successfully!
Server is running on port 3000
Environment: development
```

## Deployment on Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add all required environment variables in the Render dashboard
5. Deploy!

Render will automatically:
- Install dependencies using `npm install`
- Start the server using `npm start`
- Assign a dynamic PORT through environment variables
- Provide a public URL for your application

## Health Check
The application includes a health check endpoint at `/health` that returns:
- Server status
- MongoDB connection status
- Server uptime

## API Endpoints

### Public Routes
- `GET /` - Home page
- `GET /facilities` - Facilities page
- `GET /gallery` - Gallery page
- `GET /health` - Health check endpoint
- `GET /user/login` - User login
- `GET /user/signup` - User signup

### Admin Routes (Authentication Required)
- `GET /admin` - Admin dashboard
- Routes for managing courses, jobs, galleries, and enquiries

## Project Structure
```
NCR-INSTITUTE/
├── app.js              # Main application file
├── models/             # Database models
├── routes/             # Route handlers
│   ├── user.js        # User authentication routes
│   ├── enquiry.js     # Enquiry routes
│   ├── job.js         # Job management routes
│   └── course.js      # Course management routes
├── views/              # EJS templates
│   ├── admin/         # Admin pages
│   ├── users/         # User pages
│   ├── components/    # Reusable components
│   └── *.ejs          # Other view templates
├── public/             # Static files (CSS, JS, images)
└── package.json        # Dependencies and scripts
```

## Security Features
- Environment variable validation on startup
- XSS protection in error pages
- Session-based authentication with Passport.js
- Role-based access control (Admin/User)
- Secure MongoDB connection handling

## Error Handling
The application includes:
- 404 handler for non-existent routes
- Global error handler for server errors
- Unhandled promise rejection handler
- Uncaught exception handler

## Troubleshooting

### Server won't start
- Verify all required environment variables are set
- Check MongoDB connection string is correct
- Ensure PORT is not already in use

### MongoDB connection failed
- Verify MongoDB connection string format
- Check network connectivity to MongoDB
- Ensure MongoDB instance is running

### Cloudinary upload errors
- Verify Cloudinary credentials are correct
- Check API key permissions
- Ensure file size limits are not exceeded

## Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License
ISC
