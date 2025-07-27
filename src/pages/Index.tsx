import { useState, useEffect } from 'react';
import { Invoice, User } from '@/types/invoice';
import { loadInvoices, saveInvoices, loadUser, saveUser, exportToCSV } from '@/utils/storage';
import { SignupForm } from '@/components/SignupForm';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceTable } from '@/components/InvoiceTable';
import { Toast, useToast } from '@/components/Toast';
import { createClient } from '@supabase/supabase-js';

// Supabase client - fallback for demo purposes
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key'
);


const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    // Load user and invoices from localStorage
    const savedUser = loadUser();
    const savedInvoices = loadInvoices();
    
    setUser(savedUser);
    setInvoices(savedInvoices);
    setIsLoading(false);

    // Check if user just paid (from URL params)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paid') === '1' && savedUser) {
      const updatedUser = { ...savedUser, hasPaid: true };
      setUser(updatedUser);
      saveUser(updatedUser);
      showToast('Payment successful! Welcome to PayNapple! 🍍', 'success');
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSignup = async (signupData: { name: string; email: string }) => {
    try {
      // Save user data (not paid yet)
      const newUser: User = {
        name: signupData.name,
        email: signupData.email,
        hasPaid: false
      };
      setUser(newUser);
      saveUser(newUser);

      // Try Supabase function, fallback to mock for demo
      let data;
      try {
        const response = await supabase.functions.invoke('create-checkout-session', {
          body: {
            name: signupData.name,
            email: signupData.email
          }
        });
        data = response.data;
      } catch {
        // Fallback to mock for demo - simulate successful payment
        showToast('Demo mode: Simulating $9 payment...', 'success');
        setTimeout(() => {
          const updatedUser = { ...newUser, hasPaid: true };
          setUser(updatedUser);
          saveUser(updatedUser);
          showToast('Demo payment successful! Welcome to PayNapple! 🍍', 'success');
        }, 2000);
        return;
      }

      // Redirect to Stripe Checkout
      window.open(data.url, '_blank');
      showToast('Redirecting to secure payment...', 'success');
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Payment setup failed. Please try again.', 'error');
    }
  };

  const handleAddInvoice = (clientName: string, amount: number) => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientName,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    showToast(`Invoice for ${clientName} created successfully!`, 'success');
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      // Try Supabase function, fallback to demo
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            email: user?.email,
            invoice: invoice
          }
        });

        if (error) throw error;

        // Open Stripe Checkout in new tab
        window.open(data.url, '_blank');
        showToast(`Payment link sent for ${invoice.clientName}`, 'success');
      } catch {
        // Demo mode - simulate payment success
        showToast(`Demo: Creating payment link for ${invoice.clientName}...`, 'success');
        setTimeout(() => {
          showToast(`Demo payment link created! (Would normally open Stripe)`, 'success');
        }, 1500);
      }
    } catch (error) {
      console.error('Send invoice error:', error);
      showToast('Failed to create payment link. Please try again.', 'error');
    }
  };

  const handleMarkPaid = (invoiceId: string) => {
    const updatedInvoices = invoices.map(invoice =>
      invoice.id === invoiceId
        ? { ...invoice, status: 'paid' as const, paidAt: new Date().toISOString() }
        : invoice
    );
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    
    const invoice = invoices.find(inv => inv.id === invoiceId);
    showToast(`Invoice for ${invoice?.clientName} marked as paid!`, 'success');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    const updatedInvoices = invoices.filter(inv => inv.id !== invoiceId);
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    showToast(`Invoice for ${invoice?.clientName} deleted`, 'warning');
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      showToast('No invoices to export', 'warning');
      return;
    }
    exportToCSV(invoices);
    showToast('Invoices exported to CSV!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍍</div>
          <div className="text-xl">Loading PayNapple...</div>
        </div>
      </div>
    );
  }

  // Show signup form if user hasn't signed up or hasn't paid
  if (!user || !user.hasPaid) {
    return (
      <>
        <SignupForm onSignup={handleSignup} />
        <Toast {...toast} onHide={hideToast} />
      </>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🍍</span>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  PayNapple
                </h1>
                <p className="text-muted-foreground">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Invoices</div>
              <div className="text-2xl font-bold">{invoices.length}</div>
            </div>
          </div>
        </div>

        {/* Invoice Form */}
        <InvoiceForm onAddInvoice={handleAddInvoice} />

        {/* Invoice Table */}
        <InvoiceTable
          invoices={invoices}
          onSendInvoice={handleSendInvoice}
          onMarkPaid={handleMarkPaid}
          onDeleteInvoice={handleDeleteInvoice}
          onExportCSV={handleExportCSV}
        />

        {/* Toast */}
        <Toast {...toast} onHide={hideToast} />
      </div>
    </div>
  );
};

export default Index;