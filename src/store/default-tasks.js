const defaultTasks = [
    {
        title: "Set your name and title",
        notes: "Visit the 'Settings' tab to the left, click 'Edit', enter a Title and Name, then click 'Save'",
        category: 'Task',
        createdBy: "4amdHZtFfzQ7xBc03fIx6YZbykm2",
        createdDate: Date.parse(new Date()),
        assignedTo: "",
        assignedDate: Date.parse(new Date()),
        dueBy: Date.parse(new Date().setDate(new Date().getDate() + 1)),
        completed: false,
        completedDate: ""
    },
    {
        title: "This task has a due date!",
        notes: "Mark it complete by clicking anywhere in this area.",
        category: 'Task',
        createdBy: "4amdHZtFfzQ7xBc03fIx6YZbykm2",
        createdDate: Date.parse(new Date()),
        assignedTo: "",
        assignedDate: Date.parse(new Date()),
        dueBy: Date.parse(new Date().setDate(new Date().getDate() + 14)),
        completed: false,
        completedDate: ""
    },
    {
        title: "Welcome to PowerX",
        notes: "This is your first task!",
        category: 'Task',
        createdBy: "4amdHZtFfzQ7xBc03fIx6YZbykm2",
        createdDate: Date.parse(new Date()),
        assignedTo: "",
        assignedDate: Date.parse(new Date()),
        dueBy: Date.parse(new Date().setDate(new Date().getDate() + 14)),
        completed: false,
        completedDate: ""
    }
]
    
export default { defaultTasks }
