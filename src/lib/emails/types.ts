export interface BaseEmailOptions<T> {
  to: string | string[];
  subject: string;
  data: T;
}

export type EmailTemplate<T> = (data: T) => {
  html: string;
  text: string;
};
