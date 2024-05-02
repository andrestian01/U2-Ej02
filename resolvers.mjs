import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();


let tasks = [
  { id: '1', title: 'Hacer la compra', description: 'Comprar leche y pan', deadline: '2024-05-10', completed: false },
  { id: '2', title: 'Preparar presentación', description: 'Preparar diapositivas para la reunión', deadline: '2024-05-15', completed: false }
];

export const resolvers = {
  Query: {
    tasks: () => tasks
  },
  Mutation: {
    addTask: (_, { title, description, deadline }) => {
      const newTask = { id: String(tasks.length + 1), title, description, deadline, completed: false };
      tasks.push(newTask);
      pubsub.publish('TASK_ADDED', { taskAdded: newTask });
      return newTask;
    },
    updateTaskStatus: (_, { id, completed }) => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) throw new Error("Task not found");
      tasks[taskIndex].completed = completed;
      return tasks[taskIndex];
    },
    deleteTask: (_, { id }) => {
      const taskIndex = tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) throw new Error("Task not found");
      const deletedTask = tasks.splice(taskIndex, 1);
      pubsub.publish('TASK_DELETED', { taskDeleted: deletedTask[0] });
      return deletedTask[0];
    }
  },
  Subscription: {
    taskAdded: {
      subscribe: () => pubsub.asyncIterator(['TASK_ADDED'])
    },
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator(['TASK_DELETED'])
    }
  }
};
