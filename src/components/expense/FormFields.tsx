import { ExpenseData } from "./types";
import { BasicInfoFields } from "./form/BasicInfoFields";
import { PurposeField } from "./form/PurposeField";
import { CategoryField } from "./form/CategoryField";
import { PaymentFields } from "./form/PaymentFields";
import { ReceiptUpload } from "./form/ReceiptUpload";

interface FormFieldsProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function FormFields({ formData, setFormData }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      <BasicInfoFields formData={formData} setFormData={setFormData} />
      <PurposeField formData={formData} setFormData={setFormData} />
      <CategoryField formData={formData} setFormData={setFormData} />
      <PaymentFields formData={formData} setFormData={setFormData} />
      <ReceiptUpload formData={formData} setFormData={setFormData} />
    </div>
  );
}