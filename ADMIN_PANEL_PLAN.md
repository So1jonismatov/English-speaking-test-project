# Admin Panel Implementation Plan

## Overview
The admin panel will provide administrative capabilities for managing tests, users, and viewing analytics. This document outlines the planned features, architecture, and implementation phases.

---

## 1. Features & Functionality

### 1.1 User Management
- **View all users**: List with search, filter, and pagination
- **User details**: View detailed user information
- **Edit user profiles**: Update user information
- **Disable/Enable users**: Manage user access
- **View user test history**: See all tests taken by a user
- **Delete users**: Remove user accounts (with confirmation)

### 1.2 Test Management
- **View all tests**: List of all submitted tests with status
- **Test details**: View test questions, audio recordings, and results
- **Re-assess tests**: Trigger re-evaluation of test recordings
- **Filter tests**: By status, date, user, part
- **Export test data**: Download test results in CSV/Excel format

### 1.3 Questions Management
- **View question bank**: All available questions for parts 1, 2, 3
- **Add questions**: Create new questions
- **Edit questions**: Update existing questions
- **Delete questions**: Remove questions from the bank
- **Assign topics**: Categorize questions by topic
- **Bulk import**: Import questions from CSV/Excel

### 1.4 Analytics & Reporting
- **Dashboard overview**: Key metrics at a glance
  - Total users
  - Total tests completed
  - Average scores by part
  - Recent activity
- **Score distribution**: Charts showing score distributions
- **Performance trends**: Historical data on test performance
- **User growth**: Registration trends over time
- **Popular regions**: Geographic distribution of users

### 1.5 System Settings
- **Test configuration**: Time limits, scoring parameters
- **User roles**: Manage admin roles and permissions
- **Email templates**: Configure system emails
- **API keys**: Manage third-party integrations

---

## 2. Technical Architecture

### 2.1 Routing Structure
```
/admin (AdminLayout)
  /admin/dashboard - Dashboard overview
  /admin/users - User management
    /admin/users/:id - User details
    /admin/users/:id/edit - Edit user
  /admin/tests - Test management
    /admin/tests/:id - Test details
    /admin/tests/:id/assess - Re-assess test
  /admin/questions - Questions management
    /admin/questions/add - Add question
    /admin/questions/:id/edit - Edit question
  /admin/analytics - Analytics & reports
  /admin/settings - System settings
```

### 2.2 Components Structure
```
src/
  admin/
    components/
      AdminNavbar.tsx - Admin navigation
      AdminSidebar.tsx - Sidebar navigation
      AdminDashboard.tsx - Dashboard metrics
      UserTable.tsx - Users list table
      TestTable.tsx - Tests list table
      QuestionTable.tsx - Questions list table
      AnalyticsChart.tsx - Reusable chart component
      StatCard.tsx - Metric display card
      SearchFilter.tsx - Search and filter controls
      Pagination.tsx - Pagination component
    pages/
      AdminDashboardPage.tsx
      UsersManagementPage.tsx
      UserDetailsPage.tsx
      TestsManagementPage.tsx
      TestDetailsPage.tsx
      QuestionsManagementPage.tsx
      AnalyticsPage.tsx
      SettingsPage.tsx
    hooks/
      useAdminAuth.ts - Admin authentication check
      useUsers.ts - User management logic
      useTests.ts - Test management logic
      useQuestions.ts - Question management logic
      useAnalytics.ts - Analytics data fetching
    stores/
      adminStore.ts - Admin-specific state
```

### 2.3 API Endpoints (To be implemented on backend)
```
# User Management
GET    /admin/users              - List all users (paginated)
GET    /admin/users/:id          - Get user details
PUT    /admin/users/:id          - Update user
DELETE /admin/users/:id          - Delete user
GET    /admin/users/:id/tests    - Get user's test history

# Test Management
GET    /admin/tests              - List all tests (paginated)
GET    /admin/tests/:id          - Get test details with audio files
POST   /admin/tests/:id/reassess - Trigger re-assessment
GET    /admin/tests/export       - Export test data

# Questions Management
GET    /admin/questions          - List all questions
POST   /admin/questions          - Create question
PUT    /admin/questions/:id      - Update question
DELETE /admin/questions/:id      - Delete question
POST   /admin/questions/import   - Bulk import questions

# Analytics
GET    /admin/analytics/overview - Dashboard metrics
GET    /admin/analytics/scores   - Score distribution data
GET    /admin/analytics/trends   - Performance trends
GET    /admin/analytics/users    - User growth data

# System Settings
GET    /admin/settings           - Get system settings
PUT    /admin/settings           - Update system settings
```

### 2.4 State Management
- **Admin Store**: Separate Zustand store for admin-specific state
  - Admin user profile
  - Admin permissions/roles
  - UI state (sidebar collapsed, active filters, etc.)
  - Cached data for performance

- **Existing Stores**: Reuse authStore for authentication, testStore for test data

---

## 3. UI/UX Design

### 3.1 Layout
- **Sidebar navigation**: Collapsible left sidebar with menu items
- **Top navbar**: Admin user info, logout, notifications
- **Main content area**: Responsive grid layout
- **Breadcrumb navigation**: Clear navigation hierarchy

### 3.2 Design System
- Use existing shadcn/ui components for consistency
- Data tables with sorting, filtering, pagination
- Modal dialogs for forms and confirmations
- Toast notifications for actions
- Loading skeletons for async operations

### 3.3 Responsive Design
- Desktop-first approach (admin work is primarily desktop)
- Tablet support for on-the-go management
- Mobile-friendly for urgent actions only

---

## 4. Security & Access Control

### 4.1 Authentication
- Separate admin login or role-based access
- JWT token validation (reuse existing auth system)
- Session timeout for security
- Two-factor authentication (optional, future)

### 4.2 Authorization
- **Role-based access control (RBAC)**
  - Super Admin: Full access
  - Test Admin: Test and question management
  - User Admin: User management only
  - Viewer: Read-only access
- **Route guards**: Protect admin routes
- **Action-level permissions**: Disable/hide unauthorized actions

### 4.3 Audit Logging
- Log all admin actions
- Track changes to users, tests, questions
- Exportable audit trail

---

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Create admin routing structure
- [ ] Build admin layout components (Navbar, Sidebar)
- [ ] Implement admin authentication guard
- [ ] Set up admin Zustand store
- [ ] Create basic dashboard page with placeholder metrics
- [ ] Add admin route to main router

### Phase 2: User Management (Week 2-3)
- [ ] Implement backend API endpoints for users
- [ ] Create UserTable component with pagination
- [ ] Build search and filter functionality
- [ ] Create UserDetailsPage
- [ ] Implement user edit functionality
- [ ] Add user disable/enable feature

### Phase 3: Test Management (Week 3-4)
- [ ] Implement backend API endpoints for tests
- [ ] Create TestTable component
- [ ] Build TestDetailsPage with audio playback
- [ ] Implement test filtering and search
- [ ] Add test re-assessment functionality
- [ ] Implement test data export

### Phase 4: Questions Management (Week 4-5)
- [ ] Implement backend API endpoints for questions
- [ ] Create QuestionTable component
- [ ] Build add/edit question forms
- [ ] Implement question topic categorization
- [ ] Add bulk import functionality

### Phase 5: Analytics & Reporting (Week 5-6)
- [ ] Implement backend analytics endpoints
- [ ] Create chart components (use chart library like Recharts or Chart.js)
- [ ] Build dashboard with real metrics
- [ ] Add data visualization components
- [ ] Implement report generation

### Phase 6: Polish & Testing (Week 6-7)
- [ ] Add loading states and error handling
- [ ] Implement audit logging
- [ ] Add role-based permissions
- [ ] Test all admin flows
- [ ] Performance optimization
- [ ] Documentation

---

## 6. Dependencies

### 6.1 Libraries to Add
- **Charting library**: Recharts or Chart.js for analytics visualizations
- **Data table library**: @tanstack/react-table for advanced table features (optional, can build custom)
- **Date picker**: Already have react-day-picker
- **File upload**: For bulk question import (can use existing form components)

### 6.2 Backend Requirements
- Admin-specific API endpoints (listed in section 2.3)
- Admin role/permission system
- Audit logging infrastructure
- Audio file storage/retrieval system

---

## 7. Data Models

### 7.1 Admin User (extends existing User)
```typescript
interface AdminUser extends User {
  role: 'super_admin' | 'test_admin' | 'user_admin' | 'viewer';
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}
```

### 7.2 Admin Dashboard Metrics
```typescript
interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalTests: number;
  completedTests: number;
  averageScore: number;
  testsThisWeek: number;
  usersThisWeek: number;
  scoreDistribution: {
    part1: number[];
    part2: number[];
    part3: number[];
  };
  recentTests: Test[];
  topRegions: { name: string; count: number }[];
}
```

### 7.3 Test Admin View
```typescript
interface AdminTestDetails extends Test {
  user: User;
  questions: {
    part1: Question[];
    part2: Question[];
    part3: Question[];
  };
  recordings: {
    part1: AudioFile[];
    part2: AudioFile[];
    part3: AudioFile[];
  };
  results: {
    overallScore: number;
    part1Score: number;
    part2Score: number;
    part3Score: number;
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
  submittedAt: string;
  status: 'pending' | 'completed' | 'failed';
}
```

---

## 8. Considerations & Best Practices

### 8.1 Performance
- Implement pagination for all list views
- Lazy load admin components
- Cache frequently accessed data
- Use virtual scrolling for large lists
- Optimize audio file loading

### 8.2 User Experience
- Provide clear feedback for all actions
- Implement undo for destructive actions
- Use confirmation dialogs for deletes
- Show progress indicators for long operations
- Export data in multiple formats (CSV, Excel, PDF)

### 8.3 Security
- Never expose passwords or sensitive data
- Sanitize all user inputs
- Validate file uploads
- Implement rate limiting on admin APIs
- Use HTTPS for all admin traffic
- Log all admin actions for audit trail

### 8.4 Maintainability
- Keep admin code separate from user-facing code
- Use consistent patterns across all admin pages
- Document all admin API endpoints
- Write tests for critical admin flows
- Use TypeScript strictly

---

## 9. Future Enhancements

### 9.1 Advanced Features
- **Bulk user operations**: Email campaigns, status updates
- **Automated reports**: Scheduled email reports
- **Real-time notifications**: WebSocket for live updates
- **AI-assisted assessment**: ML model integration for scoring
- **A/B testing**: Test different question sets
- **Custom scoring rubrics**: Configurable assessment criteria

### 9.2 Integrations
- **Email service**: Send notifications to users
- **Analytics platforms**: Google Analytics, Mixpanel
- **CRM integration**: Sync with external systems
- **Payment gateway**: If adding paid features
- **SSO**: Single sign-on for admins

---

## 10. Success Metrics

- Admin can efficiently manage all users
- Admin can view and re-assess any test
- Questions can be managed without developer involvement
- Analytics provide actionable insights
- System is secure and auditable
- Performance is acceptable with large datasets

---

## Next Steps

1. **Review this plan with stakeholders**
2. **Finalize feature priorities**
3. **Design backend API endpoints**
4. **Create UI mockups for key pages**
5. **Start Phase 1 implementation**

---

*Note: This plan is designed to be implemented incrementally. Each phase builds on the previous one, and the system remains functional throughout development.*
