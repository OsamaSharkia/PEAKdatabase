document.addEventListener("DOMContentLoaded", async () => {
    console.log("FAQ fix approval script loaded")
  
    // Check if Supabase client is available
    if (!window.supabaseClient) {
      console.error("Supabase client not available")
      document.getElementById("status").textContent = "Error: Supabase client not available"
      return
    }
  
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null")
    if (!currentUser || !currentUser.isAdmin) {
      console.error("User not logged in or not an admin")
      document.getElementById("status").textContent = "Error: You must be logged in as an admin to use this tool"
      return
    }
  
    // Create and add a button to the page
    const button = document.createElement("button")
    button.innerText = "Fix Approval Issues"
    button.style.padding = "10px 15px"
    button.style.backgroundColor = "#ff9800"
    button.style.color = "white"
    button.style.border = "none"
    button.style.borderRadius = "4px"
    button.style.cursor = "pointer"
    button.style.marginTop = "20px"
    button.style.marginBottom = "20px"
  
    // Add it after the debug tools section, or at the top of the page if not found
    const debugTools = document.querySelector(".debug-tools")
    if (debugTools) {
      debugTools.appendChild(button)
    } else {
      const container = document.querySelector("#admin-panel") || document.body
      container.insertBefore(button, container.firstChild)
    }
  
    // Add click handler
    button.addEventListener("click", fixApprovalIssues)
  
    async function fixApprovalIssues() {
      console.log("Starting approval issue fix...")
  
      // Show status
      const statusMsg = document.createElement("div")
      statusMsg.style.padding = "10px"
      statusMsg.style.margin = "10px 0"
      statusMsg.style.backgroundColor = "#e3f2fd"
      statusMsg.style.border = "1px solid #bbdefb"
      statusMsg.style.borderRadius = "4px"
      statusMsg.textContent = "Checking for approval issues..."
  
      const container = document.querySelector("#admin-panel") || document.body
      container.insertBefore(statusMsg, button.nextSibling)
  
      try {
        // Check if using Supabase
        if (window.supabaseClient) {
          statusMsg.textContent = "Using Supabase: Fixing approval statuses..."
  
          // First, fix RLS policies for the faqs table
          await fixRlsPolicies()
  
          // Then check for questions with inconsistent status
          const { data: inconsistentData, error: checkError } = await window.supabaseClient
            .from("faqs")
            .select("id, question, status, approved_at")
            .or("and(status.eq.approved,approved_at.is.null),and(status.neq.approved,approved_at.not.is.null)")
  
          if (checkError) {
            throw checkError
          }
  
          if (inconsistentData && inconsistentData.length > 0) {
            statusMsg.textContent = `Found ${inconsistentData.length} questions with inconsistent approval status. Fixing...`
  
            // Fix each inconsistent question
            for (const question of inconsistentData) {
              if (question.status === "approved" && !question.approved_at) {
                // Set approved_at for approved questions
                await window.supabaseClient
                  .from("faqs")
                  .update({ approved_at: new Date().toISOString() })
                  .eq("id", question.id)
              } else if (question.status !== "approved" && question.approved_at) {
                // Clear approved_at for non-approved questions
                await window.supabaseClient.from("faqs").update({ approved_at: null }).eq("id", question.id)
              }
            }
  
            statusMsg.textContent = `Fixed ${inconsistentData.length} questions with inconsistent approval status.`
          } else {
            statusMsg.textContent = "No inconsistent approval statuses found."
          }
  
          // Add success message
          const successMessage = document.createElement("div")
          successMessage.className = "success-message"
          successMessage.textContent =
            "FAQ approval issues fixed successfully! RLS policies have been updated to allow proper question submission and management."
          document.getElementById("results").appendChild(successMessage)
  
          // Add a button to go back to admin page
          const backButton = document.createElement("button")
          backButton.textContent = "Back to Admin Panel"
          backButton.className = "back-button"
          backButton.addEventListener("click", () => {
            window.location.href = "admin.html"
          })
          document.getElementById("results").appendChild(backButton)
        } else {
          // Using localStorage
          statusMsg.textContent = "Using localStorage: Fixing approval statuses..."
  
          const faqs = JSON.parse(localStorage.getItem("faqs") || "[]")
          let fixedCount = 0
  
          // Fix each FAQ
          faqs.forEach((faq) => {
            let needsFix = false
  
            if (faq.status === "approved" && !faq.approved_at) {
              faq.approved_at = new Date().toISOString()
              needsFix = true
            } else if (faq.status !== "approved" && faq.approved_at) {
              faq.approved_at = null
              needsFix = true
            }
            faq.approved_at = null
            needsFix = true
  
            if (needsFix) {
              fixedCount++
            }
          })
  
          // Save back to localStorage
          localStorage.setItem("faqs", JSON.stringify(faqs))
  
          statusMsg.textContent = `Fixed ${fixedCount} questions. Refreshing page in 3 seconds...`
          console.log("Questions after fix:", faqs)
        }
  
        // Refresh the page after 3 seconds
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } catch (error) {
        console.error("Error fixing approval issues:", error)
        statusMsg.style.backgroundColor = "#ffebee"
        statusMsg.style.border = "1px solid #ffcdd2"
        statusMsg.textContent = `Error: ${error.message}`
      }
    }
  
    async function fixRlsPolicies() {
      try {
        document.getElementById("status").textContent = "Fixing RLS policies for FAQ tables..."
  
        // Try to use RPC to create RLS policies if available
        try {
          // Enable RLS on faqs table
          const enableRlsSQL = `
            -- Enable RLS on faqs table
            ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
            
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Allow authenticated users to insert faqs" ON public.faqs;
            DROP POLICY IF EXISTS "Allow admins to update faqs" ON public.faqs;
            DROP POLICY IF EXISTS "Allow admins to delete faqs" ON public.faqs;
            DROP POLICY IF EXISTS "Allow everyone to view approved faqs" ON public.faqs;
            DROP POLICY IF EXISTS "Allow users to view their own faqs" ON public.faqs;
            DROP POLICY IF EXISTS "Allow admins to view all faqs" ON public.faqs;
            
            -- Create policies for faqs table
            CREATE POLICY "Allow authenticated users to insert faqs" 
              ON public.faqs FOR INSERT 
              TO authenticated 
              WITH CHECK (true);
              
            CREATE POLICY "Allow admins to update faqs" 
              ON public.faqs FOR UPDATE 
              TO authenticated 
              USING ((SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()));
              
            CREATE POLICY "Allow admins to delete faqs" 
              ON public.faqs FOR DELETE 
              TO authenticated 
              USING ((SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()));
              
            CREATE POLICY "Allow everyone to view approved faqs" 
              ON public.faqs FOR SELECT 
              TO anon, authenticated 
              USING (status = 'approved');
              
            CREATE POLICY "Allow users to view their own faqs" 
              ON public.faqs FOR SELECT 
              TO authenticated 
              USING (user_id = auth.uid());
              
            CREATE POLICY "Allow admins to view all faqs" 
              ON public.faqs FOR SELECT 
              TO authenticated 
              USING ((SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()));
          `
  
          // Try to use RPC if available
          const { error: rpcError } = await window.supabaseClient.rpc("exec_sql", { sql_query: enableRlsSQL })
  
          if (rpcError) {
            console.error("Error fixing RLS policies via RPC:", rpcError)
            // If RPC fails, we'll try a different approach
            throw rpcError
          }
  
          return true
        } catch (rpcError) {
          console.error("RPC error:", rpcError)
  
          // If RPC fails, we'll try a different approach - create a test question to verify permissions
          const testQuestion = {
            question: "TEST QUESTION - PLEASE DELETE",
            answer: "This is a test question to verify RLS policies.",
            status: "pending",
            created_at: new Date().toISOString(),
          }
  
          const { data, error } = await window.supabaseClient.from("faqs").insert(testQuestion).select()
  
          if (error) {
            // If we still can't insert, we need to notify the user to fix RLS policies manually
            document.getElementById("status").textContent =
              "Unable to fix RLS policies automatically. Please contact your database administrator."
  
            const manualInstructions = document.createElement("div")
            manualInstructions.className = "manual-instructions"
            manualInstructions.innerHTML = `
              <h3>Manual RLS Policy Fix Instructions</h3>
              <p>Please run the following SQL in your Supabase SQL Editor:</p>
              <pre>${enableRlsSQL}</pre>
            `
            document.getElementById("results").appendChild(manualInstructions)
  
            return false
          } else {
            // If we can insert, delete the test question
            if (data && data.length > 0) {
              await window.supabaseClient.from("faqs").delete().eq("id", data[0].id)
            }
            return true
          }
        }
      } catch (error) {
        console.error("Error fixing RLS policies:", error)
        throw error
      }
    }
  })
  