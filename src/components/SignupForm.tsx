import { useState } from 'react';
import { User } from '@/types/invoice';

interface SignupFormProps {
  onSignup: (user: { name: string; email: string }) => void;
}

export const SignupForm = ({ onSignup }: SignupFormProps) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    
    setIsLoading(true);
    onSignup(formData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent mb-4">
            PayNapple
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Simple invoicing for freelancers
          </p>
          <div className="inline-flex items-center gap-2 bg-accent px-4 py-2 rounded-full">
            <span className="text-2xl">🍍</span>
            <span className="text-sm font-medium">One-time fee: $9</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-elevated p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field w-full"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field w-full"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.name.trim() || !formData.email.trim()}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Pay $9 & Get Started'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Secure payment powered by Stripe. Start creating invoices immediately after payment.
          </p>
        </form>
      </div>
    </div>
  );
};