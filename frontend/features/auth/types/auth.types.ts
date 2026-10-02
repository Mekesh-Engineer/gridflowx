export interface PromoPanelConfig {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subtitle: string;
  cards: {
    icon: any;
    title: string;
    description: string;
  }[];
}

export { mapAuthError } from '../utils/auth-errors';

