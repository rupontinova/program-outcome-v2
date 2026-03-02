# BUP Program Outcome Mapper v2

<div align="center">

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Status](https://img.shields.io/badge/status-Under%20Development-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**An Outcome-Based Education (OBE) System for Bangladesh University of Professionals**

[🌐 Live Application](https://program-outcome-v2.vercel.app) | [📖 Documentation](public/SRS_SRE.pdf)

</div>

---

## 📋 Overview

**BUP Program Outcome Mapper v2** is a comprehensive web-based platform designed to facilitate Outcome-Based Education (OBE) implementation at Bangladesh University of Professionals (BUP). This system enables teachers and administrators to map course objectives to program outcomes, track student performance across multiple assessment dimensions, and generate detailed analytical reports.

> **Version 2** serves all BUP departments **except the Engineering Department**, which uses a specialized system.

### 🎯 Key Purpose

- Map course objectives to BICE program outcomes
- Track student achievement across Bloom's Taxonomy and multiple skill profiles
- Provide data-driven insights for continuous curriculum improvement
- Support OBE assessment and accreditation processes

---

## 🌟 Features

### 👨‍🏫 Teacher Side

The teacher interface provides comprehensive tools for course management and student assessment:

#### Course Objective Management
- **Program Outcome Mapping**: Map each course objective to specific BICE Program Outcomes (PO1-PO12)
- **Bloom's Taxonomy Assignment**: Classify objectives by cognitive levels (C1-C6, A1-A3, P1-P5)
- **Multi-Profile Classification**: 
  - **Fundamental Profile**: Core knowledge and skills
  - **Social Profile**: Teamwork, communication, and interpersonal skills
  - **Thinking Profile**: Critical thinking and problem-solving abilities
  - **Personal Profile**: Self-management and lifelong learning

#### Student Assessment
- **Flexible Assessment Types**: Support for quizzes, assignments, midterms, finals, and custom assessments
- **Individual Score Entry**: Record student performance for each course objective
- **Real-time Validation**: Instant feedback on score validity and pass/fail status
- **Bulk Operations**: Efficiently manage scores for multiple students
- **Assessment History**: Track all assessments across the semester

#### Analytics & Reporting
- **Performance Dashboard**: Visual overview of class performance
- **Objective-wise Analysis**: Detailed breakdown by course objective
- **Pass Rate Tracking**: Monitor student success rates
- **Export Capabilities**: Generate reports for accreditation and review

---

### 👨‍💼 Admin Side

The administrative interface provides oversight and analytical capabilities:

#### Dashboard Overview
- **Department-Specific Filtering**: View data for BBA General (BBA Gen) only
- **Program Outcome Analysis**: Comprehensive PO achievement statistics
- **Student Performance Metrics**: Aggregated success rates across all courses
- **Visual Analytics**: Interactive charts and graphs

#### Detailed Student Profiles
- **Individual Achievement Tracking**: View each student's profile across all assessments
- **Multi-Dimensional Visualization**: 
  - **Bar Charts**: Visual representation of achievement percentages across Bloom's, Fundamental, Social, Thinking, and Personal profiles
  - **Achievement Summary**: Numerical breakdown showing achieved vs. total items per profile
  
#### Assessment-wise Breakdown
- **Granular Analysis**: See exactly which profile items (e.g., C1, F1, F2) were achieved for each assessment
- **Pass/Fail Indicators**: Clear visual markers (✓ for pass, ✗ for fail) for each assessment
- **Profile Code Display**: Detailed view of specific competencies achieved or missed

#### PDF Report Generation
- **Comprehensive Reports**: Generate detailed PDF reports for individual Program Outcomes
- **Student-wise Analysis**: Breakdown of achievement by student
- **Course-level Insights**: Performance metrics across all courses
- **Professional Formatting**: Publication-ready reports for accreditation

#### Teacher & Session Management
- **Teacher Account Creation**: Add and manage teacher profiles
- **Session Management**: Create and oversee academic sessions
- **Access Control**: Role-based permissions and security

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Chart.js](https://www.chartjs.org/)** - Data visualization library
- **[react-chartjs-2](https://react-chartjs-2.js.org/)** - React wrapper for Chart.js

### Backend
- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Serverless API endpoints
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[jose](https://github.com/panva/jose)** - JWT authentication

### Deployment & Tools
- **[Vercel](https://vercel.com/)** - Hosting and deployment platform
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[nodemailer](https://nodemailer.com/)** - Email service for OTP

---

## 👥 Development Team

<table>
  <tr>
    <td align="center">
      <strong>Jawad Anzum Fahim</strong><br>
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <strong>Ruponti Muin Nova</strong><br>
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or later)
- **npm** or **yarn** package manager
- **MongoDB** database (local or cloud-based like MongoDB Atlas)
- **Git** for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rupontinova/program-outcome-v2.git
   cd program-outcome-v2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT Secret for Authentication
   JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_secure
   
   # Email Configuration (for OTP)
   EMAIL_SERVER_USER=your_email@example.com
   EMAIL_SERVER_PASSWORD=your_email_password
   EMAIL_FROM=noreply@yourapp.com
   ```

4. **Set Up Database**
   
   Update the database name in `src/lib/mongodb.ts`:
   ```typescript
   const MONGODB_URI = "mongodb+srv://username:password@cluster.mongodb.net/BUP_obe_v2?retryWrites=true&w=majority";
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
program-outcome-v2/
├── src/
│   ├── pages/
│   │   ├── api/                 # API endpoints
│   │   │   ├── admin/           # Admin-specific APIs
│   │   │   ├── teachers/        # Teacher management APIs
│   │   │   ├── courseObjectives.ts
│   │   │   ├── getCourseObjectives.ts
│   │   │   ├── saveScores.ts
│   │   │   └── score_summary.ts
│   │   ├── admin/               # Admin UI pages
│   │   │   ├── homepage.tsx
│   │   │   ├── login.tsx
│   │   │   └── student.tsx
│   │   ├── homepage.tsx         # Teacher dashboard
│   │   └── login.tsx            # Teacher login
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Root redirect
│   ├── lib/
│   │   ├── mongodb.ts           # Database connection
│   │   └── constants.ts         # Global constants
│   └── middleware.ts            # Route protection
├── public/                      # Static assets
├── .env.local                   # Environment variables (not in repo)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Project dependencies
```

---

## 🔐 Default Access

### Teacher Login
- **URL**: `/login`
- Credentials are managed by administrators

### Admin Login
- **URL**: `/admin/login`
- Contact system administrator for credentials

---

## 📊 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Teacher authentication |
| POST | `/api/admin/login` | Admin authentication |
| POST | `/api/courseObjectives` | Save course objectives |
| GET | `/api/getCourseObjectives` | Fetch course objectives |
| POST | `/api/saveScores` | Save student scores |
| GET | `/api/score_summary` | Get performance summary |
| POST | `/api/request-otp` | Request password reset OTP |
| POST | `/api/reset-password` | Reset password with OTP |

---

## 🎓 Target Departments

This version serves all Bangladesh University of Professionals (BUP) departments:

✅ **Supported Departments**
- Business Administration (BBA General)
- Arts & Social Sciences
- Law
- Medicine
- Security & Strategic Studies
- All other non-engineering departments

❌ **Not Supported**
- Engineering Department (uses specialized OBE system)

---

## 🚧 Development Status

**Current Version**: 2.0 (Under Active Development)

### Implemented Features ✅
- Teacher and Admin authentication
- Course objective mapping
- Multi-profile classification system
- Student score management
- Visual analytics with charts
- Assessment-wise breakdowns
- PDF report generation

### Upcoming Features 🔜
- Enhanced reporting capabilities
- Bulk import/export functionality
- Mobile-responsive improvements
- Advanced analytics dashboard
- Email notifications for stakeholders

---

## 📝 Database Schema

### Collections
- **`teachers`**: Teacher accounts and credentials
- **`courses`**: Course information and objectives
- **`scores`**: Student assessment scores
- **`sessions`**: Academic sessions

### Key Data Models
- Course objectives linked to Program Outcomes (PO1-PO12)
- Multi-dimensional profiling (Bloom's, Fundamental, Social, Thinking, Personal)
- Pass/fail tracking with configurable thresholds

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Contact

For questions, issues, or suggestions:
- **GitHub Issues**: [Report a bug or request a feature](https://github.com/rupontinova/program-outcome-v2/issues)
- **Email**: Contact the development team through BUP official channels

---

## 🙏 Acknowledgments

- Bangladesh University of Professionals for project support
- Faculty members for valuable feedback
- OBE standards and best practices from international accreditation bodies

---

<div align="center">

**Made with ❤️ for BUP by the Development Team**

[⬆ Back to Top](#bup-program-outcome-mapper-v2)

</div>
