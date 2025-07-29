import { useState, useEffect } from 'react';
import { Invoice, User } from '@/types/invoice';
import { loadInvoices, saveInvoices, loadUser, saveUser, exportToCSV } from '@/utils/storage';
import { SignupForm } from '@/components/SignupForm';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceTable } from '@/components/InvoiceTable';
import { Toast, useToast } from '@/components/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle,
  Plus,
  Sparkles,
  Download,
  PieChart,
  Receipt
} from 'lucide-react';
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

  // Calculate stats
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = totalAmount - paidAmount;
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;
  const pendingCount = invoices.filter(inv => inv.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-6xl mb-4 animate-pulse">🍍</div>
          <div className="text-xl text-muted-foreground">Loading PayNapple...</div>
        </div>
      </div>
    );
  }

  // Show signup form if user hasn't signed up or hasn't paid
  if (!user || !user.hasPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
        {/* Hero Header */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-hover p-4 rounded-2xl shadow-large mr-4">
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                PayNapple
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The sweetest way to manage invoices. Simple, fast, and professional invoicing for freelancers and small businesses.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card/80 border border-border card-elevated">
                <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Invoice Creation</h3>
                <p className="text-sm text-muted-foreground">Create professional invoices in seconds</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card/80 border border-border card-elevated">
                <div className="bg-success/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-7 w-7 text-success" />
                </div>
                <h3 className="font-semibold text-lg mb-2">One-Click Payments</h3>
                <p className="text-sm text-muted-foreground">Send payment links directly to clients</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card/80 border border-border card-elevated">
                <div className="bg-warning/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-7 w-7 text-warning" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Track Everything</h3>
                <p className="text-sm text-muted-foreground">Monitor payments and export reports</p>
              </div>
            </div>
          </div>
        </div>
        
        <SignupForm onSignup={handleSignup} />
        <Toast {...toast} onHide={hideToast} />
      </div>
    );
  }

  // Main app interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <div className="bg-gradient-to-r from-primary to-primary-hover p-3 rounded-xl shadow-medium mr-4">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
                  PayNapple
                </h1>
                <p className="text-lg text-muted-foreground">Welcome back, {user.name}! 👋</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-4 py-2 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Premium User
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{invoices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {paidCount} paid • {pendingCount} pending
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time total
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paid Amount</CardTitle>
              <div className="bg-success/10 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">${paidAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0}% completion rate
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-elevated border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
              <div className="bg-warning/10 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Add Invoice Form */}
          <div className="xl:col-span-1">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Create New Invoice</CardTitle>
                    <CardDescription>Add a new invoice for your client</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <InvoiceForm onAddInvoice={handleAddInvoice} />
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          <div className="xl:col-span-2">
            <Card className="card-elevated">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-primary" />
                      Invoice Management
                    </CardTitle>
                    <CardDescription>Manage your invoices and track payments</CardDescription>
                  </div>
                  <Button 
                    onClick={handleExportCSV}
                    variant="outline"
                    size="sm"
                    disabled={invoices.length === 0}
                    className="shrink-0"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <Separator className="mt-4" />
              </CardHeader>
              <CardContent className="p-0">
                {invoices.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">No invoices yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Create your first invoice to start managing your payments and tracking your business revenue.
                    </p>
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Plus className="h-4 w-4 mr-1" />
                      Use the form on the left to get started
                    </div>
                  </div>
                ) : (
                  <InvoiceTable 
                    invoices={invoices} 
                    onSendInvoice={handleSendInvoice}
                    onMarkPaid={handleMarkPaid}
                    onDeleteInvoice={handleDeleteInvoice}
                    onExportCSV={handleExportCSV}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Toast */}
        <Toast {...toast} onHide={hideToast} />
      </div>
    </div>
  );
};

export default Index;