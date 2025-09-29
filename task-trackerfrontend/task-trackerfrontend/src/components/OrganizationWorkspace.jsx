import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrganizationWorkspace = () => {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [activities, setActivities] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Add API base URL for Vite
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchOrganizationData();
    fetchActivities();
  }, [id]);

  const fetchOrganizationData = async () => {
    try {
      // In a real app, you'd fetch organization details
      setOrganization({ id, name: 'Organization Workspace' });
      
      const projectsResponse = await axios.get(`${API_BASE_URL}/api/projects/organization/${id}`);
      setProjects(projectsResponse.data);

      // Fetch tasks for each project
      projectsResponse.data.forEach(async (project) => {
        const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks/project/${project.id}`);
        setTasks(prev => ({ ...prev, [project.id]: tasksResponse.data }));
      });
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/activities/organization/${id}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await axios.post(`${API_BASE_URL}/api/projects`, {
        name: newProjectName,
        description: newProjectDescription,
        organization_id: id
      });
      setNewProjectName('');
      setNewProjectDescription('');
      fetchOrganizationData();
      fetchActivities();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedProject) return;

    try {
      await axios.post(`${API_BASE_URL}/api/tasks`, {
        title: newTaskTitle,
        description: newTaskDescription,
        project_id: selectedProject,
        status: 'todo'
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedProject('');
      fetchOrganizationData();
      fetchActivities();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      fetchOrganizationData();
      fetchActivities();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container navbar-content">
          <div className="navbar-brand">Task Tracker - {organization.name}</div>
          <div className="navbar-nav">
            <span>Welcome, {user?.name}</span>
            <Link to="/organizations" className="nav-link">Back to Organizations</Link>
            <span className="nav-link" onClick={handleLogout}>Logout</span>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Main Content */}
          <div>
            {/* Create Project */}
            <div className="card">
              <h3>Create New Project</h3>
              <form onSubmit={createProject}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Project Name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Project Description"
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </form>
            </div>

            {/* Create Task */}
            <div className="card">
              <h3>Create New Task</h3>
              <form onSubmit={createTask}>
                <div className="form-group">
                  <select
                    className="form-control"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Task Title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    className="form-control"
                    placeholder="Task Description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </form>
            </div>

            {/* Projects and Tasks */}
            {projects.map(project => (
              <div key={project.id} className="card">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                
                {tasks[project.id] && tasks[project.id].length > 0 && (
                  <div className="task-board">
                    {/* Todo Column */}
                    <div className="task-column">
                      <h4>To Do</h4>
                      {tasks[project.id]
                        .filter(task => task.status === 'todo')
                        .map(task => (
                          <div key={task.id} className="task-item">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="task-status status-todo">To Do</span>
                              <button 
                                className="btn btn-primary"
                                onClick={() => updateTaskStatus(task.id, 'in-progress')}
                              >
                                Start
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* In Progress Column */}
                    <div className="task-column">
                      <h4>In Progress</h4>
                      {tasks[project.id]
                        .filter(task => task.status === 'in-progress')
                        .map(task => (
                          <div key={task.id} className="task-item">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="task-status status-in-progress">In Progress</span>
                              <button 
                                className="btn btn-success"
                                onClick={() => updateTaskStatus(task.id, 'done')}
                              >
                                Complete
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Done Column */}
                    <div className="task-column">
                      <h4>Done</h4>
                      {tasks[project.id]
                        .filter(task => task.status === 'done')
                        .map(task => (
                          <div key={task.id} className="task-item">
                            <h4>{task.title}</h4>
                            <p>{task.description}</p>
                            <span className="task-status status-done">Done</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div>
            <div className="card">
              <h3>Activity Feed</h3>
              <div className="activity-feed">
                {activities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <strong>{activity.user_name}</strong>
                    <p>{activity.description}</p>
                    <small>{new Date(activity.created_at).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationWorkspace;