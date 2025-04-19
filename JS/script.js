// Mobile Navigation Toggle
document.addEventListener("DOMContentLoaded", () => {
  console.log("Script.js loaded")

  // Check if user is logged in (use sessionStorage for tab-specific login)
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true" || localStorage.getItem("isLoggedIn") === "true"
  const isAdmin = sessionStorage.getItem("isAdmin") === "true" || localStorage.getItem("isAdmin") === "true"
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser") || "null")

  // Check Supabase session if available
  if (window.supabaseClient) {
      try {
          // Check current session
          window.supabaseClient.auth.getSession().then(({ data, error }) => {
              if (error) {
                  console.error("Session check error:", error);
                  return;
              }
              
              if (data.session) {
                  // User is logged in with Supabase
                  window.supabaseClient
                      .from('user_profiles')
                      .select('*')
                      .eq('id', data.session.user.id)
                      .single()
                      .then(({ data: profile, error: profileError }) => {
                          if (profileError) {
                              console.error("Profile fetch error:", profileError);
                              return;
                          }
                          
                          if (profile) {
                              // Update session storage
                              sessionStorage.setItem("isLoggedIn", "true");
                              sessionStorage.setItem("currentUser", JSON.stringify({
                                  id: data.session.user.id,
                                  name: profile.name,
                                  email: profile.email,
                                  isAdmin: profile.is_admin
                              }));
                              
                              if (profile.is_admin) {
                                  sessionStorage.setItem("isAdmin", "true");
                              }
                              
                              // Update navigation
                              updateNavigation();
                          }
                      });
              }
          });
      } catch (error) {
          console.error("Session check error:", error);
      }
  }

  // Store current authentication state in sessionStorage to make it tab-specific
  if (localStorage.getItem("isLoggedIn") === "true") {
    sessionStorage.setItem("isLoggedIn", "true")
    sessionStorage.setItem("currentUser", localStorage.getItem("currentUser"))
    if (localStorage.getItem("isAdmin") === "true") {
      sessionStorage.setItem("isAdmin", "true")
    }
  }

  console.log("Login status:", isLoggedIn)
  console.log("Admin status:", isAdmin)
  console.log("Current user:", currentUser)

  // Update navigation based on login status
  function updateNavigation() {
    const navLinks = document.getElementById("nav-links")
    if (!navLinks) {
      console.error("Navigation element not found")
      return
    }

    let navItems = `
      <li><a href="index.html">Home</a></li>
      <li><a href="pathways.html">Education Pathways</a></li>
      <li><a href="resources.html">Resources</a></li>
      <li><a href="faq.html">FAQ</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="about.html">About Us</a></li>
    `

    if (isLoggedIn && currentUser) {
      navItems += `
        <li><a href="profile.html">My Profile (${currentUser.name || "User"})</a></li>
        <li><a href="#" id="logout-link">Logout</a></li>
      `

      // Add admin link if user is admin
      if (isAdmin || (currentUser && currentUser.isAdmin)) {
        navItems += `<li><a href="admin.html">Admin</a></li>`
        console.log("Added admin link to navigation")
      }
    } else {
      navItems += `
        <li><a href="login.html">Login</a></li>
        <li><a href="register.html">Register</a></li>
      `
    }

    navLinks.innerHTML = navItems
    console.log("Navigation updated")

    // Set active class for current page
    const currentPage = window.location.pathname.split("/").pop() || "index.html"
    const links = navLinks.querySelectorAll("a")
    links.forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active")
      }
    })

    // Update logout functionality to clear both localStorage and sessionStorage
    const logoutLink = document.getElementById("logout-link")
    if (logoutLink) {
      logoutLink.addEventListener("click", async (e) => {
        e.preventDefault()
        
        // Sign out from Supabase if available
        if (window.supabaseClient) {
          try {
              await window.supabaseClient.auth.signOut();
          } catch (error) {
              console.error("Supabase logout error:", error);
          }
        }
        
        // Clear both sessionStorage and localStorage
        sessionStorage.removeItem("isLoggedIn")
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("isAdmin")
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("currentUser")
        localStorage.removeItem("isAdmin")
        console.log("User logged out successfully")
        window.location.href = "index.html"
      })
    }
  }

  // Call the function to update navigation
  updateNavigation()

  // Mobile menu toggle
  const menuToggle = document.getElementById("menu-toggle")
  const navLinks2 = document.getElementById("nav-links")

  if (menuToggle && navLinks2) {
    menuToggle.addEventListener("click", () => {
      navLinks2.classList.toggle("active")
      menuToggle.classList.toggle("active")
    })
  }

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    const isClickInsideNav = navLinks2?.contains(event.target)
    const isClickOnToggle = menuToggle?.contains(event.target)

    if (navLinks2?.classList.contains("active") && !isClickInsideNav && !isClickOnToggle) {
      navLinks2.classList.remove("active")
      menuToggle?.classList.remove("active")
    }
  })

  // Testimonial Slider
  const testimonialSlider = document.getElementById("testimonial-slider")
  const prevButton = document.getElementById("prev-testimonial")
  const nextButton = document.getElementById("next-testimonial")

  if (testimonialSlider && prevButton && nextButton) {
    const testimonials = testimonialSlider.querySelectorAll(".testimonial")
    let currentIndex = 0

    // Hide all testimonials except the first one
    testimonials.forEach((testimonial, index) => {
      if (index !== 0) {
        testimonial.style.display = "none"
      }
    })

    // Function to show a specific testimonial
    function showTestimonial(index) {
      testimonials.forEach((testimonial) => {
        testimonial.style.display = "none"
      })
      testimonials[index].style.display = "block"
    }

    // Event listeners for next and previous buttons
    nextButton.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % testimonials.length
      showTestimonial(currentIndex)
    })

    prevButton.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length
      showTestimonial(currentIndex)
    })

    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
      currentIndex = (currentIndex + 1) % testimonials.length
      showTestimonial(currentIndex)
    }, 5000)
  }

  // Chat Widget
  const chatToggle = document.getElementById("chat-toggle")
  const chatBox = document.getElementById("chat-box")
  const closeChat = document.getElementById("close-chat")
  const chatForm = document.getElementById("chat-form")
  const chatInput = document.getElementById("chat-input")
  const chatMessages = document.getElementById("chat-messages")
  const openChatFromCard = document.getElementById("open-chat-from-card")

  function toggleChat() {
    if (chatBox && chatToggle) {
      const isVisible = chatBox.style.display === "block"
      chatBox.style.display = isVisible ? "none" : "block"
      chatToggle.style.display = isVisible ? "flex" : "none"

      if (!isVisible) {
        chatInput?.focus()
        // Scroll to bottom of chat messages
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      }
    }
  }

  if (chatToggle) {
    chatToggle.addEventListener("click", toggleChat)
  }

  if (closeChat) {
    closeChat.addEventListener("click", toggleChat)
  }

  if (openChatFromCard) {
    openChatFromCard.addEventListener("click", () => {
      if (chatBox && chatToggle) {
        chatBox.style.display = "block"
        chatToggle.style.display = "none"
        chatInput?.focus()
        // Scroll to bottom of chat messages
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      }
    })
  }

  if (chatForm && chatInput && chatMessages) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const message = chatInput.value.trim()
      if (message === "") return

      // Add user message
      const userMessageElement = document.createElement("div")
      userMessageElement.className = "message sent"
      userMessageElement.innerHTML = `<p>${message}</p>`
      chatMessages.appendChild(userMessageElement)

      // Clear input
      chatInput.value = ""

      // Scroll to bottom of chat messages
      chatMessages.scrollTop = chatMessages.scrollHeight

      // Simulate response (in a real implementation, this would be handled by a backend)
      setTimeout(() => {
        const responseElement = document.createElement("div")
        responseElement.className = "message received"
        responseElement.innerHTML = `<p>Thank you for your message. One of our advisors will respond to you shortly. In the meantime, you might find helpful information in our FAQ section.</p>`
        chatMessages.appendChild(responseElement)

        // Scroll to bottom of chat messages
        chatMessages.scrollTop = chatMessages.scrollHeight
      }, 1000)
    })
  }

  // FAQ Accordion (if on FAQ page)
  const faqItems = document.querySelectorAll(".faq-item")
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question")
      const answer = item.querySelector(".faq-answer")
      const toggleButton = item.querySelector(".toggle-answer")

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
    })

    // FAQ Search functionality
    const faqSearch = document.getElementById("faq-search")
    const searchBtn = document.getElementById("search-btn")
    const faqList = document.getElementById("faq-list")
    const faqNotFound = document.getElementById("faq-not-found")

    if (faqSearch && searchBtn && faqList && faqNotFound) {
      function searchFAQs() {
        const searchTerm = faqSearch.value.toLowerCase()
        let resultsFound = false

        faqItems.forEach((item) => {
          const questionText = item.querySelector(".faq-question h3").textContent.toLowerCase()
          const answerText = item.querySelector(".faq-answer").textContent.toLowerCase()

          if (questionText.includes(searchTerm) || answerText.includes(searchTerm) || searchTerm === "") {
            item.style.display = "block"
            resultsFound = true
          } else {
            item.style.display = "none"
          }
        })

        faqNotFound.style.display = resultsFound ? "none" : "block"
      }

      searchBtn.addEventListener("click", searchFAQs)
      faqSearch.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          searchFAQs()
        }
      })

      // Category filtering
      const categoryTabs = document.querySelectorAll(".category-tab")
      if (categoryTabs.length > 0) {
        categoryTabs.forEach((tab) => {
          tab.addEventListener("click", () => {
            // Remove active class from all tabs
            categoryTabs.forEach((t) => t.classList.remove("active"))

            // Add active class to clicked tab
            tab.classList.add("active")

            const category = tab.getAttribute("data-category")

            faqItems.forEach((item) => {
              if (category === "all" || item.getAttribute("data-category") === category) {
                item.style.display = "block"
              } else {
                item.style.display = "none"
              }
            })

            faqNotFound.style.display = "none"
          })
        })
      }
    }
  }

  // Form submission handling
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()
      alert("Thank you for your message. We will get back to you soon!")
      contactForm.reset()
    })
  }

  const bookingForm = document.getElementById("booking-form")
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault()
      alert("Thank you for booking a consultation. We will confirm your appointment shortly!")
      bookingForm.reset()
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href")
      if (href !== "#") {
        e.preventDefault()
        const targetElement = document.querySelector(href)
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 100,
            behavior: "smooth",
          })
        }
      }
    })
  })
})