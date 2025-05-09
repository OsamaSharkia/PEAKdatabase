document.addEventListener("DOMContentLoaded", () => {
  console.log("FAQ display script loaded")

  // Load FAQs
  loadFAQs()

  // Set up search and filter functionality
  setupSearchAndFilter()

  // Set up question form visibility based on authentication
  setupQuestionForm()

  // Function to load FAQs from database or localStorage
  async function loadFAQs() {
    console.log("Loading FAQs...")
    const faqList = document.getElementById("faq-list")
    if (!faqList) {
      console.error("FAQ list element not found")
      return
    }

    // Show loading indicator
    faqList.innerHTML = '<p class="loading">Loading questions...</p>'

    try {
      // Get current user
      const currentUser = JSON.parse(
        sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null",
      )
      const isAdmin = sessionStorage.getItem("isAdmin") === "true" || localStorage.getItem("isAdmin") === "true"

      let faqs = []

      // Try to load from Supabase if available
      if (window.supabaseClient) {
        console.log("Loading FAQs from database...")

        try {
          // First try to load from the view
          let query = window.supabaseClient.from("faq_view").select("*")

          // For regular users, only show approved FAQs and their own pending FAQs
          if (!isAdmin && currentUser) {
            query = query.or(`status.eq.approved,user_id.eq.${currentUser.id}`)
          } else if (!isAdmin) {
            // For non-logged in users, only show approved FAQs
            query = query.eq("status", "approved")
          }

          // Execute query
          const { data, error } = await query.order("created_at", { ascending: false })

          if (error) {
            console.error("Error loading from faq_view:", error)
            throw error
          }

          if (data && data.length > 0) {
            faqs = data
            console.log(`Loaded ${faqs.length} FAQs from faq_view`)
          } else {
            console.log("No FAQs found in faq_view, trying direct table query...")

            // If view doesn't work, try direct table query
            let directQuery = window.supabaseClient.from("faqs").select(`
              id,
              question,
              answer,
              status,
              image_url,
              created_at,
              updated_at,
              approved_at,
              user_id,
              category_id
            `)

            // Apply filters
            if (!isAdmin && currentUser) {
              directQuery = directQuery.or(`status.eq.approved,user_id.eq.${currentUser.id}`)
            } else if (!isAdmin) {
              directQuery = directQuery.eq("status", "approved")
            }

            const { data: directData, error: directError } = await directQuery.order("created_at", { ascending: false })

            if (directError) {
              console.error("Error loading from direct query:", directError)
              throw directError
            }

            if (directData && directData.length > 0) {
              faqs = directData
              console.log(`Loaded ${faqs.length} FAQs from direct table query`)
            } else {
              console.log("No FAQs found in database, checking localStorage...")
              // Fall back to localStorage if no FAQs in database
              faqs = loadFromLocalStorage()
            }
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
          console.log("Falling back to localStorage...")
          // Fall back to localStorage if there's a database error
          faqs = loadFromLocalStorage()
        }
      } else {
        console.log("Supabase client not available, loading from localStorage...")
        // Fall back to localStorage if Supabase is not available
        faqs = loadFromLocalStorage()
      }

      // Display the FAQs
      displayFAQs(faqs)
    } catch (error) {
      console.error("Error loading FAQs:", error)
      faqList.innerHTML = `<div class="error-message">
        <h3>Error Loading FAQs</h3>
        <p>There was a problem loading the FAQs. Please try again later.</p>
        <p>Error details: ${error.message}</p>
      </div>`
    }
  }

  // Function to load FAQs from localStorage (fallback)
  function loadFromLocalStorage() {
    // Get FAQs from localStorage
    let faqs = JSON.parse(localStorage.getItem("faqs") || "[]")
    console.log(`Found ${faqs.length} FAQs in localStorage`)

    // If no FAQs in localStorage, create default ones
    if (faqs.length === 0) {
      console.log("No FAQs found, creating default ones")
      // Create default FAQs
      const defaultFaqs = [
        {
          id: "1",
          question: "How do I apply to universities in Kent?",
          answer:
            "Most undergraduate courses in the UK require application through UCAS (Universities and Colleges Admissions Service). You'll need to create an account on the UCAS website, search for courses at Kent universities, and submit your application before the deadline.",
          category: "admissions",
          category_name: "Admissions",
          category_slug: "admissions",
          category_icon: "fas fa-university",
          status: "approved",
          replies: [],
        },
        {
          id: "2",
          question: "What are the application deadlines?",
          answer:
            "For undergraduate courses starting in September 2025, the main UCAS deadline is January 31st, 2025. However, some courses may have earlier deadlines, especially for international students. It's best to check specific university websites for the most accurate information.",
          category: "admissions",
          category_name: "Admissions",
          category_slug: "admissions",
          category_icon: "fas fa-university",
          status: "approved",
          replies: [],
        },
        {
          id: "3",
          question: "What English language qualifications do I need?",
          answer:
            "Most universities require IELTS Academic with a score of 6.0-7.0 overall, with no component below 5.5. Some courses, particularly in healthcare or education, may require higher scores. Universities may also accept other qualifications like TOEFL, PTE Academic, or Cambridge English qualifications.",
          category: "language",
          category_name: "Language Requirements",
          category_slug: "language",
          category_icon: "fas fa-language",
          status: "approved",
          replies: [],
        },
        {
          id: "4",
          question: "Are there any scholarships available for refugees?",
          answer:
            "Yes, many universities offer specific scholarships for refugees and asylum seekers. The Refugee Education UK charity also provides support. Universities like Kent, Canterbury Christ Church, and Greenwich (Medway campus) have dedicated refugee scholarships. Contact the university's international office for more information.",
          category: "financial",
          category_name: "Financial Support",
          category_slug: "financial",
          category_icon: "fas fa-money-bill-wave",
          status: "approved",
          replies: [],
        },
        {
          id: "5",
          question: "How can I get my previous qualifications recognized in the UK?",
          answer:
            "UK NARIC (now UK ENIC) can provide statements of comparability for international qualifications. Universities may also have their own assessment processes. Some universities offer foundation years specifically designed for students with international qualifications.",
          category: "general",
          category_name: "General Information",
          category_slug: "general",
          category_icon: "fas fa-info-circle",
          status: "approved",
          replies: [],
        },
        {
          id: "6",
          question: "What support services are available for refugee students?",
          answer:
            "Universities in Kent offer various support services including counseling, academic skills support, and sometimes dedicated refugee advisors. Organizations like Refugee Education UK and Student Action for Refugees also provide additional support and networking opportunities.",
          category: "general",
          category_name: "General Information",
          category_slug: "general",
          category_icon: "fas fa-info-circle",
          status: "approved",
          replies: [],
        },
      ]

      // Save default FAQs to localStorage
      localStorage.setItem("faqs", JSON.stringify(defaultFaqs))
      faqs = defaultFaqs
      console.log("Default FAQs created and saved")
    }

    // Convert old format to new format if needed
    faqs = faqs.map((faq) => {
      // Convert approved to status
      if (faq.approved === true) {
        faq.status = "approved"
      } else if (faq.approved === false) {
        faq.status = "declined"
      } else {
        faq.status = "pending"
      }

      // Add category name and icon if missing
      if (!faq.category_name) {
        const categoryMap = {
          admissions: { name: "Admissions", icon: "fas fa-university" },
          language: { name: "Language Requirements", icon: "fas fa-language" },
          financial: { name: "Financial Support", icon: "fas fa-money-bill-wave" },
          general: { name: "General Information", icon: "fas fa-info-circle" },
          community: { name: "Community Questions", icon: "fas fa-users" },
        }

        const category = faq.category || "general"
        faq.category_slug = category
        faq.category_name = categoryMap[category]?.name || "General Information"
        faq.category_icon = categoryMap[category]?.icon || "fas fa-info-circle"
      }

      // Ensure replies array exists
      if (!faq.replies) {
        faq.replies = []
      }

      return faq
    })

    // Get current user
    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null",
    )
    const isAdmin = sessionStorage.getItem("isAdmin") === "true" || localStorage.getItem("isAdmin") === "true"

    // For regular users, only show approved FAQs and their own pending FAQs
    if (!isAdmin && currentUser) {
      faqs = faqs.filter((faq) => faq.status === "approved" || faq.userId === currentUser.email)
      console.log(`Filtered to ${faqs.length} visible FAQs for logged-in user`)
    } else if (!isAdmin) {
      // For non-logged in users, only show approved FAQs
      faqs = faqs.filter((faq) => faq.status === "approved")
      console.log(`Filtered to ${faqs.length} visible FAQs for non-logged-in user`)
    }

    return faqs
  }

  // Function to display FAQs
  function displayFAQs(faqs) {
    console.log(`Displaying ${faqs.length} FAQs`)
    const faqList = document.getElementById("faq-list")
    if (!faqList) {
      console.error("FAQ list element not found")
      return
    }

    // Clear the list
    faqList.innerHTML = ""

    if (faqs.length === 0) {
      faqList.innerHTML = `<div class="empty-state">
        <h3>No FAQs Available</h3>
        <p>Check back soon or submit your own question.</p>
      </div>`
      return
    }

    // Get current user
    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null",
    )

    // Create categories for organization
    const categories = {}

    // Sort FAQs into categories
    faqs.forEach((faq) => {
      const categorySlug = faq.category_slug || faq.category || "general"

      if (!categories[categorySlug]) {
        categories[categorySlug] = {
          name: faq.category_name || getCategoryTitle(categorySlug),
          icon: faq.category_icon || getCategoryIcon(categorySlug),
          faqs: [],
        }
      }

      categories[categorySlug].faqs.push(faq)
    })

    // Render FAQs by category
    for (const categorySlug in categories) {
      const category = categories[categorySlug]

      // Skip empty categories
      if (category.faqs.length === 0) continue

      const categoryHeader = document.createElement("h2")
      categoryHeader.className = "faq-category-title"
      categoryHeader.innerHTML = `<i class="${category.icon}"></i> ${category.name}`
      categoryHeader.setAttribute("data-category", categorySlug)
      faqList.appendChild(categoryHeader)

      category.faqs.forEach((faq) => {
        const faqItem = document.createElement("div")
        faqItem.className = "faq-item"
        faqItem.setAttribute("data-category", faq.category_slug || faq.category || "general")

        // Add tags if needed
        let tagHtml = ""
        if (faq.user_id || faq.userId || faq.user_email) {
          tagHtml += `<div class="question-tag community-tag">Community</div>`
        }
        if (faq.status !== "approved") {
          tagHtml += `<div class="question-tag pending-tag">${faq.status === "declined" ? "Declined" : "Pending"}</div>`
        }

        // Prepare answer content
        let answerContent = ""
        if (faq.status !== "approved") {
          answerContent = `<div class="pending-message">This question is pending review.</div>`
        } else if (!faq.answer) {
          answerContent = `<p>No answer provided yet.</p>`
        } else {
          answerContent = `<p>${faq.answer}</p>`
        }

        // Add image if present
        if (faq.image_url || faq.image) {
          answerContent += `<img src="${faq.image_url || faq.image}" alt="Question image" style="max-width: 100%; margin-top: 1rem;">`
        }

        // Create HTML for replies
        let repliesHtml = ""
        const replies = faq.replies || []

        if (replies.length > 0) {
          const repliesContent = replies
            .map(
              (reply) => `
            <div class="reply">
              <div class="reply-content">${reply.content}</div>
              <div class="reply-meta">
                <span>By: ${reply.user_name || reply.userName || "Anonymous"}</span>
                <span>Posted: ${formatDate(reply.created_at || reply.createdAt)}</span>
              </div>
            </div>
          `,
            )
            .join("")

          repliesHtml = `
            <div class="replies-section">
              <h4><i class="fas fa-comments"></i> Replies (${replies.length})</h4>
              <div class="replies-list">
                ${repliesContent}
              </div>
              ${
                currentUser
                  ? `
              <div class="reply-form">
                <textarea placeholder="Write your reply here..." class="reply-textarea" data-question-id="${faq.id}"></textarea>
                <button class="reply-submit" data-question-id="${faq.id}">Submit Reply</button>
              </div>
              `
                  : `
              <div class="auth-message info">
                <p>Please <a href="login.html">login</a> to reply to this question.</p>
              </div>
              `
              }
            </div>
          `
        } else {
          repliesHtml = `
            <div class="replies-section">
              <h4><i class="fas fa-comments"></i> Replies</h4>
              <div class="no-replies">No replies yet.</div>
              ${
                currentUser
                  ? `
              <div class="reply-form">
                <textarea placeholder="Write your reply here..." class="reply-textarea" data-question-id="${faq.id}"></textarea>
                <button class="reply-submit" data-question-id="${faq.id}">Submit Reply</button>
              </div>
              `
                  : `
              <div class="auth-message info">
                <p>Please <a href="login.html">login</a> to reply to this question.</p>
              </div>
              `
              }
            </div>
          `
        }

        faqItem.innerHTML = `
          <div class="faq-question">
            <h3>${faq.question}</h3>
            <button class="toggle-answer"><i class="fas fa-plus"></i></button>
          </div>
          <div class="faq-answer">
            ${answerContent}
            ${
              faq.user_id || faq.userId || faq.user_email
                ? `
              <div class="question-meta">
                <span>Asked by: ${faq.user_name || faq.userName || "Anonymous"}</span>
                <span>Posted: ${formatDate(faq.created_at || faq.createdAt)}</span>
              </div>
            `
                : ""
            }
            ${repliesHtml}
          </div>
          ${tagHtml}
        `

        faqList.appendChild(faqItem)

        // Add toggle functionality
        const question = faqItem.querySelector(".faq-question")
        const answer = faqItem.querySelector(".faq-answer")
        const toggleButton = faqItem.querySelector(".toggle-answer")

        if (question && answer && toggleButton) {
          question.addEventListener("click", () => {
            const isOpen = answer.style.display === "block"

            // Close all other answers
            document.querySelectorAll(".faq-answer").forEach((a) => {
              a.style.display = "none"
            })
            document.querySelectorAll(".toggle-answer i").forEach((icon) => {
              icon.className = "fas fa-plus"
            })

            // Toggle current answer
            answer.style.display = isOpen ? "none" : "block"
            toggleButton.querySelector("i").className = isOpen ? "fas fa-plus" : "fas fa-minus"
          })
        }

        // Add event listeners for reply submission
        const replyButtons = faqItem.querySelectorAll(".reply-submit")
        replyButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const questionId = this.getAttribute("data-question-id")
            const textarea = faqItem.querySelector(`.reply-textarea[data-question-id="${questionId}"]`)
            if (textarea && textarea.value.trim()) {
              submitReply(questionId, textarea.value.trim())
            } else {
              alert("Please enter a reply before submitting.")
            }
          })
        })
      })
    }
  }

  // Function to submit a reply
  async function submitReply(questionId, content) {
    const currentUser = JSON.parse(
      sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null",
    )

    if (!currentUser) {
      alert("You must be logged in to reply.")
      return
    }

    try {
      if (window.supabaseClient) {
        // Submit reply to database
        const { data, error } = await window.supabaseClient.from("faq_replies").insert({
          faq_id: questionId,
          user_id: currentUser.id,
          content: content,
        })

        if (error) throw error

        // Reload FAQs to show the new reply
        loadFAQs()
      } else {
        // Fallback to localStorage
        // Get FAQs from localStorage
        const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")

        // Find the question
        const questionIndex = faqs.findIndex((q) => q.id === questionId)
        if (questionIndex === -1) {
          alert("Question not found.")
          return
        }

        // Create reply object
        const reply = {
          id: Date.now().toString(),
          content: content,
          userId: currentUser.email,
          userName: currentUser.name || "Anonymous",
          createdAt: new Date().toISOString(),
        }

        // Add reply to question
        if (!faqs[questionIndex].replies) {
          faqs[questionIndex].replies = []
        }

        faqs[questionIndex].replies.push(reply)

        // Save back to localStorage
        localStorage.setItem("faqs", JSON.stringify(faqs))

        // Reload FAQs to show the new reply
        loadFAQs()
      }

      // Show success message
      alert("Your reply has been submitted successfully!")
    } catch (error) {
      console.error("Error submitting reply:", error)
      alert(`Failed to submit reply: ${error.message}`)
    }
  }

  // Function to set up search and filter functionality
  function setupSearchAndFilter() {
    const faqSearch = document.getElementById("faq-search")
    const searchBtn = document.getElementById("search-btn")
    const categoryTabs = document.querySelectorAll(".category-tab")
    const faqNotFound = document.getElementById("faq-not-found")

    // Search functionality
    if (searchBtn) {
      searchBtn.addEventListener("click", () => {
        searchFAQs()
      })
    }

    if (faqSearch) {
      faqSearch.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          searchFAQs()
        }
      })
    }

    // Category filtering
    if (categoryTabs) {
      categoryTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          // Remove active class from all tabs
          categoryTabs.forEach((t) => t.classList.remove("active"))

          // Add active class to clicked tab
          tab.classList.add("active")

          // Perform search with new category filter
          searchFAQs()
        })
      })
    }

    function searchFAQs() {
      const searchTerm = faqSearch ? faqSearch.value.toLowerCase() : ""
      const selectedCategory = document.querySelector(".category-tab.active")
        ? document.querySelector(".category-tab.active").getAttribute("data-category")
        : "all"

      const faqItems = document.querySelectorAll(".faq-item")
      let resultsFound = false

      faqItems.forEach((item) => {
        const questionText = item.querySelector(".faq-question h3").textContent.toLowerCase()
        const answerText = item.querySelector(".faq-answer").textContent.toLowerCase()
        const itemCategory = item.getAttribute("data-category")

        // Check if matching search term
        const matchesSearch = searchTerm === "" || questionText.includes(searchTerm) || answerText.includes(searchTerm)

        // Check if matching selected category
        const matchesCategory =
          selectedCategory === "all" ||
          itemCategory === selectedCategory ||
          (selectedCategory === "community" && item.querySelector(".community-tag"))

        if (matchesSearch && matchesCategory) {
          item.style.display = "block"
          resultsFound = true
        } else {
          item.style.display = "none"
        }
      })

      // Show/hide no results message
      if (faqNotFound) {
        faqNotFound.style.display = resultsFound ? "none" : "block"
      }

      // Show/hide category headers based on visible items
      updateCategoryHeadersVisibility()
    }

    function updateCategoryHeadersVisibility() {
      const categoryHeaders = document.querySelectorAll(".faq-category-title")

      categoryHeaders.forEach((header) => {
        let nextElement = header.nextElementSibling
        let hasVisibleItems = false

        // Check for visible items in this category
        while (nextElement && !nextElement.classList.contains("faq-category-title")) {
          if (nextElement.classList.contains("faq-item") && nextElement.style.display !== "none") {
            hasVisibleItems = true
            break
          }
          nextElement = nextElement.nextElementSibling
        }

        // Show/hide the category header
        header.style.display = hasVisibleItems ? "flex" : "none"
      })
    }
  }

  // Helper function to get category title
  function getCategoryTitle(category) {
    const titles = {
      admissions: "Admissions",
      language: "Language Requirements",
      financial: "Financial Support",
      general: "General Information",
      community: "Community Questions",
    }

    return titles[category] || "Other"
  }

  // Helper function to get category icon
  function getCategoryIcon(category) {
    const icons = {
      admissions: "fas fa-university",
      language: "fas fa-language",
      financial: "fas fa-money-bill-wave",
      general: "fas fa-info-circle",
      community: "fas fa-users",
    }

    return icons[category] || "fas fa-question-circle"
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

  // Function to set up question form visibility
  function setupQuestionForm() {
    const loginToAsk = document.getElementById("login-to-ask")
    const questionForm = document.getElementById("question-form")

    if (!loginToAsk || !questionForm) {
      console.error("Question form elements not found")
      return
    }

    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true"

    console.log("Question form - User logged in:", isLoggedIn)

    if (isLoggedIn) {
      loginToAsk.style.display = "none"
      questionForm.style.display = "block"
    } else {
      loginToAsk.style.display = "block"
      questionForm.style.display = "none"
    }
  }
})

// Debug function to inspect localStorage
function debugLocalStorage() {
  const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")
  console.log("Current FAQs in localStorage:", faqs)
  console.log(
    "Approved FAQs:",
    faqs.filter((faq) => faq.approved === true || faq.status === "approved"),
  )
  console.log(
    "Pending FAQs:",
    faqs.filter((faq) => (faq.approved !== true && faq.approved !== false) || faq.status === "pending"),
  )
}

// Call it when the page loads
document.addEventListener("DOMContentLoaded", () => {
  debugLocalStorage()
})

document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
  const userEmail = localStorage.getItem("userEmail")

  // Get DOM elements
  const searchInput = document.getElementById("faq-search")
  const searchButton = document.getElementById("search-button")
  const faqContainer = document.getElementById("faq-container")
  const categoryButtons = document.querySelectorAll(".category-button")
  const errorContainer = document.getElementById("error-container")

  // Initialize variables
  let allFaqs = []
  let filteredFaqs = []
  let currentCategory = "all"

  // Function to show error message
  function showError(message, details = "") {
    errorContainer.innerHTML = `
            <div class="alert alert-danger">
                <h4>Error Loading FAQs</h4>
                <p>${message}</p>
                ${details ? `<p>Error details: ${details}</p>` : ""}
            </div>
        `
    errorContainer.style.display = "block"
    console.error("FAQ Error:", message, details)
  }

  // Function to hide error message
  function hideError() {
    errorContainer.style.display = "none"
  }

  // Initialize Supabase client
  const { createClient } = supabase
  // Function to fetch FAQs from Supabase
  async function fetchFaqsFromDatabase() {
    try {
      // Create Supabase client
      const SUPABASE_URL = "https://your-supabase-url.supabase.co"
      const SUPABASE_KEY = "your-supabase-anon-key"

      // Initialize Supabase client
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY)

      // Fetch approved FAQs from the view
      const { data, error } = await supabaseClient.from("faq_view").select("*").eq("status", "approved")

      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error("Error fetching FAQs from database:", error)
      // Fall back to localStorage
      return getFaqsFromLocalStorage()
    }
  }

  // Function to get FAQs from localStorage
  function getFaqsFromLocalStorage() {
    try {
      const storedFaqs = localStorage.getItem("faqData")
      if (!storedFaqs) {
        return []
      }

      const parsedFaqs = JSON.parse(storedFaqs)

      // Filter only approved FAQs
      return parsedFaqs.filter((faq) => faq.status === "approved")
    } catch (error) {
      console.error("Error parsing FAQs from localStorage:", error)
      return []
    }
  }

  // Function to load FAQs
  async function loadFaqs() {
    try {
      hideError()

      // Try to fetch from database first, fall back to localStorage
      allFaqs = await fetchFaqsFromDatabase()

      if (allFaqs.length === 0) {
        // If no FAQs found, try localStorage as fallback
        allFaqs = getFaqsFromLocalStorage()
      }

      // Filter and display FAQs
      filterFaqsByCategory(currentCategory)
    } catch (error) {
      showError("There was a problem loading the FAQs. Please try again later.", error.message)
    }
  }

  // Function to filter FAQs by category
  function filterFaqsByCategory(category) {
    currentCategory = category

    // Highlight the selected category button
    categoryButtons.forEach((button) => {
      if (button.dataset.category === category) {
        button.classList.add("active")
      } else {
        button.classList.remove("active")
      }
    })

    // Filter FAQs by category
    if (category === "all") {
      filteredFaqs = [...allFaqs]
    } else {
      filteredFaqs = allFaqs.filter((faq) => {
        // Check if category_slug exists and matches, or fall back to category
        return (
          (faq.category_slug && faq.category_slug === category) ||
          (faq.category && faq.category.toLowerCase() === category.toLowerCase())
        )
      })
    }

    // Apply search filter if search input has value
    if (searchInput.value.trim() !== "") {
      filterFaqsBySearch(searchInput.value)
    } else {
      displayFaqs(filteredFaqs)
    }
  }

  // Function to filter FAQs by search term
  function filterFaqsBySearch(searchTerm) {
    if (!searchTerm.trim()) {
      displayFaqs(filteredFaqs)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const searchResults = filteredFaqs.filter((faq) => {
      return faq.question.toLowerCase().includes(term) || (faq.answer && faq.answer.toLowerCase().includes(term))
    })

    displayFaqs(searchResults)
  }

  // Function to display FAQs
  function displayFaqs(faqs) {
    if (faqs.length === 0) {
      faqContainer.innerHTML = `
                <div class="no-faqs-message">
                    <p>No FAQs found. Try a different category or search term.</p>
                </div>
            `
      return
    }

    // Sort FAQs by most recent first
    faqs.sort((a, b) => {
      const dateA = new Date(a.approved_at || a.created_at || 0)
      const dateB = new Date(b.approved_at || b.created_at || 0)
      return dateB - dateA
    })

    // Generate HTML for FAQs
    const faqsHtml = faqs
      .map((faq, index) => {
        const categoryName = faq.category_name || faq.category || "General"
        const categoryClass = faq.category_slug || (faq.category ? faq.category.toLowerCase() : "general")

        return `
                <div class="faq-item" data-category="${categoryClass}">
                    <div class="faq-question" onclick="toggleFaq(event, ${index})">
                        <h3>${faq.question}</h3>
                        <span class="category-tag ${categoryClass}">${categoryName}</span>
                        <span class="toggle-icon">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>${faq.answer || "No answer provided yet."}</p>
                    </div>
                </div>
            `
      })
      .join("")

    faqContainer.innerHTML = faqsHtml

    // Add event listeners to FAQ items
    document.querySelectorAll(".faq-question").forEach((question, index) => {
      question.addEventListener("click", (event) => toggleFaq(event, index))
    })
  }

  // Function to toggle FAQ answer visibility
  function toggleFaq(event, index) {
    event.preventDefault() // Prevent default action
    const faqItems = document.querySelectorAll(".faq-item")
    const faqItem = faqItems[index]
    const faqAnswer = faqItem.querySelector(".faq-answer")
    const toggleIcon = faqItem.querySelector(".toggle-icon")

    // Toggle the active class
    faqItem.classList.toggle("active")

    // Toggle the answer visibility
    if (faqItem.classList.contains("active")) {
      faqAnswer.style.display = "block"
      toggleIcon.textContent = "−" // Minus sign
    } else {
      faqAnswer.style.display = "none"
      toggleIcon.textContent = "+" // Plus sign
    }
  }

  // Add event listeners
  searchButton.addEventListener("click", () => {
    filterFaqsBySearch(searchInput.value)
  })

  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      filterFaqsBySearch(searchInput.value)
    }
  })

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category
      filterFaqsByCategory(category)
    })
  })

  // Load FAQs when the page loads
  loadFaqs()
})

// Initialize Supabase client
const { createClient } = supabase
