// src/types/index.ts
export interface Task {
  id: string;
  taskName: string;
  taskGroup?: string;
  deadline: string;
  estimate?: string;
  spentTime?: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  status?: 'Done' | 'In Progress' | 'To Do' | 'In Review';
  description?: string;
  attachment?: { name: string; uri: string } | null;
  link?: string;
  createdAt?: string;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: string;
  deadline: string;
  priority: string;
  description: string;
  avatarIndex: number | null;
  hasAttachment: boolean;
  hasLink: boolean;
  createdBy: string;
  tasks?: Task[];
}
