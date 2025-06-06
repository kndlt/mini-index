// Types definition
export interface User {
  id: string;
  name: string;
}

export type Message = {
  id: string;
  text: string;
  user: User;
};

export const DEFAULT_CONFIG = {
  timeout: 5000
};

export class ChatState {
  constructor(initialState) {
    this.state = initialState;
  }
}
