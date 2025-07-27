import { useState } from 'react';
import { Plus } from 'lucide-react';

interface InvoiceFormProps {
  onAddInvoice: (clientName: string, amount: number) => void;
}

export const InvoiceForm = ({ onAddInvoice }: InvoiceFormProps) => {
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !amount.trim()) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddInvoice(clientName.trim(), numAmount);
    setClientName('');
    setAmount('');
  };

  return (
    <div className="card-elevated p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Create New Invoice</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="clientName" className="block text-sm font-medium mb-2">
            Client Name
          </label>
          <input
            type="text"
            id="clientName"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="input-field w-full"
            placeholder="Enter client name"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount (USD)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field w-full"
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={!clientName.trim() || !amount.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Invoice
          </button>
        </div>
      </form>
    </div>
  );
};