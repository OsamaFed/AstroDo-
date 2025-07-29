 let input = document.getElementById("input");
  let add = document.getElementById("add");
  let clear = document.getElementById("clear");
  let list = document.getElementById('list');
  let taskCounter = document.getElementById('task-counter');
  let searchInput = document.getElementById('search');

  let tasks = [];


  window.onload = function() {
      loadTasks();
      updateTaskCounter();
      updateButtonVisibility();
  };


  document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && document.activeElement === input) {
          event.preventDefault();
          addtask();
      }
      if (event.key === 'Escape') {
          input.value = "";
          searchInput.value = "";
          inputT();
          clearSearch();
      }
  });

  function showNotification(message, type = 'success', duration = 2000) {
      // تحسين الأداء - إزالة الإشعارات السابقة
      const existingNotifications = document.querySelectorAll('.notification');
      existingNotifications.forEach(notif => {
          if (notif.parentNode) {
              notif.parentNode.removeChild(notif);
          }
      });

      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.innerHTML = message;
      
      // تحسين الأداء - استخدام requestAnimationFrame
      document.body.appendChild(notification);
      
      requestAnimationFrame(() => {
          notification.classList.add('show');
      });

      // إخفاء الإشعار بعد ثانيتين
      setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
              if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
              }
          }, 200);
      }, duration);
  }



  function inputT() {
      if (input.value.trim() === "") {
          add.style.display = "none";
      } else {
          add.style.display = "block";
      }
  }


  function addtask() {
      const taskText = input.value.trim();

      if (taskText === "") {
        showNotification("⚠️ لا يمكن ترك المهمة فارغة!", "error");
          input.focus();
          return;
      }



      if (taskText.length > 200) {
        showNotification("📏 المهمة طويلة جدًا. اختصرها إلى 200 حرف.", "error");
          return;
      }


      if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        showNotification("🔁 هذه المهمة مُضافة مسبقًا!", "error");
          return;
      }

      let taskData = {
          id: Date.now(),
          text: taskText,
          completed: false,
          dateCreated: new Date().toLocaleString('en-us', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          })
      };

      tasks.push(taskData);
      createTaskElement(taskData);
      saveTasks();
      updateTaskCounter();
      updateButtonVisibility();

      input.value = "";
      inputT();

    showNotification("📝 تمت إضافة المهمة! حان وقت الإنجاز.", "success");
  }

  // Create task element with improved structure
  function createTaskElement(taskData) {
      let li = document.createElement("li");
      li.className = "task-item";
      li.dataset.taskId = taskData.id;

      // Create priority indicator
      let priorityDot = document.createElement("span");
      priorityDot.className = "priority-dot";
      priorityDot.title = "مهمة نشطة";

      // Create checkbox
      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = taskData.completed;
      checkbox.title = taskData.completed ? "إلغاء تمام المهمة" : "تمام المهمة";
      checkbox.onchange = function() {
          toggleTask(li, taskData.id);
      };

      // Create task content container
      let taskContent = document.createElement("div");
      taskContent.className = "task-content";

      // Create task text
      let taskText = document.createElement("span");
      taskText.className = "task-text";
      taskText.textContent = taskData.text;
      taskText.title = taskData.text; // إضافة tooltip للنص الكامل

      // Create date
      let taskDate = document.createElement("span");
      taskDate.className = "task-date";
      taskDate.textContent = `تم الإنشاء: ${taskData.dateCreated}`;

      // Create action buttons container
      let actionsContainer = document.createElement("div");
      actionsContainer.className = "task-actions";
      actionsContainer.style.display = "flex";
      actionsContainer.style.gap = "5px";

      // Create edit button
      let editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerHTML = "✏️";
      editBtn.title = "تعديل المهمة";
      editBtn.onclick = function(e) {
          e.stopPropagation();
          editTask(li, taskData.id);
      };

      // Create delete button
      let deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "🗑️";
      deleteBtn.title = "حذف المهمة";
      deleteBtn.onclick = function(e) {
          e.stopPropagation();
          deleteSingleTask(li, taskData.id);
      };

      // Assemble the task item
      taskContent.appendChild(taskText);
      taskContent.appendChild(taskDate);

      actionsContainer.appendChild(editBtn);
      actionsContainer.appendChild(deleteBtn);

      li.appendChild(priorityDot);
      li.appendChild(checkbox);
      li.appendChild(taskContent);
      li.appendChild(actionsContainer);

      // Add animation
      li.style.opacity = "0";
      li.style.transform = "translateY(-20px)";
      list.appendChild(li);

      // Trigger animation
      setTimeout(() => {
          li.style.opacity = "1";
          li.style.transform = "translateY(0)";
      }, 10);

      // Apply completed state if needed
      if (taskData.completed) {
          applyCompletedStyle(li);
          checkbox.title = "إلغاء المهمة";
      }
  }

  // Delete single task with confirmation
  function deleteSingleTask(taskElement, taskId) {
      if (confirm("هل أنت متأكد من حذف هذه المهمة؟")) {
          tasks = tasks.filter(task => task.id !== taskId);

          // Add exit animation
          taskElement.style.transform = "translateX(100%)";
          taskElement.style.opacity = "0";

          setTimeout(() => {
              if (taskElement.parentNode) {
                  list.removeChild(taskElement);
              }
              saveTasks();
              updateTaskCounter();
              updateButtonVisibility();
          }, 300);

        showNotification("🗑️ تم حذف المهمة بنجاح.", "success");
      }
  }

  function checkAllTasksCompleted() {
      if (tasks.length === 0) {
          return;
      }

      if (tasks.every(task => task.completed)) {
          showNotification(`
              <div class="completion-notification">
                  <div class="completion-icon">🎉</div>
                  <div class="completion-text">
                      <strong>تهانينا!</strong><br>
                      تم إنجاز جميع المهام بنجاح!
                  </div>
                  <div class="completion-stars">⭐ 🌟 ⭐</div>
              </div>
          `, "completion", 3000);
      }
  }
  // Toggle task completion status
  function toggleTask(taskElement, taskId) {
      let task = tasks.find(t => t.id === taskId);
      if (task) {
          task.completed = !task.completed;
          saveTasks();
          updateTaskCounter();

          const checkbox = taskElement.querySelector('.task-checkbox');
          checkbox.title = task.completed ? "إلغاء تمام المهمة" : "تمام المهمة";

          if (task.completed) {
              applyCompletedStyle(taskElement);
              showNotification("🎉 أحسنت! تم إنجاز المهمة.", "success");
              checkAllTasksCompleted();
          } else {
              removeCompletedStyle(taskElement);
              showNotification("⛔️تم إلغاء التحديد. خذ وقتك، كل شيء بوقته", "success");
          }
      }
  }

  // Apply completed styling
  function applyCompletedStyle(taskElement) {
      taskElement.classList.add('completed');
      let taskText = taskElement.querySelector('.task-text');
      taskText.style.textDecoration = "line-through";
      taskText.style.color = "rgba(255, 255, 255, 0.6)";
      taskElement.style.opacity = "0.7";
      taskElement.style.background = "rgba(255, 255, 255, 0.05)";
  }

  // Remove completed styling
  function removeCompletedStyle(taskElement) {
      taskElement.classList.remove('completed');
      let taskText = taskElement.querySelector('.task-text');
      taskText.style.textDecoration = "none";
      taskText.style.color = "#FFFFFF";
      taskElement.style.opacity = "1";
      taskElement.style.background = "rgba(255, 255, 255, 0.1)";
  }

  // Edit task with validation
  function editTask(taskElement, taskId) {
      let task = tasks.find(t => t.id === taskId);
      if (task) {
          let newText = prompt("تعديل المهمة:", task.text);
          if (newText !== null && newText.trim() !== "") {
              newText = newText.trim();

              // Check text length
              if (newText.length > 200) {
                  alert("النص طويل جداً! الحد الأقصى 200 حرف");
                  return;
              }

              // Check for duplicate
              if (tasks.some(t => t.id !== taskId && t.text.toLowerCase() === newText.toLowerCase())) {
                  showNotification("هذه المهمة موجودة بالفعل!", "error");
                  return;
              }

              task.text = newText;
              let taskText = taskElement.querySelector('.task-text');
              taskText.textContent = task.text;
              taskText.title = task.text; // إضافة tooltip للنص الكامل
              saveTasks();
              showNotification("✏️ تم تعديل المهمة بنجاح!", "success");
          } else if (newText !== null) {
              showNotification("النص لا يمكن أن يكون فارغاً!", "error");
          }
      }
  }

  // Clear all tasks with confirmation
  function clearAll() {
      if (tasks.length === 0) {
          showNotification("لا توجد مهام للحذف!", "error");
          return;
      }

      if (confirm(`هل أنت متأكد من حذف جميع المهام (${tasks.length} مهمة)؟`)) {
          // Add fade out animation to all tasks
          const taskItems = document.querySelectorAll('.task-item');
          taskItems.forEach((item, index) => {
              setTimeout(() => {
                  item.style.transform = "translateX(100%)";
                  item.style.opacity = "0";
              }, index * 50);
          });

          setTimeout(() => {
              list.innerHTML = "";
              tasks = [];
              saveTasks();
              updateTaskCounter();
              updateButtonVisibility();
              input.value = "";
              showNotification("🗑️ تم حذف جميع المهام!", "success");
          }, taskItems.length * 50 + 300);
      }
  }

  // Save tasks to localStorage
  function saveTasks() {
      try {
          localStorage.setItem('todoTasks', JSON.stringify(tasks));
      } catch (error) {
          showNotification("خطأ في حفظ البيانات!", "error");
          console.error('Error saving tasks:', error);
      }
  }

  // Load tasks from localStorage
  function loadTasks() {
      try {
          let savedTasks = localStorage.getItem('todoTasks');
          if (savedTasks) {
              tasks = JSON.parse(savedTasks);
              tasks.forEach(task => createTaskElement(task));
          }
      } catch (error) {
          showNotification("خطأ في تحميل البيانات!", "error");
          console.error('Error loading tasks:', error);
          tasks = [];
      }
  }

  // تحسين updateTaskCounter للأداء
  function updateTaskCounter() {
      if (!taskCounter) return;
      
      const total = tasks.length;
      const completed = tasks.reduce((count, task) => count + (task.completed ? 1 : 0), 0);
      const remaining = total - completed;

      requestAnimationFrame(() => {
          taskCounter.innerHTML = `
              <span class="counter-item">📋 المجموع: ${total}</span>
              <span class="counter-item">✅ مكتملة: ${completed}</span>
              <span class="counter-item">⏳ متبقية: ${remaining}</span>
          `;
      });
  }

  // Update button visibility and empty state
  function updateButtonVisibility() {
      const emptyState = document.getElementById('empty-state');
      
      if (tasks.length > 0) {
          clear.style.display = "block";
          if (emptyState) emptyState.style.display = "none";
      } else {
          clear.style.display = "none";
          if (emptyState) emptyState.style.display = "block";
      }
  }



  // تحسين البحث مع debouncing
  let searchTimeout;
  function searchTasks(searchTerm) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
          performSearch(searchTerm);
      }, 150);
  }

  function performSearch(searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
          clearSearch();
          return;
      }

      const taskItems = document.querySelectorAll('.task-item');
      const searchLower = searchTerm.toLowerCase().trim();
      const fragment = document.createDocumentFragment();

      requestAnimationFrame(() => {
          taskItems.forEach(item => {
              const taskText = item.querySelector('.task-text').textContent.toLowerCase();
              item.style.display = taskText.includes(searchLower) ? 'flex' : 'none';
          });

          const emptyState = document.getElementById('empty-state');
          if (emptyState) emptyState.style.display = "none";
      });
  }

  // Clear search
  function clearSearch() {
      let taskItems = document.querySelectorAll('.task-item');
      taskItems.forEach(item => {
          item.style.display = 'flex';
      });
      updateButtonVisibility(); // إعادة تقييم عرض empty state
  }

  // Add smooth scrolling to new tasks
  function scrollToTask(taskElement) {
      taskElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
      });
  }

  // Add auto-save functionality
  setInterval(() => {
      if (tasks.length > 0) {
          saveTasks();
      }
  }, 30000); // Auto-save every 30 seconds

  // Add error handling for localStorage
  window.addEventListener('storage', function(e) {
      if (e.key === 'todoTasks') {
          try {
              loadTasks();
              updateTaskCounter();
              updateButtonVisibility();
              showNotification("تم تحديث البيانات!", "success");
          } catch (error) {
              console.error('Error handling storage event:', error);
              showNotification("خطأ في تحديث البيانات!", "error");
          }
      }
  });

  // Initialize tooltips and accessibility features
  document.addEventListener('DOMContentLoaded', function() {
      // Add ARIA labels for better accessibility
      if (input) input.setAttribute('aria-label', 'أدخل مهمة جديدة');
      if (add) add.setAttribute('aria-label', 'إضافة مهمة');
      if (clear) clear.setAttribute('aria-label', 'مسح جميع المهام');
      if (searchInput) searchInput.setAttribute('aria-label', 'البحث في المهام');
  });
