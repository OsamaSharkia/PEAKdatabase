document.addEventListener("DOMContentLoaded", () => {
  // Check if user is already logged in as admin (use sessionStorage for consistency)
  const isAdmin = sessionStorage.getItem("isAdmin") === "true"
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true"
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null")

  console.log("Admin status:", isAdmin)
  console.log("Login status:", isLoggedIn)

  // Debug localStorage on load to see what's actually there
  debugLocalStorage()

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
    .status-approved {
      color: #2e7d32;
      font-weight: 500;
    }
    .status-pending {
      color: #f57c00;
      font-weight: 500;
    }
    .status-declined {
      color: #c62828;
      font-weight: 500;
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
    .action-button {
      border: none;
      padding: 5px 10px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 5px;
      font-size: 0.9rem;
    }
    .approve-button {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .approve-button:hover {
      background-color: #c8e6c9;
    }
    .decline-button {
      background-color: #ffebee;
      color: #c62828;
    }
    .decline-button:hover {
      background-color: #ffcdd2;
    }
    .delete-button {
      background-color: #f5f5f5;
      color: #333;
    }
    .delete-button:hover {
      background-color: #e0e0e0;
    }
    .edit-answer-btn {
      background-color: #e3f2fd;
      color: #0066cc;
      border: none;
      padding: 3px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      margin-right: 5px;
    }
    .edit-answer-btn:hover {
      background-color: #bbdefb;
    }
    .modal {
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
    .modal-content {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    .modal-header h3 {
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
    .modal-textarea {
      width: 100%;
      min-height: 150px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 15px;
      font-family: inherit;
      font-size: 1rem;
    }
    .modal-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .save-btn {
      background-color: #0066cc;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    .cancel-btn {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
    }
    .debug-tools {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .debug-tools h3 {
      margin-top: 0;
      color: #333;
    }
    .debug-button {
      background-color: #ff9800;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
      margin-bottom: 10px;
    }
    .debug-button:hover {
      background-color: #f57c00;
    }
    .debug-info {
      background-color: #e3f2fd;
      padding: 10px;
      border-radius: 4px;
      margin-top: 10px;
      font-family: monospace;
      white-space: pre-wrap;
      max-height: 200px;
      overflow-y: auto;
    }
  `
  document.head.appendChild(style)

  // Only allow access if user is logged in and is an admin
  if (isLoggedIn && isAdmin && currentUser) {
    console.log("User is admin, showing admin panel")

    // Set up tab navigation
    setupTabNavigation()

    // Load questions when the questions tab is clicked
    const questionsTab = document.querySelector('a[href="#questions"]')
    if (questionsTab) {
      questionsTab.addEventListener("click", () => {
        loadQuestions()
      })
    }

    // Set up modals for editing answers and viewing replies
    setupModals()

    // Set up filter buttons for questions
    setupFilterButtons()

    // Add debug tools to the questions tab
    addDebugTools()

    // Load questions initially if we're on the questions tab
    if (document.getElementById("questions").classList.contains("active")) {
      loadQuestions()
    }
  } else {
    // Redirect to login page if not logged in as admin
    window.location.href = "login.html"
  }

  function addDebugTools() {
    const questionsTab = document.getElementById("questions")
    if (!questionsTab) return

    // Create debug tools section
    const debugTools = document.createElement("div")
    debugTools.className = "debug-tools"
    debugTools.innerHTML = `
      <h3>Debug Tools</h3>
      <p>Use these tools to fix issues with the FAQ data structure.</p>
      <div>
        <button id="create-default-faqs" class="debug-button">Create Default FAQs</button>
        <button id="reset-local-data" class="debug-button">Reset Local Data</button>
        <button id="fix-data-structure" class="debug-button">Fix Data Structure</button>
        <button id="create-db-tables" class="debug-button">Create Database Tables</button>
        <button id="fix-relationships" class="debug-button">Fix Table Relationships</button>
        <button id="fix-approval-issues" class="debug-button">Fix Approval Issues</button>
        <button id="debug-db-connection" class="debug-button">Debug DB Connection</button>
      </div>
      <div id="debug-info" class="debug-info" style="display: none;"></div>
    `

    // Add to the questions tab
    questionsTab.appendChild(debugTools)

    // Add event listeners
    document.getElementById("create-default-faqs").addEventListener("click", createDefaultFAQs)
    document.getElementById("reset-local-data").addEventListener("click", resetLocalData)
    document.getElementById("fix-data-structure").addEventListener("click", fixDataStructure)
    document.getElementById("create-db-tables").addEventListener("click", createDatabaseTables)
    document.getElementById("fix-relationships").addEventListener("click", fixTableRelationships)
    document.getElementById("fix-approval-issues").addEventListener("click", fixApprovalIssues)
    document.getElementById("debug-db-connection").addEventListener("click", debugDatabaseConnection)
  }

  async function debugDatabaseConnection() {
    const debugInfo = document.getElementById("debug-info")
    debugInfo.style.display = "block"
    debugInfo.innerHTML = "Testing database connection..."

    if (!window.supabaseClient) {
      debugInfo.innerHTML += "\n❌ Supabase client not available"
      return
    }

    try {
      // Test basic connection
      debugInfo.innerHTML += "\nTesting basic connection..."
      const { data: connectionTest, error: connectionError } = await window.supabaseClient
        .from("faqs")
        .select("count")
        .limit(1)

      if (connectionError) {
        debugInfo.innerHTML += `\n❌ Connection error: ${connectionError.message}`
      } else {
        debugInfo.innerHTML += "\n✅ Basic connection successful"
      }

      // Check tables
      debugInfo.innerHTML += "\n\nChecking tables..."

      // Check faqs table
      try {
        const { data: faqsData, error: faqsError } = await window.supabaseClient.from("faqs").select("count")
        if (faqsError) {
          debugInfo.innerHTML += `\n❌ faqs table error: ${faqsError.message}`
        } else {
          debugInfo.innerHTML += `\n✅ faqs table exists with ${faqsData[0]?.count || 0} records`
        }
      } catch (e) {
        debugInfo.innerHTML += `\n❌ faqs table check failed: ${e.message}`
      }

      // Check faq_categories table
      try {
        const { data: categoriesData, error: categoriesError } = await window.supabaseClient
          .from("faq_categories")
          .select("count")
        if (categoriesError) {
          debugInfo.innerHTML += `\n❌ faq_categories table error: ${categoriesError.message}`
        } else {
          debugInfo.innerHTML += `\n✅ faq_categories table exists with ${categoriesData[0]?.count || 0} records`
        }
      } catch (e) {
        debugInfo.innerHTML += `\n❌ faq_categories table check failed: ${e.message}`
      }

      // Try to get pending questions specifically
      try {
        debugInfo.innerHTML += "\n\nChecking pending questions..."
        const { data: pendingData, error: pendingError } = await window.supabaseClient
          .from("faqs")
          .select("*")
          .eq("status", "pending")

        if (pendingError) {
          debugInfo.innerHTML += `\n❌ Error fetching pending questions: ${pendingError.message}`
        } else {
          debugInfo.innerHTML += `\n✅ Found ${pendingData.length} pending questions`
          if (pendingData.length > 0) {
            debugInfo.innerHTML += `\n   First pending question: "${pendingData[0].question}" (ID: ${pendingData[0].id})`
          }
        }
      } catch (e) {
        debugInfo.innerHTML += `\n❌ Pending questions check failed: ${e.message}`
      }

      // Check user permissions
      debugInfo.innerHTML += "\n\nChecking user permissions..."
      try {
        const { data: insertTest, error: insertError } = await window.supabaseClient
          .from("faqs")
          .insert({
            question: "TEST QUESTION - PLEASE DELETE",
            status: "pending",
            created_at: new Date().toISOString(),
          })
          .select()

        if (insertError) {
          debugInfo.innerHTML += `\n❌ Insert permission error: ${insertError.message}`
        } else {
          debugInfo.innerHTML += `\n✅ Insert permission granted, created test question with ID: ${insertTest[0]?.id}`

          // Try to delete the test question
          const { error: deleteError } = await window.supabaseClient.from("faqs").delete().eq("id", insertTest[0]?.id)

          if (deleteError) {
            debugInfo.innerHTML += `\n❌ Delete permission error: ${deleteError.message}`
          } else {
            debugInfo.innerHTML += `\n✅ Delete permission granted, removed test question`
          }
        }
      } catch (e) {
        debugInfo.innerHTML += `\n❌ Permission check failed: ${e.message}`
      }
    } catch (error) {
      debugInfo.innerHTML += `\n❌ Error during database tests: ${error.message}`
    }
  }

  async function fixApprovalIssues() {
    if (!window.supabaseClient) {
      showStatusMessage("Supabase client not available", "error")
      return
    }

    try {
      showStatusMessage("Fixing approval issues...", "success")

      // First, check if any questions have inconsistent status
      const { data: inconsistentData, error: checkError } = await window.supabaseClient
        .from("faqs")
        .select("id, question, status, approved_at")
        .or("and(status.eq.approved,approved_at.is.null),and(status.neq.approved,approved_at.not.is.null)")

      if (checkError) {
        throw checkError
      }

      if (inconsistentData && inconsistentData.length > 0) {
        console.log("Found inconsistent questions:", inconsistentData)

        // Fix each inconsistent question individually
        for (const question of inconsistentData) {
          if (question.status === "approved" && !question.approved_at) {
            // Set approved_at for approved questions
            const { error: updateError } = await window.supabaseClient
              .from("faqs")
              .update({ approved_at: new Date().toISOString() })
              .eq("id", question.id)

            if (updateError) {
              console.error(`Error updating question ${question.id}:`, updateError)
            }
          } else if (question.status !== "approved" && question.approved_at) {
            // Clear approved_at for non-approved questions
            const { error: updateError } = await window.supabaseClient
              .from("faqs")
              .update({ approved_at: null })
              .eq("id", question.id)

            if (updateError) {
              console.error(`Error updating question ${question.id}:`, updateError)
            }
          }
        }

        showStatusMessage(`Fixed ${inconsistentData.length} questions with inconsistent approval status`, "success")
      } else {
        showStatusMessage("No inconsistent approval statuses found", "success")
      }

      // Reload questions to show the changes
      loadQuestions()
    } catch (error) {
      console.error("Error fixing approval issues:", error)
      showStatusMessage(`Error fixing approval issues: ${error.message}`, "error")
    }
  }

  async function fixTableRelationships() {
    if (!window.supabaseClient) {
      showStatusMessage("Supabase client not available", "error")
      return
    }

    try {
      showStatusMessage("Fixing table relationships...", "success")

      // Instead of using exec_sql, we'll perform individual operations

      // 1. Check if faq_categories table exists
      const { error: categoriesError } = await window.supabaseClient.from("faq_categories").select("id").limit(1)

      if (categoriesError && categoriesError.code === "42P01") {
        // Table doesn't exist, create it
        await createDatabaseTables()
      }

      // 2. Check if faqs table exists
      const { error: faqsError } = await window.supabaseClient.from("faqs").select("id").limit(1)

      if (faqsError && faqsError.code === "42P01") {
        // Table doesn't exist, create it
        await createDatabaseTables()
      } else {
        // Table exists, check if it has the right columns
        try {
          // Try to select specific columns to see if they exist
          const { error: columnsError } = await window.supabaseClient
            .from("faqs")
            .select("id, question, answer, status, approved_at, category_id")
            .limit(1)

          if (columnsError) {
            console.error("Error checking columns:", columnsError)
            showStatusMessage(`Error checking columns: ${columnsError.message}`, "error")
          }
        } catch (columnCheckError) {
          console.error("Error during column check:", columnCheckError)
        }
      }

      // 3. Verify the structure is working
      const { data: testData, error: testError } = await window.supabaseClient
        .from("faqs")
        .select("id, question, status, approved_at")
        .limit(1)

      if (testError) {
        throw testError
      }

      showStatusMessage("Table relationships verified successfully!", "success")
    } catch (error) {
      console.error("Error fixing table relationships:", error)
      showStatusMessage(`Error fixing table relationships: ${error.message}`, "error")
    }
  }

  async function createDatabaseTables() {
    if (!window.supabaseClient) {
      showStatusMessage("Supabase client not available", "error")
      return
    }

    try {
      showStatusMessage("Creating database tables...", "success")

      // Check if faq_categories table exists
      const { error: categoriesError } = await window.supabaseClient.from("faq_categories").select("id").limit(1)

      if (categoriesError && categoriesError.code === "42P01") {
        // Create categories table using RPC if available
        try {
          const createCategoriesSQL = `
            CREATE TABLE IF NOT EXISTS public.faq_categories (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              slug VARCHAR(255) NOT NULL UNIQUE,
              icon VARCHAR(255),
              display_order INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `

          // Try to use RPC if available
          const { error: rpcError } = await window.supabaseClient.rpc("exec_sql", { sql_query: createCategoriesSQL })

          if (rpcError) {
            console.error("Error creating categories table via RPC:", rpcError)
            // If RPC fails, we'll try direct insert instead
          }
        } catch (rpcError) {
          console.error("RPC error:", rpcError)
        }

        // Insert default categories
        try {
          const { error: insertError } = await window.supabaseClient.from("faq_categories").insert([
            { name: "General", slug: "general", icon: "help-circle", display_order: 1 },
            { name: "Admissions", slug: "admissions", icon: "book-open", display_order: 2 },
            { name: "Financial", slug: "financial", icon: "dollar-sign", display_order: 3 },
            { name: "Language", slug: "language", icon: "message-square", display_order: 4 },
            { name: "Community", slug: "community", icon: "users", display_order: 5 },
          ])

          if (insertError && !insertError.message.includes("duplicate key")) {
            console.error("Error inserting categories:", insertError)
          }
        } catch (insertError) {
          console.error("Insert error:", insertError)
        }
      }

      // Check if faqs table exists
      const { error: faqsError } = await window.supabaseClient.from("faqs").select("id").limit(1)

      if (faqsError && faqsError.code === "42P01") {
        // Create faqs table using RPC if available
        try {
          const createFaqsSQL = `
            CREATE TABLE IF NOT EXISTS public.faqs (
              id SERIAL PRIMARY KEY,
              question TEXT NOT NULL,
              answer TEXT,
              status VARCHAR(50) DEFAULT 'pending',
              category_id INTEGER,
              image_url TEXT,
              user_id UUID,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              approved_at TIMESTAMP WITH TIME ZONE,
              approved_by UUID
            );
          `

          // Try to use RPC if available
          const { error: rpcError } = await window.supabaseClient.rpc("exec_sql", { sql_query: createFaqsSQL })

          if (rpcError) {
            console.error("Error creating faqs table via RPC:", rpcError)
          }
        } catch (rpcError) {
          console.error("RPC error:", rpcError)
        }
      }

      // Check if faq_replies table exists
      const { error: repliesError } = await window.supabaseClient.from("faq_replies").select("id").limit(1)

      if (repliesError && repliesError.code === "42P01") {
        // Create replies table using RPC if available
        try {
          const createRepliesSQL = `
            CREATE TABLE IF NOT EXISTS public.faq_replies (
              id SERIAL PRIMARY KEY,
              faq_id INTEGER,
              user_id UUID,
              content TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
          `

          // Try to use RPC if available
          const { error: rpcError } = await window.supabaseClient.rpc("exec_sql", { sql_query: createRepliesSQL })

          if (rpcError) {
            console.error("Error creating replies table via RPC:", rpcError)
          }
        } catch (rpcError) {
          console.error("RPC error:", rpcError)
        }
      }

      showStatusMessage("Database tables created successfully!", "success")
    } catch (error) {
      console.error("Error creating database tables:", error)
      showStatusMessage(`Error creating database tables: ${error.message}`, "error")
    }
  }

  function createDefaultFAQs() {
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
        approved_at: new Date().toISOString(),
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
        approved_at: new Date().toISOString(),
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
        approved_at: new Date().toISOString(),
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
        approved_at: new Date().toISOString(),
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
        approved_at: new Date().toISOString(),
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
        approved_at: new Date().toISOString(),
        replies: [],
      },
    ]

    // Save default FAQs to localStorage
    localStorage.setItem("faqs", JSON.stringify(defaultFaqs))

    showStatusMessage("Default FAQs created successfully", "success")

    // Reload questions
    loadQuestions()
  }

  function resetLocalData() {
    if (confirm("Are you sure you want to reset local FAQ data? This cannot be undone.")) {
      localStorage.removeItem("faqs")
      showStatusMessage("Local FAQ data has been reset", "success")
      loadQuestions()
    }
  }

  function fixDataStructure() {
    const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")

    // Fix the data structure issues
    const fixedFaqs = faqs.map((faq) => {
      // Ensure status property is set
      if (!faq.status) {
        if (faq.approved === true) {
          faq.status = "approved"
        } else if (faq.approved === false) {
          faq.status = "declined"
        } else {
          faq.status = "pending"
        }
      }

      // Ensure approved_at is set correctly
      if (faq.status === "approved" && !faq.approved_at) {
        faq.approved_at = new Date().toISOString()
      } else if (faq.status !== "approved" && faq.approved_at) {
        faq.approved_at = null
      }

      // Ensure replies array exists
      if (!faq.replies) {
        faq.replies = []
      }

      // Normalize property names (camelCase vs snake_case)
      if (faq.user_id && !faq.userId) {
        faq.userId = faq.user_id
      }

      if (faq.user_name && !faq.userName) {
        faq.userName = faq.user_name
      }

      if (faq.created_at && !faq.createdAt) {
        faq.createdAt = faq.created_at
      }

      if (faq.image_url && !faq.image) {
        faq.image = faq.image_url
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

      return faq
    })

    // Save fixed data back to localStorage
    localStorage.setItem("faqs", JSON.stringify(fixedFaqs))

    // Reload questions
    loadQuestions()

    // Show success message
    showStatusMessage("FAQ data structure has been fixed!", "success")
  }

  function setupTabNavigation() {
    const adminTabs = document.querySelectorAll(".admin-nav a")
    const adminTabContents = document.querySelectorAll(".admin-tab")

    adminTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault()

        // Remove active class from all tabs and contents
        adminTabs.forEach((t) => t.classList.remove("active"))
        adminTabContents.forEach((c) => c.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active")
        const targetId = tab.getAttribute("href").substring(1)
        document.getElementById(targetId).classList.add("active")
      })
    })
  }

  function setupFilterButtons() {
    const filterButtons = document.querySelectorAll(".filter-button")

    filterButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => btn.classList.remove("active"))

        // Add active class to clicked button
        this.classList.add("active")

        // Reload questions with new filter
        loadQuestions()
      })
    })
  }

  // Login form submission
  const loginForm = document.getElementById("login-form")
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const username = document.getElementById("username").value.trim()
      const password = document.getElementById("password").value
      const loginError = document.getElementById("login-error")

      try {
        // Check if Supabase client is available
        if (window.supabaseClient) {
          // Try to login with Supabase
          const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: username,
            password: password,
          })

          if (error) throw error

          // Get user profile to check admin status
          const { data: profile, error: profileError } = await window.supabaseClient
            .from("user_profiles")
            .select("*")
            .eq("id", data.user.id)
            .single()

          if (profileError) throw profileError

          // Check if user is admin
          if (!profile.is_admin) {
            throw new Error("You don't have admin privileges")
          }

          // Valid admin login - store in sessionStorage
          sessionStorage.setItem("isLoggedIn", "true")
          sessionStorage.setItem("isAdmin", "true")
          sessionStorage.setItem(
            "currentUser",
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: profile.name || "Admin",
              isAdmin: true,
            }),
          )

          showAdminPanel()
          setupAdminTabs()
          setupModals()
          showStatusMessage("You have successfully logged in as admin", "success")
        } else {
          // Fallback to local storage if Supabase is not available
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

            showAdminPanel()
            setupAdminTabs()
            setupModals()
            showStatusMessage("You have successfully logged in as admin", "success")
          } else {
            throw new Error("Invalid username or password. Admin access required.")
          }
        }
      } catch (error) {
        console.error("Login error:", error)
        if (loginError) {
          loginError.textContent = error.message || "Invalid username or password. Admin access required."
          loginError.style.display = "block"
        }
      }
    })
  }

  // Logout button
  const logoutButton = document.getElementById("logout-button")
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        // Try to sign out with Supabase if available
        if (window.supabaseClient) {
          await window.supabaseClient.auth.signOut()
        }

        // Clear sessionStorage
        sessionStorage.removeItem("isAdmin")
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")

        hideAdminPanel()
        showStatusMessage("You have been logged out", "success")
      } catch (error) {
        console.error("Logout error:", error)
        showStatusMessage("Error during logout. Please try again.", "error")
      }
    })
  }

  function setupAdminTabs() {
    // Tab switching
    const adminTabs = document.querySelectorAll(".admin-nav a")
    const adminTabContents = document.querySelectorAll(".admin-tab")

    if (adminTabs.length > 0 && adminTabContents.length > 0) {
      adminTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          e.preventDefault()

          // Remove active class from all tabs and contents
          adminTabs.forEach((t) => t.classList.remove("active"))
          adminTabContents.forEach((c) => c.classList.remove("active"))

          // Add active class to clicked tab and corresponding content
          tab.classList.add("active")
          const tabId = tab.getAttribute("href").substring(1)
          document.getElementById(tabId).classList.add("active")

          // Load data based on active tab
          if (tabId === "users") {
            loadUsers()
          } else if (tabId === "questions") {
            loadQuestions()
          }
        })
      })
    }
  }

  // Load users
  async function loadUsers() {
    try {
      // Try to load from Supabase if available
      if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient
          .from("user_profiles")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error

        displayUsers(data || [])
      } else {
        // Fall back to localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        displayUsers(users)
      }
    } catch (error) {
      console.error("Error loading users:", error)
      showStatusMessage("Failed to load users", "error")
    }
  }

  function displayUsers(users) {
    const userTableBody = document.getElementById("user-table-body")
    if (!userTableBody) return

    userTableBody.innerHTML = ""

    if (users.length > 0) {
      users.forEach((user) => {
        const row = document.createElement("tr")

        // Format date
        const createdAt = new Date(user.created_at || user.createdAt || new Date()).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })

        // Create row content
        row.innerHTML = `
          <td>${user.name || "N/A"}</td>
          <td>${user.email || "N/A"}</td>
          <td>${createdAt}</td>
          <td>${user.is_admin || user.isAdmin ? "Yes" : "No"}</td>
          <td>
            <button class="btn-small btn-edit" data-id="${user.id}">Edit</button>
            <button class="btn-small btn-delete" data-id="${user.id}">Delete</button>
          </td>
        `
        userTableBody.appendChild(row)
      })

      // Add event listeners to buttons
      document.querySelectorAll(".btn-edit").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.getAttribute("data-id")
          editUser(userId)
        })
      })

      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", () => {
          const userId = btn.getAttribute("data-id")
          deleteUser(userId)
        })
      })
    } else {
      userTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No users found</td></tr>`
    }
  }

  // Edit user
  async function editUser(userId) {
    try {
      let userData = null

      // Try to get user from Supabase if available
      if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient.from("user_profiles").select("*").eq("id", userId).single()
        if (error) throw error
        userData = data
      } else {
        // Fall back to localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        userData = users.find((user) => user.id === userId)
      }

      if (userData) {
        // Create modal for editing
        const modal = document.createElement("div")
        modal.className = "modal"
        modal.style.display = "flex"
        modal.innerHTML = `
          <div class="modal-content">
            <div class="modal-header">
              <h3>Edit User</h3>
              <button class="close-modal">&times;</button>
            </div>
            <form id="edit-user-form">
              <div class="form-group">
                <label for="edit-name">Name</label>
                <input type="text" id="edit-name" value="${userData.name || ""}" required>
              </div>
              <div class="form-group">
                <label for="edit-email">Email</label>
                <input type="email" id="edit-email" value="${userData.email || ""}" disabled>
              </div>
              <div class="form-group">
                <label for="edit-is-admin">Admin Status</label>
                <select id="edit-is-admin">
                  <option value="true" ${userData.is_admin || userData.isAdmin ? "selected" : ""}>Admin</option>
                  <option value="false" ${!userData.is_admin && !userData.isAdmin ? "selected" : ""}>Regular User</option>
                </select>
              </div>
              <div class="modal-buttons">
                <button type="button" class="cancel-btn">Cancel</button>
                <button type="submit" class="save-btn">Save Changes</button>
              </div>
            </form>
          </div>
        `
        document.body.appendChild(modal)

        // Close modal when clicking on X or Cancel
        modal.querySelectorAll(".close-modal, .cancel-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            modal.remove()
          })
        })

        // Close modal when clicking outside
        modal.addEventListener("click", (event) => {
          if (event.target === modal) {
            modal.remove()
          }
        })

        // Handle form submission
        const editForm = document.getElementById("edit-user-form")
        editForm.addEventListener("submit", async (e) => {
          e.preventDefault()

          const updatedUser = {
            name: document.getElementById("edit-name").value,
            is_admin: document.getElementById("edit-is-admin").value === "true",
            updated_at: new Date().toISOString(),
          }

          try {
            if (window.supabaseClient) {
              // Update in Supabase
              const { error } = await window.supabaseClient.from("user_profiles").update(updatedUser).eq("id", userId)
              if (error) throw error
            } else {
              // Update in localStorage
              const users = JSON.parse(localStorage.getItem("users") || "[]")
              const userIndex = users.findIndex((user) => user.id === userId)

              if (userIndex !== -1) {
                users[userIndex] = {
                  ...users[userIndex],
                  name: updatedUser.name,
                  isAdmin: updatedUser.is_admin,
                  updatedAt: updatedUser.updated_at,
                }
                localStorage.setItem("users", JSON.stringify(users))
              }
            }

            showStatusMessage("User updated successfully", "success")
            modal.remove()
            loadUsers() // Reload users
          } catch (error) {
            console.error("Error updating user:", error)
            showStatusMessage("Failed to update user", "error")
          }
        })
      }
    } catch (error) {
      console.error("Error getting user:", error)
      showStatusMessage("Failed to get user details", "error")
    }
  }

  // Delete user
  async function deleteUser(userId) {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      if (window.supabaseClient) {
        // Delete from Supabase
        const { error } = await window.supabaseClient.from("user_profiles").delete().eq("id", userId)
        if (error) throw error
      } else {
        // Delete from localStorage
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        const updatedUsers = users.filter((user) => user.id !== userId)
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      }

      showStatusMessage("User deleted successfully", "success")
      loadUsers() // Reload users
    } catch (error) {
      console.error("Error deleting user:", error)
      showStatusMessage("Failed to delete user", "error")
    }
  }

  // FAQ Questions Management Functions
  function setupModals() {
    // Create replies modal if it doesn't exist
    if (!document.getElementById("replies-modal")) {
      const repliesModal = document.createElement("div")
      repliesModal.className = "modal"
      repliesModal.id = "replies-modal"
      repliesModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Replies</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="replies-list" id="replies-list"></div>
      </div>
    `
      document.body.appendChild(repliesModal)
    }

    // Create edit answer modal if it doesn't exist
    if (!document.getElementById("edit-answer-modal")) {
      const editAnswerModal = document.createElement("div")
      editAnswerModal.className = "modal"
      editAnswerModal.id = "edit-answer-modal"
      editAnswerModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Answer</h3>
          <button class="close-modal">&times;</button>
        </div>
        <textarea class="modal-textarea" id="edit-answer-textarea"></textarea>
        <div class="modal-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="save-btn">Save Changes</button>
        </div>
      </div>
    `
      document.body.appendChild(editAnswerModal)
    }

    // Add event listeners for closing modals
    document.querySelectorAll(".close-modal, .cancel-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".modal").forEach((modal) => {
          modal.style.display = "none"
        })
      })
    })

    // Save answer changes
    document.querySelector(".save-btn").addEventListener("click", () => {
      const questionId = document.getElementById("edit-answer-modal").getAttribute("data-question-id")
      const newAnswer = document.getElementById("edit-answer-textarea").value.trim()

      if (newAnswer) {
        updateQuestionAnswer(questionId, newAnswer)
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

  async function loadQuestions() {
    console.log("Loading questions...")
    const tableBody = document.getElementById("questions-body")

    if (!tableBody) {
      console.error("Questions table body not found")
      return
    }

    // Show loading indicator
    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading questions...</td></tr>'

    try {
      let questions = []

      // Get active filter
      const activeFilter = document.querySelector(".filter-button.active")?.getAttribute("data-filter") || "pending"

      // Try to load from database first
      if (window.supabaseClient) {
        try {
          console.log(`Loading ${activeFilter} questions from database...`)

          // Direct query to faqs table
          let query = window.supabaseClient.from("faqs").select(`
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

          // Apply filter
          if (activeFilter === "pending") {
            query = query.eq("status", "pending")
          } else if (activeFilter === "approved") {
            query = query.eq("status", "approved")
          } else if (activeFilter === "declined") {
            query = query.eq("status", "declined")
          }

          // Execute query
          const { data, error } = await query.order("created_at", { ascending: false })

          if (error) {
            console.error("Error loading from faqs table:", error)
            throw error
          }

          if (data && data.length > 0) {
            questions = data
            console.log(`Loaded ${questions.length} questions from faqs table`)

            // Try to load category information
            try {
              const { data: categories } = await window.supabaseClient.from("faq_categories").select("*")

              if (categories && categories.length > 0) {
                // Add category information to questions
                questions = questions.map((question) => {
                  const category = categories.find((c) => c.id === question.category_id)
                  if (category) {
                    question.category_name = category.name
                    question.category_slug = category.slug
                    question.category_icon = category.icon
                  } else {
                    question.category_name = "Uncategorized"
                    question.category_slug = "general"
                    question.category_icon = "help-circle"
                  }
                  return question
                })
              }
            } catch (categoryError) {
              console.warn("Could not load categories:", categoryError)
            }

            // Try to load replies
            try {
              for (let i = 0; i < questions.length; i++) {
                const { data: replies, error: repliesError } = await window.supabaseClient
                  .from("faq_replies")
                  .select("*")
                  .eq("faq_id", questions[i].id)
                  .order("created_at", { ascending: true })

                if (!repliesError && replies) {
                  questions[i].replies = replies
                } else {
                  questions[i].replies = []
                }
              }
            } catch (repliesError) {
              console.warn("Could not load replies:", repliesError)
            }
          } else {
            console.log("No questions found in database, checking localStorage...")
            // Fall back to localStorage if no questions in database
            questions = getQuestionsFromLocalStorage(activeFilter)
          }
        } catch (dbError) {
          console.error("Database error:", dbError)
          console.log("Falling back to localStorage...")
          // Fall back to localStorage if there's a database error
          questions = getQuestionsFromLocalStorage(activeFilter)
        }
      } else {
        console.log("Supabase client not available, loading from localStorage...")
        // Fall back to localStorage
        questions = getQuestionsFromLocalStorage(activeFilter)
      }

      if (questions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">
          No ${activeFilter} questions found.
        </td></tr>`
        return
      }

      // Clear the table
      tableBody.innerHTML = ""

      // Display questions
      questions.forEach((question) => {
        // Add debug logging to see question data
        console.log("Processing question:", question)

        const row = document.createElement("tr")

        // ID cell
        const idCell = document.createElement("td")
        const questionId = question.id ? question.id.toString() : ""
        const displayId = questionId.length > 8 ? questionId.substring(0, 8) + "..." : questionId
        idCell.textContent = displayId
        idCell.title = questionId // Show full ID on hover
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
        categoryCell.textContent = question.category_name || question.category || "Uncategorized"
        row.appendChild(categoryCell)

        // Status cell
        const statusCell = document.createElement("td")

        // Add reply count if there are any
        let statusHtml = ""
        if (question.status === "approved") {
          statusHtml = "Approved"
          statusCell.className = "status-approved"
        } else if (question.status === "declined") {
          statusHtml = "Declined"
          statusCell.className = "status-declined"
        } else {
          statusHtml = "Pending"
          statusCell.className = "status-pending"
        }

        const replies = question.replies || []
        if (replies.length > 0) {
          statusHtml += ` <span class="reply-count">${replies.length}</span>`

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

        row.appendChild(statusCell)

        // Actions cell
        const actionsCell = document.createElement("td")
        const actionsDiv = document.createElement("div")
        actionsDiv.className = "action-buttons"

        // Approve/Decline button
        const approveButton = document.createElement("button")
        if (question.status === "approved") {
          approveButton.className = "action-button decline-button"
          approveButton.textContent = "Decline"
          approveButton.addEventListener("click", () => {
            toggleApproval(question.id, false)
          })
        } else {
          approveButton.className = "action-button approve-button"
          approveButton.textContent = "Approve"
          approveButton.addEventListener("click", () => {
            toggleApproval(question.id, true)
          })
        }
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
    } catch (error) {
      console.error("Error loading questions:", error)
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center;">
        Error loading questions: ${error.message}
      </td></tr>`
      showStatusMessage("Failed to load questions: " + error.message, "error")
    }
  }

  function getQuestionsFromLocalStorage(activeFilter) {
    const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
    console.log("All questions from localStorage:", questions)

    let filteredQuestions = questions
    if (activeFilter === "pending") {
      filteredQuestions = questions.filter((q) => {
        // Check both status and approved properties
        if (q.status) {
          return q.status === "pending"
        } else {
          return q.approved !== true && q.approved !== false
        }
      })
    } else if (activeFilter === "approved") {
      filteredQuestions = questions.filter((q) => {
        // Check both status and approved properties
        if (q.status) {
          return q.status === "approved"
        } else {
          return q.approved === true
        }
      })
    } else if (activeFilter === "declined") {
      filteredQuestions = questions.filter((q) => {
        // Check both status and approved properties
        if (q.status) {
          return q.status === "declined"
        } else {
          return q.approved === false
        }
      })
    }

    console.log(`Filtered questions from localStorage (${activeFilter}):`, filteredQuestions)
    return filteredQuestions
  }

  function openRepliesModal(question) {
    const modal = document.getElementById("replies-modal")
    const repliesList = document.getElementById("replies-list")

    // Clear previous content
    repliesList.innerHTML = ""

    const replies = question.replies || []
    if (replies.length > 0) {
      replies.forEach((reply) => {
        const replyItem = document.createElement("div")
        replyItem.className = "reply-item"

        const replyContent = document.createElement("div")
        replyContent.className = "reply-content"
        replyContent.textContent = reply.content

        const replyMeta = document.createElement("div")
        replyMeta.className = "reply-meta"

        const userInfo = document.createElement("span")
        userInfo.textContent = `By: ${reply.user_name || reply.userName || "Anonymous"} on ${formatDate(reply.created_at || reply.createdAt)}`

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "delete-button"
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
    textarea.value = currentAnswer === "No answer provided" ? "" : currentAnswer

    // Set question ID as data attribute
    modal.setAttribute("data-question-id", questionId)

    // Show the modal
    modal.style.display = "flex"
  }

  async function deleteReply(questionId, replyId) {
    try {
      if (window.supabaseClient) {
        // Delete from database
        const { error } = await window.supabaseClient.from("faq_replies").delete().eq("id", replyId)

        if (error) throw error
      } else {
        // Delete from localStorage
        const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
        const questionIndex = questions.findIndex((q) => q.id === questionId)

        if (questionIndex !== -1) {
          questions[questionIndex].replies = questions[questionIndex].replies.filter((r) => r.id !== replyId)
          localStorage.setItem("faqs", JSON.stringify(questions))
        }
      }

      showStatusMessage("Reply deleted successfully", "success")
      loadQuestions() // Reload questions to update the UI
    } catch (error) {
      console.error("Error deleting reply:", error)
      showStatusMessage("Failed to delete reply: " + error.message, "error")
    }
  }

  async function updateQuestionAnswer(questionId, newAnswer) {
    try {
      if (window.supabaseClient) {
        // Update in database
        const { error } = await window.supabaseClient.from("faqs").update({ answer: newAnswer }).eq("id", questionId)

        if (error) throw error
      } else {
        // Update in localStorage
        const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
        const questionIndex = questions.findIndex((q) => q.id === questionId)

        if (questionIndex !== -1) {
          questions[questionIndex].answer = newAnswer
          localStorage.setItem("faqs", JSON.stringify(questions))
        }
      }

      // Hide the modal
      document.getElementById("edit-answer-modal").style.display = "none"

      showStatusMessage("Answer updated successfully", "success")
      loadQuestions() // Reload questions to update the UI
    } catch (error) {
      console.error("Error updating answer:", error)
      showStatusMessage("Failed to update answer: " + error.message, "error")
    }
  }

  async function toggleApproval(questionId, approve) {
    try {
      console.log(`Attempting to ${approve ? "approve" : "decline"} question ID:`, questionId)

      // Convert ID to string for consistent comparison if it's not already
      const questionIdStr = questionId.toString()

      if (window.supabaseClient) {
        // Update in database
        console.log("Using Supabase to update question status")

        const updateData = {
          status: approve ? "approved" : "declined",
          approved_at: approve ? new Date().toISOString() : null,
          approved_by: approve ? currentUser?.id : null,
        }

        console.log("Update data:", updateData)

        // Execute the update and log the response
        const { data, error } = await window.supabaseClient
          .from("faqs")
          .update(updateData)
          .eq("id", questionId)
          .select()

        console.log("Supabase update response:", { data, error })

        if (error) throw error

        // Show success message
        showStatusMessage(`Question ${approve ? "approved" : "declined"} successfully`, "success")

        // Force reload questions to ensure UI is updated
        setTimeout(() => {
          loadQuestions()
        }, 500)
      } else {
        // Update in localStorage
        console.log("Using localStorage to update question status")

        const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
        const questionIndex = questions.findIndex((q) => q.id.toString() === questionIdStr)

        console.log(`Found question at index ${questionIndex}`)

        if (questionIndex !== -1) {
          questions[questionIndex].status = approve ? "approved" : "declined"

          if (approve) {
            questions[questionIndex].approved_at = new Date().toISOString()
          } else {
            questions[questionIndex].approved_at = null
          }

          localStorage.setItem("faqs", JSON.stringify(questions))
          console.log("Updated localStorage with new status")

          // Show success message
          showStatusMessage(`Question ${approve ? "approved" : "declined"} successfully`, "success")

          // Force reload questions to ensure UI is updated
          setTimeout(() => {
            loadQuestions()
          }, 500)
        }
      }

      return true
    } catch (error) {
      console.error("Error updating approval status:", error)
      showStatusMessage("Failed to update approval status: " + error.message, "error")
      return false
    }
  }

  async function deleteQuestion(questionId) {
    try {
      if (window.supabaseClient) {
        // Delete from database
        const { error } = await window.supabaseClient.from("faqs").delete().eq("id", questionId)

        if (error) throw error
      } else {
        // Delete from localStorage
        const questions = JSON.parse(localStorage.getItem("faqs") || "[]")
        const updatedQuestions = questions.filter((q) => q.id !== questionId)
        localStorage.setItem("faqs", JSON.stringify(updatedQuestions))
      }

      showStatusMessage("Question deleted successfully", "success")
      loadQuestions() // Reload questions to update the UI
    } catch (error) {
      console.error("Error deleting question:", error)
      showStatusMessage("Failed to delete question: " + error.message, "error")
    }
  }

  function showStatusMessage(message, type) {
    console.log(`Status message: ${message} (${type})`)
    const statusMessage = document.getElementById("status-message")
    if (!statusMessage) {
      // Create status message element if it doesn't exist
      const newStatusMessage = document.createElement("div")
      newStatusMessage.id = "status-message"
      newStatusMessage.className = `status-message ${type}`
      newStatusMessage.textContent = message

      // Find a good place to insert it
      const adminPanel = document.getElementById("admin-panel")
      if (adminPanel) {
        adminPanel.insertBefore(newStatusMessage, adminPanel.firstChild)
      } else {
        document.body.insertBefore(newStatusMessage, document.body.firstChild)
      }

      // Show the message
      newStatusMessage.style.display = "block"

      // Auto hide after 3 seconds
      setTimeout(() => {
        newStatusMessage.style.display = "none"
      }, 3000)
    } else {
      statusMessage.textContent = message
      statusMessage.className = `status-message ${type}`
      statusMessage.style.display = "block"

      // Auto hide after 3 seconds
      setTimeout(() => {
        statusMessage.style.display = "none"
      }, 3000)
    }
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

  // Debug function to inspect localStorage
  function debugLocalStorage() {
    const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")
    console.log("Current FAQs in localStorage:", faqs)

    // Count by status
    const approved = faqs.filter((faq) => faq.status === "approved")
    const pending = faqs.filter((faq) => faq.status === "pending")
    const declined = faqs.filter((faq) => faq.status === "declined")

    console.log("Approved FAQs:", approved.length, approved)
    console.log("Pending FAQs:", pending.length, pending)
    console.log("Declined FAQs:", declined.length, declined)

    // Check for data structure issues
    const issuesFound = faqs.filter((faq) => {
      return !faq.status || !faq.replies
    })

    if (issuesFound.length > 0) {
      console.warn("FAQs with data structure issues found:", issuesFound.length, issuesFound)
    }
  }
})

// Declare supabase and bootstrap
const supabase = window.supabase || {}
const bootstrap = window.bootstrap || {}
