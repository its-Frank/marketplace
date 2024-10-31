const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const app = express();

// Database connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "kenyan_freelancer_marketplace",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_session_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.userId ? { id: req.session.userId } : null,
  });
});

//get jobs
app.get("/jobs", (req, res) => {
  const query =
    'SELECT * FROM jobs WHERE status = "open" ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching jobs" });
    }
    res.render("jobs-list", {
      jobs: results,
      user: req.session.userId ? { id: req.session.userId } : null,
      userType: req.session.userType,
    });
  });
});

// Route to display the create job form
app.get("/job/create", isAuthenticated, (req, res) => {
  // Ensure only clients can access this page
  if (req.session.userType !== "client") {
    return res.redirect("/dashboard");
  }
  res.render("create-job", { user: req.session.userId });
});

// Route to handle job creation
app.post("/job/create", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.redirect("/dashboard");
  }

  const { title, description, budget, deadline } = req.body;
  const query = `
      INSERT INTO jobs (client_id, title, description, budget, deadline)
      VALUES (?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [req.session.userId, title, description, budget, deadline],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error creating job" });
      }

      // Set success message
      req.session.successMessage = "Job created successfully!";
      res.redirect("/dashboard");
    }
  );
});

// Route to display job details
app.get("/job/:id", (req, res) => {
  const jobId = req.params.id;
  const query = `
    SELECT j.*, u.name as client_name 
    FROM jobs j
    JOIN users u ON j.client_id = u.id
    WHERE j.id = ?
  `;
  connection.query(query, [jobId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).render("error", {
        message: "Job not found",
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
    res.render("job-details", {
      job: results[0],
      user: req.session.userId ? { id: req.session.userId } : null,
      userType: req.session.userType,
    });
  });
});
// Route to display bid form
app.get("/job/:id/bid", isAuthenticated, (req, res) => {
  if (req.session.userType !== "freelancer") {
    return res.redirect("/dashboard");
  }
  const jobId = req.params.id;
  const query = "SELECT * FROM jobs WHERE id = ?";
  connection.query(query, [jobId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).render("error", {
        message: "Job not found",
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
    res.render("place-bid", {
      job: results[0],
      user: req.session.userId ? { id: req.session.userId } : null,
    });
  });
});
// Route to handle bid submission
app.post("/job/:id/bid", isAuthenticated, (req, res) => {
  if (req.session.userType !== "freelancer") {
    return res.redirect("/dashboard");
  }
  const jobId = req.params.id;
  const { amount, proposal } = req.body;
  const query = `
    INSERT INTO bids (job_id, freelancer_id, amount, proposal)
    VALUES (?, ?, ?, ?)
  `;
  connection.query(
    query,
    [jobId, req.session.userId, amount, proposal],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error submitting bid" });
      }

      req.session.successMessage = "Bid submitted successfully!";
      res.redirect("/dashboard");
    }
  );
});

//getting freelancers
app.get("/freelancers", (req, res) => {
  const query =
    'SELECT id, name, bio, skills FROM users WHERE user_type = "freelancer"';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching freelancers" });
    }
    res.render("freelancers-list", {
      freelancers: results,
      user: req.session.userId ? { id: req.session.userId } : null,
    });
  });
});

//getting freelancer details
app.get("/freelancer/:id", (req, res) => {
  const freelancerId = req.params.id;
  const query = `
    SELECT 
      u.id,
      u.name,
      u.bio,
      u.skills,
      u.location,
      u.created_at,
      COUNT(DISTINCT j.id) as completed_jobs,
      AVG(r.rating) as average_rating
    FROM users u
    LEFT JOIN bids b ON u.id = b.freelancer_id
    LEFT JOIN jobs j ON b.job_id = j.id AND j.status = 'completed'
    LEFT JOIN reviews r ON u.id = r.reviewee_id
    WHERE u.id = ? AND u.user_type = 'freelancer'
    GROUP BY u.id`;
  connection.query(query, [freelancerId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).render("error", {
        message: "Freelancer not found",
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
    // Get reviews for the freelancer
    const reviewsQuery = `
      SELECT 
        r.*,
        u.name as reviewer_name,
        j.title as job_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN jobs j ON r.job_id = j.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
      LIMIT 5`;
    connection.query(reviewsQuery, [freelancerId], (err, reviews) => {
      if (err) {
        reviews = [];
      }
      // Get success message from session and clear it
      const successMessage = req.session.successMessage;
      req.session.successMessage = null;

      res.render("freelancer-profile", {
        freelancer: results[0],
        reviews: reviews,
        user: req.session.userId ? { id: req.session.userId } : null,
        userType: req.session.userType,
        successMessage: successMessage,
      });
    });
  });
});
//login
app.get("/login", (req, res) => {
  res.render("login", { user: null });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM users WHERE email = ?";
  connection.query(query, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.userType = user.user_type;
      res.redirect("/dashboard");
    });
  });
});
//register
app.get("/register", (req, res) => {
  res.render("register", { user: null });
});

app.post("/register", (req, res) => {
  const { name, email, password, userType } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: "Error hashing password" });
    }
    const query =
      "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)";
    connection.query(query, [name, email, hash, userType], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error registering user" });
      }
      res.redirect("/login");
    });
  });
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  const query = "SELECT * FROM users WHERE id = ?";
  connection.query(query, [req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: "Error fetching user data" });
    }
    const user = results[0];
    let successMessage = req.session.successMessage || null; // Get the success message
    // Clear the success message from the session after using it
    req.session.successMessage = null;
    if (user.user_type === "freelancer") {
      // Fetch active bids and ongoing jobs for freelancer
      const bidsQuery = `
          SELECT b.*, j.title AS job_title
          FROM bids b
          JOIN jobs j ON b.job_id = j.id
          WHERE b.freelancer_id = ? AND b.status = 'pending'
        `;
      const jobsQuery = `
          SELECT j.*
          FROM jobs j
          JOIN bids b ON j.id = b.job_id
          WHERE b.freelancer_id = ? AND j.status = 'in_progress'
        `;
      connection.query(bidsQuery, [user.id], (err, bids) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching bids" });
        }
        connection.query(jobsQuery, [user.id], (err, jobs) => {
          if (err) {
            return res.status(500).json({ error: "Error fetching jobs" });
          }
          res.render("freedashboard", {
            user,
            activeBids: bids,
            ongoingJobs: jobs,
            successMessage, // Pass success message to the view
          });
        });
      });
    } else {
      // Fetch active and completed jobs for client
      const activeJobsQuery = `
          SELECT * FROM jobs
          WHERE client_id = ? AND status IN ('open', 'in_progress')
        `;
      const completedJobsQuery = `
          SELECT * FROM jobs
          WHERE client_id = ? AND status = 'completed'
        `;
      connection.query(activeJobsQuery, [user.id], (err, activeJobs) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching active jobs" });
        }
        connection.query(
          completedJobsQuery,
          [user.id],
          (err, completedJobs) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error fetching completed jobs" });
            }
            res.render("clientdashboard", {
              user,
              activeJobs,
              completedJobs,
              successMessage, // Pass success message to the view
            });
          }
        );
      });
    }
  });
});
// Route to display edit profile form
app.get("/edit-profile", isAuthenticated, (req, res) => {
  if (req.session.userType !== "freelancer") {
    return res.redirect("/dashboard");
  }
  const query = "SELECT * FROM users WHERE id = ?";
  connection.query(query, [req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: "Error fetching user data" });
    }
    res.render("edit-profile", {
      user: results[0],
      successMessage: req.session.successMessage,
    });
  });
});

// Route to handle profile updates
app.post("/edit-profile", isAuthenticated, (req, res) => {
  if (req.session.userType !== "freelancer") {
    return res.redirect("/dashboard");
  }
  const { bio, skills, location } = req.body;
  const query = `
    UPDATE users
    SET bio = ?, skills = ?, location = ?
    WHERE id = ?
  `;
  connection.query(
    query,
    [bio, skills, location, req.session.userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error updating profile" });
      }
      req.session.successMessage = "Profile updated successfully!";
      res.redirect("/dashboard");
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.redirect("/");
  });
});

// Route to show message creation form
app.get("/messages/create/:receiverId", isAuthenticated, (req, res) => {
  const receiverId = req.params.receiverId;
  // Get receiver details
  const query = "SELECT name FROM users WHERE id = ?";
  connection.query(query, [receiverId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).render("error", {
        message: "User not found",
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
    res.render("create-message", {
      receiver: results[0],
      receiverId: receiverId,
      user: { id: req.session.userId },
    });
  });
});
// Route to handle message submission
app.post("/messages/create/:receiverId", isAuthenticated, (req, res) => {
  const receiverId = req.params.receiverId;
  const { content } = req.body;
  const query = `
    INSERT INTO messages (sender_id, receiver_id, content)
    VALUES (?, ?, ?)
  `;
  connection.query(
    query,
    [req.session.userId, receiverId, content],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Error sending message" });
      }
      // Set the success message in session
      req.session.successMessage = "Message sent successfully!";
      res.redirect(`/freelancer/${receiverId}`);
    }
  );
});

// Route to show job invitation form
app.get("/jobs/invite/:freelancerId", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.redirect("/dashboard");
  }
  const freelancerId = req.params.freelancerId;
  // Get freelancer details and client's active jobs
  const queries = {
    freelancer: "SELECT name FROM users WHERE id = ?",
    activeJobs:
      "SELECT id, title FROM jobs WHERE client_id = ? AND status = 'open'",
  };
  connection.query(
    queries.freelancer,
    [freelancerId],
    (err, freelancerResults) => {
      if (err || freelancerResults.length === 0) {
        return res.status(404).render("error", {
          message: "Freelancer not found",
          user: req.session.userId ? { id: req.session.userId } : null,
        });
      }
      connection.query(
        queries.activeJobs,
        [req.session.userId],
        (err, jobResults) => {
          if (err) {
            return res.status(500).json({ error: "Error fetching jobs" });
          }
          res.render("job-invitation", {
            freelancer: freelancerResults[0],
            freelancerId: freelancerId,
            jobs: jobResults,
            user: { id: req.session.userId },
          });
        }
      );
    }
  );
});
// Route to handle job invitation
app.post("/jobs/invite/:freelancerId", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.redirect("/dashboard");
  }
  const freelancerId = req.params.freelancerId;
  const { jobId, message } = req.body;
  // First, verify the job belongs to the client
  const checkJobQuery = "SELECT id FROM jobs WHERE id = ? AND client_id = ?";
  connection.query(
    checkJobQuery,
    [jobId, req.session.userId],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      // Send invitation message
      const messageQuery = `
      INSERT INTO messages (sender_id, receiver_id, job_id, content)
      VALUES (?, ?, ?, ?)
    `;
      const inviteMessage =
        message || "You have been invited to apply for this job.";

      connection.query(
        messageQuery,
        [req.session.userId, freelancerId, jobId, inviteMessage],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Error sending invitation" });
          }
          // Set the success message in session
          req.session.successMessage = "Invitation sent successfully!";
          res.redirect(`/freelancer/${freelancerId}`);
        }
      );
    }
  );
});
// route to view messages
app.get("/messages", isAuthenticated, (req, res) => {
  const query = `
    SELECT 
      m.*,
      sender.name as sender_name,
      receiver.name as receiver_name,
      j.title as job_title
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    JOIN users receiver ON m.receiver_id = receiver.id
    LEFT JOIN jobs j ON m.job_id = j.id
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY m.created_at DESC
  `;
  connection.query(
    query,
    [req.session.userId, req.session.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching messages" });
      }
      res.render("messages", {
        messages: results,
        currentUser: { id: req.session.userId },
        user: { id: req.session.userId },
      });
    }
  );
});

// app.get("*", (req, res) => {
//   res.render("error");
// });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
