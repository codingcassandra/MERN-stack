# NutriTrack Backend API

This is the Express/Node.js backend for the NutriTrack MERN stack application. It handles database operations (MongoDB Atlas), external third-party API routing, and utility functions for the application.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed. We are using a cloud MongoDB Atlas cluster, so no local database installation is required.

### 1. Installation
Clone the repository and install the backend dependencies:
```bash
cd server
npm install
```

### 2. Environment Variables (IMPORTANT)
For security, the `.env` file is safely ignored by Git. **You must create your own `.env` file in the root of the `server/` directory** before running the app. 

Reach out to Julian for the active Atlas connection string, or use the template below:

```text
# Server Config
PORT=5001

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.../nutritrack?appName=Cluster0

# Third-Party APIs
SPOONACULAR_API_KEY=your_spoonacular_key_here

# Email Verification Utility
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Running the Server
To start the development server with live-reloading (Nodemon):
```bash
npm run dev
```
You should see:
> `🚀 Server running on port 5001`
> `MongoDB Connected`

---

## 📡 API Endpoints

All requests should be prefixed with `http://localhost:5001`.

### Meals (`/api/meals`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/meals` | Fetches all logged meals. |
| `POST` | `/api/meals` | Creates a new meal. Requires JSON body. |
| `PUT` | `/api/meals/:id` | Updates a specific meal by MongoDB `_id`. |
| `DELETE`| `/api/meals/:id` | Deletes a specific meal by MongoDB `_id`. |

**POST / PUT Request Body Example:**
```json
{
  "name": "Steak and Sweet Potato",
  "calories": 650,
  "protein": 50,
  "carbs": 40,
  "fats": 20,
  "ingredients": ["Sirloin Steak", "Sweet Potato", "Butter"]
}
```

### Nutrition Proxy (`/api/nutrition`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/nutrition?query=foodName`| Securely fetches macronutrients from Spoonacular. |

*Note to Frontend:* Always use this internal route instead of calling Spoonacular directly from React to prevent exposing our API keys in the browser network tab.

---

## 🧪 Testing

This API is fully unit-tested using Jest and Supertest. The tests cover the entire CRUD lifecycle to ensure database stability.

To run the automated test suite:
1. Ensure the development server (`npm run dev`) is **stopped**.
2. Run the test command:
```bash
npm test
```

---

## 🔐 Team Notes: Authentication & Utilities

**For Cassandra (Auth Implementation):**
The email verification infrastructure is already set up and waiting for the auth controllers. 
* You can find the configured Nodemailer logic in `utils/sendEmail.js`. 
* To trigger an email during the registration flow, simply import the function and call it:
  ```javascript
  const sendEmail = require('../utils/sendEmail');
  
  await sendEmail({
    email: user.email,
    subject: "Verify your NutriTrack Account",
    message: "Your verification link here..."
  });
  ```

---

## 🌿 Git Workflow & Contribution Guide

To ensure we don't accidentally leak secrets or break the main application, please follow this Git workflow when adding new features.

### 1. Secure Your Secrets
Never commit the `.env` file. Verify it is ignored by running `git status`. If `.env` is listed as untracked, add `.env` to the `.gitignore` file before proceeding.

### 2. Branching Strategy
Always create a new branch for your feature rather than pushing directly to `main`:
```bash
git checkout -b feature/your-feature-name
```

### 3. Commit and Push
Stage and commit your changes with a descriptive message:
```bash
git add .
git commit -m "feat: brief description of what you built"
git push origin feature/your-feature-name
```

### 4. Pull Request (PR) Template
When opening a PR on GitHub, copy and paste this template into the description box so the team knows exactly how to review and test your code:

**Copy the text below for your PR:**
```markdown
## Description
[Briefly describe the feature, bug fix, or integration you completed.]

## What's New?
* **Feature 1:** [Description]
* **Feature 2:** [Description]

## Action Required for Local Setup
[List any new packages that require `npm install` or any new variables that need to be added to the `.env` file.]

## How to Test
1. [Step 1 to test your code locally]
2. [Step 2 to test your code locally]
```
