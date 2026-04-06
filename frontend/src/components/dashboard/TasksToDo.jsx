import React, { useState } from "react";

const TasksToDo = ({ tasks }) => {

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!title || !dueDate) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch("http://127.0.0.1:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("token")
        },
        body: JSON.stringify({
          title: title,
          due_date: dueDate
        })
      });

      const data = await res.json();

      if (res.ok) {

        alert("✅ Task added successfully");

        setShowForm(false);
        setTitle("");
        setDueDate("");

        window.location.reload();

      } else {

        alert(data.error || "Failed to add task");

      }

    } catch (error) {

      console.error(error);
      alert("Server error");

    }

    setLoading(false);
  };

  return (
    <div className="task-card">

      <div className="task-header">
        <h3>Tasks To Do</h3>
        <span className="view-all">View All</span>
      </div>

      <div className="task-list">

        {tasks && tasks.length > 0 ? (

          tasks.map((item) => (

            <div key={item.id} className="task-row">

              <span className="task-date">{item.date}</span>

              {item.urgent && <span className="urgent-dot">!</span>}

              <span className="task-text">{item.title}</span>

            </div>

          ))

        ) : (

          <p className="no-data">No tasks available</p>

        )}

      </div>

      <div className="task-footer">

        <button
          className="add-task-btn"
          onClick={() => setShowForm(true)}
        >
          Add new task →
        </button>

      </div>

      {showForm && (

        <div className="task-modal">

          <div className="task-form">

            <h3>Add Task</h3>

            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

             <div className="form-buttons">

  <button
    className="save-task-btn"
    onClick={handleSubmit}
    disabled={loading}
  >
    {loading ? "Saving..." : "Save Task"}
  </button>

  <button
    className="cancel-btn"
    onClick={() => setShowForm(false)}
  >
    Cancel
  </button>

</div>

          </div>

        </div>

      )}

    </div>
  );
};

export default TasksToDo;