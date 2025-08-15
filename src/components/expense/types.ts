export interface ExpenseData {
  id?: string;
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
  receipt?: File;
  receipt_url?: string;
  notes?: string;
}

export interface ExpenseFormProps {
  currentBalance: number;
  onSubmit: (data: ExpenseData) => void;
}