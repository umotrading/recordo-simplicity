export interface ExpenseData {
  name: string;
  date: string;
  invoiceNo: string;
  vendor: string;
  purpose: string;
  customPurpose?: string;
  category: string;
  customCategory?: string;
  amount: number;
  paymentMethod: string;
}

export interface ExpenseFormProps {
  currentBalance: number;
  onSubmit: (data: ExpenseData) => void;
}