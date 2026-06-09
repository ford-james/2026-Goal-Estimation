# World Cup Goal Predictions

A web-based application for your team to predict World Cup match goals, powered by IBM Cloud and Watson AI.

## 📋 Project Overview

This application allows team members to:
- Predict the number of goals for each individual World Cup match
- Update predictions anytime before each match starts
- Compete on a leaderboard with points based on prediction accuracy
- Get AI-powered suggestions from IBM Watson
- Track personal statistics and prediction history

## 🏗️ Architecture

**Frontend:** React + TypeScript + Vite  
**Backend:** Node.js + Express + TypeScript  
**Database:** SQLite  
**Hosting:** IBM Cloud Foundry  
**AI:** IBM Watson (watsonx.ai)

## 📚 Documentation

### Key Documents

- **[README.md](./README.md)** - Main documentation (this file)
- **[PER_MATCH_IMPLEMENTATION_COMPLETE.md](./PER_MATCH_IMPLEMENTATION_COMPLETE.md)** - Complete implementation guide for per-match prediction model
- **[ADMIN_GUIDE.md](./ADMIN_GUIDE.md)** - Administrator guide for managing matches and results
- **[MATCH_SCHEDULE_GUIDE.md](./MATCH_SCHEDULE_GUIDE.md)** - Guide for managing match schedules

## 🎯 Key Features

### For Users
- **Simple Login:** Click your name to start (no passwords needed)
- **Per-Match Predictions:** Predict goals for each individual match
- **Update Anytime:** Change predictions until each match starts
- **Real-Time Countdowns:** See time remaining before each match locks
- **AI Insights:** Get Watson-powered prediction suggestions per match
- **Live Leaderboard:** See real-time rankings and standings
- **Personal Stats:** Track your accuracy and prediction history
- **Mobile Friendly:** Works seamlessly on all devices

### For Administrators
- **Match Management:** Update match results easily
- **Automatic Scoring:** Points calculated automatically
- **User Management:** Pre-configured team member accounts
- **Data Backup:** Simple SQLite database backup

## 🎮 Game Rules

### How to Play
1. Select your name from the user list
2. View all upcoming World Cup matches
3. Predict the total number of goals for each match individually
4. Update your predictions anytime before each match starts
5. Watch the countdown timer - predictions lock when the match begins
6. Earn points based on accuracy for each match

### Scoring System (Per Match)
```
Points = max(0, 100 - (|Predicted - Actual| × 10))

Examples:
- Exact prediction: 100 points
- Off by 1 goal: 90 points
- Off by 2 goals: 80 points
- Off by 5 goals: 50 points
- Off by 10+ goals: 0 points
```

**Total Score:** Sum of points from all your match predictions

### Key Features
- **Individual Match Predictions:** Predict each match separately
- **Update Capability:** Change predictions until match starts
- **Real-Time Locking:** Countdown timer shows time until lock
- **Flexible Strategy:** Adjust based on team news and conditions

## 💰 Cost Estimate

### Development
- IBM Cloud Foundry (Free Tier): $0/month
- Watson AI (Lite): $0/month
- **Total: $0/month**

### Production
- IBM Cloud Foundry (256MB): $15/month
- Watson AI (Standard): $50-100/month
- **Total: $65-115/month**

## 📅 Development Timeline

### Week 1: Backend Foundation
- Database setup and schema
- Express API implementation
- Watson AI integration
- Core services development

### Week 2: Frontend Development
- React application setup
- User interface components
- API integration
- Responsive design

### Week 3: Integration & Testing
- End-to-end testing
- Bug fixes
- Performance optimization
- Load match data

### Week 4: Deployment & Launch
- Deploy to IBM Cloud
- Final testing
- Team onboarding
- Go live!

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- IBM Cloud account
- Watson AI service credentials

### Installation
```bash
# Clone repository
git clone <repository-url>
cd worldcup-goal-estimation

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Deployment
```bash
# Build and deploy
./deploy.sh
```

## 📊 Database Schema

The application uses SQLite with the following main tables:
- **users:** Pre-configured team members
- **predictions:** User predictions per match with points and lock status
- **matches:** World Cup match schedule with times and results

### Key Schema Features
- **Per-Match Predictions:** One prediction per user per match (not per day)
- **Individual Locking:** Each match locks independently when it starts
- **Match Times:** Precise start times for accurate countdown timers
- **Update Tracking:** Timestamps for prediction submissions and updates

See [PER_MATCH_IMPLEMENTATION_COMPLETE.md](./PER_MATCH_IMPLEMENTATION_COMPLETE.md) for complete schema details.

## 🔧 Technology Stack

### Backend
- Node.js 20 LTS
- Express.js with TypeScript
- SQLite3 with better-sqlite3
- IBM Watson AI SDK
- Jest for testing

### Frontend
- React 18+
- TypeScript
- Vite (build tool)
- React Router (navigation)
- Zustand (state management)

### Infrastructure
- IBM Cloud Foundry (hosting)
- IBM Watson AI (predictions)
- SQLite (database)

## 📱 User Interface

### Pages
1. **User Selection:** Simple landing page to choose your name
2. **Dashboard:** Main page showing all upcoming matches with individual prediction forms
3. **Leaderboard:** Rankings and standings
4. **History:** Personal prediction history and stats
5. **Admin:** Match result management (optional)

### Components
- Match cards with team information and match times
- Per-match prediction forms with update capability
- Real-time countdown timers (updates every second)
- Lock status indicators (🔒 LOCKED / ⏰ Countdown)
- Watson AI suggestion panel (per match)
- Leaderboard table with rankings
- Personal statistics dashboard

## 🧪 Testing

### Backend Tests
- Database operations
- Scoring algorithm
- API endpoints
- Watson AI integration

### Frontend Tests
- Component rendering
- User interactions
- API integration
- Form validation

### Integration Tests
- Complete user flows
- End-to-end scenarios
- Cross-browser compatibility

## 📈 Monitoring

### Key Metrics
- Application uptime
- API response times
- Prediction submission rate
- User engagement
- Watson AI usage

### Daily Tasks
- Check application health
- Update match results
- Verify scoring accuracy
- Monitor for issues

## 🔒 Security

- HTTPS/TLS encryption
- Input validation and sanitization
- Rate limiting on API endpoints
- Database backup strategy
- Error logging and monitoring

## 🤝 Team Setup

### Pre-configured Users
Team members are pre-configured in the database:
- No registration required
- Simple name selection to login
- Each user has unique ID and avatar color
- Trust-based system (appropriate for small team)

### Adding New Users
```sql
INSERT INTO users (id, name, display_name, avatar_color, email) 
VALUES ('user_006', 'Frank Brown', 'Frank', '#E17055', 'frank@team.com');
```

## 📖 Additional Resources

- [IBM Cloud Documentation](https://cloud.ibm.com/docs)
- [Watson AI Documentation](https://cloud.ibm.com/docs/watson)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [React Documentation](https://react.dev)

## 🎉 Launch Checklist

- [ ] IBM Cloud account created
- [ ] Watson AI service provisioned
- [ ] Database initialized with schema
- [ ] Team members added to users table
- [ ] World Cup match schedule loaded
- [ ] Backend deployed to IBM Cloud
- [ ] Frontend deployed to IBM Cloud
- [ ] End-to-end testing completed
- [ ] Team members onboarded
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Ready for tournament! 🏆

## 📞 Support

For questions or issues during development or tournament:
1. Check the implementation plan documentation
2. Review error logs in IBM Cloud
3. Test in development environment first
4. Contact team administrator

## 🏆 Tournament Information

**2026 FIFA World Cup**
- Dates: June 11 - July 19, 2026
- Hosts: USA, Canada, Mexico
- Teams: 48 teams
- Matches: 104 matches
- Duration: 39 days

Good luck with your predictions! ⚽

---

**Note:** This application is designed for a small team and uses a simplified authentication model. For production use with external users, implement proper authentication and security measures as outlined in ARCHITECTURE_PLAN.md.