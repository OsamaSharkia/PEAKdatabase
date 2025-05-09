document.addEventListener("DOMContentLoaded", () => {
  console.log("FAQ submission script loaded")

  // Check if user is logged in
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true"
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null")

  console.log("Login status:", isLoggedIn)
  console.log("Current user:", currentUser)

  // Get form elements
  const questionForm = document.getElementById("question-form")
  const loginToAsk = document.getElementById("login-to-ask")
  const categorySelect = document.getElementById("category")
  const submitButton = document.getElementById("submit-question")
  const statusMessage = document.getElementById("status-message")

  // Load categories from database if available
  loadCategories()

  // Show appropriate form based on login status
  if (isLoggedIn && currentUser) {
    if (questionForm) questionForm.style.display = "block"
    if (loginToAsk) loginToAsk.style.display = "none"
    console.log("Showing question form for logged in user")
  } else {
    if (questionForm) questionForm.style.display = "none"
    if (loginToAsk) loginToAsk.style.display = "block"
    console.log("Showing login message for non-logged in user")
  }

  // Handle question submission
  if (questionForm && currentUser) {
    questionForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const questionText = document.getElementById("question").value.trim()
      const category = document.getElementById("category").value
      const termsChecked = document.getElementById("terms").checked
      const imageFile = document.getElementById("question-image")?.files[0]

      if (!questionText || !category || !termsChecked) {
        showMessage("Please fill in all required fields and accept the terms.", "error")
        return
      }

      // Disable submit button to prevent multiple submissions
      if (submitButton) {
        submitButton.disabled = true
        submitButton.textContent = "Submitting..."
      }

      try {
        // Check if Supabase client is available
        if (window.supabaseClient) {
          let imageUrl = null

          // Upload image if provided
          if (imageFile) {
            const fileExt = imageFile.name.split(".").pop()
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
            const filePath = `faq-images/${fileName}`

            const { data: uploadData, error: uploadError } = await window.supabaseClient.storage
              .from("public")
              .upload(filePath, imageFile)

            if (uploadError) {
              throw new Error(`Image upload failed: ${uploadError.message}`)
            }

            // Get public URL for the uploaded image
            const { data: urlData } = window.supabaseClient.storage.from("public").getPublicUrl(filePath)
            imageUrl = urlData.publicUrl
          }

          // First, check if the category exists or create it
          let categoryId = null

          // Try to get category by ID first (if it's a number)
          if (!isNaN(Number.parseInt(category))) {
            categoryId = Number.parseInt(category)
          } else {
            // Try to find category by slug
            const { data: categoryData, error: categoryError } = await window.supabaseClient
              .from("faq_categories")
              .select("id")
              .eq("slug", category.toLowerCase())
              .single()

            if (categoryError && categoryError.code !== "PGRST116") {
              // PGRST116 is "No rows returned" error
              console.error("Error finding category:", categoryError)
            }

            if (categoryData) {
              categoryId = categoryData.id
            } else {
              // Create new category
              const { data: newCategory, error: newCategoryError } = await window.supabaseClient
                .from("faq_categories")
                .insert({
                  name: category,
                  slug: category.toLowerCase().replace(/\s+/g, "-"),
                  icon: "help-circle",
                })
                .select()

              if (newCategoryError) {
                console.error("Error creating category:", newCategoryError)
                throw new Error(`Failed to create category: ${newCategoryError.message}`)
              }

              if (newCategory && newCategory.length > 0) {
                categoryId = newCategory[0].id
              }
            }
          }

          // Insert FAQ into database
          const { data, error } = await window.supabaseClient
            .from("faqs")
            .insert({
              question: questionText,
              category_id: categoryId,
              user_id: currentUser.id,
              image_url: imageUrl,
              status: "pending",
            })
            .select()

          if (error) {
            throw new Error(`Failed to submit question: ${error.message}`)
          }

          // Show success message
          showMessage(
            "Thank you for your question! It has been submitted for review and will appear in the FAQ once approved.",
            "success",
          )

          // Reset form
          questionForm.reset()

          // Hide image preview if it exists
          const imagePreview = document.getElementById("image-preview")
          if (imagePreview) {
            imagePreview.style.display = "none"
          }
        } else {
          // Fallback to localStorage if Supabase is not available
          saveQuestionToLocalStorage(questionText, category, imageFile, currentUser)
        }
      } catch (error) {
        console.error("Error submitting question:", error)
        showMessage(`Error: ${error.message}`, "error")
      } finally {
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false
          submitButton.textContent = "Submit Question"
        }
      }
    })
  }

  // Function to save question to localStorage (fallback)
  async function saveQuestionToLocalStorage(questionText, category, imageFile, currentUser) {
    // Create new question object
    const newQuestion = {
      id: Date.now().toString(),
      question: questionText,
      answer: "", // Empty answer
      category: category,
      status: "pending",
      userId: currentUser.email,
      userName: currentUser.name || "Anonymous",
      createdAt: new Date().toISOString(),
      replies: [],
    }

    // Add image if one was uploaded
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        newQuestion.image = e.target.result
        completeLocalSave(newQuestion)
      }
      reader.readAsDataURL(imageFile)
    } else {
      completeLocalSave(newQuestion)
    }
  }

  function completeLocalSave(question) {
    // Get existing questions from localStorage or initialize empty array
    const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")

    // Add new question
    faqs.push(question)

    // Save back to localStorage
    localStorage.setItem("faqs", JSON.stringify(faqs))

    // Show success message
    showMessage(
      "Thank you for your question! It has been submitted for review and will appear in the FAQ once approved.",
      "success",
    )

    // Reset form
    document.getElementById("question-form").reset()

    // Hide image preview if it exists
    const imagePreview = document.getElementById("image-preview")
    if (imagePreview) {
      imagePreview.style.display = "none"
    }
  }

  // Function to load categories from database
  async function loadCategories() {
    if (!categorySelect || !window.supabaseClient) return

    try {
      const { data, error } = await window.supabaseClient
        .from("faq_categories")
        .select("id, name")
        .order("display_order", { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        // Clear existing options except the first one (if it's a placeholder)
        while (categorySelect.options.length > 1) {
          categorySelect.remove(1)
        }

        // Add new options
        data.forEach((category) => {
          const option = document.createElement("option")
          option.value = category.id
          option.textContent = category.name
          categorySelect.appendChild(option)
        })
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  // Function to show status messages
  function showMessage(message, type) {
    if (!statusMessage) return

    statusMessage.textContent = message
    statusMessage.className = `status-message ${type}`
    statusMessage.style.display = "block"

    // Auto hide after 5 seconds
    setTimeout(() => {
      statusMessage.style.display = "none"
    }, 5000)
  }

  // Set up image upload functionality
  const imageUploadArea = document.getElementById("image-upload-area")
  const imageInput = document.getElementById("question-image")
  const imagePreview = document.getElementById("image-preview")
  const previewImg = document.getElementById("preview-img")

  if (imageUploadArea && imageInput && imagePreview && previewImg) {
    imageUploadArea.addEventListener("click", () => {
      imageInput.click()
    })

    imageInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader()

        reader.onload = (e) => {
          previewImg.src = e.target.result
          imagePreview.style.display = "block"
        }

        reader.readAsDataURL(this.files[0])
      }
    })

    // Drag and drop functionality
    imageUploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      imageUploadArea.style.borderColor = "#0066cc"
      imageUploadArea.style.backgroundColor = "#f0f7ff"
    })

    imageUploadArea.addEventListener("dragleave", () => {
      imageUploadArea.style.borderColor = "#ddd"
      imageUploadArea.style.backgroundColor = ""
    })

    imageUploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      imageUploadArea.style.borderColor = "#ddd"
      imageUploadArea.style.backgroundColor = ""

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        imageInput.files = e.dataTransfer.files

        const reader = new FileReader()
        reader.onload = (e) => {
          previewImg.src = e.target.result
          imagePreview.style.display = "block"
        }

        reader.readAsDataURL(e.dataTransfer.files[0])
      }
    })
  }
})
