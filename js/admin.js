document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin.js loaded")
  
    // Check if user is already logged in as admin (prefer sessionStorage for tab-specific login)
    const isAdmin = sessionStorage.getItem("isAdmin") === "true" || localStorage.getItem("isAdmin") === "true"
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true"
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null")
  
    console.log("Admin status:", isAdmin)
    console.log("Login status:", isLoggedIn)
  
    // Add styles for status messages
    const style = document.createElement("style")
    style.textContent = `
          .status-message {
              padding: 10px 15px;
              margin-bottom: 20px;
              border-radius: 4px;
              font-weight: 500;
              display: none;
          }
          .status-message.success {
              background-color: #e8f5e9;
              color: #2e7d32;
              border: 1px solid #c8e6c9;
          }
          .status-message.error {
              background-color: #ffebee;
              color: #c62828;
              border: 1px solid #ffcdd2;
          }
          .reply-count {
              background-color: #e3f2fd;
              color: #0066cc;
              border-radius: 50%;
              padding: 2px 6px;
              font-size: 0.8rem;
              margin-left: 5px;
          }
          .view-replies-btn {
              background-color: #e3f2fd;
              color: #0066cc;
              border: none;
              padding: 3px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.8rem;
              margin-left: 5px;
          }
          .view-replies-btn:hover {
              background-color: #bbdefb;
          }
          .replies-modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
          }
          .replies-modal-content {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
              max-height: 80vh;
              overflow-y: auto;
          }
          .replies-modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
          }
          .replies-modal-header h3 {
              margin: 0;
              color: #0066cc;
          }
          .close-modal {
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: #666;
          }
          .reply-item {
              padding: 10px;
              border-bottom: 1px solid #eee;
              margin-bottom: 10px;
          }
          .reply-content {
              margin-bottom: 5px;
          }
          .reply-meta {
              display: flex;
              justify-content: space-between;
              font-size: 0.8rem;
              color: #777;
          }
          .delete-reply-btn {
              background-color: #ffebee;
              color: #c62828;
              border: none;
              padding: 3px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.8rem;
              margin-left: 5px;
          }
          .delete-reply-btn:hover {
              background-color: #ffcdd2;
          }
          .edit-answer-btn {
              background-color: #e8f5e9;
              color: #2e7d32;
              border: none;
              padding: 3px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.8rem;
              margin-right: 5px;
          }
          .edit-answer-btn:hover {
              background-color: #c8e6c9;
          }
          .edit-answer-modal {
              display: none;
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.5);
              z-index: 1000;
              justify-content: center;
              align-items: center;
          }
          .edit-answer-modal-content {
              background-color: white;
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              width: 90%;
          }
          .edit-answer-modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
          }
          .edit-answer-modal-header h3 {
              margin: 0;
              color: #0066cc;
          }
          .edit-answer-textarea {
              width: 100%;
              min-height: 150px;
              padding: 10px;
              border: 1px solid #ddd;
              border-radius: 4px;
              margin-bottom: 15px;
              font-family: inherit;
              font-size: 1rem;
          }
          .edit-answer-buttons {
              display: flex;
              justify-content: flex-end;
              gap: 10px;
          }
          .save-answer-btn {
              background-color: #0066cc;
              color: white;
              border: none;
              padding: 8px 15px;
              border-radius: 4px;
              cursor: pointer;
          }
          .cancel-edit-btn {
              background-color: #f5f5f5;
              color: #333;
              border: 1px solid #ddd;
              padding: 8px 15px;
              border-radius: 4px;
              cursor: pointer;
          }
      `
    document.head.appendChild(style)
  
    // Only allow access if user is logged in and is an admin
    if (isLoggedIn && isAdmin && currentUser && currentUser.isAdmin) {
      console.log("User is admin, showing admin panel")
      showAdminPanel()
      loadQuestions()
      setupModals()
    } else if (isLoggedIn && currentUser) {
      // User is logged in but not an admin
      console.log("User is logged in but not admin")
      const loginError = document.getElementById("login-error")
      if (loginError) {
        loginError.textContent = "You don't have admin privileges. Please contact the administrator."
        loginError.style.display = "block"
      }
    }
  
    // Login form submission
    const loginForm = document.getElementById("login-form")
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
  
        const username = document.getElementById("username").value.trim()
        const password = document.getElementById("password").value
  
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]")
  
        // Find user with matching username/email
        const user = users.find(
          (u) =>
            (u.email.toLowerCase() === username.toLowerCase() || u.name.toLowerCase() === username.toLowerCase()) &&
            u.isAdmin,
        )
  
        if (user && user.password === password) {
          // Valid admin login - use sessionStorage for tab-specific login
          sessionStorage.setItem("isLoggedIn", "true")
          sessionStorage.setItem("isAdmin", "true")
          sessionStorage.setItem("currentUser", JSON.stringify(user))
  
          // Also update localStorage for convenience
          localStorage.setItem("isLoggedIn", "true")
          localStorage.setItem("isAdmin", "true")
          localStorage.setItem("currentUser", JSON.stringify(user))
  
          showAdminPanel()
          loadQuestions()
          setupModals()
          showStatusMessage("You have successfully logged in as admin", "success")
        } else {
          // Invalid login
          const loginError = document.getElementById("login-error")
          if (loginError) {
            loginError.textContent = "Invalid username or password. Admin access required."
            loginError.style.display = "block"
          }
        }
      })
    }
  
    // Logout button
    const logoutButton = document.getElementById("logout-button")
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        // Clear both sessionStorage and localStorage
        sessionStorage.removeItem("isAdmin")
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        localStorage.removeItem("isAdmin")
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("currentUser")
        hideAdminPanel()
        showStatusMessage("You have been logged out", "success")
      })
    }
  })
  
  function setupModals() {
    // Create replies modal
    const repliesModal = document.createElement("div")
    repliesModal.className = "replies-modal"
    repliesModal.id = "replies-modal"
    repliesModal.innerHTML = `
      <div class="replies-modal-content">
        <div class="replies-modal-header">
          <h3>Replies</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="replies-list" id="replies-list"></div>
      </div>
    `
    document.body.appendChild(repliesModal)
  
    // Create edit answer modal
    const editAnswerModal = document.createElement("div")
    editAnswerModal.className = "edit-answer-modal"
    editAnswerModal.id = "edit-answer-modal"
    editAnswerModal.innerHTML = `
      <div class="edit-answer-modal-content">
        <div class="edit-answer-modal-header">
          <h3>Edit Answer</h3>
          <button class="close-modal">&times;</button>
        </div>
        <textarea class="edit-answer-textarea" id="edit-answer-textarea"></textarea>
        <div class="edit-answer-buttons">
          <button class="cancel-edit-btn">Cancel</button>
          <button class="save-answer-btn">Save Changes</button>
        </div>
      </div>
    `
    document.body.appendChild(editAnswerModal)
  
    // Add event listeners for closing modals
    document.querySelectorAll(".close-modal, .cancel-edit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("replies-modal").style.display = "none"
        document.getElementById("edit-answer-modal").style.display = "none"
      })
    })
  
    // Save answer changes
    document.querySelector(".save-answer-btn").addEventListener("click", () => {
      const questionId = document.getElementById("edit-answer-modal").getAttribute("data-question-id")
      const newAnswer = document.getElementById("edit-answer-textarea").value.trim()
  
      if (newAnswer) {
        updateQuestionAnswer(questionId, newAnswer)
        document.getElementById("edit-answer-modal").style.display = "none"
      } else {
        alert("Please enter an answer before saving.")
      }
    })
  }
  
  function showAdminPanel() {
    const adminLogin = document.getElementById("admin-login")
    const adminPanel = document.getElementById("admin-panel")
  
    if (adminLogin && adminPanel) {
      adminLogin.style.display = "none"
      adminPanel.style.display = "block"
    }
  }
  
  function hideAdminPanel() {
    const adminLogin = document.getElementById("admin-login")
    const adminPanel = document.getElementById("admin-panel")
  
    if (adminLogin && adminPanel) {
      adminLogin.style.display = "block"
      adminPanel.style.display = "none"
    }
  }
  
  function loadQuestions() {
    console.log("Loading questions...")
    const tableBody = document.getElementById("questions-body")
    const emptyState = document.querySelector(".empty-state")
  
    if (!tableBody) {
      console.error("Questions table body not found")
      return
    }
  
    // First try to get questions from localStorage
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
  
    if (questions.length === 0) {
      // If no questions in localStorage, try to load from JSON file
      fetch("faq-data.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load questions. Status: ${response.status}`)
          }
          return response.json()
        })
        .then((data) => {
          // Add replies array if not present
          const dataWithReplies = data.map((q) => {
            if (!q.replies) q.replies = []
            return q
          })
  
          // Save to localStorage for future use
          localStorage.setItem("faqs", JSON.stringify(dataWithReplies))
          displayQuestions(dataWithReplies)
        })
        .catch((error) => {
          console.error("Error loading questions:", error)
          tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading questions: ${error.message}</td></tr>`
          showStatusMessage(`Error: ${error.message}. Make sure faq-data.json exists and is accessible.`, "error")
        })
    } else {
      // Display questions from localStorage
      displayQuestions(questions)
    }
  }
  
  function displayQuestions(questions) {
    console.log(`Displaying ${questions.length} questions`)
    const tableBody = document.getElementById("questions-body")
    if (!tableBody) return
  
    tableBody.innerHTML = ""
  
    if (questions.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">
              No questions found. Questions that users submit will appear here.
          </td></tr>`
      return
    }
  
    questions.forEach((question) => {
      const row = document.createElement("tr")
  
      // ID cell
      const idCell = document.createElement("td")
      idCell.textContent = question.id
      row.appendChild(idCell)
  
      // Question cell
      const questionCell = document.createElement("td")
      questionCell.textContent = question.question
      row.appendChild(questionCell)
  
      // Answer cell
      const answerCell = document.createElement("td")
      const answerText = question.answer || "No answer provided"
  
      // Add edit button for answer
      const editBtn = document.createElement("button")
      editBtn.className = "edit-answer-btn"
      editBtn.textContent = "Edit"
      editBtn.addEventListener("click", () => {
        openEditAnswerModal(question.id, answerText)
      })
  
      const answerDisplay = document.createElement("div")
      answerDisplay.textContent = answerText.length > 50 ? answerText.substring(0, 50) + "..." : answerText
  
      answerCell.appendChild(answerDisplay)
      answerCell.appendChild(editBtn)
      row.appendChild(answerCell)
  
      // Category cell
      const categoryCell = document.createElement("td")
      categoryCell.textContent = question.category || "Uncategorized"
      row.appendChild(categoryCell)
  
      // Status cell
      const statusCell = document.createElement("td")
  
      // Add reply count if there are any
      let statusHtml = question.approved ? "Approved" : "Pending"
      if (question.replies && question.replies.length > 0) {
        statusHtml += ` <span class="reply-count">${question.replies.length}</span>`
  
        // Add view replies button
        const viewRepliesBtn = document.createElement("button")
        viewRepliesBtn.className = "view-replies-btn"
        viewRepliesBtn.textContent = "View Replies"
        viewRepliesBtn.addEventListener("click", () => {
          openRepliesModal(question)
        })
  
        statusCell.innerHTML = statusHtml
        statusCell.appendChild(viewRepliesBtn)
      } else {
        statusCell.innerHTML = statusHtml
      }
  
      statusCell.className = question.approved ? "status-approved" : "status-pending"
      row.appendChild(statusCell)
  
      // Actions cell
      const actionsCell = document.createElement("td")
      const actionsDiv = document.createElement("div")
      actionsDiv.className = "action-buttons"
  
      // Approve/Decline button
      const approveButton = document.createElement("button")
      approveButton.className = question.approved ? "action-button decline-button" : "action-button approve-button"
      approveButton.textContent = question.approved ? "Decline" : "Approve"
      approveButton.addEventListener("click", () => {
        toggleApproval(question.id, !question.approved)
      })
      actionsDiv.appendChild(approveButton)
  
      // Delete button
      const deleteButton = document.createElement("button")
      deleteButton.className = "action-button delete-button"
      deleteButton.textContent = "Delete"
      deleteButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this question?")) {
          deleteQuestion(question.id)
        }
      })
      actionsDiv.appendChild(deleteButton)
  
      actionsCell.appendChild(actionsDiv)
      row.appendChild(actionsCell)
  
      tableBody.appendChild(row)
    })
  }
  
  function openRepliesModal(question) {
    const modal = document.getElementById("replies-modal")
    const repliesList = document.getElementById("replies-list")
  
    // Clear previous content
    repliesList.innerHTML = ""
  
    if (question.replies && question.replies.length > 0) {
      question.replies.forEach((reply) => {
        const replyItem = document.createElement("div")
        replyItem.className = "reply-item"
  
        const replyContent = document.createElement("div")
        replyContent.className = "reply-content"
        replyContent.textContent = reply.content
  
        const replyMeta = document.createElement("div")
        replyMeta.className = "reply-meta"
  
        const userInfo = document.createElement("span")
        userInfo.textContent = `By: ${reply.userName || "Anonymous"} on ${formatDate(reply.createdAt)}`
  
        const deleteBtn = document.createElement("button")
        deleteBtn.className = "delete-reply-btn"
        deleteBtn.textContent = "Delete"
        deleteBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this reply?")) {
            deleteReply(question.id, reply.id)
            replyItem.remove()
  
            // If no more replies, close the modal
            if (repliesList.children.length === 0) {
              modal.style.display = "none"
            }
          }
        })
  
        replyMeta.appendChild(userInfo)
        replyMeta.appendChild(deleteBtn)
  
        replyItem.appendChild(replyContent)
        replyItem.appendChild(replyMeta)
        repliesList.appendChild(replyItem)
      })
    } else {
      repliesList.innerHTML = '<div class="no-replies">No replies for this question.</div>'
    }
  
    // Show the modal
    modal.style.display = "flex"
  }
  
  function openEditAnswerModal(questionId, currentAnswer) {
    const modal = document.getElementById("edit-answer-modal")
    const textarea = document.getElementById("edit-answer-textarea")
  
    // Set current answer in textarea
    textarea.value = currentAnswer
  
    // Set question ID as data attribute
    modal.setAttribute("data-question-id", questionId)
  
    // Show the modal
    modal.style.display = "flex"
  }
  
  function deleteReply(questionId, replyId) {
    // Get questions from localStorage
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
  
    // Find the question
    const questionIndex = questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) return
  
    // Remove the reply
    questions[questionIndex].replies = questions[questionIndex].replies.filter((r) => r.id !== replyId)
  
    // Save back to localStorage
    localStorage.setItem("faqs", JSON.stringify(questions))
  
    // Reload questions to update the UI
    loadQuestions()
  
    // Show success message
    showStatusMessage("Reply deleted successfully", "success")
  }
  
  function updateQuestionAnswer(questionId, newAnswer) {
    // Get questions from localStorage
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
  
    // Find the question
    const questionIndex = questions.findIndex((q) => q.id === questionId)
    if (questionIndex === -1) return
  
    // Update the answer
    questions[questionIndex].answer = newAnswer
  
    // Save back to localStorage
    localStorage.setItem("faqs", JSON.stringify(questions))
  
    // Reload questions to update the UI
    loadQuestions()
  
    // Show success message
    showStatusMessage("Answer updated successfully", "success")
  }
  
  function toggleApproval(id, approved) {
    console.log(`Toggling approval for question ${id} to ${approved}`)
  
    // Get questions from localStorage
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
  
    // Find and update the question
    const updatedQuestions = questions.map((q) => {
      if (q.id === id) {
        // If approving and the answer is the default pending message, clear it
        if (approved && q.answer === "This question is pending review.") {
          return { ...q, approved: approved, answer: "" }
        } else {
          return { ...q, approved: approved }
        }
      }
      return q
    })
  
    // Save updated questions back to localStorage
    localStorage.setItem("faqs", JSON.stringify(updatedQuestions))
  
    // Update the display
    displayQuestions(updatedQuestions)
  
    // Show status message
    const action = approved ? "approved" : "unapproved"
    showStatusMessage(`Question has been ${action} successfully`, "success")
  }
  
  function deleteQuestion(id) {
    console.log(`Deleting question ${id}`)
  
    // Get questions from localStorage
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
  
    // Filter out the question to delete
    const updatedQuestions = questions.filter((q) => q.id !== id)
  
    // Save updated questions back to localStorage
    localStorage.setItem("faqs", JSON.stringify(updatedQuestions))
  
    // Update the display
    displayQuestions(updatedQuestions)
  
    // Show status message
    showStatusMessage("Question has been deleted successfully", "success")
  }
  
  function showStatusMessage(message, type) {
    console.log(`Status message: ${message} (${type})`)
    const statusMessage = document.getElementById("status-message")
    if (!statusMessage) return
  
    statusMessage.textContent = message
    statusMessage.className = `status-message ${type}`
    statusMessage.style.display = "block"
  
    // Auto hide after 3 seconds
    setTimeout(() => {
      statusMessage.style.display = "none"
    }, 3000)
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString) return ""
  
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
  