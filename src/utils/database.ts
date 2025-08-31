import { supabase } from '@/integrations/supabase/client';
import { Invoice } from '@/types/invoice';

export const loadInvoices = async (userId: string): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading invoices:', error);
    return [];
  }

  // Transform database format to app format
  return (data || []).map(dbInvoice => ({
    id: dbInvoice.id,
    clientName: dbInvoice.client_name,
    amount: dbInvoice.amount,
    status: dbInvoice.status,
    createdAt: dbInvoice.created_at,
    paidAt: dbInvoice.paid_at
  }));
};

export const saveInvoice = async (invoice: Invoice, userId: string) => {
  const { error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      client_name: invoice.clientName,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.createdAt,
      paid_at: invoice.paidAt
    });

  if (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
};

export const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: updates.status,
      paid_at: updates.paidAt
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice:', error);
    throw error;
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
};