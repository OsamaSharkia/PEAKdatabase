# PEAK - Pathway to Education Access in Kent



## 📚 Project Overview

PEAK (Pathway to Education Access in Kent) is a comprehensive web platform designed to support refugees and international students in accessing higher education opportunities in Kent, UK. The platform provides educational resources, pathway guidance, scholarship information, and community support through an intuitive and accessible interface.

This project aims to bridge the information gap for refugees and asylum seekers who want to pursue higher education but face barriers in understanding the UK education system, application processes, language requirements, and available financial support.

### 🎯 Target Audience

- Refugees and asylum seekers in Kent, UK
- International students seeking education in Kent
- Educational advisors and support workers
- Community organizations supporting refugees

## ✨ Key Features

### 📝 Educational Pathways
- **Detailed pathway guides**: Step-by-step information on different routes to higher education
- **University comparison**: Side-by-side comparison of Kent universities
- **Application process guidance**: UCAS application walkthrough
- **Timeline visualization**: Key dates and deadlines for applications

### 📚 Resource Library
- **Downloadable PDF resources**: Official guides and documents
- **Categorized materials**: Organized by topic (admissions, language, financial support)
- **Document previews**: Quick view of resources before downloading
- **Resource recommendations**: Personalized suggestions based on user profile

### ❓ Interactive FAQ System
- **Searchable questions**: Full-text search functionality
- **Category filtering**: Browse by topic area
- **User question submission**: Community-contributed questions
- **Admin moderation**: Review and approval workflow
- **Reply functionality**: Community discussion on questions

### 👤 User Authentication & Profiles
- **Secure registration**: Email verification process
- **Profile customization**: Personal details and preferences
- **Notification settings**: Email alert preferences
- **Password management**: Secure password reset and update
- **Account deletion**: User data removal option

### 👑 Admin Dashboard
- **Content management**: Add, edit, and remove content
- **User management**: View and manage user accounts
- **Question moderation**: Review and respond to submitted questions
- **Analytics overview**: Basic usage statistics
- **System settings**: Configuration options

### 💬 Support Features
- **Chat widget**: Quick help access
- **Contact forms**: Direct communication channels
- **Community engagement**: User interaction opportunities

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Custom styling with responsive design
- **JavaScript**: Client-side interactivity and validation
- **Font Awesome**: Icon library for visual elements
- **Responsive Design**: Mobile-first approach for all device compatibility

### Backend
- **Supabase**: Backend-as-a-Service platform providing:
  - **Authentication**: User registration, login, password reset
  - **Database**: PostgreSQL database for storing user data, FAQs, and application state
  - **Storage**: File storage for documents and resources
  - **Functions**: Serverless functions for business logic
  - **Realtime**: Real-time updates for dynamic content

### Data Storage
- **Supabase PostgreSQL**: Primary database for:
  - User profiles and authentication data
  - FAQ questions and answers
  - Resource metadata
  - System configuration
- **Supabase Storage**: Document and file storage
- **Local Storage**: Fallback for offline functionality and session management

### Integration Points
- **Supabase Auth API**: User authentication and management
- **Supabase Database API**: Data retrieval and manipulation
- **Supabase Storage API**: File upload and download

## 📊 Database Schema

### Tables
- **user_profiles**: User information and preferences
  - id (UUID, PK)
  - email (VARCHAR)
  - name (VARCHAR)
  - phone (VARCHAR)
  - bio (TEXT)
  - is_admin (BOOLEAN)
  - notify_educational (BOOLEAN)
  - notify_resources (BOOLEAN)
  - notify_events (BOOLEAN)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

- **faqs**: Frequently asked questions
  - id (SERIAL, PK)
  - question (TEXT)
  - answer (TEXT)
  - status (VARCHAR) - 'pending', 'approved', 'declined'
  - category_id (INTEGER, FK)
  - image_url (TEXT)
  - user_id (UUID, FK)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)
  - approved_at (TIMESTAMP)
  - approved_by (UUID, FK)

- **faq_categories**: Categories for FAQs
  - id (SERIAL, PK)
  - name (VARCHAR)
  - slug (VARCHAR)
  - icon (VARCHAR)
  - display_order (INTEGER)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

- **faq_replies**: User replies to FAQs
  - id (SERIAL, PK)
  - faq_id (INTEGER, FK)
  - user_id (UUID, FK)
  - content (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## 🚀 Live Demo

The site is hosted on GitHub Pages at [https://osamasharkia.github.io](https://osamasharkia.github.io)

## 📁 Project Structure

```
osamasharkia.github.io/
├── css/                      # Stylesheet files
│   ├── styles.css            # Main stylesheet
│   └── profile.css           # Profile page specific styles
├── documents/                # PDF resources and guides
│   ├── 2023-STAR-Guidance-Applying-for-Scholarships.pdf
│   ├── Higher and further education review.pdf
│   ├── Kent_Universities_Comparison_Guide.pdf
│   ├── WUSC-Manual-2018.pdf
│   ├── guidance_for_refugees_and_asylum_seekers.pdf
│   ├── ielts-general-training-writing-task-1.pdf
│   └── international-undergraduate-guide-parents.pdf
├── js/                       # JavaScript functionality
│   ├── admin.js              # Admin dashboard functionality
│   ├── auth-service.js       # Authentication service
│   ├── faq-submission.js     # FAQ submission handling
│   ├── faq.js                # FAQ display and interaction
│   ├── fix-approval.js       # Admin approval workflow
│   ├── login.js              # Login functionality
│   ├── nav-handler.js        # Navigation handling
│   ├── profile.js            # User profile management
│   ├── register.js           # Registration functionality
│   └── script.js             # Main JavaScript file
├── json/                     # JSON data files
│   └── faq-data.json         # FAQ data (fallback)
├── about.html                # About page
├── admin-login.html          # Admin login page
├── admin-questions.html      # Admin questions management
├── admin.html                # Admin dashboard
├── auth-confirmation.html    # Auth confirmation page
├── auth-redirect.html        # Auth redirect handler
├── contact.html              # Contact page
├── debug-faq-data.html       # Debug tool for FAQ data
├── debug-faq.html            # Debug tool for FAQ system
├── faq-submission.html       # FAQ submission page
├── faq.html                  # FAQ page
├── index.html                # Home page
├── login.html                # Login page
├── pathways.html             # Educational pathways page
├── privacy.html              # Privacy policy
├── profile.html              # User profile page
├── register.html             # Registration page
├── resources.html            # Resources page
├── terms.html                # Terms and conditions
└── README.md                 # Project documentation
```

## 🔧 Setup and Installation

### Prerequisites
- Git
- Web server (local development server or hosting service)
- Supabase account (for backend functionality)

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/osamasharkia.github.io.git
cd osamasharkia.github.io
