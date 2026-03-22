# Data Model Documentation

This document describes the data model for the LTI (Learning Tracking Initiative) application, including entity descriptions, field definitions, relationships, and an entity-relationship diagram.

## Implementation order (reference)

1. **Prerequisite — authentication:** Persist recruiter accounts (`User`), hash passwords at rest (one-way; e.g. bcrypt or Argon2), and ship a **login screen** plus server-side session (no JWT for now). Candidate management and uploads require an authenticated session.
2. **Database:** Prisma schema and migrations for `User`, `Candidate`, nested entities, and `Resume`; file metadata points to files stored on disk.
3. **Backend:** APIs for login/session, candidate creation (including validation and duplicate-email handling), and CV upload.
4. **Frontend:** Bilingual UI (English/Spanish, user-selected), WCAG 2.1 AA, Chrome/Edge; add-candidate flow optimized for consecutive registrations.

## Model Descriptions

### 1. User (Recruiter account)

Represents an internal user who signs in with username and password to access recruiter features (session-based authentication).

**Fields:**
- `id`: Unique identifier (Primary Key)
- `username`: Unique login identifier (max 100 characters)
- `passwordHash`: One-way password hash — **never** store plaintext passwords; do not log this field
- `createdAt` / `updatedAt` (optional but recommended for audit)

**Validation rules:**
- Username required, unique, trimmed; allowed characters aligned with product policy (alphanumeric plus safe punctuation as implemented)
- Password strength rules as defined in backend (minimum length, complexity if required)

**Relationships:**
- None required for MVP; optional future: `candidatesCreated` or audit fields on `Candidate` if product requires attribution

### 2. Candidate
Represents a job candidate who can apply for positions within the system.

**Fields:**
- `id`: Unique identifier for the candidate (Primary Key)
- `firstName`: Candidate's first name (max 100 characters)
- `lastName`: Candidate's last name (max 100 characters)
- `email`: Candidate's unique email address (max 255 characters)
- `phone`: Candidate's phone number (optional; international formats supported, max 30 characters stored)
- `address`: Candidate's address (optional, max 100 characters)

**Validation Rules:**
- First name and last name are required, 2-100 characters: letters (Unicode letters), spaces, and hyphens (for compound names); no digits-only values
- Email is required, must be unique, and follow valid email format; duplicate email attempts must return a **dedicated API error** (distinct message/code from generic validation errors)
- Phone is optional; accept international formats (not limited to Spanish numbering); validate length and sensible character set (digits, spaces, `+`, parentheses, hyphens as implemented)
- Address is optional but cannot exceed 100 characters
- Education: **0 to 3** records per candidate (minimum none, maximum three)
- Work experience: **0 or more** records per candidate (no maximum count in the model)
- Resume (CV): **required** when creating a candidate via the recruiter flow — exactly one CV per creation (PDF or DOCX, max 10MB); file bytes stored under the repository `cv/` directory (sibling to `frontend/` and `backend/`); database stores metadata (`filePath`, `fileType`, `uploadDate`) only

**Relationships:**
- `educations`: One-to-many relationship with Education model
- `workExperiences`: One-to-many relationship with WorkExperience model
- `resumes`: One-to-many relationship with Resume model
- `applications`: One-to-many relationship with Application model

### 3. Education
Represents educational background information for candidates.

**Fields:**
- `id`: Unique identifier for the education record (Primary Key)
- `institution`: Name of the educational institution (max 100 characters)
- `title`: Degree or certification title obtained (max 250 characters)
- `startDate`: Start date of the education period
- `endDate`: End date of the education period (optional, null if ongoing)
- `candidateId`: Foreign key referencing the Candidate

**Validation Rules:**
- Institution is required and cannot exceed 100 characters
- Title is required and cannot exceed 250 characters
- Start date is required and must be in valid date format
- End date is optional but must be valid if provided
- Aggregate: **0 to 3** education records per candidate (enforced at application layer when saving a candidate)

**Relationships:**
- `candidate`: Many-to-one relationship with Candidate model

### 4. WorkExperience
Represents work history and professional experience for candidates.

**Fields:**
- `id`: Unique identifier for the work experience record (Primary Key)
- `company`: Name of the company or organization (max 100 characters)
- `position`: Job title or position held (max 100 characters)
- `description`: Description of responsibilities and achievements (optional, max 200 characters)
- `startDate`: Start date of the work experience
- `endDate`: End date of the work experience (optional, null if current)
- `candidateId`: Foreign key referencing the Candidate

**Validation Rules:**
- Company name is required and cannot exceed 100 characters
- Position is required and cannot exceed 100 characters
- Description is optional but cannot exceed 200 characters if provided
- Start date is required and must be in valid date format
- End date is optional but must be valid if provided
- No maximum number of work experience rows per candidate

**Relationships:**
- `candidate`: Many-to-one relationship with Candidate model

### 5. Resume
Represents uploaded resume files associated with candidates.

**Fields:**
- `id`: Unique identifier for the resume record (Primary Key)
- `filePath`: File system path to the uploaded resume (max 500 characters)
- `fileType`: MIME type or file extension of the resume (max 50 characters)
- `uploadDate`: Date and time when the resume was uploaded
- `candidateId`: Foreign key referencing the Candidate

**Validation Rules:**
- File path is required and cannot exceed 500 characters (store relative or controlled path; **do not** expose raw server filesystem details in public API responses)
- File type is required and cannot exceed 50 characters
- Upload date is automatically set when file is uploaded
- Supported file types: PDF and DOCX (max 10MB)
- For recruiter candidate intake, **one** resume is required at creation time

**Relationships:**
- `candidate`: Many-to-one relationship with Candidate model

### 6. Company
Represents companies that post job positions and employ staff.

**Fields:**
- `id`: Unique identifier for the company (Primary Key)
- `name`: Unique company name

**Relationships:**
- `employees`: One-to-many relationship with Employee model
- `positions`: One-to-many relationship with Position model

### 7. Employee
Represents employees within companies who can conduct interviews.

**Fields:**
- `id`: Unique identifier for the employee (Primary Key)
- `name`: Employee's full name
- `email`: Employee's unique email address
- `role`: Employee's role or job title
- `isActive`: Boolean indicating if the employee is currently active
- `companyId`: Foreign key referencing the Company

**Relationships:**
- `company`: Many-to-one relationship with Company model
- `interviews`: One-to-many relationship with Interview model

### 8. InterviewType
Defines different types of interviews that can be conducted.

**Fields:**
- `id`: Unique identifier for the interview type (Primary Key)
- `name`: Name of the interview type (e.g., "Technical", "HR", "Behavioral")
- `description`: Detailed description of the interview type (optional)

**Relationships:**
- `interviewSteps`: One-to-many relationship with InterviewStep model

### 9. InterviewFlow
Represents a sequence of interview steps that define the hiring process.

**Fields:**
- `id`: Unique identifier for the interview flow (Primary Key)
- `description`: Description of the interview flow process (optional)

**Relationships:**
- `interviewSteps`: One-to-many relationship with InterviewStep model
- `positions`: One-to-many relationship with Position model

### 10. InterviewStep
Represents individual steps within an interview flow.

**Fields:**
- `id`: Unique identifier for the interview step (Primary Key)
- `name`: Name of the interview step
- `orderIndex`: Numeric order of this step within the flow
- `interviewFlowId`: Foreign key referencing the InterviewFlow
- `interviewTypeId`: Foreign key referencing the InterviewType

**Relationships:**
- `interviewFlow`: Many-to-one relationship with InterviewFlow model
- `interviewType`: Many-to-one relationship with InterviewType model
- `applications`: One-to-many relationship with Application model
- `interviews`: One-to-many relationship with Interview model

### 11. Position
Represents job positions available for application.

**Fields:**
- `id`: Unique identifier for the position (Primary Key)
- `companyId`: Foreign key referencing the Company (required)
- `interviewFlowId`: Foreign key referencing the InterviewFlow (required)
- `title`: Job title (required, max 100 characters)
- `description`: Brief description of the position (required)
- `status`: Current status of the position (default: "Draft", valid values: Open, Contratado, Cerrado, Borrador)
- `isVisible`: Boolean indicating if the position is publicly visible (default: false)
- `location`: Job location (required)
- `jobDescription`: Detailed job description (required)
- `requirements`: Job requirements and qualifications (optional)
- `responsibilities`: Job responsibilities (optional)
- `salaryMin`: Minimum salary range (optional, must be >= 0)
- `salaryMax`: Maximum salary range (optional, must be >= 0 and >= salaryMin)
- `employmentType`: Type of employment (e.g., "Full-time", "Part-time", "Contract") (optional)
- `benefits`: Job benefits description (optional)
- `companyDescription`: Description of the hiring company (optional)
- `applicationDeadline`: Deadline for applications (optional, must be a future date)
- `contactInfo`: Contact information for inquiries (optional)

**Validation Rules:**
- Title is required and cannot exceed 100 characters
- Description, location, and jobDescription are required fields
- Status must be one of: Open, Contratado, Cerrado, Borrador
- Company and interview flow references must exist in the database
- Salary values must be non-negative numbers
- Application deadline must be a future date if provided

**Relationships:**
- `company`: Many-to-one relationship with Company model
- `interviewFlow`: Many-to-one relationship with InterviewFlow model
- `applications`: One-to-many relationship with Application model

### 12. Application
Represents a candidate's application to a specific position.

**Fields:**
- `id`: Unique identifier for the application (Primary Key)
- `applicationDate`: Date when the application was submitted
- `currentInterviewStep`: Current step in the interview process
- `notes`: Additional notes about the application (optional)
- `positionId`: Foreign key referencing the Position
- `candidateId`: Foreign key referencing the Candidate
- `interviewStepId`: Foreign key referencing the current InterviewStep

**Relationships:**
- `position`: Many-to-one relationship with Position model
- `candidate`: Many-to-one relationship with Candidate model
- `interviewStep`: Many-to-one relationship with InterviewStep model
- `interviews`: One-to-many relationship with Interview model

### 13. Interview
Represents individual interview sessions conducted as part of an application.

**Fields:**
- `id`: Unique identifier for the interview (Primary Key)
- `interviewDate`: Date and time of the interview
- `result`: Interview result or outcome (optional)
- `score`: Numeric score or rating from the interview (optional)
- `notes`: Interview notes and feedback (optional)
- `applicationId`: Foreign key referencing the Application
- `interviewStepId`: Foreign key referencing the InterviewStep
- `employeeId`: Foreign key referencing the conducting Employee

**Relationships:**
- `application`: Many-to-one relationship with Application model
- `interviewStep`: Many-to-one relationship with InterviewStep model
- `employee`: Many-to-one relationship with Employee model

## Entity Relationship Diagram

```mermaid
erDiagram
    User {
        Int id PK
        String username UK
        String passwordHash
    }
    Candidate {
        Int id PK
        String firstName
        String lastName
        String email UK
        String phone
        String address
    }
    Education {
        Int id PK
        String institution
        String title
        DateTime startDate
        DateTime endDate
        Int candidateId FK
    }
    WorkExperience {
        Int id PK
        String company
        String position
        String description
        DateTime startDate
        DateTime endDate
        Int candidateId FK
    }
    Resume {
        Int id PK
        String filePath
        String fileType
        DateTime uploadDate
        Int candidateId FK
    }
    Company {
        Int id PK
        String name UK
    }
    Employee {
        Int id PK
        String name
        String email UK
        String role
        Boolean isActive
        Int companyId FK
    }
    InterviewType {
        Int id PK
        String name
        String description
    }
    InterviewFlow {
        Int id PK
        String description
    }
    InterviewStep {
        Int id PK
        String name
        Int orderIndex
        Int interviewFlowId FK
        Int interviewTypeId FK
    }
    Position {
        Int id PK
        String title
        String description
        String status
        Boolean isVisible
        String location
        String jobDescription
        String requirements
        String responsibilities
        Float salaryMin
        Float salaryMax
        String employmentType
        String benefits
        String companyDescription
        DateTime applicationDeadline
        String contactInfo
        Int companyId FK
        Int interviewFlowId FK
    }
    Application {
        Int id PK
        DateTime applicationDate
        Int currentInterviewStep
        String notes
        Int positionId FK
        Int candidateId FK
        Int interviewStepId FK
    }
    Interview {
        Int id PK
        DateTime interviewDate
        String result
        Int score
        String notes
        Int applicationId FK
        Int interviewStepId FK
        Int employeeId FK
    }

    Candidate ||--o{ Education : "has"
    Candidate ||--o{ WorkExperience : "has"
    Candidate ||--o{ Resume : "has"
    Candidate ||--o{ Application : "submits"
    
    Company ||--o{ Employee : "employs"
    Company ||--o{ Position : "offers"
    
    InterviewType ||--o{ InterviewStep : "defines"
    InterviewFlow ||--o{ InterviewStep : "includes"
    InterviewFlow ||--o{ Position : "guides"
    
    Position ||--o{ Application : "receives"
    Application ||--o{ Interview : "includes"
    
    InterviewStep ||--o{ Application : "current_step"
    InterviewStep ||--o{ Interview : "conducted_at"
    
    Employee ||--o{ Interview : "conducts"
```

## Key Design Principles

1. **Referential Integrity**: All foreign key relationships ensure data consistency across the system.

2. **Flexibility**: The interview flow system allows for customizable hiring processes per position.

3. **Audit Trail**: Application and interview dates provide a complete timeline of the hiring process.

4. **Extensibility**: The modular design allows for easy addition of new features and data points.

5. **Data Normalization**: The model follows database normalization principles to minimize redundancy and ensure data integrity.

## Security and privacy (planning reference)

These items complement access control via username/password and hashed passwords in `User`:

- **Logging:** Do not log passwords, session secrets, full CV contents, or unnecessary PII; use structured errors without leaking stack traces to clients in production.
- **Sessions:** Server-side session store (e.g. signed cookie + server session) with secure cookie flags when deployed behind HTTPS; for local dev without HTTPS, keep `Secure` cookie off but document the limitation.
- **Uploads:** Enforce MIME/size on the server; store files outside web root or serve via controlled download endpoint; randomize filenames to avoid guessable URLs; `cv/` directory gitignored with `.gitkeep` or documented setup.
- **Transport:** HTTPS not required for this phase; revisit before any production deployment.
- **Candidate data:** Apply least privilege (only authenticated recruiters); rate-limit login and sensitive endpoints when hardening later.

## UI and accessibility (reference)

- **Locales:** UI available in **English** and **Spanish** with explicit user language selection; technical code and API messages remain English per project standards.
- **Accessibility:** Target **WCAG 2.1 Level AA** for the recruiter flows implemented in this initiative.
- **Browsers:** Primary support for latest **Chrome** and **Edge**.

## Notes

- All `id` fields serve as primary keys with auto-increment functionality
- Foreign key relationships maintain referential integrity
- Optional fields allow for flexible data entry while maintaining required core information
- The interview system supports multi-step hiring processes with different types of interviews
- Candidate email has a unique constraint; duplicate create attempts return a **dedicated** client-facing/API error
- **User** (recruiter) is separate from **Employee** (company HR data in the domain model); authentication uses `User` for this product phase
- Autocomplete for education/work experience is **out of scope** for the current version (backlog) 