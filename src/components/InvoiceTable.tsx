import { Invoice } from '@/types/invoice';
import { Trash2, Send, CheckCircle, Download } from 'lucide-react';

interface InvoiceTableProps {
  invoices: Invoice[];
  onSendInvoice: (invoice: Invoice) => void;
  onMarkPaid: (invoiceId: string) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onExportCSV: () => void;
}

export const InvoiceTable = ({
  invoices,
  onSendInvoice,
  onMarkPaid,
  onDeleteInvoice,
  onExportCSV
}: InvoiceTableProps) => {
  if (invoices.length === 0) {
    return (
      <div className="card-elevated p-12 text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
        <p className="text-muted-foreground">Create your first invoice to get started!</p>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Invoices</h2>
        <button
          onClick={onExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold">Client</th>
              <th className="text-left py-3 px-4 font-semibold">Amount</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Created</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="table-stripe">
                <td className="py-4 px-4 font-medium">{invoice.clientName}</td>
                <td className="py-4 px-4">${invoice.amount.toFixed(2)}</td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid'
                        ? 'bg-success/10 text-success'
                        : 'bg-warning/10 text-warning'
                    }`}
                  >
                    {invoice.status === 'paid' ? (
                      <>
                        <CheckCircle size={12} />
                        Paid
                      </>
                    ) : (
                      'Pending'
                    )}
                  </span>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-end gap-2">
                    {invoice.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onSendInvoice(invoice)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors text-sm"
                        >
                          <Send size={12} />
                          Send
                        </button>
                        <button
                          onClick={() => onMarkPaid(invoice.id)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors text-sm"
                        >
                          <CheckCircle size={12} />
                          Mark Paid
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDeleteInvoice(invoice.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};