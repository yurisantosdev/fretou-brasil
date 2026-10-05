import { User, UserFormData } from "@/src/types/users";

export type UserFormProps = {
  user: User | null;
  onCancel: () => void;
  onSubmit: (data: UserFormData) => void | Promise<void>;
};