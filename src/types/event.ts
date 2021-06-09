export interface TodoEvent {
  type: TodoEventType;
}

export enum TodoEventType {
  Added = "Todo added",
  MarkedAsCompleted = "Todo marked as completed",
  MarkedAsInComplete = "Todo marked as incomplete",
  Deleted = "Todo deleted",
}