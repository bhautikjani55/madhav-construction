import InvoiceForm from "@/components/invoice/InvoiceForm";

export default function NewInvoicePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Create New Invoice</h1>
      <InvoiceForm mode="create" />
    </div>
  );
}
