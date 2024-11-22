const express = require("express");
const path = require("path");
const session = require("express-session");
const mysql = require("mysql");
const multer = require("multer");
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

// configured my multer configuration to handle multiple upload destinations
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (req.path === "/client/edit-profile") {
//       cb(null, "public/uploads/profiles/");
//     } else {
//       cb(null, "public/uploads/gig_images/");
//     }
//   },
//   filename: (req, file, cb) => {
//     const prefix = req.path === "/client/edit-profile" ? "profile-" : "";
//     cb(null, prefix + Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
//     if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
//       return cb(new Error("Only images are allowed"));
//     }
//     cb(null, true);
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });
//bid_images
const bidStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/bid_files/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const uploadBidFile = multer({
  storage: bidStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// File upload configuration for work submissions
const workUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/work_submissions/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
});

//start
// Helper function to check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
// Multer storage configuration with dynamic destination based on fieldname
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationPath;
    switch (file.fieldname) {
      case "profileImage":
        destinationPath = "public/uploads/profiles/";
        break;
      case "gigImage":
        destinationPath = "public/uploads/gig_images/";
        break;
      case "serviceImage":
        destinationPath = "public/uploads/services/";
        break;
      default:
        return cb(new Error("Invalid file field name"), null);
    }
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    const prefix =
      file.fieldname === "profileImage"
        ? "profile-"
        : file.fieldname === "serviceImage"
        ? "service-"
        : "";
    cb(null, prefix + Date.now() + path.extname(file.originalname));
  },
});
// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => checkFileType(file, cb),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

//end

// Routes
app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.userId ? { id: req.session.userId } : null,
  });
});

//get jobs
app.get("/jobs", (req, res) => {
  const query = `
    SELECT j.*, GROUP_CONCAT(ji.image_path) as images
    FROM jobs j
    LEFT JOIN job_images ji ON j.id = ji.job_id
    WHERE j.status = 'open'
    GROUP BY j.id
    ORDER BY j.created_at DESC
  `;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching jobs" });
    }
    // Process the results to convert image string to array
    const processedResults = results.map((job) => ({
      ...job,
      images: job.images ? job.images.split(",") : [],
    }));
    res.render("jobs-list", {
      jobs: processedResults,
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

// job creation
app.post(
  "/job/create",
  isAuthenticated,
  upload.array("gig_images", 3),
  (req, res) => {
    if (req.session.userType !== "client") {
      return res.redirect("/dashboard");
    }
    try {
      const {
        title,
        description,
        budget,
        deadline,
        basic_price,
        basic_description,
        basic_delivery,
        basic_revisions,
        standard_price,
        standard_description,
        standard_delivery,
        standard_revisions,
        premium_price,
        premium_description,
        premium_delivery,
        premium_revisions,
      } = req.body;
      const query = `
      INSERT INTO jobs (
        client_id, title, description, budget, deadline,
        basic_price, basic_description, basic_delivery, basic_revisions,
        standard_price, standard_description, standard_delivery, standard_revisions,
        premium_price, premium_description, premium_delivery, premium_revisions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
      connection.query(
        query,
        [
          req.session.userId,
          title,
          description,
          budget,
          deadline,
          basic_price,
          basic_description,
          basic_delivery,
          basic_revisions,
          standard_price,
          standard_description,
          standard_delivery,
          standard_revisions,
          premium_price,
          premium_description,
          premium_delivery,
          premium_revisions,
        ],
        (err, result) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Error creating job" });
          }
          // Handle image uploads
          const jobId = result.insertId;
          if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map((file) => {
              return new Promise((resolve, reject) => {
                const imageQuery =
                  "INSERT INTO job_images (job_id, image_path) VALUES (?, ?)";
                const imagePath = "/uploads/gig_images/" + file.filename; // Store the relative path
                connection.query(
                  imageQuery,
                  [jobId, imagePath],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                );
              });
            });
            Promise.all(imagePromises)
              .then(() => {
                req.session.successMessage =
                  "Job created successfully with images!";
                res.redirect("/dashboard");
              })
              .catch((err) => {
                console.error("Error saving image paths:", err);
                req.session.successMessage =
                  "Job created but there was an error saving images.";
                res.redirect("/dashboard");
              });
          } else {
            req.session.successMessage = "Job created successfully!";
            res.redirect("/dashboard");
          }
        }
      );
    } catch (error) {
      console.error("Error in job creation:", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating the job" });
    }
  }
);
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
app.post(
  "/job/:id/bid",
  isAuthenticated,
  uploadBidFile.single("proposal_file"),
  (req, res) => {
    if (req.session.userType !== "freelancer") {
      return res.redirect("/dashboard");
    }
    const jobId = req.params.id;
    const { amount, proposal, delivery_time } = req.body;
    const filePath = req.file
      ? "/uploads/bid_files/" + req.file.filename
      : null;
    // First insert the bid
    const bidQuery = `
    INSERT INTO bids (job_id, freelancer_id, amount, proposal, delivery_time)
    VALUES (?, ?, ?, ?, ?)
  `;
    connection.query(
      bidQuery,
      [jobId, req.session.userId, amount, proposal, delivery_time],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error submitting bid" });
        }
        // If there's a file, save it to bid_attachments
        if (filePath) {
          const attachmentQuery = `
          INSERT INTO bid_attachments (bid_id, file_path)
          VALUES (?, ?)
        `;
          connection.query(
            attachmentQuery,
            [result.insertId, filePath],
            (err) => {
              if (err) {
                console.error("Error saving bid attachment:", err);
              }
            }
          );
        }
        req.session.successMessage = "Bid submitted successfully!";
        res.redirect("/dashboard");
      }
    );
  }
);

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

//dashboard
app.get("/dashboard", isAuthenticated, (req, res) => {
  const query = "SELECT * FROM users WHERE id = ?";
  connection.query(query, [req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(500).json({ error: "Error fetching user data" });
    }
    const user = results[0];
    let successMessage = req.session.successMessage || null;
    req.session.successMessage = null;
    if (user.user_type === "freelancer") {
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
      const completedJobsQuery = `
    SELECT j.*, b.amount as payment_amount,
           CASE 
             WHEN j.paid = 0 THEN 'pending'
             WHEN j.paid = 1 THEN 'paid'
           END as payment_status
    FROM jobs j
    JOIN bids b ON j.id = b.job_id
    WHERE b.freelancer_id = ? 
    AND j.status = 'completed'
  `;
      connection.query(bidsQuery, [user.id], (err, bids) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching bids" });
        }
        connection.query(jobsQuery, [user.id], (err, jobs) => {
          if (err) {
            return res.status(500).json({ error: "Error fetching jobs" });
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
              res.render("freedashboard", {
                user,
                activeBids: bids,
                ongoingJobs: jobs,
                completedJobs,
                successMessage,
              });
            }
          );
        });
      });
    } else {
      // Updated client dashboard code with bid information
      const activeJobsQuery = `
        SELECT j.*, COUNT(DISTINCT b.id) as bid_count, 
               GROUP_CONCAT(DISTINCT b.id) as bid_ids 
        FROM jobs j
        LEFT JOIN bids b ON j.id = b.job_id
        WHERE j.client_id = ? AND j.status IN ('open', 'in_progress')
        GROUP BY j.id
      `;
      const completedJobsQuery = `
        SELECT * FROM jobs
        WHERE client_id = ? AND status = 'completed'
      `;
      connection.query(activeJobsQuery, [user.id], (err, activeJobs) => {
        if (err) {
          return res.status(500).json({ error: "Error fetching active jobs" });
        }
        // Get all bids for active jobs
        const jobIds = activeJobs.map((job) => job.id);
        if (jobIds.length > 0) {
          const bidsQuery = `
            SELECT b.*, u.name as freelancer_name, 
                   u.email as freelancer_email,
                   ba.file_path as proposal_file
            FROM bids b
            JOIN users u ON b.freelancer_id = u.id
            LEFT JOIN bid_attachments ba ON b.id = ba.bid_id
            WHERE b.job_id IN (?)
          `;
          connection.query(bidsQuery, [jobIds], (err, bids) => {
            if (err) {
              return res.status(500).json({ error: "Error fetching bids" });
            }
            // Group bids by job
            const bidsByJob = {};
            bids.forEach((bid) => {
              if (!bidsByJob[bid.job_id]) {
                bidsByJob[bid.job_id] = [];
              }
              bidsByJob[bid.job_id].push(bid);
            });
            // Add bids to jobs
            activeJobs.forEach((job) => {
              job.bids = bidsByJob[job.id] || [];
            });
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
                  successMessage,
                });
              }
            );
          });
        } else {
          // If there are no active jobs, skip the bids query
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
                successMessage,
              });
            }
          );
        }
      });
    }
  });
});

//edit profile for client
app.get("/client/edit-profile", isAuthenticated, (req, res) => {
  const query = "SELECT * FROM users WHERE id = ?";
  connection.query(query, [req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.redirect("/dashboard");
    }
    res.render("editclient-profile", {
      user: results[0],
      errorMessage: req.session.errorMessage || null,
    });
    req.session.errorMessage = null;
  });
});
app.post(
  "/client/edit-profile",
  isAuthenticated,
  upload.single("profile_picture"),
  (req, res) => {
    const { name, email, location, bio } = req.body;
    let updateQuery = `
    UPDATE users 
    SET name = ?, email = ?, location = ?, bio = ?
  `;
    let queryParams = [name, email, location, bio];
    // If a new profile picture was uploaded, add it to the update query
    if (req.file) {
      updateQuery += `, profile_picture = ?`;
      queryParams.push(`/uploads/profiles/${req.file.filename}`);
    }
    updateQuery += ` WHERE id = ?`;
    queryParams.push(req.session.userId);
    // First check if email is already taken (excluding current user)
    connection.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, req.session.userId],
      (err, results) => {
        if (err) {
          req.session.errorMessage = "An error occurred. Please try again.";
          return res.redirect("/client/editclient-profile");
        }
        if (results.length > 0) {
          req.session.errorMessage = "Email is already taken.";
          return res.redirect("/client/editclient-profile");
        }
        // If email is available, proceed with update
        connection.query(updateQuery, queryParams, (err, result) => {
          if (err) {
            req.session.errorMessage =
              "An error occurred while updating your profile.";
            return res.redirect("/client/editclient-profile");
          }
          req.session.successMessage = "Profile updated successfully!";
          res.redirect("/dashboard");
        });
      }
    );
  }
);
// Route to display edit profile form of a freelancer
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
// Route to mark message as read
app.post("/messages/mark-read/:messageId", isAuthenticated, (req, res) => {
  const messageId = req.params.messageId;
  const query = `
    UPDATE messages 
    SET is_read = TRUE 
    WHERE id = ? AND receiver_id = ?
  `;
  connection.query(query, [messageId, req.session.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error updating message status" });
    }
    res.json({ success: true });
  });
});

// Route to show reply form
app.get("/messages/reply/:messageId", isAuthenticated, (req, res) => {
  const messageId = req.params.messageId;
  const query = `
    SELECT 
      m.*,
      sender.name as sender_name,
      sender.id as sender_id,
      j.title as job_title
    FROM messages m
    JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN jobs j ON m.job_id = j.id
    WHERE m.id = ?
  `;
  connection.query(query, [messageId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).render("error", {
        message: "Message not found",
        user: { id: req.session.userId },
      });
    }
    const originalMessage = results[0];
    res.render("reply-message", {
      originalMessage,
      user: { id: req.session.userId },
    });
  });
});

// Route to handle reply submission
app.post("/messages/reply/:messageId", isAuthenticated, (req, res) => {
  const messageId = req.params.messageId;
  const { content } = req.body;
  // First get the original message to know who to send the reply to
  const query = `
    SELECT sender_id, job_id
    FROM messages
    WHERE id = ?
  `;
  connection.query(query, [messageId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ error: "Original message not found" });
    }
    const originalMessage = results[0];
    const receiverId = originalMessage.sender_id;
    // Insert the reply
    const insertQuery = `
      INSERT INTO messages (sender_id, receiver_id, job_id, content)
      VALUES (?, ?, ?, ?)
    `;
    connection.query(
      insertQuery,
      [req.session.userId, receiverId, originalMessage.job_id, content],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Error sending reply" });
        }
        res.redirect("/messages");
      }
    );
  });
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

//bid acceptance
app.post("/bids/:bidId/accept", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const bidId = req.params.bidId;
  const { requirements } = req.body;
  // Start a transaction
  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Error starting transaction" });
    }
    // First, verify the bid belongs to a job owned by this client
    const verifyQuery = `
      SELECT b.*, j.client_id, j.id as job_id
      FROM bids b
      JOIN jobs j ON b.job_id = j.id
      WHERE b.id = ? AND j.client_id = ?
    `;
    connection.query(
      verifyQuery,
      [bidId, req.session.userId],
      (err, results) => {
        if (err || results.length === 0) {
          connection.rollback();
          return res.status(403).json({ error: "Unauthorized" });
        }
        const bid = results[0];
        // Update bid status to accepted
        const updateBidQuery =
          "UPDATE bids SET status = 'accepted' WHERE id = ?";
        connection.query(updateBidQuery, [bidId], (err) => {
          if (err) {
            connection.rollback();
            return res.status(500).json({ error: "Error updating bid" });
          }
          // Update job status to in_progress
          const updateJobQuery =
            "UPDATE jobs SET status = 'in_progress' WHERE id = ?";
          connection.query(updateJobQuery, [bid.job_id], (err) => {
            if (err) {
              connection.rollback();
              return res
                .status(500)
                .json({ error: "Error updating job status" });
            }
            // Send message to freelancer with requirements
            const messageQuery = `
            INSERT INTO messages (sender_id, receiver_id, job_id, content)
            VALUES (?, ?, ?, ?)
          `;
            const messageContent = `Your bid has been accepted! Here are the job requirements:\n\n${requirements}`;
            connection.query(
              messageQuery,
              [
                req.session.userId,
                bid.freelancer_id,
                bid.job_id,
                messageContent,
              ],
              (err) => {
                if (err) {
                  connection.rollback();
                  return res
                    .status(500)
                    .json({ error: "Error sending message" });
                }
                connection.commit((err) => {
                  if (err) {
                    connection.rollback();
                    return res
                      .status(500)
                      .json({ error: "Error committing transaction" });
                  }
                  req.session.successMessage =
                    "Bid accepted and requirements sent to freelancer!";
                  res.redirect("/dashboard");
                });
              }
            );
          });
        });
      }
    );
  });
});
// bid rejection
app.post("/bids/:bidId/reject", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const bidId = req.params.bidId;
  const { reason } = req.body;
  // Verify bid belongs to client's job and update status
  const query = `
    UPDATE bids b
    JOIN jobs j ON b.job_id = j.id
    SET b.status = 'rejected'
    WHERE b.id = ? AND j.client_id = ?
  `;
  connection.query(query, [bidId, req.session.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error rejecting bid" });
    }
    // Send rejection message to freelancer if reason provided
    if (reason) {
      const messageQuery = `
        INSERT INTO messages (sender_id, receiver_id, job_id, content)
        SELECT ?, freelancer_id, job_id, ?
        FROM bids
        WHERE id = ?
      `;
      connection.query(
        messageQuery,
        [
          req.session.userId,
          `Your bid was not accepted. Reason: ${reason}`,
          bidId,
        ],
        (err) => {
          if (err) {
            console.error("Error sending rejection message:", err);
          }
        }
      );
    }
    req.session.successMessage = "Bid rejected successfully";
    res.redirect("/dashboard");
  });
});

// List all services
app.get("/services", (req, res) => {
  connection.query(
    `
    SELECT s.*, u.name as seller_name 
    FROM services s 
    JOIN users u ON s.seller_id = u.id 
    WHERE s.status = 'available'
    ORDER BY s.created_at DESC
  `,
    (error, services) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Server error");
      }

      res.render("service-list", {
        services,
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
  );
});
// Create service form
app.get("/services/create", isAuthenticated, (req, res) => {
  res.render("service-create", {
    user: { id: req.session.userId },
  });
});
// Create new service
app.post("/services/create", isAuthenticated, (req, res) => {
  // Specifying single file upload for the `serviceImage` field
  upload.single("serviceImage")(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(400).send("Error uploading file");
    }
    const { title, description, price } = req.body;
    const image_path = req.file
      ? `/uploads/services/${req.file.filename}`
      : null;
    connection.query(
      `
      INSERT INTO services (seller_id, title, description, price, image_path)
      VALUES (?, ?, ?, ?, ?)
      `,
      [req.session.userId, title, description, price, image_path],
      (error) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Server error");
        }
        res.redirect("/services");
      }
    );
  });
});
// Service details
app.get("/services/:id", (req, res) => {
  connection.query(
    `
    SELECT s.*, u.name as seller_name 
    FROM services s 
    JOIN users u ON s.seller_id = u.id 
    WHERE s.id = ?
  `,
    [req.params.id],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Server error");
      }
      if (!results[0]) {
        return res.status(404).send("Service not found");
      }
      res.render("service-details", {
        service: results[0],
        user: req.session.userId ? { id: req.session.userId } : null,
      });
    }
  );
});
// Initialize payment
app.post("/services/:id/purchase", isAuthenticated, (req, res) => {
  // First get the service details
  connection.query(
    "SELECT * FROM services WHERE id = ?",
    [req.params.id],
    (error, serviceResults) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Server error");
      }
      if (!serviceResults[0]) {
        return res.status(404).send("Service not found");
      }
      const service = serviceResults[0];
      // Create transaction record
      connection.query(
        `
      INSERT INTO service_transactions (service_id, buyer_id, seller_id, amount, status)
      VALUES (?, ?, ?, ?, 'pending')
    `,
        [service.id, req.session.userId, service.seller_id, service.price],
        (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).send("Server error");
          }
          res.render("payments", {
            service,
            transactionId: result.insertId,
            user: { id: req.session.userId },
          });
        }
      );
    }
  );
});

// Process M-Pesa payment (mock)
app.post("/services/:id/process-payment", isAuthenticated, (req, res) => {
  const { transactionId, mpesaCode } = req.body;
  connection.query(
    `
    UPDATE service_transactions 
    SET mpesa_transaction_id = ?, status = 'completed'
    WHERE id = ?
  `,
    [mpesaCode, transactionId],
    (error) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Server error");
      }
      res.redirect("/services");
    }
  );
});

//start
// Route to handle work submission
app.post(
  "/jobs/:jobId/submit",
  isAuthenticated,
  workUpload.array("work_files", 5),
  (req, res) => {
    if (req.session.userType !== "freelancer") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const jobId = req.params.jobId;
    const { submission_text } = req.body;
    const files = req.files;

    // First, verify this freelancer is assigned to this job
    const verifyQuery = `
    SELECT * FROM jobs j
    JOIN bids b ON j.id = b.job_id
    WHERE j.id = ? AND b.freelancer_id = ? AND b.status = 'accepted'
  `;

    connection.query(
      verifyQuery,
      [jobId, req.session.userId],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(403).json({ error: "Not authorized for this job" });
        }

        // Create work submission
        const submissionQuery = `
      INSERT INTO work_submissions (job_id, freelancer_id, submission_text, status)
      VALUES (?, ?, ?, 'pending')
    `;

        connection.query(
          submissionQuery,
          [jobId, req.session.userId, submission_text],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error creating submission" });
            }

            const submissionId = result.insertId;

            // Handle file uploads
            if (files && files.length > 0) {
              const filePromises = files.map((file) => {
                return new Promise((resolve, reject) => {
                  const filePath = "/uploads/work_submissions/" + file.filename;
                  const fileQuery = `
              INSERT INTO submission_files (submission_id, file_path)
              VALUES (?, ?)
            `;
                  connection.query(
                    fileQuery,
                    [submissionId, filePath],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });
              });

              Promise.all(filePromises)
                .then(() => {
                  // Update job status
                  const updateJobQuery = `
              UPDATE jobs SET status = 'review' WHERE id = ?
            `;
                  connection.query(updateJobQuery, [jobId], (err) => {
                    if (err) {
                      console.error("Error updating job status:", err);
                    }
                    res.redirect("/dashboard");
                  });
                })
                .catch((err) => {
                  console.error("Error saving files:", err);
                  res.status(500).json({ error: "Error saving files" });
                });
            } else {
              // Update job status even if no files
              const updateJobQuery = `
          UPDATE jobs SET status = 'review' WHERE id = ?
        `;
              connection.query(updateJobQuery, [jobId], (err) => {
                if (err) {
                  console.error("Error updating job status:", err);
                }
                res.redirect("/dashboard");
              });
            }
          }
        );
      }
    );
  }
);

// Route to handle client review
app.post("/jobs/:jobId/review", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const jobId = req.params.jobId;
  const { status, revision_notes } = req.body;

  // Verify this is the client's job
  const verifyQuery = `
    SELECT * FROM jobs WHERE id = ? AND client_id = ?
  `;

  connection.query(verifyQuery, [jobId, req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: "Not authorized for this job" });
    }

    if (status === "approved") {
      // Update job status to payment_pending
      const updateQuery = `
        UPDATE jobs SET status = 'payment_pending' WHERE id = ?
      `;
      connection.query(updateQuery, [jobId], (err) => {
        if (err) {
          return res.status(500).json({ error: "Error updating job status" });
        }
        res.redirect(`/jobs/${jobId}/payment`);
      });
    } else if (status === "revision") {
      // Create revision request
      const revisionQuery = `
        INSERT INTO revision_requests (job_id, client_id, revision_notes)
        VALUES (?, ?, ?)
      `;
      connection.query(
        revisionQuery,
        [jobId, req.session.userId, revision_notes],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error creating revision request" });
          }
          // Update job status
          const updateQuery = `
          UPDATE jobs SET status = 'revision' WHERE id = ?
        `;
          connection.query(updateQuery, [jobId], (err) => {
            if (err) {
              return res
                .status(500)
                .json({ error: "Error updating job status" });
            }
            res.redirect("/dashboard");
          });
        }
      );
    }
  });
});

// Route to process payment
app.post("/jobs/:jobId/payment", isAuthenticated, (req, res) => {
  if (req.session.userType !== "client") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const jobId = req.params.jobId;
  const { payment_method, transaction_id } = req.body;

  // Verify job status and ownership
  const verifyQuery = `
    SELECT * FROM jobs WHERE id = ? AND client_id = ? AND status = 'payment_pending'
  `;

  connection.query(verifyQuery, [jobId, req.session.userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: "Invalid job or status" });
    }

    const job = results[0];

    // Create payment record
    const paymentQuery = `
      INSERT INTO payments (job_id, amount, payment_method, transaction_id)
      VALUES (?, ?, ?, ?)
    `;

    connection.query(
      paymentQuery,
      [jobId, job.budget, payment_method, transaction_id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Error processing payment" });
        }

        // Update job status to completed
        const updateQuery = `
        UPDATE jobs SET status = 'completed' WHERE id = ?
      `;

        connection.query(updateQuery, [jobId], (err) => {
          if (err) {
            return res.status(500).json({ error: "Error updating job status" });
          }

          res.redirect("/dashboard");
        });
      }
    );
  });
});

//end

//error
// app.get("*", (req, res) => {
//   res.render("error");
// });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
