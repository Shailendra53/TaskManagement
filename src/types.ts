export interface Task {
  id: string;
  title: string;
  category: string;
  createdAt: number;
  completedAt?: number;
  isCompleted: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
